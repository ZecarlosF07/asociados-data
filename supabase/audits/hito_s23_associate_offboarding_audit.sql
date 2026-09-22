-- S23 audit: todas las filas con expected deben coincidir.
with checks as (
  select 1 as position, 's23_required_column' as check_name,
    count(*)::int as found, 1 as expected,
    coalesce(jsonb_agg(column_name), '[]'::jsonb) as detail
  from information_schema.columns
  where table_schema = 'public' and table_name = 'associates' and column_name = 'is_offboarded'
  union all
  select 2, 's23_required_rpcs', count(*)::int, 2,
    coalesce(jsonb_agg(proname order by proname), '[]'::jsonb)
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and proname in ('offboard_associate', 'reinstate_associate')
  union all
  select 3, 's23_suspended_remaining', count(*)::int, 0,
    coalesce(jsonb_agg(a.id order by a.id), '[]'::jsonb)
  from public.associates a join public.catalog_items ci on ci.id = a.associate_status_id
  where not a.is_deleted and ci.code = 'SUSPENDIDO'
  union all
  select 4, 's23_offboarded_not_inactive', count(*)::int, 0,
    coalesce(jsonb_agg(a.id order by a.id), '[]'::jsonb)
  from public.associates a join public.associate_operational_summary aos on aos.id = a.id
  where a.is_offboarded and not a.is_deleted and aos.effective_status_code <> 'INACTIVO'
  union all
  select 5, 's23_offboarded_with_operational_membership', count(*)::int, 0,
    coalesce(jsonb_agg(mo.id order by mo.id), '[]'::jsonb)
  from public.membership_operational_summary mo
  join public.associates a on a.id = mo.associate_id
  where a.is_offboarded and mo.effective_status_code in ('VIGENTE', 'PROGRAMADA')
  union all
  select 6, 's23_offboarded_with_active_committee', count(*)::int, 0,
    coalesce(jsonb_agg(ac.id order by ac.id), '[]'::jsonb)
  from public.associate_committees ac join public.associates a on a.id = ac.associate_id
  where a.is_offboarded and ac.is_active and not ac.is_deleted
  union all
  select 7, 's23_offboarded_without_reason_or_date', count(*)::int, 0,
    coalesce(jsonb_agg(a.id order by a.id), '[]'::jsonb)
  from public.associates a where a.is_offboarded and not a.is_deleted
    and (nullif(btrim(a.inactivation_reason), '') is null or a.inactivated_at is null)
  union all
  select 8, 's23_suspended_catalog_active', count(*)::int, 0,
    coalesce(jsonb_agg(ci.id order by ci.id), '[]'::jsonb)
  from public.catalog_items ci join public.catalog_groups cg on cg.id = ci.group_id
  where cg.code = 'ASSOCIATE_STATUS' and ci.code = 'SUSPENDIDO' and ci.is_active
  union all
  select 9, 's23_offboarded_future_collectible', count(*)::int, 0,
    coalesce(jsonb_agg(psb.id order by psb.id), '[]'::jsonb)
  from public.payment_schedule_balances psb
  join public.associates a on a.id = psb.associate_id
  where a.is_offboarded and psb.is_collectible and psb.due_date > public.business_today()
  union all
  select 10, 's23_old_suspension_still_executable',
    case when has_function_privilege('authenticated',
      'public.set_associate_suspension(uuid, boolean)', 'EXECUTE') then 1 else 0 end,
    0, '[]'::jsonb
)
select check_name, found, expected, detail from checks order by position;
