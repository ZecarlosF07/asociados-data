-- ============================================
-- Auditoria Hito S9: Alta directa de asociados historicos
-- Ejecutar despues de aplicar la migracion S9.
-- ============================================

select
  'associate_code_generator' as check_name,
  public.generate_associate_internal_code('20601234567', date '2024-08-10') as found,
  'A24234567' as expected,
  (
    public.generate_associate_internal_code('20601234567', date '2024-08-10')
    = 'A24234567'
  ) as ok;

select
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as result_type,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'generate_associate_internal_code',
    'create_direct_associate',
    'convert_prospect_to_associate'
  )
order by p.proname;

select
  'active_associate_duplicate_ruc' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(jsonb_build_object('ruc', ruc, 'total', total)), '[]'::jsonb) as detail
from (
  select ruc, count(*)::int as total
  from public.associates
  where is_deleted = false
  group by ruc
  having count(*) > 1
) duplicates;

select
  'active_associate_duplicate_internal_code' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(jsonb_build_object('internal_code', internal_code, 'total', total)), '[]'::jsonb) as detail
from (
  select internal_code, count(*)::int as total
  from public.associates
  where is_deleted = false
  group by internal_code
  having count(*) > 1
) duplicates;

select
  'direct_associate_audit_events' as check_name,
  count(*)::int as found,
  0 as expected_min,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'event_at', event_at,
        'associate_id', entity_id,
        'code', new_data ->> 'internal_code'
      )
      order by event_at desc
    ),
    '[]'::jsonb
  ) as detail
from public.audit_logs
where entity_name = 'associates'
  and action_type = 'create_direct_associate'
  and extra_meta ->> 'source' = 'direct_historical_associate';

select
  'new_direct_codes_format' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'ruc', a.ruc,
        'association_date', a.association_date,
        'internal_code', a.internal_code,
        'expected_code',
        public.generate_associate_internal_code(a.ruc, a.association_date)
      )
    ),
    '[]'::jsonb
  ) as detail
from public.associates a
where a.is_deleted = false
  and a.prospect_origin_id is null
  and a.association_date is not null
  and a.internal_code <> public.generate_associate_internal_code(a.ruc, a.association_date)
  and exists (
    select 1
    from public.audit_logs al
    where al.entity_name = 'associates'
      and al.entity_id = a.id
      and al.action_type = 'create_direct_associate'
      and al.extra_meta ->> 'source' = 'direct_historical_associate'
  );
