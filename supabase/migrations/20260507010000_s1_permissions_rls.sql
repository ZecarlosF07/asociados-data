-- ============================================
-- Hito S1: Seguridad, roles, permisos y RLS
-- ============================================

-- --------------------------------------------
-- Modelo parametrizable de permisos
-- --------------------------------------------

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  code varchar(80) not null,
  name varchar(120) not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_modules_code unique (code)
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  action_code varchar(40) not null,
  description text,
  created_at timestamptz not null default now(),
  constraint uq_permissions_module_action unique (module_id, action_code)
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  is_allowed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

drop trigger if exists trg_modules_updated_at on public.modules;
create trigger trg_modules_updated_at
  before update on public.modules
  for each row
  execute function public.fn_set_updated_at();

drop trigger if exists trg_role_permissions_updated_at on public.role_permissions;
create trigger trg_role_permissions_updated_at
  before update on public.role_permissions
  for each row
  execute function public.fn_set_updated_at();

insert into public.modules (code, name, description) values
  ('dashboard', 'Dashboard', 'Indicadores iniciales y vista principal'),
  ('prospectos', 'Prospectos', 'Gestion de prospectos, evaluaciones y cotizaciones'),
  ('asociados', 'Asociados', 'Ficha principal, personas vinculadas y contactos'),
  ('membresias', 'Membresias', 'Gestion de membresias del asociado'),
  ('cobranza', 'Cobranza', 'Cronograma, pagos y acciones de cobranza'),
  ('documentos', 'Documentos', 'Repositorio documental y almacenamiento'),
  ('reportes', 'Reportes', 'Reportes, indicadores y exportaciones'),
  ('usuarios', 'Usuarios', 'Usuarios, roles y perfiles internos'),
  ('configuracion', 'Configuracion', 'Parametros, catalogos y categorias'),
  ('auditoria', 'Auditoria', 'Consulta de bitacora de auditoria')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  is_active = true,
  updated_at = now();

insert into public.permissions (module_id, action_code, description)
select m.id, a.action_code, a.description
from public.modules m
cross join (values
  ('read', 'Lectura de informacion'),
  ('create', 'Creacion de registros'),
  ('update', 'Actualizacion de registros'),
  ('delete', 'Eliminacion fisica o logica de registros'),
  ('admin', 'Administracion del modulo')
) as a(action_code, description)
on conflict (module_id, action_code) do update set
  description = excluded.description;

-- ADMIN: acceso total.
insert into public.role_permissions (role_id, permission_id, is_allowed)
select r.id, p.id, true
from public.roles r
cross join public.permissions p
where r.code = 'ADMIN'
on conflict (role_id, permission_id) do update set
  is_allowed = excluded.is_allowed,
  updated_at = now();

-- OPERADOR: operacion del negocio; sin administracion de usuarios, configuracion ni auditoria.
insert into public.role_permissions (role_id, permission_id, is_allowed)
select r.id, p.id, true
from public.roles r
join public.permissions p on true
join public.modules m on m.id = p.module_id
where r.code = 'OPERADOR'
  and (
    (m.code in ('dashboard', 'reportes', 'configuracion') and p.action_code = 'read')
    or (m.code in ('prospectos', 'asociados', 'membresias', 'cobranza', 'documentos')
      and p.action_code in ('read', 'create', 'update'))
  )
on conflict (role_id, permission_id) do update set
  is_allowed = excluded.is_allowed,
  updated_at = now();

-- CONSULTA: solo lectura de informacion operativa.
insert into public.role_permissions (role_id, permission_id, is_allowed)
select r.id, p.id, true
from public.roles r
join public.permissions p on true
join public.modules m on m.id = p.module_id
where r.code = 'CONSULTA'
  and m.code in (
    'dashboard',
    'prospectos',
    'asociados',
    'membresias',
    'cobranza',
    'documentos',
    'reportes',
    'configuracion'
  )
  and p.action_code = 'read'
