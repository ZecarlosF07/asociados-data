-- ============================================
-- Auditoria Hito S10: Modulo de auditoria operativa
-- Ejecutar despues de aplicar la migracion S10.
-- ============================================

select
  'audit_logs_table' as check_name,
  count(*)::int as found,
  1 as expected
from information_schema.tables
where table_schema = 'public'
  and table_name = 'audit_logs';

select
  c.relname as relation_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'audit_logs';

select
  schemaname,
  tablename,
  policyname,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'audit_logs'
  and policyname in (
    'audit_logs_read',
    'audit_logs_insert',
    'audit_logs_admin_delete'
  )
order by policyname;

select
  'auditoria_module' as check_name,
  count(*)::int as found,
  1 as expected
from public.modules
where code = 'auditoria'
  and is_active = true;

select
  r.code as role_code,
  p.action_code,
  rp.is_allowed
from public.roles r
join public.role_permissions rp on rp.role_id = r.id
join public.permissions p on p.id = rp.permission_id
join public.modules m on m.id = p.module_id
where m.code = 'auditoria'
order by r.code, p.action_code;

select
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as result_type,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'purge_old_audit_logs';

select
  entity_name,
  count(*)::int as event_count
from public.audit_logs
group by entity_name
order by event_count desc, entity_name
limit 20;

select
  action_type,
  count(*)::int as event_count
from public.audit_logs
group by action_type
order by event_count desc, action_type
limit 20;

select
  al.event_at,
  al.entity_name,
  al.action_type,
  al.summary,
  up.first_name,
  up.last_name,
  up.institutional_email
from public.audit_logs al
left join public.user_profiles up on up.id = al.actor_user_id
order by al.event_at desc
limit 20;
