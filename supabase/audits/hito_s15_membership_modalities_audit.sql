-- Auditoria Hito S15: modalidades de cobro para membresias anuales.
-- Valida catalogos y consistencia basica de cronogramas generados.

with membership_types as (
  select ci.code, ci.label, ci.sort_order
  from public.catalog_items ci
  join public.catalog_groups cg on cg.id = ci.group_id
  where cg.code = 'MEMBERSHIP_TYPE'
    and ci.is_deleted = false
),
expected_types as (
  select *
  from (values
    ('MENSUAL',        'Mensual',        1),
    ('TRIMESTRAL',     'Trimestral',     2),
    ('CUATRIMESTRAL',  'Cuatrimestral',  3),
    ('SEMESTRAL',      'Semestral',      4),
    ('ANUAL',          'Anual',          5)
  ) as v(code, label, sort_order)
),
membership_stats as (
  select
    m.id as membership_id,
    mt.code as membership_type_code,
    m.start_date,
    m.end_date,
    m.monthly_billing_day,
    count(ps.id)::int as active_schedule_count,
    min(ps.due_date) as first_due_date,
    bool_or(ps.due_date < m.start_date) as has_due_before_start,
    bool_or(
      mt.code in ('MENSUAL', 'TRIMESTRAL', 'CUATRIMESTRAL', 'SEMESTRAL')
      and extract(day from ps.due_date)::int <> m.monthly_billing_day
    ) as has_wrong_billing_day,
    bool_or(
      mt.code = 'ANUAL'
      and ps.due_date <> (m.end_date + interval '1 day')::date
    ) as has_wrong_annual_due_date
  from public.memberships m
  join public.catalog_items mt on mt.id = m.membership_type_id
  left join public.payment_schedules ps
    on ps.membership_id = m.id
    and ps.is_deleted = false
  where m.is_deleted = false
  group by
    m.id,
    mt.code,
    m.start_date,
    m.end_date,
    m.monthly_billing_day
)
select
  'missing_membership_type' as section,
  jsonb_agg(to_jsonb(et) order by et.sort_order) as details
from expected_types et
left join membership_types mt on mt.code = et.code
where mt.code is null

union all

select
  'wrong_membership_type_order' as section,
  jsonb_agg(
    jsonb_build_object(
      'code', mt.code,
      'current_sort_order', mt.sort_order,
      'expected_sort_order', et.sort_order
    )
    order by et.sort_order
  ) as details
from expected_types et
join membership_types mt on mt.code = et.code
where mt.sort_order is distinct from et.sort_order

union all

select
  'periodic_memberships_without_billing_day' as section,
  jsonb_agg(to_jsonb(ms) order by ms.start_date desc) as details
from membership_stats ms
where ms.membership_type_code in ('MENSUAL', 'TRIMESTRAL', 'CUATRIMESTRAL', 'SEMESTRAL')
  and ms.monthly_billing_day is null

union all

select
  'wrong_schedule_count' as section,
  jsonb_agg(to_jsonb(ms) order by ms.start_date desc) as details
from membership_stats ms
where (
    ms.membership_type_code = 'MENSUAL'
    and ms.active_schedule_count <> 12
  )
  or (
    ms.membership_type_code = 'TRIMESTRAL'
    and ms.active_schedule_count <> 4
  )
  or (
    ms.membership_type_code = 'CUATRIMESTRAL'
    and ms.active_schedule_count <> 3
  )
  or (
    ms.membership_type_code = 'SEMESTRAL'
    and ms.active_schedule_count <> 2
  )
  or (
    ms.membership_type_code = 'ANUAL'
    and ms.active_schedule_count <> 1
  )

union all

select
  'date_rule_violations' as section,
  jsonb_agg(to_jsonb(ms) order by ms.start_date desc) as details
from membership_stats ms
where ms.has_due_before_start = true
  or ms.has_wrong_billing_day = true
  or ms.has_wrong_annual_due_date = true;