on conflict (role_id, permission_id) do update set
  is_allowed = excluded.is_allowed,
  updated_at = now();

grant select on public.modules, public.permissions, public.role_permissions to authenticated;

-- --------------------------------------------
-- Funciones auxiliares de autorizacion
-- --------------------------------------------

create or replace function public.current_user_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select up.id
  from public.user_profiles up
  where up.auth_user_id = auth.uid()
    and up.is_active = true
    and up.is_deleted = false
  limit 1
$$;

create or replace function public.current_user_role_code()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.code
  from public.user_profiles up
  join public.roles r on r.id = up.role_id
  where up.auth_user_id = auth.uid()
    and up.is_active = true
    and up.is_deleted = false
    and r.is_active = true
  limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role_code() = 'ADMIN', false)
$$;

create or replace function public.has_module_permission(module_code text, action_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(exists (
    select 1
    from public.user_profiles up
    join public.roles r on r.id = up.role_id
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    join public.modules m on m.id = p.module_id
    where up.auth_user_id = auth.uid()
      and up.is_active = true
      and up.is_deleted = false
      and r.is_active = true
      and rp.is_allowed = true
      and m.is_active = true
      and m.code = module_code
      and p.action_code = action_code
  ), false)
$$;

create or replace function public.touch_current_user_last_login()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_profiles
  set last_login_at = now(),
      updated_at = now()
  where auth_user_id = auth.uid()
    and is_active = true
    and is_deleted = false;
end;
$$;

grant execute on function public.current_user_profile_id() to authenticated;
grant execute on function public.current_user_role_code() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_module_permission(text, text) to authenticated;
grant execute on function public.touch_current_user_last_login() to authenticated;

-- --------------------------------------------
-- Auditoria automatica para acciones criticas
-- --------------------------------------------

create or replace function public.fn_audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_entity_id uuid;
  v_action text;
begin
  v_actor := public.current_user_profile_id();
  v_action := lower(tg_op);

  if tg_op = 'INSERT' then
    v_entity_id := new.id;
    insert into public.audit_logs (
      actor_user_id,
      entity_name,
      entity_id,
      action_type,
      previous_data,
      new_data,
      summary
    ) values (
      v_actor,
      tg_table_name,
      v_entity_id,
      v_action,
      null,
      to_jsonb(new),
      'Registro creado en ' || tg_table_name
    );
    return new;
  elsif tg_op = 'UPDATE' then
    v_entity_id := new.id;
    insert into public.audit_logs (
      actor_user_id,
      entity_name,
      entity_id,
      action_type,
      previous_data,
      new_data,
      summary
    ) values (
      v_actor,
      tg_table_name,
      v_entity_id,
      v_action,
      to_jsonb(old),
      to_jsonb(new),
      'Registro actualizado en ' || tg_table_name
    );
    return new;
  elsif tg_op = 'DELETE' then
    v_entity_id := old.id;
    insert into public.audit_logs (
      actor_user_id,
      entity_name,
      entity_id,
      action_type,
      previous_data,
      new_data,
      summary
    ) values (
      v_actor,
      tg_table_name,
      v_entity_id,
      v_action,
      to_jsonb(old),
      null,
      'Registro eliminado en ' || tg_table_name
    );
    return old;
  end if;

  return null;
end;
$$;

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'prospects',
    'prospect_evaluations',
    'prospect_quotes',
    'prospect_status_history',
    'captadores',
    'associates',
    'associate_people',
    'associate_area_contacts',
    'memberships',
    'payment_schedules',
    'payments',
    'collection_actions',
    'storage_nodes',
    'documents',
    'user_profiles',
    'system_settings',
    'catalog_items',
    'categories'
  ]
  loop
    execute format('drop trigger if exists trg_audit_%I on public.%I', v_table, v_table);
    execute format(
      'create trigger trg_audit_%I after insert or update or delete on public.%I for each row execute function public.fn_audit_row_change()',
      v_table,
      v_table
    );
  end loop;
end $$;

