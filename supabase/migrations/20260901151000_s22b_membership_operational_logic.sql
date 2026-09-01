-- ============================================================
-- Hito S22B: logica operativa de membresias y cobranza
-- ============================================================
-- Fase 2 de 2. Requiere que S22A haya finalizado correctamente.

begin;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'memberships'
      and column_name = 'operational_end_date'
  ) or not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payment_schedules'
      and column_name = 'is_operational'
  ) or public.find_catalog_item_id('MEMBERSHIP_STATUS', 'PROGRAMADA') is null then
    raise exception 'S22A no esta aplicada. Ejecuta primero la migracion de base y saneamiento.'
      using errcode = 'P0001';
  end if;
end $$;

-- ------------------------------------------------------------
-- Vistas operativas: fuente unica de estados y saldos.
-- ------------------------------------------------------------
create or replace view public.membership_operational_summary
with (security_invoker = true)
as
with base as (
  select
    m.*,
    ms.code as stored_status_code,
    ms.label as stored_status_label,
    successor.id as successor_membership_id,
    least(
      m.end_date,
      coalesce(m.operational_end_date, m.end_date),
      coalesce(successor.start_date - 1, m.end_date)
    ) as effective_end_date
  from public.memberships m
  join public.catalog_items ms on ms.id = m.membership_status_id
  left join public.memberships successor
    on successor.renewed_from_membership_id = m.id
   and successor.is_deleted = false
   and not exists (
     select 1 from public.catalog_items ss
     where ss.id = successor.membership_status_id and ss.code = 'CANCELADA'
   )
  where m.is_deleted = false
)
select
  base.*,
  case
    when stored_status_code = 'CANCELADA' then 'CANCELADA'
    when start_date > public.business_today() then 'PROGRAMADA'
    when start_date <= public.business_today()
      and effective_end_date >= public.business_today() then 'VIGENTE'
    when successor_membership_id is not null or stored_status_code = 'RENOVADA' then 'RENOVADA'
    else 'VENCIDA'
  end as effective_status_code,
  case
    when stored_status_code = 'CANCELADA' then 'Cancelada'
    when start_date > public.business_today() then 'Programada'
    when start_date <= public.business_today()
      and effective_end_date >= public.business_today() then 'Vigente'
    when successor_membership_id is not null or stored_status_code = 'RENOVADA' then 'Renovada'
    else 'Vencida'
  end as effective_status_label,
  start_date <= public.business_today()
    and effective_end_date >= public.business_today()
    and stored_status_code <> 'CANCELADA' as is_effective,
  start_date > public.business_today()
    and stored_status_code <> 'CANCELADA' as is_scheduled
from base;

create or replace view public.payment_schedule_balances
with (security_invoker = true)
as
with payment_totals as (
  select
    p.payment_schedule_id,
    coalesce(sum(p.amount_paid), 0)::numeric(12,2) as paid_amount,
    max(p.payment_date) as last_payment_date
  from public.payments p
  where p.is_deleted = false and p.is_reversed = false
  group by p.payment_schedule_id
), base as (
  select
    ps.*,
    mo.effective_status_code as membership_effective_status_code,
    mo.start_date as membership_start_date,
    mo.effective_end_date as membership_effective_end_date,
    cs.code as stored_collection_status_code,
    cs.label as stored_collection_status_label,
    coalesce(pt.paid_amount, 0)::numeric(12,2) as paid_amount,
    greatest(ps.expected_amount - coalesce(pt.paid_amount, 0), 0)::numeric(12,2) as outstanding_amount,
    pt.last_payment_date,
    exists (
      select 1 from public.collection_actions ca
      where ca.payment_schedule_id = ps.id and ca.is_deleted = false
    ) as has_collection_management
  from public.payment_schedules ps
  join public.membership_operational_summary mo on mo.id = ps.membership_id
  join public.catalog_items cs on cs.id = ps.collection_status_id
  left join payment_totals pt on pt.payment_schedule_id = ps.id
  where ps.is_deleted = false
)
select
  base.*,
  case
    when not is_operational or stored_collection_status_code = 'ANULADO' then 'ANULADO'
    when outstanding_amount = 0 then 'PAGADO'
    when due_date < public.business_today() then 'VENCIDO'
    when paid_amount > 0 then 'PARCIAL'
    else 'PENDIENTE'
  end as financial_status_code,
  case
    when not is_operational or stored_collection_status_code = 'ANULADO' then 'Anulado'
    when outstanding_amount = 0 then 'Pagado'
    when due_date < public.business_today() then 'Vencido'
    when paid_amount > 0 then 'Parcial'
    else 'Pendiente'
  end as financial_status_label,
  membership_effective_status_code <> 'PROGRAMADA'
    and membership_start_date <= public.business_today()
    and is_operational
    and stored_collection_status_code <> 'ANULADO'
    and outstanding_amount > 0 as is_collectible
from base;

-- Reconciliar indicadores legados con los movimientos conservados. El estado
-- financiero visible sigue proviniendo de la vista, no de estos flags.
update public.payment_schedules ps
set is_paid = b.outstanding_amount = 0 and b.financial_status_code <> 'ANULADO',
    paid_at = case
      when b.outstanding_amount = 0 and b.financial_status_code <> 'ANULADO'
        then b.last_payment_date::timestamp at time zone 'America/Lima'
      else null
    end,
    collection_status_id = public.find_catalog_item_id(
      'COLLECTION_STATUS', b.financial_status_code
    ),
    updated_at = now()
from public.payment_schedule_balances b
where b.id = ps.id
  and (
    ps.is_paid is distinct from (b.outstanding_amount = 0 and b.financial_status_code <> 'ANULADO')
    or ps.paid_at is distinct from case
      when b.outstanding_amount = 0 and b.financial_status_code <> 'ANULADO'
        then b.last_payment_date::timestamp at time zone 'America/Lima'
      else null
    end
    or ps.collection_status_id is distinct from public.find_catalog_item_id(
      'COLLECTION_STATUS', b.financial_status_code
    )
  );

