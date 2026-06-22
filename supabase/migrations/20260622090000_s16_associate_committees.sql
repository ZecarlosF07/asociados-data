-- ============================================================
-- Hito S16: modulo de comites y asignacion a asociados
-- ============================================================

-- Modulo y permisos
insert into public.modules (code, name, description)
values ('comites', 'Comites', 'Gestion de comites institucionales y sus asociados')
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
where m.code = 'comites'
on conflict (module_id, action_code) do update set
  description = excluded.description;

insert into public.role_permissions (role_id, permission_id, is_allowed)
select r.id, p.id, true
from public.roles r
join public.permissions p on true
join public.modules m on m.id = p.module_id
where m.code = 'comites'
  and (
    r.code = 'ADMIN'
    or (r.code = 'FIDELIZACION' and p.action_code in ('read', 'create', 'update'))
  )
on conflict (role_id, permission_id) do update set
  is_allowed = excluded.is_allowed,
  updated_at = now();

-- Entidades de comites
create table if not exists public.committees (
  id uuid primary key default gen_random_uuid(),
  code varchar(50),
  name varchar(180) not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  constraint chk_committees_name_not_blank check (btrim(name) <> ''),
  constraint chk_committees_deleted_inactive check (not is_deleted or not is_active)
);

create table if not exists public.associate_committees (
  id uuid primary key default gen_random_uuid(),
  associate_id uuid not null references public.associates(id) on delete restrict,
  committee_id uuid not null references public.committees(id) on delete restrict,
  joined_at date,
  left_at date,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  constraint chk_associate_committees_dates
    check (left_at is null or joined_at is null or left_at >= joined_at),
  constraint chk_associate_committees_active_dates
    check (
      (is_active = true and left_at is null)
      or (is_active = false and left_at is not null)
    ),
  constraint chk_associate_committees_deleted_closed
    check (not is_deleted or (not is_active and left_at is not null))
);

create unique index if not exists uq_committees_code_active
  on public.committees (lower(btrim(code)))
  where is_deleted = false and code is not null;

create unique index if not exists uq_committees_name_active
  on public.committees (lower(btrim(name)))
  where is_deleted = false;

create index if not exists idx_committees_active
  on public.committees (is_active)
  where is_deleted = false;

create index if not exists idx_associate_committees_associate
  on public.associate_committees (associate_id)
  where is_deleted = false;

create index if not exists idx_associate_committees_committee
  on public.associate_committees (committee_id)
  where is_deleted = false;

create unique index if not exists uq_associate_committees_active_pair
  on public.associate_committees (associate_id, committee_id)
  where is_active = true and is_deleted = false;

create unique index if not exists uq_associate_committees_primary
  on public.associate_committees (associate_id)
  where is_primary = true and is_active = true and is_deleted = false;

-- Normalizacion, actor e invariantes de comites
create or replace function public.fn_prepare_committee()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
begin
  if v_actor is null then
    raise exception 'No se pudo identificar al usuario autenticado.' using errcode = '42501';
  end if;

  new.code := nullif(upper(btrim(new.code)), '');
  new.name := btrim(new.name);

  if new.name is null or new.name = '' then
    raise exception 'El nombre del comite es obligatorio.' using errcode = '22023';
  end if;

  if tg_op = 'INSERT' then
    new.created_by := v_actor;
    new.updated_by := v_actor;
    new.is_deleted := false;
    new.deleted_at := null;
    new.deleted_by := null;
  else
    if old.is_deleted then
      raise exception 'Un comite eliminado no puede modificarse.' using errcode = '23514';
    end if;

    new.created_at := old.created_at;
    new.created_by := old.created_by;
    new.updated_by := v_actor;

    if old.is_active = true and new.is_active = false and exists (
      select 1
      from public.associate_committees ac
      where ac.committee_id = old.id
        and ac.is_active = true
        and ac.is_deleted = false
    ) then
      raise exception 'No se puede inactivar un comite con asociados vigentes.'
        using errcode = '23514';
    end if;

    if old.is_deleted = false and new.is_deleted = true then
      if not public.has_module_permission('comites', 'admin') then
        raise exception 'No tienes permisos para eliminar comites.' using errcode = '42501';
      end if;

      if exists (
        select 1
        from public.associate_committees ac
        where ac.committee_id = old.id
          and ac.is_active = true
          and ac.is_deleted = false
      ) then
        raise exception 'No se puede eliminar un comite con asociados vigentes.'
          using errcode = '23514';
      end if;

      new.deleted_at := coalesce(new.deleted_at, now());
      new.deleted_by := v_actor;
      new.is_active := false;
    else
      new.deleted_at := old.deleted_at;
      new.deleted_by := old.deleted_by;
    end if;
  end if;

  return new;
