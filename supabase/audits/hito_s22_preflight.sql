-- ============================================================
-- Preflight S22: casos que requieren revision humana
-- Ejecutar antes de aplicar la migracion S22.
-- Devuelve todos los controles en una sola grilla de resultados.
-- ============================================================

with active_memberships as (
  select m.*
  from public.memberships m
  join public.catalog_items ms on ms.id = m.membership_status_id
  where not m.is_deleted and ms.code not in ('CANCELADA', 'RENOVADA')
), duplicate_membership_losers as (
  select distinct older.id, older.associate_id
  from active_memberships older
  join active_memberships newer
    on newer.associate_id = older.associate_id
   and (newer.created_at, newer.id) > (older.created_at, older.id)
   and older.start_date <= coalesce(newer.end_date, newer.start_date + 364)
   and newer.start_date <= coalesce(older.end_date, older.start_date + 364)
), duplicate_memberships_with_payments as (
  select loser.id, loser.associate_id
  from duplicate_membership_losers loser
  where exists (
    select 1
    from public.payments payment
    left join public.payment_schedules schedule on schedule.id = payment.payment_schedule_id
    where not payment.is_deleted and not payment.is_reversed
      and (payment.membership_id = loser.id or schedule.membership_id = loser.id)
  )
), overpayments as (
  select schedule.id
  from public.payment_schedules schedule
  join public.payments payment on payment.payment_schedule_id = schedule.id
  where not payment.is_deleted and not payment.is_reversed
  group by schedule.id, schedule.expected_amount
  having sum(payment.amount_paid) > schedule.expected_amount
), crossed_relations as (
  select 'payment_schedule'::text as entity, schedule.id
  from public.payment_schedules schedule
  join public.memberships membership on membership.id = schedule.membership_id
  where schedule.associate_id is distinct from membership.associate_id
  union all
  select 'payment'::text, payment.id
  from public.payments payment
  join public.payment_schedules schedule on schedule.id = payment.payment_schedule_id
  where payment.associate_id is distinct from schedule.associate_id
     or payment.membership_id is distinct from schedule.membership_id
  union all
  select 'payment_membership'::text, payment.id
  from public.payments payment
  join public.memberships membership on membership.id = payment.membership_id
  where payment.associate_id is distinct from membership.associate_id
), duplicate_periods as (
  select schedule.membership_id, schedule.period_year,
    coalesce(schedule.period_month, 0) as period_month
  from public.payment_schedules schedule
  join public.catalog_items status on status.id = schedule.collection_status_id
  where not schedule.is_deleted and status.code <> 'ANULADO'
  group by schedule.membership_id, schedule.period_year,
    coalesce(schedule.period_month, 0)
  having count(*) > 1
), duplicate_schedules_with_payments as (
  select distinct schedule.id
  from duplicate_periods duplicate
  join public.payment_schedules schedule
    on schedule.membership_id = duplicate.membership_id
   and schedule.period_year = duplicate.period_year
   and coalesce(schedule.period_month, 0) = duplicate.period_month
  join public.catalog_items status
    on status.id = schedule.collection_status_id and status.code <> 'ANULADO'
  join public.payments payment on payment.payment_schedule_id = schedule.id
  where not payment.is_deleted and not payment.is_reversed
), invalid_payment_dates as (
  select payment.id
  from public.payments payment
  join public.memberships membership on membership.id = payment.membership_id
  where not payment.is_deleted and not payment.is_reversed
    and (
      payment.payment_date < membership.start_date
      or payment.payment_date > (now() at time zone 'America/Lima')::date
    )
), invalid_financial_data as (
  select 'membership'::text as entity, membership.id
  from public.memberships membership
  left join public.categories category on category.id = membership.category_id
  left join public.catalog_items membership_type on membership_type.id = membership.membership_type_id
  left join public.catalog_groups type_group on type_group.id = membership_type.group_id
  left join public.catalog_items membership_status on membership_status.id = membership.membership_status_id
  left join public.catalog_groups status_group on status_group.id = membership_status.group_id
  where not membership.is_deleted and (
    membership.category_id is null or category.id is null or membership.fee_amount <= 0
    or membership.end_date is not null and membership.end_date < membership.start_date
    or type_group.code is distinct from 'MEMBERSHIP_TYPE'
    or status_group.code is distinct from 'MEMBERSHIP_STATUS'
  )
  union all
  select 'payment_schedule'::text, schedule.id
  from public.payment_schedules schedule
  where not schedule.is_deleted and schedule.expected_amount <= 0
), checks as (
  select 1 as position,
    's22_blocking_duplicate_memberships_with_payments'::text as check_name,
    count(*)::int as found, 0 as expected,
    coalesce(jsonb_agg(jsonb_build_object(
      'membership_id', id, 'associate_id', associate_id
    ) order by id), '[]'::jsonb) as detail
  from duplicate_memberships_with_payments
  union all
  select 2, 's22_blocking_overpayments', count(*)::int, 0,
    coalesce(jsonb_agg(id order by id), '[]'::jsonb)
  from overpayments
  union all
  select 3, 's22_blocking_cross_associate_relations', count(*)::int, 0,
    coalesce(jsonb_agg(jsonb_build_object('entity', entity, 'id', id)
      order by entity, id), '[]'::jsonb)
  from crossed_relations
  union all
  select 4, 's22_blocking_duplicate_schedules_with_payments', count(*)::int, 0,
    coalesce(jsonb_agg(id order by id), '[]'::jsonb)
  from duplicate_schedules_with_payments
  union all
  select 5, 's22_blocking_invalid_payment_dates', count(*)::int, 0,
    coalesce(jsonb_agg(id order by id), '[]'::jsonb)
  from invalid_payment_dates
  union all
  select 6, 's22_blocking_invalid_financial_data', count(*)::int, 0,
    coalesce(jsonb_agg(jsonb_build_object('entity', entity, 'id', id)
      order by entity, id), '[]'::jsonb)
  from invalid_financial_data
)
select check_name, found, expected, detail
from checks
order by position;
