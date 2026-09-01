-- ============================================================
-- Audit S22A: base y saneamiento previo a la logica operativa
-- ============================================================
-- Todas las filas deben devolver found = 0 y expected = 0.

with required_columns as (
  select *
  from (values
    ('memberships', 'renewed_from_membership_id'),
    ('memberships', 'operational_end_date'),
    ('payment_schedules', 'is_operational')
  ) required(table_name, column_name)
  where not exists (
    select 1
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = required.table_name
      and c.column_name = required.column_name
  )
), missing_programmed_status as (
  select 'MEMBERSHIP_STATUS.PROGRAMADA'::text as item
  where public.find_catalog_item_id('MEMBERSHIP_STATUS', 'PROGRAMADA') is null
), memberships_without_end as (
  select m.id
  from public.memberships m
  where not m.is_deleted and m.end_date is null
), duplicate_current as (
  select m.associate_id, array_agg(m.id order by m.created_at desc, m.id desc) as membership_ids
  from public.memberships m
  where not m.is_deleted and m.is_current
  group by m.associate_id
  having count(*) > 1
), duplicate_operational_schedules as (
  select ps.membership_id, ps.period_year, coalesce(ps.period_month, 0) as period_month,
         array_agg(ps.id order by ps.created_at desc, ps.id desc) as schedule_ids
  from public.payment_schedules ps
  where not ps.is_deleted and ps.is_operational
  group by ps.membership_id, ps.period_year, coalesce(ps.period_month, 0)
  having count(*) > 1
), current_category_mismatch as (
  select m.id as membership_id, m.associate_id, m.category_id as membership_category_id,
         a.category_id as associate_category_id
  from public.memberships m
  join public.associates a on a.id = m.associate_id
  where not m.is_deleted and m.is_current and not a.is_deleted
    and a.category_id is not null
    and m.category_id is distinct from a.category_id
), checks as (
  select 1 as position, 's22a_missing_required_columns'::text as check_name,
         count(*)::integer as found, 0::integer as expected,
         coalesce(jsonb_agg(jsonb_build_object('table', table_name, 'column', column_name)), '[]'::jsonb) as detail
  from required_columns
  union all
  select 2, 's22a_missing_programmed_status', count(*)::integer, 0,
         coalesce(jsonb_agg(item), '[]'::jsonb)
  from missing_programmed_status
  union all
  select 3, 's22a_memberships_without_end', count(*)::integer, 0,
         coalesce(jsonb_agg(id order by id), '[]'::jsonb)
  from memberships_without_end
  union all
  select 4, 's22a_duplicate_current_memberships', count(*)::integer, 0,
         coalesce(jsonb_agg(jsonb_build_object('associate_id', associate_id, 'membership_ids', membership_ids)), '[]'::jsonb)
  from duplicate_current
  union all
  select 5, 's22a_duplicate_operational_schedules', count(*)::integer, 0,
         coalesce(jsonb_agg(jsonb_build_object(
           'membership_id', membership_id,
           'period_year', period_year,
           'period_month', period_month,
           'schedule_ids', schedule_ids
         )), '[]'::jsonb)
  from duplicate_operational_schedules
  union all
  select 6, 's22a_current_category_mismatch', count(*)::integer, 0,
         coalesce(jsonb_agg(to_jsonb(current_category_mismatch)), '[]'::jsonb)
  from current_category_mismatch
)
select check_name, found, expected, detail
from checks
order by position;