end;
$$;

-- Estos DROP solo reemplazan objetos propios de S16 para permitir una reejecucion segura.
drop trigger if exists trg_committees_prepare on public.committees;
create trigger trg_committees_prepare
  before insert or update on public.committees
  for each row execute function public.fn_prepare_committee();

drop trigger if exists trg_committees_updated_at on public.committees;
create trigger trg_committees_updated_at
  before update on public.committees
  for each row execute function public.fn_set_updated_at();

create or replace function public.fn_prepare_associate_committee()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
begin
  if v_actor is null then
    raise exception 'No se pudo identificar al usuario autenticado.' using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    new.created_by := v_actor;
    new.updated_by := v_actor;
    new.is_deleted := false;
    new.deleted_at := null;
    new.deleted_by := null;
  else
    if old.is_deleted then
      raise exception 'Un vinculo eliminado no puede modificarse.' using errcode = '23514';
    end if;

    new.created_at := old.created_at;
    new.created_by := old.created_by;
    new.updated_by := v_actor;

    if old.is_deleted = false and new.is_deleted = true then
      if new.is_active or new.left_at is null then
        raise exception 'El vinculo debe cerrarse antes de eliminarse.' using errcode = '23514';
      end if;
      new.deleted_at := coalesce(new.deleted_at, now());
      new.deleted_by := v_actor;
    else
      new.deleted_at := old.deleted_at;
      new.deleted_by := old.deleted_by;
    end if;
  end if;

  if new.is_active and new.is_deleted then
    raise exception 'Un vinculo eliminado no puede permanecer activo.' using errcode = '23514';
  end if;

  if new.joined_at is not null
     and new.joined_at > (now() at time zone 'America/Lima')::date then
    raise exception 'La fecha de incorporacion no puede ser futura.' using errcode = '22023';
  end if;

  if new.is_active then
    perform 1
    from public.committees c
    where c.id = new.committee_id
      and c.is_active = true
      and c.is_deleted = false
    for share;

    if not found then
      raise exception 'El comite seleccionado no existe o esta inactivo.' using errcode = '22023';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_associate_committees_prepare on public.associate_committees;
create trigger trg_associate_committees_prepare
  before insert or update on public.associate_committees
  for each row execute function public.fn_prepare_associate_committee();

drop trigger if exists trg_associate_committees_updated_at on public.associate_committees;
create trigger trg_associate_committees_updated_at
  before update on public.associate_committees
  for each row execute function public.fn_set_updated_at();

drop trigger if exists trg_audit_committees on public.committees;
create trigger trg_audit_committees
  after insert or update or delete on public.committees
  for each row execute function public.fn_audit_row_change();

drop trigger if exists trg_audit_associate_committees on public.associate_committees;
create trigger trg_audit_associate_committees
  after insert or update or delete on public.associate_committees
  for each row execute function public.fn_audit_row_change();

-- Integridad referencial preparada por Hito 7
do $$
begin
  if exists (
    select 1 from public.storage_nodes sn
    where sn.committee_id is not null
      and not exists (select 1 from public.committees c where c.id = sn.committee_id)
  ) or exists (
    select 1 from public.documents d
    where d.committee_id is not null
      and not exists (select 1 from public.committees c where c.id = d.committee_id)
  ) then
    raise exception 'Existen committee_id documentales sin comite valido. Regulariza los datos antes de aplicar S16.';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'fk_storage_nodes_committee'
      and conrelid = 'public.storage_nodes'::regclass
  ) then
    alter table public.storage_nodes
      add constraint fk_storage_nodes_committee
      foreign key (committee_id) references public.committees(id) on delete restrict;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'fk_documents_committee'
      and conrelid = 'public.documents'::regclass
  ) then
    alter table public.documents
      add constraint fk_documents_committee
      foreign key (committee_id) references public.committees(id) on delete restrict;
  end if;
end $$;

