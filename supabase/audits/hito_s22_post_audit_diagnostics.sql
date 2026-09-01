-- ============================================================
-- Diagnostico posterior al audit S22
-- ============================================================
-- Solo lectura. Agrupa las causas exactas de los hallazgos restantes.

with membership_relation_issues as (
  select
    'membership_relation'::text as issue_group,
    child.id as entity_id,
    concat_ws(', ',
      case when child.associate_id is distinct from parent.associate_id
        then 'different_associate' end,
      case when child.start_date <= parent.start_date
        then 'child_start_not_after_parent' end
    ) as reason,
    jsonb_build_object(
      'child_id', child.id,
      'parent_id', parent.id,
      'child_associate_id', child.associate_id,
      'parent_associate_id', parent.associate_id,
      'child_start_date', child.start_date,
      'parent_start_date', parent.start_date,
      'child_created_at', child.created_at,
      'parent_created_at', parent.created_at
    ) as context
  from public.memberships child
  join public.memberships parent on parent.id = child.renewed_from_membership_id
  where not child.is_deleted and (
    child.associate_id is distinct from parent.associate_id
    or child.start_date <= parent.start_date
  )
), schedule_issues as (
  select
    'schedule'::text as issue_group,
    ps.id as entity_id,
    concat_ws(', ',
      case when ps.associate_id is distinct from m.associate_id
        then 'different_associate' end,
      case when ps.expected_amount <= 0
        then 'non_positive_amount' end,
      case when ps.period_month is not null and ps.period_month not between 1 and 12
        then 'invalid_period_month' end,
      case when csg.code is distinct from 'COLLECTION_STATUS'
        then 'invalid_collection_status' end,
      case when ps.due_date < m.start_date
        then 'due_before_membership_start' end,
      case when ps.due_date > m.end_date + case when mt.code = 'ANUAL' then 1 else 0 end
        then 'due_after_membership_end' end
    ) as reason,
    jsonb_build_object(
      'schedule_id', ps.id,
      'membership_id', m.id,
      'associate_id', ps.associate_id,
      'membership_associate_id', m.associate_id,
      'membership_type', mt.code,
      'membership_status', ms.code,
      'collection_status', cs.code,
      'is_operational', ps.is_operational,
      'has_valid_payment', exists (
        select 1 from public.payments p
        where p.payment_schedule_id = ps.id
          and not p.is_deleted and not p.is_reversed
      ),
      'start_date', m.start_date,
      'end_date', m.end_date,
      'due_date', ps.due_date,
      'period_year', ps.period_year,
      'period_month', ps.period_month,
      'expected_amount', ps.expected_amount
    ) as context
  from public.payment_schedules ps
  join public.memberships m on m.id = ps.membership_id
  join public.catalog_items mt on mt.id = m.membership_type_id
  join public.catalog_items ms on ms.id = m.membership_status_id
  left join public.catalog_items cs on cs.id = ps.collection_status_id
  left join public.catalog_groups csg on csg.id = cs.group_id
  where not ps.is_deleted and (
    ps.associate_id is distinct from m.associate_id
    or ps.expected_amount <= 0
    or ps.period_month is not null and ps.period_month not between 1 and 12
    or csg.code is distinct from 'COLLECTION_STATUS'
    or ps.due_date < m.start_date
    or ps.due_date > m.end_date + case when mt.code = 'ANUAL' then 1 else 0 end
  )
), payment_issues as (
  select
    'payment_relation'::text as issue_group,
    p.id as entity_id,
    concat_ws(', ',
      case when ps.id is null then 'schedule_missing' end,
      case when ps.is_deleted then 'schedule_deleted' end,
      case when m.id is null then 'membership_missing' end,
      case when m.is_deleted then 'membership_deleted' end,
      case when p.associate_id is distinct from ps.associate_id
        then 'different_schedule_associate' end,
      case when p.membership_id is distinct from ps.membership_id
        then 'different_schedule_membership' end,
      case when p.associate_id is distinct from m.associate_id
        then 'different_membership_associate' end
    ) as reason,
    jsonb_build_object(
      'payment_id', p.id,
      'payment_associate_id', p.associate_id,
      'payment_membership_id', p.membership_id,
      'payment_schedule_id', p.payment_schedule_id,
      'schedule_associate_id', ps.associate_id,
      'schedule_membership_id', ps.membership_id,
      'schedule_deleted', ps.is_deleted,
      'membership_associate_id', m.associate_id,
      'membership_deleted', m.is_deleted,
      'payment_date', p.payment_date,
      'amount_paid', p.amount_paid
    ) as context
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
), issues as (
  select * from membership_relation_issues
  union all
  select * from schedule_issues
  union all
  select * from payment_issues
)
select
  issue_group,
  reason,
  count(*)::integer as found,
  jsonb_agg(context order by entity_id) as detail
from issues
group by issue_group, reason
order by issue_group, reason;
