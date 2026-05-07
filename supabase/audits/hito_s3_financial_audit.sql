select
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as result_type,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'find_catalog_item_id',
    'refresh_associate_overdue_schedules',
    'refresh_associate_payment_health',
    'register_payment'
  )
order by p.proname;

select
  cg.code as group_code,
  ci.code as item_code,
  ci.label,
  ci.is_active
from public.catalog_items ci
join public.catalog_groups cg on cg.id = ci.group_id
where cg.code in ('COLLECTION_STATUS', 'PAYMENT_HEALTH', 'PAYMENT_METHOD')
  and ci.is_deleted = false
order by cg.code, ci.sort_order;

select
  schemaname,
  tablename,
  policyname,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('payment_schedules', 'payments', 'collection_actions')
order by tablename, policyname;
