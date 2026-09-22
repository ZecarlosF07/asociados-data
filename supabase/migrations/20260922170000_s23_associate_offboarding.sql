-- S23: baja administrativa y reincorporacion. Requiere S22B.
begin;

alter table public.associates
  add column if not exists is_offboarded boolean not null default false;

create index if not exists idx_associates_offboarded
  on public.associates (is_offboarded) where is_deleted = false;

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
    when count(*) filter (where psb.is_collectible and psb.due_date < public.business_today()) >= 3 then 'CRITICO'
    when count(*) filter (where psb.is_collectible and psb.due_date < public.business_today()) > 0 then 'MOROSO'
    when min(psb.due_date) filter (where psb.is_collectible and psb.due_date >= public.business_today()) <= public.business_today() + 7 then 'POR_VENCER'
    else 'AL_DIA'
  end as payment_health_code,
  case
    when count(*) filter (where psb.is_collectible and psb.due_date < public.business_today()) >= 3 then 'Crítico'
    when count(*) filter (where psb.is_collectible and psb.due_date < public.business_today()) > 0 then 'Moroso'
    when min(psb.due_date) filter (where psb.is_collectible and psb.due_date >= public.business_today()) <= public.business_today() + 7 then 'Por vencer'
    else 'Al día'
  end as payment_health_label
from public.associates a
left join public.payment_schedule_balances psb on psb.associate_id = a.id
where not a.is_deleted
group by a.id;

-- Solo las RPC de S23 pueden cambiar el indicador administrativo.
create or replace function public.fn_guard_offboard_transition()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.is_offboarded is distinct from old.is_offboarded
      or new.inactivation_reason is distinct from old.inactivation_reason
      or new.inactivated_at is distinct from old.inactivated_at)
    and current_setting('app.s23_offboard_transition', true) is distinct from 'allowed' then
    raise exception 'Usa Dar de baja o Reincorporar para cambiar el estado administrativo.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger trg_associates_offboard_transition
  before update of is_offboarded, inactivation_reason, inactivated_at on public.associates
  for each row execute function public.fn_guard_offboard_transition();

create or replace function public.fn_guard_retired_associate_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.catalog_items ci
    where ci.id = new.associate_status_id and ci.code = 'SUSPENDIDO' and not ci.is_active) then
    raise exception 'Suspendido fue retirado. Usa Dar de baja.' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger trg_associates_retired_status
  before insert or update of associate_status_id on public.associates
  for each row execute function public.fn_guard_retired_associate_status();

create or replace function public.fn_guard_retired_status_catalog()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.code = 'SUSPENDIDO' and new.is_active and not new.is_deleted
    and exists (select 1 from public.catalog_groups cg
      where cg.id = new.group_id and cg.code = 'ASSOCIATE_STATUS') then
    raise exception 'Suspendido fue retirado del catalogo operativo.' using errcode = '23514';
  end if;
  return new;
end;
$$;

-- Se instala despues del backfill, al final de esta migracion.

create or replace function public.fn_guard_offboarded_membership()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_status text;
  v_offboarded boolean;
begin
  select ci.code into v_status from public.catalog_items ci where ci.id = new.membership_status_id;
  if not new.is_deleted and v_status in ('VIGENTE', 'PROGRAMADA') then
    select a.is_offboarded into v_offboarded from public.associates a
    where a.id = new.associate_id for update;
    if v_offboarded then
      raise exception 'La empresa esta dada de baja. Reincorporala antes de crear o renovar una membresia.'
        using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_memberships_offboard_guard
  before insert or update of associate_id, membership_status_id, is_deleted on public.memberships
  for each row execute function public.fn_guard_offboarded_membership();

create or replace function public.fn_guard_offboarded_committee()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_offboarded boolean;
begin
  if new.is_active and not new.is_deleted then
    select a.is_offboarded into v_offboarded from public.associates a
    where a.id = new.associate_id for update;
    if v_offboarded then
      raise exception 'La empresa esta dada de baja. Reincorporala antes de asignar un comite.'
        using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_associate_committees_offboard_guard
  before insert or update of associate_id, is_active, is_deleted on public.associate_committees
  for each row execute function public.fn_guard_offboarded_committee();

