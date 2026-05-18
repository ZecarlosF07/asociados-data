-- ============================================
-- Hito S12: audit de vencimiento de membresias anuales
-- Detecta cronogramas anuales cuyo vencimiento no corresponde
-- al dia siguiente de la fecha de fin de la membresia.
-- ============================================

with annual_memberships as (
  select
    m.id,
    m.associate_id,
    m.start_date,
    m.end_date,
    a.internal_code,
    a.company_name,
    mt.code as membership_type_code,
    case
      when m.end_date is not null
        then (m.end_date + interval '1 day')::date
      else null
    end as expected_due_date
  from public.memberships m
  join public.catalog_items mt on mt.id = m.membership_type_id
  left join public.associates a on a.id = m.associate_id
  where m.is_deleted = false
    and mt.code = 'ANUAL'
),
schedule_stats as (
  select
    am.id as membership_id,
    count(ps.id)::integer as active_schedule_count,
    min(ps.due_date) as first_due_date,
    max(ps.due_date) as last_due_date,
    count(*) filter (
      where ps.id is not null
        and ps.due_date is distinct from am.expected_due_date
    )::integer as due_mismatch_count,
    count(*) filter (
      where ps.id is not null
        and exists (
          select 1
          from public.payments p
          where p.payment_schedule_id = ps.id
            and p.is_deleted = false
            and p.is_reversed = false
        )
    )::integer as paid_schedule_count
  from annual_memberships am
  left join public.payment_schedules ps on ps.membership_id = am.id
    and ps.is_deleted = false
  group by am.id
),
issues as (
  select
    am.id as membership_id,
    am.internal_code,
    am.company_name,
    am.start_date,
    am.end_date,
    am.expected_due_date,
    ss.first_due_date,
    ss.last_due_date,
    ss.active_schedule_count,
    ss.due_mismatch_count,
    ss.paid_schedule_count,
    array_remove(array[
      case
        when am.end_date is null
          then 'missing_membership_end_date'
      end,
      case
        when ss.active_schedule_count <> 1
          then 'schedule_count_not_1'
      end,
      case
        when am.end_date is not null
          and ss.due_mismatch_count > 0
          then 'annual_due_date_mismatch'
      end
    ], null) as issue_codes
  from annual_memberships am
  join schedule_stats ss on ss.membership_id = am.id
)
select
  'annual_membership_due_issues' as check_name,
  count(*) filter (where cardinality(issue_codes) > 0)::integer as found,
  0 as expected,
  jsonb_agg(
    jsonb_build_object(
      'membership_id', membership_id,
      'internal_code', internal_code,
      'company_name', company_name,
      'start_date', start_date,
      'end_date', end_date,
      'expected_due_date', expected_due_date,
      'first_due_date', first_due_date,
      'last_due_date', last_due_date,
      'active_schedule_count', active_schedule_count,
      'due_mismatch_count', due_mismatch_count,
      'paid_schedule_count', paid_schedule_count,
      'issue_codes', issue_codes
    )
  ) filter (where cardinality(issue_codes) > 0) as detail
from issues;

-- Detalle expandido para revision manual.
with annual_memberships as (
  select
    m.id,
    m.associate_id,
    m.start_date,
    m.end_date,
    a.internal_code,
    a.company_name,
    mt.code as membership_type_code,
    case
      when m.end_date is not null
        then (m.end_date + interval '1 day')::date
      else null
    end as expected_due_date
  from public.memberships m
  join public.catalog_items mt on mt.id = m.membership_type_id
  left join public.associates a on a.id = m.associate_id
  where m.is_deleted = false
    and mt.code = 'ANUAL'
),
schedule_rows as (
  select
    am.id as membership_id,
    am.internal_code,
    am.company_name,
    am.start_date,
    am.end_date,
    am.expected_due_date,
    ps.id as schedule_id,
    ps.due_date,
    ps.period_year,
    ps.period_month,
    ps.expected_amount,
    ps.is_paid,
    exists (
      select 1
      from public.payments p
      where p.payment_schedule_id = ps.id
        and p.is_deleted = false
        and p.is_reversed = false
    ) as has_active_payment
  from annual_memberships am
  left join public.payment_schedules ps on ps.membership_id = am.id
    and ps.is_deleted = false
),
schedule_counts as (
  select
    membership_id,
    count(schedule_id)::integer as active_schedule_count
  from schedule_rows
  group by membership_id
)
select
  sr.internal_code,
  sr.company_name,
  sr.membership_id,
  sr.start_date,
  sr.end_date,
  sr.expected_due_date,
  sc.active_schedule_count,
  sr.schedule_id,
  sr.due_date,
  sr.period_year,
  sr.period_month,
  sr.expected_amount,
  sr.is_paid,
  sr.has_active_payment,
  array_remove(array[
    case
      when sr.end_date is null
        then 'missing_membership_end_date'
    end,
    case
      when sc.active_schedule_count <> 1
        then 'schedule_count_not_1'
    end,
    case
      when sr.end_date is not null
        and sr.due_date is distinct from sr.expected_due_date
        then 'annual_due_date_mismatch'
    end
  ], null) as issue_codes
from schedule_rows sr
join schedule_counts sc on sc.membership_id = sr.membership_id
where sr.end_date is null
   or sc.active_schedule_count <> 1
   or (
     sr.end_date is not null
     and sr.due_date is distinct from sr.expected_due_date
   )
order by sr.start_date desc, sr.internal_code, sr.due_date;
