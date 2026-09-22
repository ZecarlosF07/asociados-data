-- S25: la salud no aplica a inactivos; la deuda sigue visible y cobrable.
with balances as (
  select psb.associate_id,
    coalesce(sum(psb.outstanding_amount) filter (where psb.is_collectible), 0)::numeric(12,2)
      as collectible_amount,
    coalesce(sum(psb.outstanding_amount) filter (
      where psb.is_collectible and psb.due_date < public.business_today()
    ), 0)::numeric(12,2) as overdue_amount
  from public.payment_schedule_balances psb
  group by psb.associate_id
), checks as (
  select 1 as position, 's25_inactive_catalog' as check_name,
    count(*)::int as found, 1 as expected,
    coalesce(jsonb_agg(ci.id order by ci.id), '[]'::jsonb) as detail
  from public.catalog_items ci join public.catalog_groups cg on cg.id = ci.group_id
  where cg.code = 'PAYMENT_HEALTH' and ci.code = 'NO_APLICA_INACTIVO'
    and ci.label = 'No aplica · inactivo' and ci.is_active and not ci.is_deleted
  union all
  select 2, 's25_inactive_wrong_health', count(*)::int, 0,
    coalesce(jsonb_agg(s.id order by s.id), '[]'::jsonb)
  from public.associate_operational_summary s
  where s.effective_status_code = 'INACTIVO'
    and (s.payment_health_code is distinct from 'NO_APLICA_INACTIVO'
      or s.payment_health_label is distinct from 'No aplica · inactivo')
  union all
  select 3, 's25_inactive_cache_mismatch', count(*)::int, 0,
    coalesce(jsonb_agg(a.id order by a.id), '[]'::jsonb)
  from public.associates a
  join public.associate_operational_summary s on s.id = a.id
  left join public.catalog_items ci on ci.id = a.payment_health_status_id
  where s.effective_status_code = 'INACTIVO'
    and ci.code is distinct from 'NO_APLICA_INACTIVO'
  union all
  select 4, 's25_in_process_wrong_health', count(*)::int, 0,
    coalesce(jsonb_agg(s.id order by s.id), '[]'::jsonb)
  from public.associate_operational_summary s
  where s.effective_status_code = 'EN_PROCESO' and s.payment_health_code is distinct from 'NO_APLICA'
  union all
  select 5, 's25_active_marked_not_applicable', count(*)::int, 0,
    coalesce(jsonb_agg(s.id order by s.id), '[]'::jsonb)
  from public.associate_operational_summary s
  where s.effective_status_code = 'ACTIVO'
    and s.payment_health_code in ('NO_APLICA', 'NO_APLICA_INACTIVO')
  union all
  select 6, 's25_balance_formula_mismatch', count(*)::int, 0,
    coalesce(jsonb_agg(s.id order by s.id), '[]'::jsonb)
  from public.associate_operational_summary s
  left join balances b on b.associate_id = s.id
  where s.collectible_amount is distinct from coalesce(b.collectible_amount, 0)
    or s.overdue_amount is distinct from coalesce(b.overdue_amount, 0)
  union all
  select 7, 's25_report_mismatch', count(*)::int, 0,
    coalesce(jsonb_agg(s.id order by s.id), '[]'::jsonb)
  from public.associate_operational_summary s
  left join public.report_associates_summary r on r.id = s.id
  where r.id is null or r.payment_health_code is distinct from s.payment_health_code
    or r.payment_health_label is distinct from s.payment_health_label
    or r.collectible_amount is distinct from s.collectible_amount
    or r.overdue_amount is distinct from s.overdue_amount
)
select check_name, found, expected, detail from checks order by position;