-- --------------------------------------------
-- RLS y policies
-- --------------------------------------------

create or replace procedure public.apply_module_policies(
  p_table regclass,
  p_module text,
  p_has_soft_delete boolean default true
)
language plpgsql
as $$
declare
  v_prefix text := replace(p_table::text, '.', '_');
  v_read_expr text;
begin
  execute format('alter table %s enable row level security', p_table);

  v_read_expr := case
    when p_has_soft_delete then
      format('(public.is_admin() or (is_deleted = false and public.has_module_permission(%L, %L)))', p_module, 'read')
    else
      format('public.has_module_permission(%L, %L)', p_module, 'read')
  end;

  execute format('drop policy if exists %I on %s', v_prefix || '_read', p_table);
  execute format('drop policy if exists %I on %s', v_prefix || '_create', p_table);
  execute format('drop policy if exists %I on %s', v_prefix || '_update', p_table);
  execute format('drop policy if exists %I on %s', v_prefix || '_delete', p_table);

  execute format(
    'create policy %I on %s for select to authenticated using (%s)',
    v_prefix || '_read',
    p_table,
    v_read_expr
  );

  execute format(
    'create policy %I on %s for insert to authenticated with check (public.has_module_permission(%L, %L))',
    v_prefix || '_create',
    p_table,
    p_module,
    'create'
  );

  execute format(
    'create policy %I on %s for update to authenticated using (public.has_module_permission(%L, %L)) with check (public.has_module_permission(%L, %L))',
    v_prefix || '_update',
    p_table,
    p_module,
    'update',
    p_module,
    'update'
  );

  execute format(
    'create policy %I on %s for delete to authenticated using (public.has_module_permission(%L, %L))',
    v_prefix || '_delete',
    p_table,
    p_module,
    'delete'
  );
end;
$$;

-- Tablas de permisos
alter table public.modules enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

drop policy if exists modules_read on public.modules;
create policy modules_read on public.modules
  for select to authenticated
  using (public.current_user_profile_id() is not null);

drop policy if exists permissions_read on public.permissions;
create policy permissions_read on public.permissions
  for select to authenticated
  using (public.current_user_profile_id() is not null);

drop policy if exists role_permissions_read on public.role_permissions;
create policy role_permissions_read on public.role_permissions
  for select to authenticated
  using (public.current_user_profile_id() is not null);

drop policy if exists modules_admin_write on public.modules;
create policy modules_admin_write on public.modules
  for all to authenticated
  using (public.has_module_permission('usuarios', 'admin'))
  with check (public.has_module_permission('usuarios', 'admin'));

drop policy if exists permissions_admin_write on public.permissions;
create policy permissions_admin_write on public.permissions
  for all to authenticated
  using (public.has_module_permission('usuarios', 'admin'))
  with check (public.has_module_permission('usuarios', 'admin'));

drop policy if exists role_permissions_admin_write on public.role_permissions;
create policy role_permissions_admin_write on public.role_permissions
  for all to authenticated
  using (public.has_module_permission('usuarios', 'admin'))
  with check (public.has_module_permission('usuarios', 'admin'));

-- Roles y usuarios
alter table public.roles enable row level security;
alter table public.user_profiles enable row level security;

drop policy if exists roles_read on public.roles;
create policy roles_read on public.roles
  for select to authenticated
  using (public.current_user_profile_id() is not null);

drop policy if exists roles_admin_write on public.roles;
create policy roles_admin_write on public.roles
  for all to authenticated
  using (public.has_module_permission('usuarios', 'admin'))
  with check (public.has_module_permission('usuarios', 'admin'));

drop policy if exists user_profiles_read on public.user_profiles;
create policy user_profiles_read on public.user_profiles
  for select to authenticated
  using (
    id = public.current_user_profile_id()
    or public.has_module_permission('usuarios', 'read')
  );

drop policy if exists user_profiles_create on public.user_profiles;
create policy user_profiles_create on public.user_profiles
  for insert to authenticated
  with check (public.has_module_permission('usuarios', 'create'));

