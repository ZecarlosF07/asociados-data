-- ============================================================
-- Preflight S22C: clasificacion de reparaciones posteriores a S22
-- ============================================================
-- Solo lectura. Devuelve una tabla breve por tipo de reparacion.

with invalid_links as (
  select
    child.id as child_id,
    parent.id as parent_id,
    child.start_date as child_start_date,
    parent.start_date as parent_start_date,
    child_status.code as child_status,
    parent_status.code as parent_status
  from public.memberships child
  join public.memberships parent on parent.id = child.renewed_from_membership_id
  join public.catalog_items child_status on child_status.id = child.membership_status_id
  join public.catalog_items parent_status on parent_status.id = parent.membership_status_id
  where not child.is_deleted and (
    child.associate_id is distinct from parent.associate_id
    or child.start_date <= parent.start_date
  )
), deleted_paid_memberships as (
  select
    m.id,
    m.associate_id,
    m.start_date,
    m.end_date,
    ms.code as stored_status,
    m.category_id,
    m.fee_amount,
    count(distinct p.id)::integer as payment_count,
    sum(p.amount_paid)::numeric(12,2) as paid_amount
  from public.memberships m
  join public.catalog_items ms on ms.id = m.membership_status_id
  join public.payments p on p.membership_id = m.id
    and not p.is_deleted and not p.is_reversed
  where m.is_deleted
  group by m.id, ms.code
), schedules_after_end as (
  select
    ps.id,
    ps.membership_id,
    mt.code as membership_type,
    ms.code as membership_status,
    m.is_current,
    ps.is_operational,
    exists (
      select 1 from public.payments p
      where p.payment_schedule_id = ps.id
        and not p.is_deleted and not p.is_reversed
    ) as has_valid_payment,
    m.start_date,
    m.end_date,
    m.operational_end_date,
    ps.due_date,
    public.membership_annual_end_date(m.start_date) as reconstructed_annual_end,
    ps.due_date <= public.membership_annual_end_date(m.start_date)
      + case when mt.code = 'ANUAL' then 1 else 0 end as fits_reconstructed_annual_period
  from public.payment_schedules ps
  join public.memberships m on m.id = ps.membership_id
  join public.catalog_items mt on mt.id = m.membership_type_id
  join public.catalog_items ms on ms.id = m.membership_status_id
  where not ps.is_deleted
    and ps.due_date > m.end_date + case when mt.code = 'ANUAL' then 1 else 0 end
), summaries as (
  select
    1 as position,
    'invalid_renewal_links'::text as issue_group,
    concat_ws(' / ', child_status, parent_status)::text as classification,
    count(*)::integer as found,
    jsonb_agg(jsonb_build_object(
      'child_id', child_id,
      'parent_id', parent_id,
      'child_start', child_start_date,
      'parent_start', parent_start_date
    ) order by child_id) as detail
  from invalid_links
  group by child_status, parent_status

  union all

  select
    2,
    'deleted_memberships_with_payments',
    stored_status,
    count(*)::integer,
    jsonb_agg(jsonb_build_object(
      'membership_id', id,
      'associate_id', associate_id,
      'start_date', start_date,
      'end_date', end_date,
      'category_missing', category_id is null,
      'fee_amount', fee_amount,
      'payment_count', payment_count,
      'paid_amount', paid_amount
    ) order by id)
  from deleted_paid_memberships
  group by stored_status

  union all

  select
    3,
    'schedules_after_membership_end',
    concat_ws(' / ',
      membership_type,
      membership_status,
      case when is_current then 'CURRENT' else 'HISTORICAL' end,
      case when is_operational then 'OPERATIONAL' else 'ANNULLED' end,
      case when has_valid_payment then 'WITH_PAYMENT' else 'WITHOUT_PAYMENT' end,
      case when fits_reconstructed_annual_period then 'FITS_ANNUAL' else 'EXCEEDS_ANNUAL' end
    ),
    count(*)::integer,
    jsonb_build_object(
      'memberships', count(distinct membership_id),
      'min_start_date', min(start_date),
      'max_current_end_date', max(end_date),
      'max_due_date', max(due_date),
      'max_reconstructed_end', max(reconstructed_annual_end)
    )
  from schedules_after_end
  group by membership_type, membership_status, is_current, is_operational,
           has_valid_payment, fits_reconstructed_annual_period
)
select issue_group, classification, found, detail
from summaries
order by position, classification;