create or replace view public.associate_operational_summary
with (security_invoker = true)
as
select
  a.id,
  case
    when stored_status.code = 'SUSPENDIDO' then 'SUSPENDIDO'
    when exists (
      select 1 from public.membership_operational_summary mo
      where mo.associate_id = a.id and mo.effective_status_code = 'VIGENTE'
    ) then 'ACTIVO'
    when exists (
      select 1 from public.memberships m
      where m.associate_id = a.id and m.is_deleted = false
    ) then 'INACTIVO'
    else 'EN_PROCESO'
  end as effective_status_code,
  case
    when stored_status.code = 'SUSPENDIDO' then 'Suspendido'
    when exists (
      select 1 from public.membership_operational_summary mo
      where mo.associate_id = a.id and mo.effective_status_code = 'VIGENTE'
    ) then 'Activo'
    when exists (
      select 1 from public.memberships m
      where m.associate_id = a.id and m.is_deleted = false
    ) then 'Inactivo'
    else 'En proceso'
  end as effective_status_label,
  case
    when count(*) filter (
      where psb.is_collectible and psb.due_date < public.business_today()
    ) >= 3 then 'CRITICO'
    when count(*) filter (
      where psb.is_collectible and psb.due_date < public.business_today()
    ) > 0 then 'MOROSO'
    when min(psb.due_date) filter (
      where psb.is_collectible and psb.due_date >= public.business_today()
    ) <= public.business_today() + 7 then 'POR_VENCER'
    else 'AL_DIA'
  end as payment_health_code,
  case
    when count(*) filter (
      where psb.is_collectible and psb.due_date < public.business_today()
    ) >= 3 then 'Crítico'
    when count(*) filter (
      where psb.is_collectible and psb.due_date < public.business_today()
    ) > 0 then 'Moroso'
    when min(psb.due_date) filter (
      where psb.is_collectible and psb.due_date >= public.business_today()
    ) <= public.business_today() + 7 then 'Por vencer'
    else 'Al día'
  end as payment_health_label
from public.associates a
join public.catalog_items stored_status on stored_status.id = a.associate_status_id
left join public.payment_schedule_balances psb on psb.associate_id = a.id
where a.is_deleted = false
group by a.id, stored_status.code;