create index if not exists idx_storage_nodes_committee
  on public.storage_nodes (committee_id)
  where is_deleted = false and committee_id is not null;

create index if not exists idx_documents_committee
  on public.documents (committee_id)
  where is_deleted = false and committee_id is not null;

-- RLS
alter table public.committees enable row level security;
alter table public.associate_committees enable row level security;

drop policy if exists committees_read on public.committees;
create policy committees_read on public.committees
  for select to authenticated
  using (
    public.is_admin()
    or (is_deleted = false and public.has_module_permission('comites', 'read'))
  );

drop policy if exists committees_create on public.committees;
create policy committees_create on public.committees
  for insert to authenticated
  with check (public.has_module_permission('comites', 'create'));

drop policy if exists committees_update on public.committees;
create policy committees_update on public.committees
  for update to authenticated
  using (
    is_deleted = false
    and public.has_module_permission('comites', 'update')
  )
  with check (
    public.has_module_permission('comites', 'update')
  );

drop policy if exists associate_committees_read on public.associate_committees;
create policy associate_committees_read on public.associate_committees
  for select to authenticated
  using (
    public.is_admin()
    or (
      is_deleted = false
      and (
        public.has_module_permission('asociados', 'read')
        or public.has_module_permission('comites', 'read')
      )
    )
  );

revoke insert, update on public.committees from authenticated;
grant select on public.committees to authenticated;
grant insert (code, name, description) on public.committees to authenticated;
grant update (code, name, description) on public.committees to authenticated;
grant select on public.associate_committees to authenticated;

-- Helper interno para altas atomicas
create or replace function public.insert_initial_associate_committee(
  p_associate_id uuid,
  p_committee_id uuid,
  p_joined_at date
)
returns public.associate_committees
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_assignment public.associate_committees%rowtype;
begin
  perform 1
  from public.committees c
  where c.id = p_committee_id
    and c.is_active = true
    and c.is_deleted = false
  for update;

  if not found then
    raise exception 'El comite seleccionado no existe o esta inactivo.' using errcode = '22023';
  end if;

  insert into public.associate_committees (
    associate_id, committee_id, joined_at, is_primary, is_active,
    created_by, updated_by
  ) values (
    p_associate_id, p_committee_id, p_joined_at, true, true,
    v_actor, v_actor
  )
  returning * into v_assignment;

  return v_assignment;
end;
$$;

create or replace function public.set_associate_primary_committee(
  p_associate_id uuid,
  p_committee_id uuid,
  p_effective_date date,
  p_notes text default null
)
returns public.associate_committees
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_current public.associate_committees%rowtype;
  v_result public.associate_committees%rowtype;
  v_today date := (now() at time zone 'America/Lima')::date;
begin
  if not public.has_module_permission('asociados', 'update') then
    raise exception 'No tienes permisos para actualizar asociados.' using errcode = '42501';
  end if;
  if p_committee_id is null or p_effective_date is null then
    raise exception 'Comite y fecha efectiva son obligatorios.' using errcode = '22023';
  end if;
  if p_effective_date > v_today then
    raise exception 'La fecha efectiva no puede ser futura.' using errcode = '22023';
  end if;

  perform 1 from public.associates a
  where a.id = p_associate_id and a.is_deleted = false
  for update;
  if not found then
    raise exception 'El asociado no existe.' using errcode = 'P0002';
  end if;

  perform 1 from public.committees c
  where c.id = p_committee_id and c.is_active = true and c.is_deleted = false
  for update;
  if not found then
    raise exception 'El comite seleccionado no existe o esta inactivo.' using errcode = '22023';
  end if;

  select * into v_current
  from public.associate_committees ac
  where ac.associate_id = p_associate_id
    and ac.is_primary = true
    and ac.is_active = true
    and ac.is_deleted = false
  for update;

  if found and v_current.committee_id = p_committee_id then
    return v_current;
  end if;
  if found and v_current.joined_at is not null and p_effective_date < v_current.joined_at then
    raise exception 'La fecha efectiva no puede ser anterior al ingreso vigente.' using errcode = '22023';
  end if;

  if v_current.id is not null then
    update public.associate_committees
    set is_active = false,
        left_at = p_effective_date,
        updated_by = v_actor
    where id = v_current.id;
  end if;

  insert into public.associate_committees (
    associate_id, committee_id, joined_at, is_primary, is_active,
    notes, created_by, updated_by
  ) values (
    p_associate_id, p_committee_id, p_effective_date, true, true,
    nullif(btrim(p_notes), ''), v_actor, v_actor
  )
  returning * into v_result;

  return v_result;