-- El nucleo no expone EXECUTE a clientes; tambien se usa en el backfill de suspendidos.
create or replace function public.fn_offboard_associate_internal(
  p_associate_id uuid, p_reason text, p_actor uuid default null
) returns public.associates language plpgsql security definer set search_path = public as $$
declare
  v_associate public.associates%rowtype;
  v_membership public.memberships%rowtype;
  v_cancelled uuid := public.find_catalog_item_id('MEMBERSHIP_STATUS', 'CANCELADA');
  v_vigente uuid := public.find_catalog_item_id('MEMBERSHIP_STATUS', 'VIGENTE');
  v_expired uuid := public.find_catalog_item_id('MEMBERSHIP_STATUS', 'VENCIDA');
  v_annulled uuid := public.find_catalog_item_id('COLLECTION_STATUS', 'ANULADO');
  v_today date := public.business_today();
begin
  if nullif(btrim(p_reason), '') is null then
    raise exception 'El motivo de baja es obligatorio.' using errcode = '22023';
  end if;
  select * into v_associate from public.associates
  where id = p_associate_id and not is_deleted for update;
  if not found then raise exception 'La empresa no existe.' using errcode = 'P0002'; end if;
  if v_associate.is_offboarded then
    raise exception 'La empresa ya esta dada de baja. Actualiza la ficha antes de continuar.' using errcode = '23514';
  end if;
  if exists (
    select 1 from public.membership_operational_summary mo
    join public.payment_schedules ps on ps.membership_id = mo.id and not ps.is_deleted
    join public.payments p on p.payment_schedule_id = ps.id and not p.is_deleted and not p.is_reversed
    where mo.associate_id = p_associate_id and mo.effective_status_code = 'PROGRAMADA'
  ) then
    raise exception 'Una renovacion programada ya tiene pagos. Requiere revision contable antes de la baja.'
      using errcode = '23514';
  end if;

  -- Cancelar futuras primero: S22 restaura su antecesora, que luego se cierra.
  for v_membership in
    select m.* from public.memberships m
    join public.membership_operational_summary mo on mo.id = m.id
    where m.associate_id = p_associate_id and mo.effective_status_code = 'PROGRAMADA'
    order by m.start_date, m.id for update of m
  loop
    update public.memberships set membership_status_id = v_cancelled,
      operational_end_date = start_date - 1, updated_by = p_actor, updated_at = now()
    where id = v_membership.id;
    update public.payment_schedules set collection_status_id = v_annulled,
      is_paid = false, paid_at = null, updated_by = p_actor, updated_at = now()
    where membership_id = v_membership.id and not is_deleted and not is_paid;
    if v_membership.renewed_from_membership_id is not null then
      update public.memberships set membership_status_id = case
          when end_date >= v_today then v_vigente else v_expired end,
        operational_end_date = null, updated_by = p_actor, updated_at = now()
      where id = v_membership.renewed_from_membership_id and not is_deleted;
    end if;
  end loop;

  for v_membership in
    select m.* from public.memberships m
    join public.membership_operational_summary mo on mo.id = m.id
    where m.associate_id = p_associate_id and mo.effective_status_code = 'VIGENTE'
    order by m.start_date, m.id for update of m
  loop
    update public.memberships set membership_status_id = v_cancelled,
      operational_end_date = least(end_date, v_today),
      updated_by = p_actor, updated_at = now() where id = v_membership.id;
  end loop;

  -- Ninguna obligacion futura impaga permanece cobrable tras la baja,
  -- incluso si pertenece a un periodo historico. Los pagos no se modifican.
  update public.payment_schedules ps set collection_status_id = v_annulled,
    is_paid = false, paid_at = null,
    notes = concat_ws(E'\n', nullif(ps.notes, ''), 'Anulada por baja administrativa.'),
    updated_by = p_actor, updated_at = now()
  where ps.associate_id = p_associate_id and not ps.is_deleted
    and ps.due_date > v_today and ps.collection_status_id <> v_annulled
    and exists (select 1 from public.payment_schedule_balances b
      where b.id = ps.id and b.outstanding_amount > 0);

  update public.associate_committees set is_active = false, is_primary = false,
    left_at = greatest(coalesce(joined_at, v_today), v_today),
    updated_by = p_actor, updated_at = now()
  where associate_id = p_associate_id and is_active and not is_deleted;

  perform set_config('app.s23_offboard_transition', 'allowed', true);
  update public.associates set is_offboarded = true,
    inactivation_reason = btrim(p_reason),
    inactivated_at = now(), updated_by = p_actor, updated_at = now()
  where id = p_associate_id returning * into v_associate;
  perform set_config('app.s23_offboard_transition', '', true);
  perform public.fn_sync_associate_operational_cache(p_associate_id);
  select * into v_associate from public.associates where id = p_associate_id;
  return v_associate;