create or replace function public.fn_sync_associate_operational_cache(p_associate_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.associates a
  set associate_status_id = status_item.id,
      payment_health_status_id = health_item.id,
      updated_at = now()
  from public.associate_operational_summary summary
  join public.catalog_items status_item on status_item.code = summary.effective_status_code
  join public.catalog_groups status_group
    on status_group.id = status_item.group_id and status_group.code = 'ASSOCIATE_STATUS'
  join public.catalog_items health_item on health_item.code = summary.payment_health_code
  join public.catalog_groups health_group
    on health_group.id = health_item.group_id and health_group.code = 'PAYMENT_HEALTH'
  where summary.id = a.id and a.id = p_associate_id
    and (
      a.associate_status_id is distinct from status_item.id
      or a.payment_health_status_id is distinct from health_item.id
    );
end;
$$;

do $$
declare r record;
begin
  for r in select id from public.associates where not is_deleted loop
    perform public.fn_sync_associate_operational_cache(r.id);
  end loop;
end $$;

-- S21 sigue siendo la base de categoria, pero S22 contempla simultaneamente
-- una membresia efectiva y una renovacion programada.
create or replace function public.fn_prepare_membership_category()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_category_id uuid;
begin
  select a.category_id into v_category_id
  from public.associates a
  join public.categories c on c.id = a.category_id
  where a.id = new.associate_id and not a.is_deleted and c.is_active and not c.is_deleted;

  if v_category_id is null and new.is_current and not new.is_deleted then
    raise exception 'Asigna una categoria activa al asociado antes de crear la membresia.'
      using errcode = '23514';
  end if;
  if tg_op = 'INSERT' then
    new.category_id := v_category_id;
  elsif new.is_current or new.category_id is distinct from old.category_id then
    new.category_id := coalesce(v_category_id, old.category_id);
  end if;
  return new;
end;
$$;

create or replace function public.fn_sync_current_membership_category()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.category_id is not distinct from old.category_id then return new; end if;
  if exists (
    select 1 from public.membership_operational_summary mo
    where mo.associate_id = new.id
      and mo.effective_status_code in ('VIGENTE', 'PROGRAMADA')
  ) and (
    new.category_id is null or not exists (
      select 1 from public.categories c
      where c.id = new.category_id and c.is_active and not c.is_deleted
    )
  ) then
    raise exception 'No se puede dejar sin categoria a un asociado con membresia vigente o programada.'
      using errcode = '23514';
  end if;

  update public.memberships m
  set category_id = new.category_id, updated_at = now()
  where m.associate_id = new.id and not m.is_deleted
    and (
      m.is_current
      or m.id in (
        select mo.id from public.membership_operational_summary mo
        where mo.associate_id = new.id
          and mo.effective_status_code in ('VIGENTE', 'PROGRAMADA')
      )
    );
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Validaciones y generacion de cronogramas.
-- ------------------------------------------------------------
create or replace function public.fn_assert_membership_operational_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type_code text;
  v_status_code text;
  v_effective_end date;
begin
  select ci.code into v_type_code
  from public.catalog_items ci
  join public.catalog_groups cg on cg.id = ci.group_id
  where ci.id = new.membership_type_id and cg.code = 'MEMBERSHIP_TYPE'
    and ci.is_active and not ci.is_deleted;

  select ci.code into v_status_code
  from public.catalog_items ci
  join public.catalog_groups cg on cg.id = ci.group_id
  where ci.id = new.membership_status_id and cg.code = 'MEMBERSHIP_STATUS'
    and ci.is_active and not ci.is_deleted;

  if v_type_code is null or v_status_code is null then
    raise exception 'Tipo o estado de membresia invalido.' using errcode = '23514';
  end if;
  if new.category_id is null or new.fee_amount <= 0 then
    raise exception 'La categoria y una tarifa positiva son obligatorias.' using errcode = '23514';
  end if;
  if new.end_date is null or new.end_date < new.start_date then
    raise exception 'El periodo de membresia no es valido.' using errcode = '23514';
  end if;
  if v_type_code = 'ANUAL' then
    new.monthly_billing_day := null;
  elsif new.monthly_billing_day is null or new.monthly_billing_day not between 1 and 28 then
    raise exception 'El dia de cobro debe estar entre 1 y 28.' using errcode = '23514';
  end if;

  v_effective_end := least(new.end_date, coalesce(new.operational_end_date, new.end_date));
  if v_status_code <> 'CANCELADA' and v_effective_end >= new.start_date and exists (
    select 1
    from public.memberships m
    join public.catalog_items ms on ms.id = m.membership_status_id
    where m.associate_id = new.associate_id
      and m.id <> new.id
      and m.is_deleted = false
      and ms.code <> 'CANCELADA'
      and m.start_date <= v_effective_end
      and least(m.end_date, coalesce(m.operational_end_date, m.end_date)) >= new.start_date
  ) then
    raise exception 'El periodo se superpone con otra membresia operativa.' using errcode = '23P01';
  end if;

  if new.start_date > public.business_today() and v_status_code <> 'CANCELADA' and exists (
    select 1
    from public.memberships m
    join public.catalog_items ms on ms.id = m.membership_status_id
    where m.associate_id = new.associate_id
      and m.id <> new.id
      and m.is_deleted = false
      and ms.code <> 'CANCELADA'
      and m.start_date > public.business_today()
  ) then
    raise exception 'El asociado ya tiene una membresia programada.' using errcode = '23505';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_memberships_operational_integrity on public.memberships;
create trigger trg_memberships_operational_integrity
  before insert or update of associate_id, membership_type_id, category_id,
    fee_amount, start_date, end_date, operational_end_date,
    monthly_billing_day, membership_status_id, is_deleted
  on public.memberships
  for each row execute function public.fn_assert_membership_operational_row();

create or replace function public.fn_assert_schedule_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_associate_id uuid;
  v_status_group text;
  v_status_code text;
begin
  select associate_id into v_associate_id
  from public.memberships where id = new.membership_id and is_deleted = false;
  if v_associate_id is null or v_associate_id is distinct from new.associate_id then
    raise exception 'La cuota no corresponde al asociado de la membresia.' using errcode = '23503';
  end if;
  if new.expected_amount <= 0 or new.period_month is not null and new.period_month not between 1 and 12 then
    raise exception 'Importe o periodo de cuota invalido.' using errcode = '23514';
  end if;
  select cg.code, ci.code into v_status_group, v_status_code
  from public.catalog_items ci join public.catalog_groups cg on cg.id = ci.group_id
  where ci.id = new.collection_status_id and ci.is_active and not ci.is_deleted;
  if v_status_group is distinct from 'COLLECTION_STATUS' then
    raise exception 'Estado de cobranza invalido.' using errcode = '23514';
  end if;
  new.is_operational := v_status_code <> 'ANULADO';
  return new;
end;
$$;

drop trigger if exists trg_payment_schedules_integrity on public.payment_schedules;
create trigger trg_payment_schedules_integrity
  before insert or update of membership_id, associate_id, expected_amount,
    period_year, period_month, collection_status_id, is_operational
  on public.payment_schedules
  for each row execute function public.fn_assert_schedule_row();

alter table public.memberships drop constraint if exists chk_memberships_positive_fee;
alter table public.memberships add constraint chk_memberships_positive_fee check (fee_amount > 0);
alter table public.memberships drop constraint if exists chk_memberships_date_range;
alter table public.memberships add constraint chk_memberships_date_range check (end_date >= start_date);
alter table public.payment_schedules drop constraint if exists chk_payment_schedules_positive_amount;
alter table public.payment_schedules add constraint chk_payment_schedules_positive_amount check (expected_amount > 0);
alter table public.payment_schedules drop constraint if exists chk_payment_schedules_period_month;
alter table public.payment_schedules add constraint chk_payment_schedules_period_month check (period_month is null or period_month between 1 and 12);
alter table public.payments drop constraint if exists chk_payments_positive_amount;
alter table public.payments add constraint chk_payments_positive_amount check (amount_paid > 0);

create or replace function public.fn_generate_membership_schedule(
  p_membership_id uuid,
  p_actor uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membership public.memberships%rowtype;
  v_type_code text;
  v_pending_id uuid;
  v_installments integer;
  v_interval integer;
  v_offset integer;
  v_index integer;
  v_total_cents bigint;
  v_base_cents bigint;
  v_amount numeric(12,2);
  v_due date;
begin
  select m.*
  into v_membership
  from public.memberships m
  where m.id = p_membership_id and m.is_deleted = false
  for update;

  if not found then
    raise exception 'La membresia no existe.' using errcode = 'P0002';
  end if;

  select mt.code
  into v_type_code
  from public.catalog_items mt
  where mt.id = v_membership.membership_type_id;

  if v_type_code is null then
    raise exception 'La modalidad de la membresia no es valida.' using errcode = '23514';
  end if;
  if exists (
    select 1 from public.payment_schedules ps
    join public.catalog_items cs on cs.id = ps.collection_status_id
    where ps.membership_id = p_membership_id
      and ps.is_deleted = false and cs.code <> 'ANULADO'
  ) then
    raise exception 'La membresia ya tiene un cronograma operativo.' using errcode = '23505';
  end if;

  v_pending_id := public.find_catalog_item_id('COLLECTION_STATUS', 'PENDIENTE');
  select installments, interval_months into v_installments, v_interval
  from (values
    ('MENSUAL', 12, 1), ('TRIMESTRAL', 4, 3),
    ('CUATRIMESTRAL', 3, 4), ('SEMESTRAL', 2, 6), ('ANUAL', 1, 12)
  ) f(code, installments, interval_months)
  where f.code = v_type_code;

  if v_installments is null or v_pending_id is null then
    raise exception 'No se puede generar el cronograma para la modalidad indicada.' using errcode = '22023';
  end if;

  v_total_cents := round(v_membership.fee_amount * 100);
  v_base_cents := trunc(v_total_cents::numeric / v_installments);
  v_offset := case
    when v_type_code = 'ANUAL' then 0
    when v_membership.monthly_billing_day >= extract(day from v_membership.start_date) then 0
    else 1
  end;

  for v_index in 0..v_installments - 1 loop
    v_amount := case
      when v_index = v_installments - 1
        then (v_total_cents - v_base_cents * (v_installments - 1))::numeric / 100
      else v_base_cents::numeric / 100
    end;
    if v_type_code = 'ANUAL' then
      v_due := v_membership.end_date + 1;
    else
      v_due := (
        date_trunc('month', v_membership.start_date::timestamp)
        + make_interval(months => (v_offset + v_index) * v_interval)
        + make_interval(days => v_membership.monthly_billing_day - 1)
      )::date;
    end if;

    insert into public.payment_schedules (
      membership_id, associate_id, due_date, period_year, period_month,
      expected_amount, collection_status_id, created_by, updated_by
    ) values (
      v_membership.id, v_membership.associate_id, v_due,
      extract(year from v_due)::integer,
      case when v_type_code = 'ANUAL' then null else extract(month from v_due)::smallint end,
      v_amount, v_pending_id, p_actor, p_actor
    );
  end loop;
end;
$$;

-- Regenerar cronogramas inconsistentes sin pagos; los anteriores se conservan anulados.
do $$
declare
  v_paid_bad jsonb;
  r record;
begin
  with bad_schedules as (
    select m.id as membership_id
    from public.membership_operational_summary mo
    join public.memberships m on m.id = mo.id
    join public.catalog_items mt on mt.id = m.membership_type_id
    left join public.payment_schedules ps on ps.membership_id = m.id and ps.is_deleted = false
    left join public.catalog_items cs on cs.id = ps.collection_status_id and cs.code <> 'ANULADO'
    where m.is_deleted = false
      and mo.effective_status_code in ('VIGENTE', 'PROGRAMADA')
    group by m.id, m.fee_amount, mt.code
    having count(ps.id) filter (where cs.id is not null) <> case mt.code
        when 'MENSUAL' then 12 when 'TRIMESTRAL' then 4 when 'CUATRIMESTRAL' then 3
        when 'SEMESTRAL' then 2 when 'ANUAL' then 1 else 0 end
      or coalesce(sum(ps.expected_amount) filter (where cs.id is not null), 0) <> m.fee_amount
  )
  select coalesce(jsonb_agg(distinct b.membership_id), '[]'::jsonb)
  into v_paid_bad
  from bad_schedules b
  join public.payment_schedules ps on ps.membership_id = b.membership_id
  join public.payments p on p.payment_schedule_id = ps.id
  where p.is_deleted = false and p.is_reversed = false;

  if jsonb_array_length(v_paid_bad) > 0 then
    raise exception 'S22 bloqueado: cronogramas inconsistentes con pagos=%', v_paid_bad
      using errcode = '23514';
  end if;

  for r in
    select m.id as membership_id
    from public.membership_operational_summary mo
    join public.memberships m on m.id = mo.id
    join public.catalog_items mt on mt.id = m.membership_type_id
    left join public.payment_schedules ps on ps.membership_id = m.id and ps.is_deleted = false
    left join public.catalog_items cs on cs.id = ps.collection_status_id and cs.code <> 'ANULADO'
    where m.is_deleted = false
      and mo.effective_status_code in ('VIGENTE', 'PROGRAMADA')
    group by m.id, m.fee_amount, mt.code
    having count(ps.id) filter (where cs.id is not null) <> case mt.code
        when 'MENSUAL' then 12 when 'TRIMESTRAL' then 4 when 'CUATRIMESTRAL' then 3
        when 'SEMESTRAL' then 2 when 'ANUAL' then 1 else 0 end
      or coalesce(sum(ps.expected_amount) filter (where cs.id is not null), 0) <> m.fee_amount
  loop
    update public.payment_schedules ps
    set collection_status_id = public.find_catalog_item_id('COLLECTION_STATUS', 'ANULADO'),
        is_paid = false,
        paid_at = null,
        notes = concat_ws(E'\n', nullif(ps.notes, ''), 'Anulada automaticamente por S22: cronograma regenerado.'),
        updated_at = now()
    where ps.membership_id = r.membership_id
      and ps.is_deleted = false;

    perform public.fn_generate_membership_schedule(r.membership_id, null);
  end loop;
end $$;

-- Validacion diferida: permite que el RPC inserte todas las cuotas dentro de
-- la misma transaccion, pero rechaza un cronograma incompleto al confirmar.
create or replace function public.fn_assert_membership_schedule_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membership_id uuid;
  v_fee numeric(12,2);
  v_type_code text;
  v_status_code text;
  v_expected_count integer;
  v_actual_count integer;
  v_actual_total numeric(12,2);
  v_primary_membership_id uuid;
  v_previous_membership_id uuid;
begin
  if tg_table_name = 'memberships' then
    v_primary_membership_id := case when tg_op = 'DELETE' then old.id else new.id end;
  else
    v_primary_membership_id := case when tg_op = 'DELETE' then old.membership_id else new.membership_id end;
    if tg_op = 'UPDATE' then
      v_previous_membership_id := old.membership_id;
    end if;
  end if;

  for v_membership_id in
    select distinct membership_id
    from (
      values
        (v_primary_membership_id),
        (v_previous_membership_id)
    ) ids(membership_id)
    where membership_id is not null
  loop
    select m.fee_amount, mt.code, ms.code
    into v_fee, v_type_code, v_status_code
    from public.memberships m
    join public.catalog_items mt on mt.id = m.membership_type_id
    join public.catalog_items ms on ms.id = m.membership_status_id
    where m.id = v_membership_id and not m.is_deleted;

    if not found or v_status_code not in ('VIGENTE', 'PROGRAMADA') then
      continue;
    end if;

    v_expected_count := case v_type_code
      when 'MENSUAL' then 12 when 'TRIMESTRAL' then 4
      when 'CUATRIMESTRAL' then 3 when 'SEMESTRAL' then 2
      when 'ANUAL' then 1 else 0 end;

    select count(*)::integer, coalesce(sum(expected_amount), 0)::numeric(12,2)
    into v_actual_count, v_actual_total
    from public.payment_schedules
    where membership_id = v_membership_id
      and not is_deleted and is_operational;

    if v_actual_count <> v_expected_count or v_actual_total <> v_fee then
      raise exception 'El cronograma de la membresia % debe tener % cuotas por un total de %, pero tiene % por %.',
        v_membership_id, v_expected_count, v_fee, v_actual_count, v_actual_total
        using errcode = '23514';
    end if;
  end loop;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists trg_memberships_schedule_total on public.memberships;
create constraint trigger trg_memberships_schedule_total
  after insert or update or delete on public.memberships
  deferrable initially deferred
  for each row execute function public.fn_assert_membership_schedule_total();

drop trigger if exists trg_payment_schedules_total on public.payment_schedules;
create constraint trigger trg_payment_schedules_total
  after insert or update or delete on public.payment_schedules
  deferrable initially deferred
  for each row execute function public.fn_assert_membership_schedule_total();

-- ------------------------------------------------------------
-- RPCs transaccionales de membresia.
-- ------------------------------------------------------------
create or replace function public.fn_assert_membership_request(
  p_membership_type_id uuid,
  p_fee_amount numeric,
  p_start_date date,
  p_monthly_billing_day integer
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare v_type_code text;
begin
  select ci.code into v_type_code
  from public.catalog_items ci join public.catalog_groups cg on cg.id = ci.group_id
  where ci.id = p_membership_type_id and cg.code = 'MEMBERSHIP_TYPE'
    and ci.is_active and not ci.is_deleted;
  if v_type_code is null or p_fee_amount is null or p_fee_amount <= 0 or p_start_date is null then
    raise exception 'Los datos de la membresia no son validos.' using errcode = '22023';
  end if;
  if v_type_code <> 'ANUAL' and (p_monthly_billing_day is null or p_monthly_billing_day not between 1 and 28) then
    raise exception 'El dia de cobro debe estar entre 1 y 28.' using errcode = '22023';
  end if;
  return v_type_code;
end;
$$;

create or replace function public.create_membership_period(
  p_associate_id uuid,
  p_membership_type_id uuid,
  p_fee_amount numeric,
  p_start_date date,
  p_monthly_billing_day integer default null,
  p_negotiation_notes text default null
)
returns public.memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_associate public.associates%rowtype;
  v_membership public.memberships%rowtype;
  v_status_id uuid;
begin
  if not public.has_module_permission('membresias', 'create') or v_actor is null then
    raise exception 'No tienes permisos para crear membresias.' using errcode = '42501';
  end if;
  perform public.fn_assert_membership_request(p_membership_type_id, p_fee_amount, p_start_date, p_monthly_billing_day);
  select a.* into v_associate from public.associates a
  where a.id = p_associate_id and not a.is_deleted for update;
  if not found or v_associate.category_id is null then
    raise exception 'Asigna una categoria activa al asociado desde Informacion.' using errcode = '23514';
  end if;
  if exists (
    select 1 from public.membership_operational_summary mo
    where mo.associate_id = p_associate_id
      and mo.effective_status_code in ('VIGENTE', 'PROGRAMADA')
  ) then
    raise exception 'El asociado ya tiene una membresia vigente o programada. Usa Renovar.' using errcode = '23505';
  end if;
  update public.memberships set is_current = false, updated_at = now()
  where associate_id = p_associate_id and is_current and not is_deleted;
  v_status_id := public.find_catalog_item_id('MEMBERSHIP_STATUS',
    case when p_start_date > public.business_today() then 'PROGRAMADA' else 'VIGENTE' end);
  insert into public.memberships (
    associate_id, membership_type_id, category_id, fee_amount, currency_code,
    start_date, end_date, monthly_billing_day, membership_status_id,
    negotiation_notes, is_current, created_by, updated_by
  ) values (
    p_associate_id, p_membership_type_id, v_associate.category_id, p_fee_amount, 'PEN',
    p_start_date, public.membership_annual_end_date(p_start_date),
    p_monthly_billing_day, v_status_id, nullif(trim(p_negotiation_notes), ''),
    true, v_actor, v_actor
  ) returning * into v_membership;
  perform public.fn_generate_membership_schedule(v_membership.id, v_actor);
  perform public.fn_sync_associate_operational_cache(v_membership.associate_id);
  return v_membership;
end;
$$;

create or replace function public.renew_membership_period(
  p_membership_id uuid,
  p_membership_type_id uuid,
  p_fee_amount numeric,
  p_start_date date,
  p_monthly_billing_day integer default null,
  p_negotiation_notes text default null
)
returns public.memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_old public.memberships%rowtype;
  v_new public.memberships%rowtype;
  v_category_id uuid;
  v_status_id uuid;
  v_renewed_id uuid := public.find_catalog_item_id('MEMBERSHIP_STATUS', 'RENOVADA');
  v_annulled_id uuid := public.find_catalog_item_id('COLLECTION_STATUS', 'ANULADO');
begin
  if not (public.has_module_permission('membresias', 'create') and public.has_module_permission('membresias', 'update'))
    or v_actor is null then
    raise exception 'No tienes permisos para renovar membresias.' using errcode = '42501';
  end if;
  perform public.fn_assert_membership_request(p_membership_type_id, p_fee_amount, p_start_date, p_monthly_billing_day);
  select m.* into v_old from public.memberships m
  where m.id = p_membership_id and not m.is_deleted for update;
  if not found then raise exception 'La membresia no existe.' using errcode = 'P0002'; end if;
  if not exists (
    select 1 from public.membership_operational_summary mo
    where mo.id = v_old.id and mo.effective_status_code = 'VIGENTE'
  ) then
    raise exception 'Solo se puede renovar la membresia efectivamente vigente.' using errcode = '23514';
  end if;
  if exists (
    select 1 from public.memberships n join public.catalog_items ns on ns.id = n.membership_status_id
    where n.renewed_from_membership_id = v_old.id and not n.is_deleted and ns.code <> 'CANCELADA'
  ) then
    raise exception 'La membresia ya tiene una renovacion programada.' using errcode = '23505';
  end if;
  if p_start_date <= v_old.start_date then
    raise exception 'La nueva fecha de inicio debe ser posterior al periodo anterior.' using errcode = '22023';
  end if;
  select category_id into v_category_id from public.associates
  where id = v_old.associate_id and not is_deleted for update;
  if v_category_id is null then
    raise exception 'Asigna una categoria activa al asociado desde Informacion.' using errcode = '23514';
  end if;

  update public.memberships
  set membership_status_id = v_renewed_id,
      operational_end_date = least(end_date, p_start_date - 1),
      is_current = false, updated_by = v_actor, updated_at = now()
  where id = v_old.id;

  update public.payment_schedules ps
  set collection_status_id = v_annulled_id,
      is_paid = false, paid_at = null,
      notes = concat_ws(E'\n', nullif(ps.notes, ''), 'Anulada por renovacion de membresia.'),
      updated_by = v_actor, updated_at = now()
  where ps.membership_id = v_old.id
    and ps.is_deleted = false
    and ps.due_date >= p_start_date
    and exists (
      select 1 from public.payment_schedule_balances b
      where b.id = ps.id and b.outstanding_amount > 0
    );

  v_status_id := public.find_catalog_item_id('MEMBERSHIP_STATUS',
    case when p_start_date > public.business_today() then 'PROGRAMADA' else 'VIGENTE' end);
  insert into public.memberships (
    associate_id, membership_type_id, category_id, fee_amount, currency_code,
    start_date, end_date, monthly_billing_day, membership_status_id,
    negotiation_notes, renewed_from_membership_id, is_current, created_by, updated_by
  ) values (
    v_old.associate_id, p_membership_type_id, v_category_id, p_fee_amount, 'PEN',
    p_start_date, public.membership_annual_end_date(p_start_date),
    p_monthly_billing_day, v_status_id, nullif(trim(p_negotiation_notes), ''),
    v_old.id, true, v_actor, v_actor
  ) returning * into v_new;
  perform public.fn_generate_membership_schedule(v_new.id, v_actor);
  perform public.fn_sync_associate_operational_cache(v_new.associate_id);
  return v_new;
end;
$$;

create or replace function public.cancel_membership_period(p_membership_id uuid)
returns public.memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_membership public.memberships%rowtype;
  v_cancelled_id uuid := public.find_catalog_item_id('MEMBERSHIP_STATUS', 'CANCELADA');
  v_annulled_id uuid := public.find_catalog_item_id('COLLECTION_STATUS', 'ANULADO');
begin
  if not public.has_module_permission('membresias', 'update') or v_actor is null then
    raise exception 'No tienes permisos para cancelar membresias.' using errcode = '42501';
  end if;
  select m.* into v_membership from public.memberships m
  where m.id = p_membership_id and not m.is_deleted for update;
  if not found then raise exception 'La membresia no existe.' using errcode = 'P0002'; end if;
  if not exists (
    select 1 from public.membership_operational_summary mo
    where mo.id = v_membership.id and mo.effective_status_code = 'VIGENTE'
  ) then
    raise exception 'Solo se puede cancelar la membresia efectivamente vigente.' using errcode = '23514';
  end if;
  update public.memberships
  set membership_status_id = v_cancelled_id,
      operational_end_date = least(end_date, public.business_today()),
      updated_by = v_actor, updated_at = now()
  where id = v_membership.id returning * into v_membership;

  update public.payment_schedules ps
  set collection_status_id = v_annulled_id, is_paid = false, paid_at = null,
      notes = concat_ws(E'\n', nullif(ps.notes, ''), 'Anulada por cancelacion de membresia.'),
      updated_by = v_actor, updated_at = now()
  where ps.membership_id = v_membership.id and not ps.is_deleted
    and ps.due_date > public.business_today()
    and exists (select 1 from public.payment_schedule_balances b where b.id = ps.id and b.outstanding_amount > 0);

  perform public.fn_sync_associate_operational_cache(v_membership.associate_id);
  return v_membership;
end;
$$;

create or replace function public.cancel_scheduled_membership(p_membership_id uuid)
returns public.memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_membership public.memberships%rowtype;
  v_cancelled_id uuid := public.find_catalog_item_id('MEMBERSHIP_STATUS', 'CANCELADA');
  v_vigente_id uuid := public.find_catalog_item_id('MEMBERSHIP_STATUS', 'VIGENTE');
  v_expired_id uuid := public.find_catalog_item_id('MEMBERSHIP_STATUS', 'VENCIDA');
  v_annulled_id uuid := public.find_catalog_item_id('COLLECTION_STATUS', 'ANULADO');
begin
  if not public.has_module_permission('membresias', 'update') or v_actor is null then
    raise exception 'No tienes permisos para cancelar renovaciones.' using errcode = '42501';
  end if;
  select m.* into v_membership from public.memberships m
  where m.id = p_membership_id and not m.is_deleted for update;
  if not found or not exists (
    select 1 from public.membership_operational_summary mo
    where mo.id = p_membership_id and mo.effective_status_code = 'PROGRAMADA'
  ) then
    raise exception 'La membresia no esta programada.' using errcode = '22023';
  end if;
  update public.memberships set membership_status_id = v_cancelled_id,
    operational_end_date = start_date - 1,
    updated_by = v_actor, updated_at = now()
  where id = v_membership.id returning * into v_membership;
  update public.payment_schedules set collection_status_id = v_annulled_id,
    is_paid = false, paid_at = null, updated_by = v_actor, updated_at = now()
  where membership_id = v_membership.id and not is_deleted and not is_paid;
  if v_membership.renewed_from_membership_id is not null then
    update public.memberships
    set membership_status_id = case
          when end_date >= public.business_today() then v_vigente_id
          else v_expired_id
        end,
        operational_end_date = null,
        updated_by = v_actor, updated_at = now()
    where id = v_membership.renewed_from_membership_id
      and not is_deleted;
  end if;
  perform public.fn_sync_associate_operational_cache(v_membership.associate_id);
  return v_membership;
end;
$$;

-- ------------------------------------------------------------
-- Pagos, reversiones y cobranza transaccional.
-- ------------------------------------------------------------
create or replace function public.fn_recalculate_schedule(p_schedule_id uuid, p_actor uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_schedule public.payment_schedules%rowtype;
  v_paid numeric(12,2);
  v_status_id uuid;
  v_last_date date;
begin
  select * into v_schedule from public.payment_schedules where id = p_schedule_id for update;
  select coalesce(sum(amount_paid), 0), max(payment_date)
  into v_paid, v_last_date
  from public.payments
  where payment_schedule_id = p_schedule_id and not is_deleted and not is_reversed;
  if exists (select 1 from public.catalog_items where id = v_schedule.collection_status_id and code = 'ANULADO') then
    return;
  end if;
  v_status_id := public.find_catalog_item_id('COLLECTION_STATUS', case
    when v_paid >= v_schedule.expected_amount then 'PAGADO'
    when v_paid > 0 then 'PARCIAL'
    when v_schedule.due_date < public.business_today() then 'VENCIDO'
    else 'PENDIENTE' end);
  update public.payment_schedules
  set is_paid = v_paid >= expected_amount,
      paid_at = case when v_paid >= expected_amount
        then v_last_date::timestamp at time zone 'America/Lima' else null end,
      collection_status_id = v_status_id,
      updated_by = p_actor, updated_at = now()
  where id = p_schedule_id;
end;
$$;

create or replace function public.register_payment(
  p_payment_schedule_id uuid,
  p_payment_date date,
  p_amount_paid numeric,
  p_operation_code text,
  p_payment_method_id uuid default null,
  p_reference_notes text default null
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_schedule public.payment_schedules%rowtype;
  v_balance public.payment_schedule_balances%rowtype;
  v_payment public.payments%rowtype;
begin
  if not (public.has_module_permission('cobranza', 'create') and public.has_module_permission('cobranza', 'update'))
    or v_actor is null then
    raise exception 'No tienes permisos para registrar pagos.' using errcode = '42501';
  end if;
  if p_payment_date is null or p_payment_date > public.business_today() or p_amount_paid is null or p_amount_paid <= 0
    or nullif(trim(p_operation_code), '') is null then
    raise exception 'Los datos del pago no son validos.' using errcode = '22023';
  end if;
  select * into v_schedule from public.payment_schedules
  where id = p_payment_schedule_id and not is_deleted for update;
  select * into v_balance from public.payment_schedule_balances where id = p_payment_schedule_id;
  if not found or not v_balance.is_collectible then
    raise exception 'La cuota no esta disponible para pago.' using errcode = '23514';
  end if;
  if p_payment_date < v_balance.membership_start_date then
    raise exception 'No se aceptan pagos antes del inicio de la membresia.' using errcode = '22023';
  end if;
  if p_amount_paid > v_balance.outstanding_amount then
    raise exception 'El monto supera el saldo pendiente de %.', v_balance.outstanding_amount using errcode = '22023';
  end if;
  if p_payment_method_id is not null and not exists (
    select 1 from public.catalog_items ci join public.catalog_groups cg on cg.id = ci.group_id
    where ci.id = p_payment_method_id and cg.code = 'PAYMENT_METHOD' and ci.is_active and not ci.is_deleted
  ) then raise exception 'Metodo de pago invalido.' using errcode = '22023'; end if;

  insert into public.payments (
    associate_id, membership_id, payment_schedule_id, payment_date,
    amount_paid, currency_code, operation_code, payment_method_id,
    reference_notes, registered_by_user_id, created_by, updated_by
  ) values (
    v_schedule.associate_id, v_schedule.membership_id, v_schedule.id, p_payment_date,
    p_amount_paid, 'PEN', trim(p_operation_code), p_payment_method_id,
    nullif(trim(p_reference_notes), ''), v_actor, v_actor, v_actor
  ) returning * into v_payment;
  perform public.fn_recalculate_schedule(v_schedule.id, v_actor);
  perform public.fn_sync_associate_operational_cache(v_schedule.associate_id);
  return v_payment;
end;
$$;

create or replace function public.reverse_payment(p_payment_id uuid, p_reason text)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_payment public.payments%rowtype;
begin
  if not public.has_module_permission('cobranza', 'update') or v_actor is null then
    raise exception 'No tienes permisos para reversar pagos.' using errcode = '42501';
  end if;
  if nullif(trim(p_reason), '') is null then
    raise exception 'El motivo de reversion es obligatorio.' using errcode = '22023';
  end if;
  select * into v_payment from public.payments
  where id = p_payment_id and not is_deleted for update;
  if not found or v_payment.is_reversed then
    raise exception 'El pago no existe o ya fue reversado.' using errcode = '23514';
  end if;
  update public.payments set is_reversed = true, reversed_at = now(),
    reversal_reason = trim(p_reason), updated_by = v_actor, updated_at = now()
  where id = v_payment.id returning * into v_payment;
  perform public.fn_recalculate_schedule(v_payment.payment_schedule_id, v_actor);
  perform public.fn_sync_associate_operational_cache(v_payment.associate_id);
  return v_payment;
end;
$$;

create or replace function public.register_collection_action(
  p_associate_id uuid,
  p_payment_schedule_id uuid,
  p_contact_type_id uuid,
  p_subject text,
  p_short_observation text default null,
  p_mail_to text default null,
  p_action_result_id uuid default null,
  p_next_follow_up_at timestamptz default null
)
returns public.collection_actions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_action public.collection_actions%rowtype;
begin
  if not (public.has_module_permission('cobranza', 'create') and public.has_module_permission('cobranza', 'update'))
    or v_actor is null then
    raise exception 'No tienes permisos para registrar gestiones.' using errcode = '42501';
  end if;
  if nullif(trim(p_subject), '') is null then
    raise exception 'El asunto es obligatorio.' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.catalog_items ci
    join public.catalog_groups cg on cg.id = ci.group_id
    where ci.id = p_contact_type_id and cg.code = 'CONTACT_TYPE'
      and ci.is_active and not ci.is_deleted
  ) then
    raise exception 'El tipo de contacto no es valido.' using errcode = '22023';
  end if;
  if p_action_result_id is not null and not exists (
    select 1 from public.catalog_items ci
    join public.catalog_groups cg on cg.id = ci.group_id
    where ci.id = p_action_result_id and cg.code = 'COLLECTION_RESULT'
      and ci.is_active and not ci.is_deleted
  ) then
    raise exception 'El resultado de cobranza no es valido.' using errcode = '22023';
  end if;
  if p_payment_schedule_id is not null and not exists (
    select 1 from public.payment_schedule_balances b
    where b.id = p_payment_schedule_id and b.associate_id = p_associate_id and b.is_collectible
  ) then
    raise exception 'La cuota no corresponde al asociado o no esta disponible para cobranza.' using errcode = '23514';
  end if;
  insert into public.collection_actions (
    associate_id, payment_schedule_id, action_date, managed_by_user_id,
    contact_type_id, subject, short_observation, mail_to, action_result_id,
    next_follow_up_at, created_by, updated_by
  ) values (
    p_associate_id, p_payment_schedule_id, now(), v_actor,
    p_contact_type_id, trim(p_subject), nullif(trim(p_short_observation), ''),
    nullif(trim(p_mail_to), ''), p_action_result_id, p_next_follow_up_at,
    v_actor, v_actor
  ) returning * into v_action;
  return v_action;
end;
$$;

create or replace function public.set_associate_suspension(p_associate_id uuid, p_suspended boolean)
returns public.associates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_profile_id();
  v_status_id uuid;
  v_associate public.associates%rowtype;
  v_code text;
begin
  if not public.has_module_permission('asociados', 'update') or v_actor is null then
    raise exception 'No tienes permisos para cambiar el estado del asociado.' using errcode = '42501';
  end if;
  select effective_status_code into v_code from public.associate_operational_summary where id = p_associate_id;
  if v_code is null then raise exception 'El asociado no existe.' using errcode = 'P0002'; end if;
  v_status_id := public.find_catalog_item_id('ASSOCIATE_STATUS', case
    when p_suspended then 'SUSPENDIDO'
    when exists (select 1 from public.membership_operational_summary where associate_id = p_associate_id and effective_status_code = 'VIGENTE') then 'ACTIVO'
    when exists (select 1 from public.memberships where associate_id = p_associate_id and not is_deleted) then 'INACTIVO'
    else 'EN_PROCESO' end);
  update public.associates set associate_status_id = v_status_id,
    updated_by = v_actor, updated_at = now()
  where id = p_associate_id and not is_deleted returning * into v_associate;
  return v_associate;
end;
$$;

-- ------------------------------------------------------------
-- Reportes y dashboard consumen las mismas reglas operativas.
-- ------------------------------------------------------------
create or replace view public.report_associates_summary
with (security_invoker = true)
as
select
  a.id, a.internal_code, a.company_name, a.trade_name, a.ruc,
  a.association_date, a.corporate_email,
  aos.effective_status_code::varchar(80) as associate_status_code,
  aos.effective_status_label::varchar(150) as associate_status_label,
  c.code as category_code, c.name as category_name, c.base_fee as category_base_fee,
  at.code as activity_type_code, at.label as activity_type_label,
  cs.code as company_size_code, cs.label as company_size_label,
  aos.payment_health_code::varchar(80) as payment_health_code,
  aos.payment_health_label::varchar(150) as payment_health_label
from public.associates a
join public.associate_operational_summary aos on aos.id = a.id
left join public.categories c on c.id = a.category_id
left join public.catalog_items at on at.id = a.activity_type_id
left join public.catalog_items cs on cs.id = a.company_size_id
where a.is_deleted = false;

drop view if exists public.report_memberships_summary;
create view public.report_memberships_summary
with (security_invoker = true)
as
select
  mo.id, mo.fee_amount, mo.currency_code, mo.start_date, mo.end_date,
  mo.effective_end_date, mo.is_current, mo.is_effective, mo.is_scheduled,
  mt.code as membership_type_code, mt.label as membership_type_label,
  c.code as category_code, c.name as category_name,
  mo.effective_status_code as membership_status_code,
  mo.effective_status_label as membership_status_label,
  a.id as associate_id, a.company_name as associate_company_name,
  a.ruc as associate_ruc, a.internal_code as associate_internal_code
from public.membership_operational_summary mo
left join public.catalog_items mt on mt.id = mo.membership_type_id
left join public.categories c on c.id = mo.category_id
left join public.associates a on a.id = mo.associate_id;

drop view if exists public.report_schedules_summary;
create view public.report_schedules_summary
with (security_invoker = true)
as
select
  b.id, b.due_date, b.expected_amount, b.paid_amount, b.outstanding_amount,
  (b.outstanding_amount = 0 and b.financial_status_code <> 'ANULADO') as is_paid,
  b.paid_at, b.period_year, b.period_month, b.is_collectible,
  b.financial_status_code as collection_status_code,
  b.financial_status_label as collection_status_label,
  b.has_collection_management,
  a.id as associate_id, a.company_name as associate_company_name,
  a.ruc as associate_ruc, a.internal_code as associate_internal_code
from public.payment_schedule_balances b
left join public.associates a on a.id = b.associate_id;

create or replace view public.report_committee_assignments_current
with (security_invoker = true)
as
select
  a.id as associate_id, a.internal_code as associate_internal_code,
  a.company_name as associate_company_name, a.ruc as associate_ruc,
  aos.effective_status_code::varchar(80) as associate_status_code,
  aos.effective_status_label::varchar(150) as associate_status_label,
  cat.code as category_code, cat.name as category_name,
  ac.id as committee_assignment_id, c.id as committee_id,
  c.code as committee_code, c.name as committee_name,
  c.is_active as committee_is_active, ac.joined_at
from public.associates a
join public.associate_operational_summary aos on aos.id = a.id
left join public.associate_committees ac
  on ac.associate_id = a.id and ac.is_primary and ac.is_active and not ac.is_deleted
left join public.committees c on c.id = ac.committee_id and not c.is_deleted
left join public.categories cat on cat.id = a.category_id
where not a.is_deleted and public.has_module_permission('reportes', 'read');

create or replace view public.dashboard_kpis
with (security_invoker = true)
as
with associate_counts as (
  select coalesce(sum(total_by_status), 0)::integer as total,
    coalesce(jsonb_object_agg(effective_status_code, total_by_status), '{}'::jsonb) as by_status
  from (
    select effective_status_code, count(*)::integer as total_by_status
    from public.associate_operational_summary group by effective_status_code
  ) grouped
), financial as (
  select
    coalesce(sum(outstanding_amount) filter (where is_collectible), 0) as pending,
    count(*) filter (where is_collectible)::integer as pending_count,
    coalesce(sum(outstanding_amount) filter (where is_collectible and due_date < public.business_today()), 0) as overdue,
    count(*) filter (where is_collectible and due_date < public.business_today())::integer as overdue_count
  from public.payment_schedule_balances
)
select
  1 as id,
  (select count(*)::integer from public.prospects where not is_deleted) as prospects_total,
  coalesce((select jsonb_object_agg(code, total) from (
    select coalesce(ci.code, 'SIN_ESTADO') code, count(*)::integer total
    from public.prospects p left join public.catalog_items ci on ci.id = p.prospect_status_id
    where not p.is_deleted group by ci.code
  ) p), '{}'::jsonb) as prospects_by_status,
  (select total from associate_counts) as associates_total,
  (select by_status from associate_counts) as associates_by_status,
  (select count(*)::integer from public.membership_operational_summary where effective_status_code = 'VIGENTE') as memberships_current,
  (select pending from financial) as financial_pending,
  (select pending_count from financial) as financial_pending_count,
  (select overdue from financial) as financial_overdue,
  (select overdue_count from financial) as financial_overdue_count,
  (select coalesce(sum(amount_paid), 0) from public.payments
    where not is_deleted and not is_reversed
      and payment_date >= date_trunc('month', public.business_today())::date) as financial_collected_this_month,
  (select count(*)::integer from public.documents where not is_deleted and is_latest_version) as documents_total;

-- Los flujos anteriores dejan de estar disponibles: toda escritura debe ser atomica.
revoke all on function public.create_current_membership(uuid, uuid, numeric, text, date, date, integer, uuid, text)
  from authenticated;
revoke all on function public.renew_current_membership(uuid, uuid, numeric, text, date, date, integer, uuid, text)
  from authenticated;

revoke all on function public.fn_assert_membership_operational_row() from public, anon, authenticated;
revoke all on function public.fn_assert_schedule_row() from public, anon, authenticated;
revoke all on function public.fn_generate_membership_schedule(uuid, uuid) from public, anon, authenticated;
revoke all on function public.fn_assert_membership_request(uuid, numeric, date, integer) from public, anon, authenticated;
revoke all on function public.fn_recalculate_schedule(uuid, uuid) from public, anon, authenticated;
revoke all on function public.fn_assert_membership_schedule_total() from public, anon, authenticated;
revoke all on function public.fn_sync_associate_operational_cache(uuid) from public, anon, authenticated;
revoke all on function public.membership_annual_end_date(date) from public, anon, authenticated;

revoke all on function public.create_membership_period(uuid, uuid, numeric, date, integer, text) from public, anon;
revoke all on function public.renew_membership_period(uuid, uuid, numeric, date, integer, text) from public, anon;
revoke all on function public.cancel_membership_period(uuid) from public, anon;
revoke all on function public.cancel_scheduled_membership(uuid) from public, anon;
revoke all on function public.register_payment(uuid, date, numeric, text, uuid, text) from public, anon;
revoke all on function public.reverse_payment(uuid, text) from public, anon;
revoke all on function public.register_collection_action(uuid, uuid, uuid, text, text, text, uuid, timestamptz) from public, anon;
revoke all on function public.set_associate_suspension(uuid, boolean) from public, anon;

grant execute on function public.create_membership_period(uuid, uuid, numeric, date, integer, text) to authenticated;
grant execute on function public.renew_membership_period(uuid, uuid, numeric, date, integer, text) to authenticated;
grant execute on function public.cancel_membership_period(uuid) to authenticated;
grant execute on function public.cancel_scheduled_membership(uuid) to authenticated;
grant execute on function public.register_payment(uuid, date, numeric, text, uuid, text) to authenticated;
grant execute on function public.reverse_payment(uuid, text) to authenticated;
grant execute on function public.register_collection_action(uuid, uuid, uuid, text, text, text, uuid, timestamptz) to authenticated;
grant execute on function public.set_associate_suspension(uuid, boolean) to authenticated;
grant select on public.membership_operational_summary,
  public.payment_schedule_balances,
  public.associate_operational_summary to authenticated;
grant select on public.report_associates_summary,
  public.report_memberships_summary,
  public.report_schedules_summary,
  public.report_committee_assignments_current,
  public.dashboard_kpis to authenticated;

comment on view public.membership_operational_summary is 'Estado efectivo de membresias calculado con fecha de negocio America/Lima.';
comment on view public.payment_schedule_balances is 'Saldo y estado financiero efectivo de cada cuota.';
comment on view public.associate_operational_summary is 'Estado y salud financiera efectivos del asociado.';

commit;