end;
$$;

create or replace function public.clear_associate_primary_committee(
  p_associate_id uuid,
  p_effective_date date,
  p_notes text default null
)
returns public.associate_committees
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_current public.associate_committees%rowtype;
  v_today date := (now() at time zone 'America/Lima')::date;
begin
  if not public.has_module_permission('asociados', 'update') then
    raise exception 'No tienes permisos para actualizar asociados.' using errcode = '42501';
  end if;
  if p_effective_date is null then
    raise exception 'La fecha efectiva es obligatoria.' using errcode = '22023';
  end if;
  if p_effective_date > v_today then
    raise exception 'La fecha efectiva no puede ser futura.' using errcode = '22023';
  end if;

  perform 1 from public.associates a
  where a.id = p_associate_id and a.is_deleted = false
  for update;
  if not found then
    raise exception 'El asociado no existe.' using errcode = 'P0002';
  end if;

  select * into v_current
  from public.associate_committees ac
  where ac.associate_id = p_associate_id
    and ac.is_primary = true
    and ac.is_active = true
    and ac.is_deleted = false
  for update;

  if not found then
    return null;
  end if;
  if v_current.joined_at is not null and p_effective_date < v_current.joined_at then
    raise exception 'La fecha efectiva no puede ser anterior al ingreso vigente.' using errcode = '22023';
  end if;

  update public.associate_committees
  set is_active = false,
      left_at = p_effective_date,
      notes = coalesce(nullif(btrim(p_notes), ''), notes),
      updated_by = v_actor
  where id = v_current.id
  returning * into v_current;

  return v_current;
end;
$$;

create or replace function public.set_committee_active_status(
  p_committee_id uuid,
  p_is_active boolean
)
returns public.committees
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_committee public.committees%rowtype;
begin
  if not public.has_module_permission('comites', 'update') then
    raise exception 'No tienes permisos para actualizar comites.' using errcode = '42501';
  end if;
  if v_actor is null then
    raise exception 'No se pudo identificar al usuario autenticado.' using errcode = '42501';
  end if;
  if p_is_active is null then
    raise exception 'El estado del comite es obligatorio.' using errcode = '22023';
  end if;

  select * into v_committee
  from public.committees c
  where c.id = p_committee_id and c.is_deleted = false
  for update;
  if not found then
    raise exception 'El comite no existe.' using errcode = 'P0002';
  end if;

  update public.committees
  set is_active = p_is_active
  where id = p_committee_id
  returning * into v_committee;

  return v_committee;
end;
$$;

create or replace function public.filter_associate_ids_by_committee(
  p_committee_id uuid default null,
  p_without_committee boolean default false
)
returns table (associate_id uuid)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_without_committee boolean := coalesce(p_without_committee, false);
begin
  if not public.has_module_permission('asociados', 'read') then
    raise exception 'No tienes permisos para consultar asociados.' using errcode = '42501';
  end if;
  if p_committee_id is not null and v_without_committee then
    raise exception 'Los filtros por comite y sin comite son excluyentes.' using errcode = '22023';
  end if;

  return query
  select a.id
  from public.associates a
  where a.is_deleted = false
    and (
      (p_committee_id is null and not v_without_committee)
      or (
        p_committee_id is not null
        and exists (
          select 1 from public.associate_committees ac
          where ac.associate_id = a.id
            and ac.committee_id = p_committee_id
            and ac.is_primary = true
            and ac.is_active = true
            and ac.is_deleted = false
        )
      )
      or (
        v_without_committee
        and not exists (
          select 1 from public.associate_committees ac
          where ac.associate_id = a.id
            and ac.is_primary = true
            and ac.is_active = true
            and ac.is_deleted = false
        )
      )
    );
end;
$$;

-- Extensiones S16 sin renombrar ni reemplazar las RPC operativas existentes
do $$
begin
  if to_regprocedure('public.create_direct_associate(text,text,uuid,date,text,text,uuid,uuid,text,text,text,text,text,text,date,uuid,uuid,uuid,text,boolean,text)') is null then
    raise exception 'No existe la RPC base create_direct_associate de S9. Aplica las migraciones anteriores antes de S16.';
  end if;

  if to_regprocedure('public.convert_prospect_to_associate(uuid,text,uuid,date,uuid,text)') is null then
    raise exception 'No existe la RPC base convert_prospect_to_associate de S9. Aplica las migraciones anteriores antes de S16.';
  end if;
