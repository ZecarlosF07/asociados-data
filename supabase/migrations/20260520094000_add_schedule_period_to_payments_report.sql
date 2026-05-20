-- Expone el periodo de cuota en reportes de pagos registrados.
-- La fecha de pago responde "cuando se registró/pagó"; la cuota responde
-- "qué obligación del cronograma fue cancelada".

create or replace view public.report_payments_summary
with (security_invoker = true)
as
select
  p.id,
  p.payment_date,
  p.amount_paid,
  p.operation_code,
  p.is_reversed,
  pm.code as payment_method_code,
  pm.label as payment_method_label,
  a.id as associate_id,
  a.company_name as associate_company_name,
  a.ruc as associate_ruc,
  a.internal_code as associate_internal_code,
  ps.id as payment_schedule_id,
  ps.due_date as schedule_due_date,
  ps.period_year as schedule_period_year,
  ps.period_month as schedule_period_month,
  ps.expected_amount as schedule_expected_amount,
  ps.is_paid as schedule_is_paid
from public.payments p
left join public.catalog_items pm on pm.id = p.payment_method_id
left join public.payment_schedules ps
  on ps.id = p.payment_schedule_id
  and ps.is_deleted = false
left join public.associates a on a.id = p.associate_id
where p.is_deleted = false
  and p.is_reversed = false;
