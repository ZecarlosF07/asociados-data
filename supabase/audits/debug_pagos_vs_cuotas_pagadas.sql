-- Diagnostico: compara cuotas pagadas vs pagos registrados.
-- Ejecutar en Supabase SQL Editor.

with payment_base as (
  select
    p.id as payment_id,
    p.payment_schedule_id,
    p.associate_id,
    p.payment_date,
    p.amount_paid,
    p.operation_code,
    p.is_reversed,
    p.is_deleted,
    p.created_at
  from public.payments p
  where p.is_deleted = false
),
schedule_base as (
  select
    ps.id as schedule_id,
    ps.associate_id,
    ps.due_date,
    ps.period_year,
    ps.period_month,
    ps.expected_amount,
    ps.is_paid,
    ps.paid_at,
    ps.is_deleted
  from public.payment_schedules ps
  where ps.is_deleted = false
),
summary as (
  select
    'resumen' as section,
    jsonb_build_object(
      'cuotas_pagadas', (
        select count(*)
        from schedule_base
        where is_paid = true
      ),
      'pagos_registrados', (
        select count(*)
        from payment_base
      ),
      'pagos_no_reversados', (
        select count(*)
        from payment_base
        where is_reversed = false
      ),
      'pagos_reversados', (
        select count(*)
        from payment_base
        where is_reversed = true
      )
    ) as detail
),
grouped as (
  select
    'pagos_por_cuota' as section,
    jsonb_build_object(
      'payment_schedule_id', pb.payment_schedule_id,
      'codigo_asociado', a.internal_code,
      'asociado', a.company_name,
      'periodo', case
        when sb.period_month is not null
          then lpad(sb.period_month::text, 2, '0') || '/' || sb.period_year::text
        else sb.period_year::text
      end,
      'vencimiento', sb.due_date,
      'monto_cuota', sb.expected_amount,
      'cuota_pagada', sb.is_paid,
      'pagado_el', sb.paid_at,
      'cantidad_pagos', count(pb.payment_id),
      'pagos_no_reversados', count(pb.payment_id) filter (where pb.is_reversed = false),
      'total_pagado_no_reversado', coalesce(sum(pb.amount_paid) filter (where pb.is_reversed = false), 0),
      'pagos', jsonb_agg(
        jsonb_build_object(
          'payment_id', pb.payment_id,
          'fecha_pago', pb.payment_date,
          'monto', pb.amount_paid,
          'operacion', pb.operation_code,
          'reversado', pb.is_reversed
        )
        order by pb.payment_date, pb.created_at
      )
    ) as detail
  from payment_base pb
  left join schedule_base sb on sb.schedule_id = pb.payment_schedule_id
  left join public.associates a on a.id = coalesce(sb.associate_id, pb.associate_id)
  group by
    pb.payment_schedule_id,
    a.internal_code,
    a.company_name,
    sb.period_year,
    sb.period_month,
    sb.due_date,
    sb.expected_amount,
    sb.is_paid,
    sb.paid_at
),
anomalies as (
  select
    'observaciones' as section,
    jsonb_build_object(
      'pagos_sin_cuota', (
        select count(*)
        from payment_base
        where payment_schedule_id is null
      ),
      'pagos_en_cuotas_no_pagadas', (
        select count(*)
        from payment_base pb
        join schedule_base sb on sb.schedule_id = pb.payment_schedule_id
        where sb.is_paid = false
          and pb.is_reversed = false
      ),
      'cuotas_con_mas_de_un_pago', (
        select count(*)
        from (
          select payment_schedule_id
          from payment_base
          where payment_schedule_id is not null
          group by payment_schedule_id
          having count(*) > 1
        ) duplicated
      )
    ) as detail
)
select *
from summary
union all
select *
from anomalies
union all
select *
from grouped
order by section;
