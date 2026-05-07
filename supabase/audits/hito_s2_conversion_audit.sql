select
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as result_type,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'next_entity_code',
    'convert_prospect_to_associate'
  )
order by p.proname;

select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'idx_associates_code',
    'idx_associates_ruc',
    'idx_associates_prospect_origin_unique',
    'idx_prospects_converted_associate_unique'
  )
order by tablename, indexname;

select
  entity_code,
  period_year,
  last_sequence
from public.entity_counters
where entity_code = 'ASSOCIATES'
order by period_year desc;