drop policy if exists user_profiles_update on public.user_profiles;
create policy user_profiles_update on public.user_profiles
  for update to authenticated
  using (public.has_module_permission('usuarios', 'update'))
  with check (public.has_module_permission('usuarios', 'update'));

drop policy if exists user_profiles_delete on public.user_profiles;
create policy user_profiles_delete on public.user_profiles
  for delete to authenticated
  using (public.has_module_permission('usuarios', 'delete'));

-- Configuracion y catalogos
alter table public.system_settings enable row level security;

drop policy if exists system_settings_public_read on public.system_settings;
create policy system_settings_public_read on public.system_settings
  for select to anon, authenticated
  using (is_public = true and is_deleted = false);

drop policy if exists system_settings_config_read on public.system_settings;
create policy system_settings_config_read on public.system_settings
  for select to authenticated
  using (
    public.is_admin()
    or (is_deleted = false and public.has_module_permission('configuracion', 'read'))
  );

drop policy if exists system_settings_config_write on public.system_settings;
create policy system_settings_config_write on public.system_settings
  for all to authenticated
  using (public.has_module_permission('configuracion', 'admin'))
  with check (public.has_module_permission('configuracion', 'admin'));

call public.apply_module_policies('public.catalog_groups', 'configuracion', false);
call public.apply_module_policies('public.catalog_items', 'configuracion', true);
call public.apply_module_policies('public.categories', 'configuracion', true);

-- Modulos operativos
call public.apply_module_policies('public.prospects', 'prospectos', true);
call public.apply_module_policies('public.prospect_evaluations', 'prospectos', true);
call public.apply_module_policies('public.prospect_quotes', 'prospectos', true);
call public.apply_module_policies('public.prospect_status_history', 'prospectos', false);
call public.apply_module_policies('public.captadores', 'prospectos', true);

call public.apply_module_policies('public.associates', 'asociados', true);
call public.apply_module_policies('public.associate_people', 'asociados', true);
call public.apply_module_policies('public.associate_area_contacts', 'asociados', true);

call public.apply_module_policies('public.memberships', 'membresias', true);

call public.apply_module_policies('public.payment_schedules', 'cobranza', true);
call public.apply_module_policies('public.payments', 'cobranza', true);
call public.apply_module_policies('public.collection_actions', 'cobranza', true);

call public.apply_module_policies('public.storage_nodes', 'documentos', true);
call public.apply_module_policies('public.documents', 'documentos', true);

drop procedure public.apply_module_policies(regclass, text, boolean);

-- Auditoria
alter table public.audit_logs enable row level security;

drop policy if exists audit_logs_read on public.audit_logs;
create policy audit_logs_read on public.audit_logs
  for select to authenticated
  using (public.has_module_permission('auditoria', 'read'));

drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs
  for insert to authenticated
  with check (public.current_user_profile_id() is not null);

drop policy if exists audit_logs_admin_delete on public.audit_logs;
create policy audit_logs_admin_delete on public.audit_logs
  for delete to authenticated
  using (public.has_module_permission('auditoria', 'admin'));

-- --------------------------------------------
-- Supabase Storage: bucket y policies
-- --------------------------------------------

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'documents',
  'documents',
  false,
  20971520,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/csv',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists documents_storage_read on storage.objects;
create policy documents_storage_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents'
    and public.has_module_permission('documentos', 'read')
  );

drop policy if exists documents_storage_insert on storage.objects;
create policy documents_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documents'
    and public.has_module_permission('documentos', 'create')
  );

drop policy if exists documents_storage_update on storage.objects;
create policy documents_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'documents'
    and public.has_module_permission('documentos', 'update')
  )
  with check (
    bucket_id = 'documents'
    and public.has_module_permission('documentos', 'update')
  );

drop policy if exists documents_storage_delete on storage.objects;
create policy documents_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documents'
    and public.has_module_permission('documentos', 'delete')
  );

