-- S24: una empresa que nunca tuvo membresia no puede estar "Al dia".
-- Requiere S23. No modifica las migraciones ya aplicadas.
begin;

insert into public.catalog_items (group_id, code, label, sort_order, is_active)
select cg.id, 'NO_APLICA', 'No aplica · sin membresía', 0, true
from public.catalog_groups cg
where cg.code = 'PAYMENT_HEALTH' and cg.is_active
on conflict do nothing;

update public.catalog_items ci
set label = 'No aplica · sin membresía', sort_order = 0, is_active = true
from public.catalog_groups cg
where ci.group_id = cg.id and cg.code = 'PAYMENT_HEALTH'
  and ci.code = 'NO_APLICA' and not ci.is_deleted;

do $$
begin
  if not exists (
    select 1 from public.catalog_items ci
    join public.catalog_groups cg on cg.id = ci.group_id
    where cg.code = 'PAYMENT_HEALTH' and ci.code = 'NO_APLICA'
      and ci.is_active and not ci.is_deleted
  ) then
    raise exception 'No se pudo habilitar PAYMENT_HEALTH.NO_APLICA.' using errcode = '23514';
  end if;
end;
$$;

create or replace view public.associate_operational_summary
with (security_invoker = true) as
select a.id,
  case
    when a.is_offboarded then 'INACTIVO'
    when exists (select 1 from public.membership_operational_summary mo
      where mo.associate_id = a.id and mo.effective_status_code = 'VIGENTE') then 'ACTIVO'
    when exists (select 1 from public.memberships m
      where m.associate_id = a.id and not m.is_deleted) then 'INACTIVO'
    else 'EN_PROCESO'
  end as effective_status_code,
  case
    when a.is_offboarded then 'Inactivo'
    when exists (select 1 from public.membership_operational_summary mo
      where mo.associate_id = a.id and mo.effective_status_code = 'VIGENTE') then 'Activo'
    when exists (select 1 from public.memberships m
      where m.associate_id = a.id and not m.is_deleted) then 'Inactivo'
    else 'En proceso'
  end as effective_status_label,
  case
    when not exists (select 1 from public.memberships m
      where m.associate_id = a.id and not m.is_deleted) then 'NO_APLICA'
    when count(*) filter (where psb.is_collectible and psb.due_date < public.business_today()) >= 3 then 'CRITICO'
    when count(*) filter (where psb.is_collectible and psb.due_date < public.business_today()) > 0 then 'MOROSO'
    when min(psb.due_date) filter (where psb.is_collectible and psb.due_date >= public.business_today()) <= public.business_today() + 7 then 'POR_VENCER'
    else 'AL_DIA'
  end as payment_health_code,
  case
    when not exists (select 1 from public.memberships m
      where m.associate_id = a.id and not m.is_deleted) then 'No aplica · sin membresía'
    when count(*) filter (where psb.is_collectible and psb.due_date < public.business_today()) >= 3 then 'Crítico'
    when count(*) filter (where psb.is_collectible and psb.due_date < public.business_today()) > 0 then 'Moroso'
    when min(psb.due_date) filter (where psb.is_collectible and psb.due_date >= public.business_today()) <= public.business_today() + 7 then 'Por vencer'
    else 'Al día'
  end as payment_health_label
from public.associates a
left join public.payment_schedule_balances psb on psb.associate_id = a.id
where not a.is_deleted
group by a.id;

-- Las nuevas empresas sin membresia tambien deben iniciar con la cache correcta.
create or replace function public.fn_sync_new_associate_operational_cache()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.fn_sync_associate_operational_cache(new.id);
  return new;
end;
$$;

create trigger trg_associates_initialize_operational_cache
  after insert on public.associates
  for each row execute function public.fn_sync_new_associate_operational_cache();

-- Backfill no destructivo: solo estado, salud de pago y updated_at si difieren.
do $$
declare v_id uuid;
begin
  for v_id in select id from public.associates where not is_deleted order by id loop
    perform public.fn_sync_associate_operational_cache(v_id);
  end loop;
end;
$$;

commit;