end $$;

create or replace function public.create_direct_associate_with_committee(
  p_company_name text,
  p_ruc text,
  p_associate_status_id uuid,
  p_association_date date,
  p_trade_name text default null,
  p_economic_activity text default null,
  p_activity_type_id uuid default null,
  p_company_size_id uuid default null,
  p_address text default null,
  p_corporate_email text default null,
  p_landline_phone text default null,
  p_mobile_phone_1 text default null,
  p_mobile_phone_2 text default null,
  p_website text default null,
  p_anniversary_date date default null,
  p_category_id uuid default null,
  p_affiliation_responsible_user_id uuid default null,
  p_captador_id uuid default null,
  p_book_registry text default null,
  p_welcome_status boolean default false,
  p_notes text default null,
  p_committee_id uuid default null
)
returns public.associates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_associate public.associates%rowtype;
begin
  v_associate := public.create_direct_associate(
    p_company_name, p_ruc, p_associate_status_id, p_association_date,
    p_trade_name, p_economic_activity, p_activity_type_id, p_company_size_id,
    p_address, p_corporate_email, p_landline_phone, p_mobile_phone_1,
    p_mobile_phone_2, p_website, p_anniversary_date, p_category_id,
    p_affiliation_responsible_user_id, p_captador_id, p_book_registry,
    p_welcome_status, p_notes
  );

  if p_committee_id is not null then
    perform public.insert_initial_associate_committee(
      v_associate.id, p_committee_id, p_association_date
    );
  end if;

  return v_associate;
end;
$$;

create or replace function public.convert_prospect_to_associate_with_committee(
  p_prospect_id uuid,
  p_ruc text,
  p_associate_status_id uuid,
  p_association_date date,
  p_responsible_user_id uuid default null,
  p_notes text default null,
  p_committee_id uuid default null
)
returns public.associates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_associate public.associates%rowtype;
begin
  v_associate := public.convert_prospect_to_associate(
    p_prospect_id, p_ruc, p_associate_status_id, p_association_date,
    p_responsible_user_id, p_notes
  );

  if p_committee_id is not null then
    perform public.insert_initial_associate_committee(
      v_associate.id, p_committee_id, p_association_date
    );
  end if;

  return v_associate;
end;
$$;

revoke all on function public.insert_initial_associate_committee(uuid, uuid, date)
  from public, anon, authenticated;
revoke all on function public.set_associate_primary_committee(uuid, uuid, date, text)
  from public, anon;
revoke all on function public.clear_associate_primary_committee(uuid, date, text)
  from public, anon;
revoke all on function public.set_committee_active_status(uuid, boolean)
  from public, anon;
revoke all on function public.filter_associate_ids_by_committee(uuid, boolean)
  from public, anon;
revoke all on function public.create_direct_associate_with_committee(
  text, text, uuid, date, text, text, uuid, uuid, text, text, text, text,
  text, text, date, uuid, uuid, uuid, text, boolean, text, uuid
) from public, anon;
revoke all on function public.convert_prospect_to_associate_with_committee(uuid, text, uuid, date, uuid, text, uuid)
  from public, anon;

grant execute on function public.set_associate_primary_committee(uuid, uuid, date, text)
  to authenticated;
grant execute on function public.clear_associate_primary_committee(uuid, date, text)
  to authenticated;
grant execute on function public.set_committee_active_status(uuid, boolean)
  to authenticated;
grant execute on function public.filter_associate_ids_by_committee(uuid, boolean)
  to authenticated;
grant execute on function public.create_direct_associate_with_committee(
  text, text, uuid, date, text, text, uuid, uuid, text, text, text, text,
  text, text, date, uuid, uuid, uuid, text, boolean, text, uuid
) to authenticated;
grant execute on function public.convert_prospect_to_associate_with_committee(uuid, text, uuid, date, uuid, text, uuid)
  to authenticated;

comment on table public.committees is 'Comites institucionales administrados por el modulo Comites';
comment on table public.associate_committees is 'Historial de vinculacion entre asociados y comites';
