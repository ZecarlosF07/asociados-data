-- S25: la salud de pago no aplica a empresas inactivas.
-- La deuda devengada sigue cobrable y se expone por separado.
-- Requiere S24; no modifica migraciones anteriores.
begin;

insert into public.catalog_items (group_id, code, label, sort_order, is_active)
select cg.id, 'NO_APLICA_INACTIVO', 'No aplica · inactivo', 0, true
from public.catalog_groups cg
where cg.code = 'PAYMENT_HEALTH' and cg.is_active
on conflict do nothing;

update public.catalog_items ci
set label = 'No aplica · inactivo', sort_order = 0, is_active = true
from public.catalog_groups cg
where ci.group_id = cg.id and cg.code = 'PAYMENT_HEALTH'
  and ci.code = 'NO_APLICA_INACTIVO' and not ci.is_deleted;

do $$
begin
  if not exists (
    select 1 from public.catalog_items ci
    join public.catalog_groups cg on cg.id = ci.group_id
    where cg.code = 'PAYMENT_HEALTH' and ci.code = 'NO_APLICA_INACTIVO'
      and ci.is_active and not ci.is_deleted
  ) then
    raise exception 'No se pudo habilitar PAYMENT_HEALTH.NO_APLICA_INACTIVO.'
      using errcode = '23514';
  end if;
end;
$$;

create or replace view public.associate_operational_summary
with (security_invoker = true) as
with membership_state as (
  select a.id,
    exists (select 1 from public.memberships m
      where m.associate_id = a.id and not m.is_deleted) as has_membership,
    exists (select 1 from public.membership_operational_summary mo
      where mo.associate_id = a.id and mo.effective_status_code = 'VIGENTE') as has_effective_membership
  from public.associates a where not a.is_deleted
)
select a.id,
  case
    when a.is_offboarded then 'INACTIVO'
    when ms.has_effective_membership then 'ACTIVO'
    when ms.has_membership then 'INACTIVO'
    else 'EN_PROCESO'
  end as effective_status_code,
  case
    when a.is_offboarded then 'Inactivo'
    when ms.has_effective_membership then 'Activo'
    when ms.has_membership then 'Inactivo'
    else 'En proceso'
  end as effective_status_label,
  case
    when a.is_offboarded or (ms.has_membership and not ms.has_effective_membership)
      then 'NO_APLICA_INACTIVO'
    when not ms.has_membership then 'NO_APLICA'
    when count(*) filter (where psb.is_collectible and psb.due_date < public.business_today()) >= 3 then 'CRITICO'
    when count(*) filter (where psb.is_collectible and psb.due_date < public.business_today()) > 0 then 'MOROSO'
    when min(psb.due_date) filter (where psb.is_collectible and psb.due_date >= public.business_today()) <= public.business_today() + 7 then 'POR_VENCER'
    else 'AL_DIA'
  end as payment_health_code,
  case
    when a.is_offboarded or (ms.has_membership and not ms.has_effective_membership)
      then 'No aplica · inactivo'
    when not ms.has_membership then 'No aplica · sin membresía'
    when count(*) filter (where psb.is_collectible and psb.due_date < public.business_today()) >= 3 then 'Crítico'
    when count(*) filter (where psb.is_collectible and psb.due_date < public.business_today()) > 0 then 'Moroso'
    when min(psb.due_date) filter (where psb.is_collectible and psb.due_date >= public.business_today()) <= public.business_today() + 7 then 'Por vencer'
    else 'Al día'
  end as payment_health_label,
  coalesce(sum(psb.outstanding_amount) filter (where psb.is_collectible), 0)::numeric(12,2)
    as collectible_amount,
  coalesce(sum(psb.outstanding_amount) filter (
    where psb.is_collectible and psb.due_date < public.business_today()
  ), 0)::numeric(12,2) as overdue_amount
from public.associates a
join membership_state ms on ms.id = a.id
left join public.payment_schedule_balances psb on psb.associate_id = a.id
where not a.is_deleted
group by a.id, ms.has_membership, ms.has_effective_membership;

create or replace view public.report_associates_summary
with (security_invoker = true) as
select
  a.id, a.internal_code, a.company_name, a.trade_name, a.ruc,
  a.association_date, a.corporate_email,
  aos.effective_status_code::varchar(80) as associate_status_code,
  aos.effective_status_label::varchar(150) as associate_status_label,
  c.code as category_code, c.name as category_name, c.base_fee as category_base_fee,
  at.code as activity_type_code, at.label as activity_type_label,
  cs.code as company_size_code, cs.label as company_size_label,
  aos.payment_health_code::varchar(80) as payment_health_code,
  aos.payment_health_label::varchar(150) as payment_health_label,
  aos.collectible_amount, aos.overdue_amount
from public.associates a
join public.associate_operational_summary aos on aos.id = a.id
left join public.categories c on c.id = a.category_id
left join public.catalog_items at on at.id = a.activity_type_id
left join public.catalog_items cs on cs.id = a.company_size_id
where not a.is_deleted;

-- Sincronizar los indicadores almacenados, sin tocar pagos ni cronogramas.
do $$
declare v_id uuid;
begin
  for v_id in select id from public.associates where not is_deleted order by id loop
    perform public.fn_sync_associate_operational_cache(v_id);
  end loop;
end;
$$;

notify pgrst, 'reload schema';

commit;
