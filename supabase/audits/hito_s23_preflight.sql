-- S23 preflight: ejecutar antes de la migracion. Los conteos informan el alcance.
with suspended as (
  select a.id from public.associates a
  join public.catalog_items ci on ci.id = a.associate_status_id
  where not a.is_deleted and ci.code = 'SUSPENDIDO'
), checks as (
  select 1 as position, 's23_suspended_to_migrate' as check_name,
    count(*)::int as found, null::int as expected,
    coalesce(jsonb_agg(id order by id), '[]'::jsonb) as detail from suspended
  union all
  select 2, 's23_suspended_with_membership', count(distinct s.id)::int, null::int,
    coalesce(jsonb_agg(distinct s.id), '[]'::jsonb)
  from suspended s join public.membership_operational_summary mo on mo.associate_id = s.id
  where mo.effective_status_code in ('VIGENTE', 'PROGRAMADA')
  union all
  select 3, 's23_suspended_with_active_committee', count(distinct s.id)::int, null::int,
    coalesce(jsonb_agg(distinct s.id), '[]'::jsonb)
  from suspended s join public.associate_committees ac on ac.associate_id = s.id
  where ac.is_active and not ac.is_deleted
  union all
  select 4, 's23_blocking_paid_scheduled_memberships', count(*)::int, 0,
    coalesce(jsonb_agg(mo.id order by mo.id), '[]'::jsonb)
  from public.membership_operational_summary mo
  join public.payment_schedules ps on ps.membership_id = mo.id and not ps.is_deleted
  join public.payments p on p.payment_schedule_id = ps.id and not p.is_deleted and not p.is_reversed
  where mo.effective_status_code = 'PROGRAMADA' and mo.associate_id in (select id from suspended)
  union all
  select 5, 's23_blocking_future_joined_committee', count(*)::int, 0,
    coalesce(jsonb_agg(ac.id order by ac.id), '[]'::jsonb)
  from public.associate_committees ac
  where ac.associate_id in (select id from suspended) and ac.is_active and not ac.is_deleted
    and ac.joined_at > public.business_today()
)
select check_name, found, expected, detail from checks order by position;
