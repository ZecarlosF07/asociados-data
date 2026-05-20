-- ============================================================================
-- Auditoría Hito S14: Hardening preproducción - auditoría confiable y fechas de pago
-- Ejecutar después de aplicar la migración S14.
-- ============================================================================

-- 9.1 Policy de insert directo removida
-- Resultado esperado: true (0 políticas de INSERT encontradas)
select
  'audit_logs_direct_insert_policy_removed' as check_name,
  (count(*) = 0)::boolean as found,
  true as expected
from pg_policies
where schemaname = 'public'
  and tablename = 'audit_logs'
  and cmd = 'INSERT';

-- 9.2 RLS de auditoría activo
select
  'audit_logs_rls_enabled' as check_name,
  c.relrowsecurity as found,
  true as expected
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'audit_logs';

-- 9.2.1 Políticas de auditoría activas (Lectura)
select
  'audit_logs_read_policy_exists' as check_name,
  (count(*) > 0)::boolean as found,
  true as expected
from pg_policies
where schemaname = 'public'
  and tablename = 'audit_logs'
  and policyname = 'audit_logs_read';

-- 9.2.2 Políticas de auditoría activas (Eliminación Administrativa)
select
  'audit_logs_admin_delete_policy_exists' as check_name,
  (count(*) > 0)::boolean as found,
  true as expected
from pg_policies
where schemaname = 'public'
  and tablename = 'audit_logs'
  and policyname = 'audit_logs_admin_delete';

-- 9.3 Fuentes internas de auditoría (Triggers / Funciones de auditoría)
select
  'fn_audit_row_change_exists' as check_name,
  (count(*) > 0)::boolean as found,
  true as expected
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'fn_audit_row_change';

-- 9.4 Registro de pagos seguro (Uso de 'America/Lima')
select
  'register_payment_timezone_safe' as check_name,
  (prosrc ilike '%at time zone ''America/Lima''%')::boolean as found,
  true as expected
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'register_payment';

-- 9.4.2 Registro de pagos seguro (Sin cast inseguro 'p_payment_date::timestamptz')
select
  'register_payment_no_insecure_cast' as check_name,
  (prosrc not ilike '%p_payment_date::timestamptz%')::boolean as found,
  true as expected
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'register_payment';
