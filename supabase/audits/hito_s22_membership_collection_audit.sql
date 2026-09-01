-- ============================================================
-- Auditoria S22: membresias, saldos y cobranza operativa
-- ============================================================

-- El SQL Editor solo muestra el ultimo result set. Todos los checks se
-- consolidan en una sola tabla para que ninguno quede oculto.
with checks as (
select
  1 as position,
  's22_required_objects' as check_name,
  count(*)::int as found,
  18 as expected,
  coalesce(jsonb_agg(object_name order by object_name), '[]'::jsonb) as detail
from (
  select proname as object_name
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and proname in (
    'business_today', 'membership_annual_end_date', 'fn_assert_membership_operational_row',
    'fn_assert_schedule_row', 'fn_generate_membership_schedule',
    'fn_assert_membership_schedule_total',
    'fn_sync_associate_operational_cache',
    'create_membership_period', 'renew_membership_period',
    'cancel_membership_period', 'cancel_scheduled_membership',
    'register_payment', 'reverse_payment', 'register_collection_action',
    'set_associate_suspension'
  )
  union all
  select table_name
  from information_schema.views
  where table_schema = 'public' and table_name in (
    'membership_operational_summary', 'payment_schedule_balances',
    'associate_operational_summary'
  )
) objects
union all
select
  2 as position,
  's22_multiple_effective_memberships' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(associate_id order by associate_id), '[]'::jsonb) as detail
from (
  select associate_id
  from public.membership_operational_summary
  where effective_status_code = 'VIGENTE'
  group by associate_id having count(*) > 1
) invalid
union all
select
  3 as position,
  's22_multiple_scheduled_memberships' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(associate_id order by associate_id), '[]'::jsonb) as detail
from (
  select associate_id
  from public.membership_operational_summary
  where effective_status_code = 'PROGRAMADA'
  group by associate_id having count(*) > 1
) invalid
union all
select
  4 as position,
  's22_latest_membership_marker' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(id order by id), '[]'::jsonb) as detail
from (
  select m.id, m.is_current,
    row_number() over (
      partition by m.associate_id order by m.created_at desc, m.id desc
    ) as position
  from public.memberships m
  where not m.is_deleted
) ranked
where is_current is distinct from (position = 1)
union all
select
  5 as position,
  's22_stored_vigente_with_different_effective_status' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(id order by id), '[]'::jsonb) as detail
from public.membership_operational_summary
where stored_status_code = 'VIGENTE'
  and effective_status_code <> 'VIGENTE'
union all
select
  6 as position,
  's22_overlapping_operational_periods' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(jsonb_build_object('left', left_id, 'right', right_id)), '[]'::jsonb) as detail
from (
  select a.id as left_id, b.id as right_id
  from public.membership_operational_summary a
  join public.membership_operational_summary b
    on b.associate_id = a.associate_id and b.id > a.id
   and a.effective_status_code <> 'CANCELADA'
   and b.effective_status_code <> 'CANCELADA'
   and a.start_date <= b.effective_end_date
   and b.start_date <= a.effective_end_date
) invalid
union all
select
  7 as position,
  's22_active_without_effective_membership' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(aos.id order by aos.id), '[]'::jsonb) as detail
from public.associate_operational_summary aos
where aos.effective_status_code = 'ACTIVO'
  and not exists (
    select 1 from public.membership_operational_summary mo
    where mo.associate_id = aos.id and mo.effective_status_code = 'VIGENTE'
  )
union all
select
  8 as position,
  's22_nonactive_with_effective_membership' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(aos.id order by aos.id), '[]'::jsonb) as detail
from public.associate_operational_summary aos
where aos.effective_status_code not in ('ACTIVO', 'SUSPENDIDO')
  and exists (
    select 1 from public.membership_operational_summary mo
    where mo.associate_id = aos.id and mo.effective_status_code = 'VIGENTE'
  )
union all
select
  9 as position,
  's22_associate_operational_cache_drift' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(a.id order by a.id), '[]'::jsonb) as detail
from public.associates a
join public.associate_operational_summary summary on summary.id = a.id
left join public.catalog_items stored_status on stored_status.id = a.associate_status_id
left join public.catalog_items stored_health on stored_health.id = a.payment_health_status_id
where not a.is_deleted and (
  stored_status.code is distinct from summary.effective_status_code
  or stored_health.code is distinct from summary.payment_health_code
)
union all
select
  10 as position,
  's22_memberships_without_operational_schedule' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(mo.id order by mo.id), '[]'::jsonb) as detail
from public.membership_operational_summary mo
where mo.effective_status_code in ('VIGENTE', 'PROGRAMADA')
  and not exists (
    select 1 from public.payment_schedule_balances b
    where b.membership_id = mo.id and b.stored_collection_status_code <> 'ANULADO'
  )
union all
select
  11 as position,
  's22_schedule_amount_mismatch' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(membership_id order by membership_id), '[]'::jsonb) as detail
from (
  select mo.id as membership_id
  from public.membership_operational_summary mo
  join public.payment_schedule_balances b on b.membership_id = mo.id
  where mo.effective_status_code in ('VIGENTE', 'PROGRAMADA')
    and b.is_operational
  group by mo.id, mo.fee_amount
  having sum(b.expected_amount) <> mo.fee_amount
) invalid
union all
select
  12 as position,
  's22_duplicate_operational_schedules' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(jsonb_build_object(
    'membership_id', membership_id,
    'period_year', period_year,
    'period_month', period_month
  )), '[]'::jsonb) as detail
