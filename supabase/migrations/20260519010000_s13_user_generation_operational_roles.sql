-- ============================================
-- Hito S13: Generacion de usuarios y roles operativos
-- ============================================

do $$
begin
  if exists (
    select 1
    from public.user_profiles up
    join public.roles r on r.id = up.role_id
    where r.code in ('OPERADOR', 'CONSULTA')
  ) then
    raise exception 'No se puede eliminar OPERADOR/CONSULTA: existen perfiles asociados a esos roles.'
      using errcode = '23503';
  end if;
end $$;

insert into public.roles (code, name, description, is_active, is_system) values
  ('CAPTACION', 'Captacion', 'Acceso operativo al modulo de prospectos.', true, true),
  ('FACTURACION', 'Facturacion', 'Acceso operativo a cobranza y consulta de membresias.', true, true),
  ('FIDELIZACION', 'Fidelizacion', 'Acceso operativo a prospectos, asociados, membresias, cobranza y documentos.', true, true),
  ('ALTA_DIRECCION', 'Alta Direccion', 'Acceso de supervision a reportes y auditoria.', true, true)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  is_active = true,
  is_system = true,
  updated_at = now();

delete from public.role_permissions rp
using public.roles r
where rp.role_id = r.id
  and r.code in (
    'CAPTACION',
    'FACTURACION',
    'FIDELIZACION',
    'ALTA_DIRECCION',
    'OPERADOR',
    'CONSULTA'
  );

delete from public.roles
where code in ('OPERADOR', 'CONSULTA');

-- ADMIN: acceso total.
insert into public.role_permissions (role_id, permission_id, is_allowed)
select r.id, p.id, true
from public.roles r
cross join public.permissions p
where r.code = 'ADMIN'
on conflict (role_id, permission_id) do update set
  is_allowed = excluded.is_allowed,
  updated_at = now();

-- CAPTACION: prospectos read/create/update.
insert into public.role_permissions (role_id, permission_id, is_allowed)
select r.id, p.id, true
from public.roles r
join public.permissions p on true
join public.modules m on m.id = p.module_id
where r.code = 'CAPTACION'
  and m.code = 'prospectos'
  and p.action_code in ('read', 'create', 'update')
on conflict (role_id, permission_id) do update set
  is_allowed = excluded.is_allowed,
  updated_at = now();

-- FACTURACION: cobranza read/create/update y membresias read.
insert into public.role_permissions (role_id, permission_id, is_allowed)
select r.id, p.id, true
from public.roles r
join public.permissions p on true
join public.modules m on m.id = p.module_id
where r.code = 'FACTURACION'
  and (
    (m.code = 'cobranza' and p.action_code in ('read', 'create', 'update'))
    or (m.code = 'membresias' and p.action_code = 'read')
  )
on conflict (role_id, permission_id) do update set
  is_allowed = excluded.is_allowed,
  updated_at = now();

-- FIDELIZACION: modulos operativos read/create/update.
insert into public.role_permissions (role_id, permission_id, is_allowed)
select r.id, p.id, true
from public.roles r
join public.permissions p on true
join public.modules m on m.id = p.module_id
where r.code = 'FIDELIZACION'
  and m.code in ('prospectos', 'asociados', 'membresias', 'cobranza', 'documentos')
  and p.action_code in ('read', 'create', 'update')
on conflict (role_id, permission_id) do update set
  is_allowed = excluded.is_allowed,
  updated_at = now();

-- ALTA_DIRECCION: reportes y auditoria en lectura.
insert into public.role_permissions (role_id, permission_id, is_allowed)
select r.id, p.id, true
from public.roles r
join public.permissions p on true
join public.modules m on m.id = p.module_id
where r.code = 'ALTA_DIRECCION'
  and m.code in ('reportes', 'auditoria')
  and p.action_code = 'read'
on conflict (role_id, permission_id) do update set
  is_allowed = excluded.is_allowed,
  updated_at = now();
