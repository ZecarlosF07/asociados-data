-- ============================================
-- Auditoria Hito S13: Usuarios y roles operativos
-- Ejecutar despues de aplicar la migracion S13.
-- ============================================

select
  'roles_operativos_vigentes' as check_name,
  count(*)::int as found,
  5 as expected,
  coalesce(jsonb_agg(code order by code), '[]'::jsonb) as detail
from public.roles
where code in (
    'ADMIN',
    'CAPTACION',
    'FACTURACION',
    'FIDELIZACION',
    'ALTA_DIRECCION'
  )
  and is_active = true;

select
  'roles_retirados_no_existen' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(code order by code), '[]'::jsonb) as detail
from public.roles
where code in ('OPERADOR', 'CONSULTA');

select
  'perfiles_roles_retirados' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'profile_id', up.id,
        'email', up.institutional_email,
        'role_code', r.code
      )
    ),
    '[]'::jsonb
  ) as detail
from public.user_profiles up
join public.roles r on r.id = up.role_id
where r.code in ('OPERADOR', 'CONSULTA');

select
  'captacion_permisos' as check_name,
  coalesce(jsonb_agg(m.code || ':' || p.action_code order by m.code, p.action_code), '[]'::jsonb) as found,
  '["prospectos:create","prospectos:read","prospectos:update"]'::jsonb as expected
from public.roles r
join public.role_permissions rp on rp.role_id = r.id and rp.is_allowed = true
join public.permissions p on p.id = rp.permission_id
join public.modules m on m.id = p.module_id
where r.code = 'CAPTACION';

select
  'facturacion_permisos' as check_name,
  coalesce(jsonb_agg(m.code || ':' || p.action_code order by m.code, p.action_code), '[]'::jsonb) as found,
  '["cobranza:create","cobranza:read","cobranza:update","membresias:read"]'::jsonb as expected
from public.roles r
join public.role_permissions rp on rp.role_id = r.id and rp.is_allowed = true
join public.permissions p on p.id = rp.permission_id
join public.modules m on m.id = p.module_id
where r.code = 'FACTURACION';

select
  'fidelizacion_sin_modulos_restringidos' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(m.code || ':' || p.action_code order by m.code, p.action_code), '[]'::jsonb) as detail
from public.roles r
join public.role_permissions rp on rp.role_id = r.id and rp.is_allowed = true
join public.permissions p on p.id = rp.permission_id
join public.modules m on m.id = p.module_id
where r.code = 'FIDELIZACION'
  and m.code in ('dashboard', 'reportes', 'usuarios', 'auditoria', 'configuracion');

select
  'alta_direccion_permisos' as check_name,
  coalesce(jsonb_agg(m.code || ':' || p.action_code order by m.code, p.action_code), '[]'::jsonb) as found,
  '["auditoria:read","reportes:read"]'::jsonb as expected
from public.roles r
join public.role_permissions rp on rp.role_id = r.id and rp.is_allowed = true
join public.permissions p on p.id = rp.permission_id
join public.modules m on m.id = p.module_id
where r.code = 'ALTA_DIRECCION';

select
  'roles_operativos_sin_delete_admin' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'role', r.code,
        'module', m.code,
        'action', p.action_code
      )
      order by r.code, m.code, p.action_code
    ),
    '[]'::jsonb
  ) as detail
from public.roles r
join public.role_permissions rp on rp.role_id = r.id and rp.is_allowed = true
join public.permissions p on p.id = rp.permission_id
join public.modules m on m.id = p.module_id
where r.code in ('CAPTACION', 'FACTURACION', 'FIDELIZACION', 'ALTA_DIRECCION')
  and p.action_code in ('delete', 'admin');

select
  'admin_activo' as check_name,
  count(*)::int as found,
  1 as expected_min,
  coalesce(jsonb_agg(up.institutional_email order by up.institutional_email), '[]'::jsonb) as detail
from public.user_profiles up
join public.roles r on r.id = up.role_id
where r.code = 'ADMIN'
  and r.is_active = true
  and up.is_active = true
  and up.is_deleted = false;

select
  'internal_reference_read_policies' as check_name,
  count(*)::int as found,
  7 as expected,
  coalesce(jsonb_agg(tablename || ':' || policyname order by tablename, policyname), '[]'::jsonb) as detail
from pg_policies
where schemaname = 'public'
  and (
    (tablename = 'associates' and policyname = 'associates_internal_reference_read')
    or (tablename = 'prospects' and policyname = 'prospects_internal_reference_read')
    or (tablename = 'captadores' and policyname = 'captadores_internal_reference_read')
    or (tablename = 'categories' and policyname = 'categories_internal_reference_read')
    or (tablename = 'catalog_items' and policyname = 'catalog_items_internal_reference_read')
    or (tablename = 'catalog_groups' and policyname = 'catalog_groups_internal_reference_read')
    or (tablename = 'user_profiles' and policyname = 'user_profiles_internal_reference_read')
  );

select
  'facturacion_sin_asociados_module_permission' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(m.code || ':' || p.action_code order by m.code, p.action_code), '[]'::jsonb) as detail
from public.roles r
join public.role_permissions rp on rp.role_id = r.id and rp.is_allowed = true
join public.permissions p on p.id = rp.permission_id
join public.modules m on m.id = p.module_id
where r.code = 'FACTURACION'
  and m.code = 'asociados';

select
  'reportes_operational_read_policies' as check_name,
  count(*)::int as found,
  5 as expected,
  coalesce(jsonb_agg(tablename || ':' || policyname order by tablename, policyname), '[]'::jsonb) as detail
from pg_policies
where schemaname = 'public'
  and (
    (tablename = 'memberships' and policyname = 'memberships_reports_read')
    or (tablename = 'payment_schedules' and policyname = 'payment_schedules_reports_read')
    or (tablename = 'payments' and policyname = 'payments_reports_read')
    or (tablename = 'collection_actions' and policyname = 'collection_actions_reports_read')
    or (tablename = 'documents' and policyname = 'documents_reports_read')
  );

select
  'alta_direccion_sin_modulos_operativos' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(m.code || ':' || p.action_code order by m.code, p.action_code), '[]'::jsonb) as detail
from public.roles r
join public.role_permissions rp on rp.role_id = r.id and rp.is_allowed = true
join public.permissions p on p.id = rp.permission_id
join public.modules m on m.id = p.module_id
where r.code = 'ALTA_DIRECCION'
  and m.code in ('prospectos', 'asociados', 'membresias', 'cobranza', 'documentos');