from (
  select membership_id, period_year, coalesce(period_month, 0) as period_month
  from public.payment_schedules
  where not is_deleted and is_operational
  group by membership_id, period_year, coalesce(period_month, 0)
  having count(*) > 1
) invalid
union all
select
  13 as position,
  's22_invalid_membership_data' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(m.id order by m.id), '[]'::jsonb) as detail
from public.memberships m
left join public.categories c on c.id = m.category_id
left join public.catalog_items mt on mt.id = m.membership_type_id
left join public.catalog_groups mtg on mtg.id = mt.group_id
left join public.catalog_items ms on ms.id = m.membership_status_id
left join public.catalog_groups msg on msg.id = ms.group_id
where not m.is_deleted and (
  m.category_id is null or c.id is null
  or m.fee_amount <= 0
  or m.end_date < m.start_date
  or mtg.code is distinct from 'MEMBERSHIP_TYPE' or not mt.is_active or mt.is_deleted
  or msg.code is distinct from 'MEMBERSHIP_STATUS' or not ms.is_active or ms.is_deleted
)
union all
select
  14 as position,
  's22_membership_relation_mismatch' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(child.id order by child.id), '[]'::jsonb) as detail
from public.memberships child
join public.memberships parent on parent.id = child.renewed_from_membership_id
where child.is_deleted = false and (
  child.associate_id is distinct from parent.associate_id
  or child.start_date <= parent.start_date
)
union all
select
  15 as position,
  's22_invalid_schedule_data' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(ps.id order by ps.id), '[]'::jsonb) as detail
from public.payment_schedules ps
join public.memberships m on m.id = ps.membership_id
join public.catalog_items mt on mt.id = m.membership_type_id
left join public.catalog_items cs on cs.id = ps.collection_status_id
left join public.catalog_groups csg on csg.id = cs.group_id
where not ps.is_deleted and (
  ps.associate_id is distinct from m.associate_id
  or ps.expected_amount <= 0
  or ps.period_month is not null and ps.period_month not between 1 and 12
  or csg.code is distinct from 'COLLECTION_STATUS'
  or ps.is_operational and (
    ps.due_date < m.start_date
    or ps.due_date > m.end_date + case when mt.code = 'ANUAL' then 1 else 0 end
  )
)
union all
select
  16 as position,
  's22_schedule_operational_flag_mismatch' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(ps.id order by ps.id), '[]'::jsonb) as detail
from public.payment_schedules ps
join public.catalog_items cs on cs.id = ps.collection_status_id
where not ps.is_deleted
  and ps.is_operational is distinct from (cs.code <> 'ANULADO')
union all
select
  17 as position,
  's22_tracking_state_stored_as_financial_status' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(id order by id), '[]'::jsonb) as detail
from public.payment_schedule_balances
where stored_collection_status_code = 'EN_GESTION'
union all
select
  18 as position,
  's22_annulled_or_scheduled_collectible' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(id order by id), '[]'::jsonb) as detail
from public.payment_schedule_balances
where is_collectible and (
  financial_status_code = 'ANULADO'
  or membership_effective_status_code = 'PROGRAMADA'
)
union all
select
  19 as position,
  's22_payments_before_membership_start' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(p.id order by p.id), '[]'::jsonb) as detail
from public.payments p
join public.memberships m on m.id = p.membership_id
where not p.is_deleted and not p.is_reversed
  and p.payment_date < m.start_date
union all
select
  20 as position,
  's22_schedule_payment_flags' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(id order by id), '[]'::jsonb) as detail
from public.payment_schedule_balances
where stored_collection_status_code <> 'ANULADO'
  and (is_paid is distinct from (outstanding_amount = 0)
    or (is_paid and paid_at is null)
    or (not is_paid and paid_at is not null))
union all
select
  21 as position,
  's22_overpayments' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(id order by id), '[]'::jsonb) as detail
from public.payment_schedule_balances
where paid_amount > expected_amount
union all
select
  22 as position,
  's22_balance_formula_mismatch' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(id order by id), '[]'::jsonb) as detail
from public.payment_schedule_balances
where outstanding_amount is distinct from greatest(expected_amount - paid_amount, 0)::numeric(12,2)
  or financial_status_code = 'PARCIAL' and paid_amount <= 0
union all
select
  23 as position,
  's22_payment_relation_mismatch' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(p.id order by p.id), '[]'::jsonb) as detail
from public.payments p
left join public.payment_schedules ps on ps.id = p.payment_schedule_id
left join public.memberships m on m.id = p.membership_id
where not p.is_deleted and not p.is_reversed and (
  ps.id is null or ps.is_deleted
  or m.id is null or m.is_deleted
  or p.associate_id is distinct from ps.associate_id
  or p.membership_id is distinct from ps.membership_id
  or p.associate_id is distinct from m.associate_id
)
union all
select
  24 as position,
  's22_deleted_schedules_with_valid_payments' as check_name,
  count(distinct ps.id)::int as found,
  0 as expected,
  coalesce(jsonb_agg(distinct ps.id), '[]'::jsonb) as detail
from public.payment_schedules ps
join public.payments p on p.payment_schedule_id = ps.id
where ps.is_deleted = true and p.is_deleted = false and p.is_reversed = false
)
select check_name, found, expected, detail
from checks
order by position;