end;
$$;

create or replace function public.offboard_associate(
  p_associate_id uuid, p_reason text, p_expected_status_code text default null
)
returns public.associates language plpgsql security definer set search_path = public as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_associate public.associates%rowtype;
begin
  if v_actor is null or not public.has_module_permission('asociados', 'update') then
    raise exception 'No tienes permisos para dar de baja empresas.' using errcode = '42501';
  end if;
  select * into v_associate from public.associates
  where id = p_associate_id and not is_deleted for update;
  if not found then raise exception 'La empresa no existe.' using errcode = 'P0002'; end if;
  if p_expected_status_code is not null and p_expected_status_code is distinct from (
    select aos.effective_status_code from public.associate_operational_summary aos
    where aos.id = p_associate_id
  ) then
    raise exception 'El estado de la empresa cambio. Actualiza la ficha antes de continuar.'
      using errcode = '40001';
  end if;
  if exists (select 1 from public.membership_operational_summary mo
      where mo.associate_id = p_associate_id and mo.effective_status_code in ('VIGENTE', 'PROGRAMADA'))
    and not public.has_module_permission('membresias', 'update') then
    raise exception 'Necesitas permiso de edicion de Membresias para completar la baja.' using errcode = '42501';
  end if;
  return public.fn_offboard_associate_internal(p_associate_id, p_reason, v_actor);
end;
$$;

create or replace function public.reinstate_associate(p_associate_id uuid)
returns public.associates language plpgsql security definer set search_path = public as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_associate public.associates%rowtype;
begin
  if v_actor is null or not public.has_module_permission('asociados', 'update') then
    raise exception 'No tienes permisos para reincorporar empresas.' using errcode = '42501';
  end if;
  select * into v_associate from public.associates
  where id = p_associate_id and not is_deleted for update;
  if not found then raise exception 'La empresa no existe.' using errcode = 'P0002'; end if;
  if not v_associate.is_offboarded then
    raise exception 'La empresa ya esta reincorporada. Actualiza la ficha.' using errcode = '23514';
  end if;
  perform set_config('app.s23_offboard_transition', 'allowed', true);
  update public.associates set is_offboarded = false,
    updated_by = v_actor, updated_at = now()
  where id = p_associate_id returning * into v_associate;
  perform set_config('app.s23_offboard_transition', '', true);
  perform public.fn_sync_associate_operational_cache(p_associate_id);
  select * into v_associate from public.associates where id = p_associate_id;
  return v_associate;
end;
$$;

-- La funcion antigua permanece como objeto para el audit S22, pero ya no puede usarse.
create or replace function public.set_associate_suspension(p_associate_id uuid, p_suspended boolean)
returns public.associates language plpgsql security definer set search_path = public as $$
begin
  raise exception 'Suspendido fue retirado. Usa Dar de baja o Reincorporar.' using errcode = '0A000';
end;
$$;

revoke all on function public.fn_offboard_associate_internal(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.set_associate_suspension(uuid, boolean) from public, anon, authenticated;
revoke all on function public.offboard_associate(uuid, text, text) from public, anon;
revoke all on function public.reinstate_associate(uuid) from public, anon;
grant execute on function public.offboard_associate(uuid, text, text) to authenticated;
grant execute on function public.reinstate_associate(uuid) to authenticated;

-- Los suspendidos previos se convierten por la misma logica, conservando deuda e historial.
-- El trigger S16 exige un actor interactivo; se desactiva solo durante este backfill
-- privilegiado y se reactiva dentro de la misma transaccion.
alter table public.associate_committees disable trigger trg_associate_committees_prepare;
do $$
declare v_id uuid;
begin
  for v_id in
    select a.id from public.associates a
    join public.catalog_items ci on ci.id = a.associate_status_id
    where not a.is_deleted and ci.code = 'SUSPENDIDO'
    order by a.id
  loop
    perform public.fn_offboard_associate_internal(
      v_id, 'Migración S23: baja administrativa de estado Suspendido.', null
    );
  end loop;
end;
$$;
alter table public.associate_committees enable trigger trg_associate_committees_prepare;

update public.catalog_items ci set is_active = false
from public.catalog_groups cg
where ci.group_id = cg.id and cg.code = 'ASSOCIATE_STATUS' and ci.code = 'SUSPENDIDO';

create trigger trg_catalog_items_retired_associate_status
  before insert or update of group_id, code, is_active, is_deleted on public.catalog_items
  for each row execute function public.fn_guard_retired_status_catalog();

commit;
