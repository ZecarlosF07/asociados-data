-- ============================================
-- Hito S7: audit de fechas de membresias y cronogramas
-- Detecta cronogramas existentes que requieren revision.
-- ============================================

with monthly_memberships as (
  select
    m.id,
    m.associate_id,
    m.start_date,
    m.end_date,
    m.monthly_billing_day,
    a.internal_code,
    a.company_name,
    mt.code as membership_type_code,
    case
      when m.monthly_billing_day >= extract(day from m.start_date)::integer
        then (
          date_trunc('month', m.start_date)::date
          + (m.monthly_billing_day - 1)
        )::date
      else (
        date_trunc('month', m.start_date)::date
        + interval '1 month'
        + (m.monthly_billing_day - 1) * interval '1 day'
      )::date
    end as expected_first_due_date
  from public.memberships m
  join public.catalog_items mt on mt.id = m.membership_type_id
  left join public.associates a on a.id = m.associate_id
  where m.is_deleted = false
    and mt.code = 'MENSUAL'
),
schedule_stats as (
  select
    mm.id as membership_id,
    count(ps.id)::integer as active_schedule_count,
    min(ps.due_date) as first_due_date,
    count(*) filter (where ps.due_date < mm.start_date)::integer as due_before_start_count,
    count(*) filter (
      where extract(day from ps.due_date)::integer <> mm.monthly_billing_day
    )::integer as billing_day_mismatch_count,
    count(*) filter (
      where exists (
        select 1
        from public.payments p
        where p.payment_schedule_id = ps.id
          and p.is_deleted = false
          and p.is_reversed = false
      )
    )::integer as paid_schedule_count
  from monthly_memberships mm
  left join public.payment_schedules ps on ps.membership_id = mm.id
    and ps.is_deleted = false
  group by mm.id
),
issues as (
  select
    mm.id as membership_id,
    mm.internal_code,
    mm.company_name,
    mm.start_date,
    mm.monthly_billing_day,
    mm.expected_first_due_date,
    ss.first_due_date,
    ss.active_schedule_count,
    ss.due_before_start_count,
    ss.billing_day_mismatch_count,
    ss.paid_schedule_count,
    array_remove(array[
      case
        when ss.active_schedule_count <> 12
          then 'schedule_count_not_12'
      end,
      case
        when ss.first_due_date is distinct from mm.expected_first_due_date
          then 'first_due_mismatch'
      end,
      case
        when ss.due_before_start_count > 0
          then 'due_before_start'
      end,
      case
        when ss.billing_day_mismatch_count > 0
          then 'billing_day_mismatch'
      end,
      case
        when ss.paid_schedule_count > 0
          then 'has_paid_schedules_review_before_regeneration'
      end
    ], null) as issue_codes
  from monthly_memberships mm
  join schedule_stats ss on ss.membership_id = mm.id
)
select
  'monthly_membership_date_issues' as check_name,
  count(*) filter (where cardinality(issue_codes) > 0)::integer as found,
  0 as expected,
  jsonb_agg(
    jsonb_build_object(
      'membership_id', membership_id,
      'internal_code', internal_code,
      'company_name', company_name,
      'start_date', start_date,
      'monthly_billing_day', monthly_billing_day,
      'expected_first_due_date', expected_first_due_date,
      'first_due_date', first_due_date,
      'active_schedule_count', active_schedule_count,
      'due_before_start_count', due_before_start_count,
      'billing_day_mismatch_count', billing_day_mismatch_count,
      'paid_schedule_count', paid_schedule_count,
      'issue_codes', issue_codes
    )
  ) filter (where cardinality(issue_codes) > 0) as detail
from issues;

-- Detalle expandido para revision manual.
with monthly_memberships as (
  select
    m.id,
    m.start_date,
    m.monthly_billing_day,
    a.internal_code,
    a.company_name,
    case
      when m.monthly_billing_day >= extract(day from m.start_date)::integer
        then (
          date_trunc('month', m.start_date)::date
          + (m.monthly_billing_day - 1)
        )::date
      else (
        date_trunc('month', m.start_date)::date
        + interval '1 month'
        + (m.monthly_billing_day - 1) * interval '1 day'
      )::date
    end as expected_first_due_date
  from public.memberships m
  join public.catalog_items mt on mt.id = m.membership_type_id
  left join public.associates a on a.id = m.associate_id
  where m.is_deleted = false
    and mt.code = 'MENSUAL'
),
schedule_stats as (
  select
    mm.id as membership_id,
    count(ps.id)::integer as active_schedule_count,
    min(ps.due_date) as first_due_date,
    count(*) filter (where ps.due_date < mm.start_date)::integer as due_before_start_count,
    count(*) filter (
      where extract(day from ps.due_date)::integer <> mm.monthly_billing_day
    )::integer as billing_day_mismatch_count,
    count(*) filter (
      where exists (
        select 1
        from public.payments p
        where p.payment_schedule_id = ps.id
          and p.is_deleted = false
          and p.is_reversed = false
      )
    )::integer as paid_schedule_count
  from monthly_memberships mm
  left join public.payment_schedules ps on ps.membership_id = mm.id
    and ps.is_deleted = false
  group by mm.id
)
select
  mm.internal_code,
  mm.company_name,
  mm.id as membership_id,
  mm.start_date,
  mm.monthly_billing_day,
  mm.expected_first_due_date,
  ss.first_due_date,
  ss.active_schedule_count,
  ss.due_before_start_count,
  ss.billing_day_mismatch_count,
  ss.paid_schedule_count
from monthly_memberships mm
join schedule_stats ss on ss.membership_id = mm.id
where ss.active_schedule_count <> 12
   or ss.first_due_date is distinct from mm.expected_first_due_date
   or ss.due_before_start_count > 0
   or ss.billing_day_mismatch_count > 0
   or ss.paid_schedule_count > 0
order by mm.start_date desc, mm.internal_code;
