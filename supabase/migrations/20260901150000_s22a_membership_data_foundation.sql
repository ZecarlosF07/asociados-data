-- ============================================================
-- Hito S22A: base de datos y saneamiento de membresias
-- ============================================================
-- Fase 1 de 2. Ejecutar primero y validar que finalice correctamente.

begin;

-- Estado para renovaciones que aun no empiezan.
insert into public.catalog_items (group_id, code, label, sort_order, is_active)
select g.id, 'PROGRAMADA', 'Programada', 2, true
from public.catalog_groups g
where g.code = 'MEMBERSHIP_STATUS'
  and not exists (
    select 1
    from public.catalog_items ci
    where ci.group_id = g.id
      and ci.code = 'PROGRAMADA'
      and ci.is_deleted = false
  );

update public.catalog_items ci
set label = v.label,
    sort_order = v.sort_order,
    is_active = true,
    updated_at = now()
from public.catalog_groups g
join (values
  ('VIGENTE',   'Vigente',   1),
  ('PROGRAMADA','Programada',2),
  ('VENCIDA',   'Vencida',   3),
  ('CANCELADA', 'Cancelada', 4),
  ('RENOVADA',  'Renovada',  5)
) as v(code, label, sort_order) on true
where ci.group_id = g.id
  and g.code = 'MEMBERSHIP_STATUS'
  and ci.code = v.code
  and ci.is_deleted = false;

alter table public.memberships
  add column if not exists renewed_from_membership_id uuid
    references public.memberships(id),
  add column if not exists operational_end_date date;

alter table public.payment_schedules
  add column if not exists is_operational boolean not null default true;

-- Una membresia puede acumular renovaciones canceladas en el historial. La
-- unicidad operativa se valida por trigger/RPC excluyendo las canceladas.
drop index if exists public.uq_memberships_renewed_from;
create index if not exists idx_memberships_renewed_from
  on public.memberships (renewed_from_membership_id)
  where renewed_from_membership_id is not null and is_deleted = false;

create or replace function public.business_today()
returns date
language sql
stable
set search_path = public
as $$
  select (now() at time zone 'America/Lima')::date
$$;

revoke all on function public.business_today() from public;
grant execute on function public.business_today() to authenticated;

create or replace function public.membership_annual_end_date(p_start_date date)
returns date
language sql
immutable
strict
set search_path = public
as $$
  select case
    when extract(month from p_start_date) = 2 and extract(day from p_start_date) = 29
      then make_date(extract(year from p_start_date)::integer + 1, 2, 28)
    else (p_start_date + interval '1 year' - interval '1 day')::date
  end
$$;

-- ------------------------------------------------------------
-- Preflight bloqueante. No se modifican datos ambiguos.
-- ------------------------------------------------------------
do $$
declare
  v_duplicate_paid jsonb;
  v_overpaid jsonb;
  v_crossed jsonb;
  v_duplicate_schedule_paid jsonb;
  v_invalid_payment_dates jsonb;
  v_invalid_financial_data jsonb;
begin
  with active_memberships as (
    select m.*, ms.code as status_code
    from public.memberships m
    join public.catalog_items ms on ms.id = m.membership_status_id
    where m.is_deleted = false
      and ms.code not in ('CANCELADA', 'RENOVADA')
  ), duplicate_losers as (
    select distinct older.id
    from active_memberships older
    join active_memberships newer
      on newer.associate_id = older.associate_id
     and (newer.created_at, newer.id) > (older.created_at, older.id)
     and older.start_date <= coalesce(newer.end_date, newer.start_date + 364)
     and newer.start_date <= coalesce(older.end_date, older.start_date + 364)
  )
  select coalesce(jsonb_agg(dl.id order by dl.id), '[]'::jsonb)
  into v_duplicate_paid
  from duplicate_losers dl
  where exists (
    select 1
    from public.payments p
    left join public.payment_schedules ps on ps.id = p.payment_schedule_id
    where p.is_deleted = false
      and p.is_reversed = false
      and (p.membership_id = dl.id or ps.membership_id = dl.id)
  );

  select coalesce(jsonb_agg(payment_schedule_id order by payment_schedule_id), '[]'::jsonb)
  into v_overpaid
  from (
    select ps.id as payment_schedule_id
    from public.payment_schedules ps
    join public.payments p on p.payment_schedule_id = ps.id
    where p.is_deleted = false
      and p.is_reversed = false
    group by ps.id, ps.expected_amount
    having sum(p.amount_paid) > ps.expected_amount
  ) invalid;

  select coalesce(jsonb_agg(id order by id), '[]'::jsonb)
  into v_crossed
  from (
    select ps.id
    from public.payment_schedules ps
    join public.memberships m on m.id = ps.membership_id
    where ps.associate_id is distinct from m.associate_id
    union
    select p.id
    from public.payments p
    join public.payment_schedules ps on ps.id = p.payment_schedule_id
    where p.associate_id is distinct from ps.associate_id
       or p.membership_id is distinct from ps.membership_id
    union
    select p.id
    from public.payments p
    join public.memberships m on m.id = p.membership_id
    where p.associate_id is distinct from m.associate_id
  ) invalid;

  select coalesce(jsonb_agg(p.id order by p.id), '[]'::jsonb)
  into v_invalid_payment_dates
  from public.payments p
  join public.memberships m on m.id = p.membership_id
  where not p.is_deleted and not p.is_reversed
    and (p.payment_date < m.start_date or p.payment_date > public.business_today());

  select coalesce(jsonb_agg(jsonb_build_object('entity', entity, 'id', id)), '[]'::jsonb)
  into v_invalid_financial_data
  from (
    select 'membership'::text as entity, m.id
    from public.memberships m
    left join public.categories c on c.id = m.category_id
    left join public.catalog_items mt on mt.id = m.membership_type_id
    left join public.catalog_groups mtg on mtg.id = mt.group_id
    left join public.catalog_items ms on ms.id = m.membership_status_id
    left join public.catalog_groups msg on msg.id = ms.group_id
    where not m.is_deleted and (
      m.category_id is null or c.id is null or m.fee_amount <= 0
      or m.end_date is not null and m.end_date < m.start_date
      or mtg.code is distinct from 'MEMBERSHIP_TYPE'
      or msg.code is distinct from 'MEMBERSHIP_STATUS'
    )
    union all
    select 'payment_schedule'::text, ps.id
    from public.payment_schedules ps
    where not ps.is_deleted and ps.expected_amount <= 0
  ) invalid;

  with duplicate_periods as (
    select ps.membership_id, ps.period_year, coalesce(ps.period_month, 0) as period_month
    from public.payment_schedules ps
    join public.catalog_items cs on cs.id = ps.collection_status_id
    where ps.is_deleted = false and cs.code <> 'ANULADO'
    group by ps.membership_id, ps.period_year, coalesce(ps.period_month, 0)
    having count(*) > 1
  )
  select coalesce(jsonb_agg(distinct ps.id order by ps.id), '[]'::jsonb)
  into v_duplicate_schedule_paid
  from duplicate_periods d
  join public.payment_schedules ps
    on ps.membership_id = d.membership_id
   and ps.period_year = d.period_year
   and coalesce(ps.period_month, 0) = d.period_month
  join public.catalog_items cs on cs.id = ps.collection_status_id and cs.code <> 'ANULADO'
  join public.payments p on p.payment_schedule_id = ps.id
  where p.is_deleted = false and p.is_reversed = false;

  if jsonb_array_length(v_duplicate_paid) > 0
    or jsonb_array_length(v_overpaid) > 0
    or jsonb_array_length(v_crossed) > 0
    or jsonb_array_length(v_duplicate_schedule_paid) > 0
    or jsonb_array_length(v_invalid_payment_dates) > 0
    or jsonb_array_length(v_invalid_financial_data) > 0 then
    raise exception 'S22 bloqueado. duplicados_con_pagos=%, sobrepagos=%, relaciones_cruzadas=%, cuotas_duplicadas_con_pagos=%, fechas_pago_invalidas=%, datos_financieros_invalidos=%',
      v_duplicate_paid, v_overpaid, v_crossed, v_duplicate_schedule_paid,
      v_invalid_payment_dates, v_invalid_financial_data
      using errcode = '23514';
  end if;
end $$;

-- Completar finales contractuales ausentes antes de calcular estados.
update public.memberships
set end_date = public.membership_annual_end_date(start_date),
    updated_at = now()
where end_date is null
  and is_deleted = false;

-- Identificar duplicados funcionales sin pagos: gana el registro mas reciente.
-- Todo el saneamiento se ejecuta en una sola sentencia para no depender de
-- tablas temporales ni del manejo de sesiones del SQL Editor.
with active_memberships as (
  select m.*, ms.code as status_code
  from public.memberships m
  join public.catalog_items ms on ms.id = m.membership_status_id
  where m.is_deleted = false
    and ms.code not in ('CANCELADA', 'RENOVADA')
), duplicate_memberships as materialized (
  select distinct on (older.id)
    older.id as loser_id,
    older.created_at as loser_created_at,
    newer.id as winner_id,
    newer.start_date as winner_start_date
  from active_memberships older
  join active_memberships newer
    on newer.associate_id = older.associate_id
   and (newer.created_at, newer.id) > (older.created_at, older.id)
   and older.start_date <= newer.end_date
   and newer.start_date <= older.end_date
  order by older.id, newer.created_at desc, newer.id desc
), closest_predecessor as (
  select distinct on (d.winner_id)
    d.winner_id,
    d.loser_id
  from duplicate_memberships d
  order by d.winner_id, d.loser_created_at desc, d.loser_id desc
), updated_memberships as (
  update public.memberships m
  set membership_status_id = case
        when exists (select 1 from duplicate_memberships d where d.loser_id = m.id)
          then public.find_catalog_item_id('MEMBERSHIP_STATUS', 'RENOVADA')
        else m.membership_status_id
      end,
      operational_end_date = coalesce(
        (select d.winner_start_date - 1 from duplicate_memberships d where d.loser_id = m.id),
        m.operational_end_date
      ),
      is_current = case
        when exists (select 1 from duplicate_memberships d where d.loser_id = m.id)
          then false
        else m.is_current
      end,
      renewed_from_membership_id = coalesce(
        m.renewed_from_membership_id,
        (select cp.loser_id from closest_predecessor cp where cp.winner_id = m.id)
      ),
      updated_at = now()
  where exists (select 1 from duplicate_memberships d where d.loser_id = m.id)
     or exists (select 1 from closest_predecessor cp where cp.winner_id = m.id)
  returning m.id
), updated_schedules as (
  update public.payment_schedules ps
  set collection_status_id = public.find_catalog_item_id('COLLECTION_STATUS', 'ANULADO'),
      is_operational = false,
      is_paid = false,
      paid_at = null,
      notes = concat_ws(E'\n', nullif(ps.notes, ''), 'Anulada automaticamente por S22: membresia duplicada.'),
      updated_at = now()
  from duplicate_memberships d
  where ps.membership_id = d.loser_id
    and ps.is_deleted = false
  returning ps.id
)
select
  (select count(*) from duplicate_memberships) as memberships_replaced,
  (select count(*) from closest_predecessor) as renewal_links_considered,
  (select count(*) from updated_memberships) as memberships_updated,
  (select count(*) from updated_schedules) as schedules_annulled;

-- Normalizar estados almacenados. La vista operativa seguira calculandolos por fecha.
update public.memberships m
set membership_status_id = case
      when m.start_date > public.business_today()
        then public.find_catalog_item_id('MEMBERSHIP_STATUS', 'PROGRAMADA')
      else public.find_catalog_item_id('MEMBERSHIP_STATUS', 'VENCIDA')
    end,
    updated_at = now()
from public.catalog_items ms
where ms.id = m.membership_status_id
  and ms.code = 'VIGENTE'
  and m.is_deleted = false
  and (
    m.start_date > public.business_today()
    or least(m.end_date, coalesce(m.operational_end_date, m.end_date)) < public.business_today()
  );

-- Si quedaron varias membresias futuras no superpuestas, conservar solo el
-- registro administrativo mas reciente como programado.
with extra_scheduled as materialized (
  select id
  from (
    select m.id,
      row_number() over (
        partition by m.associate_id order by m.created_at desc, m.id desc
      ) as position
    from public.memberships m
    join public.catalog_items ms on ms.id = m.membership_status_id
    where not m.is_deleted
      and m.start_date > public.business_today()
      and ms.code not in ('CANCELADA', 'RENOVADA')
  ) ranked
  where position > 1
), updated_memberships as (
  update public.memberships m
  set membership_status_id = public.find_catalog_item_id('MEMBERSHIP_STATUS', 'CANCELADA'),
      operational_end_date = m.start_date - 1,
      is_current = false,
      updated_at = now()
  from extra_scheduled extra
  where m.id = extra.id
  returning m.id
), updated_schedules as (
  update public.payment_schedules ps
  set collection_status_id = public.find_catalog_item_id('COLLECTION_STATUS', 'ANULADO'),
      is_operational = false,
      is_paid = false,
      paid_at = null,
      notes = concat_ws(E'\n', nullif(ps.notes, ''), 'Anulada automaticamente por S22: renovacion programada duplicada.'),
      updated_at = now()
  from extra_scheduled extra
  where ps.membership_id = extra.id
    and not ps.is_deleted
  returning ps.id
)
select
  (select count(*) from updated_memberships) as scheduled_memberships_cancelled,
  (select count(*) from updated_schedules) as schedules_annulled;

-- Recuperar cronogramas eliminados por los flujos antiguos de cancelacion.
-- Los movimientos pagados se conservan como pagados; el resto queda anulado.
with paid_totals as (
  select payment_schedule_id, coalesce(sum(amount_paid), 0) as paid_amount,
         max(payment_date) as last_payment_date
  from public.payments
  where is_deleted = false and is_reversed = false
  group by payment_schedule_id
)
update public.payment_schedules ps
set is_deleted = false,
    deleted_at = null,
    deleted_by = null,
    is_paid = coalesce(pt.paid_amount, 0) >= ps.expected_amount,
    paid_at = case when coalesce(pt.paid_amount, 0) >= ps.expected_amount
      then pt.last_payment_date::timestamp at time zone 'America/Lima' else null end,
    collection_status_id = public.find_catalog_item_id(
      'COLLECTION_STATUS',
      case when coalesce(pt.paid_amount, 0) >= ps.expected_amount then 'PAGADO' else 'ANULADO' end
    ),
    is_operational = coalesce(pt.paid_amount, 0) >= ps.expected_amount,
    notes = concat_ws(E'\n', nullif(ps.notes, ''), 'Recuperada por S22 para preservar el historial financiero.'),
    updated_at = now()
from paid_totals pt
where ps.is_deleted = true
  and pt.payment_schedule_id = ps.id;

update public.payment_schedules ps
set is_deleted = false,
    deleted_at = null,
    deleted_by = null,
    is_paid = false,
    paid_at = null,
    collection_status_id = public.find_catalog_item_id('COLLECTION_STATUS', 'ANULADO'),
    is_operational = false,
    notes = concat_ws(E'\n', nullif(ps.notes, ''), 'Recuperada y anulada por S22 para preservar el historial.'),
    updated_at = now()
where ps.is_deleted = true;

-- Los duplicados de cuota sin pagos se conservan anulados. Si cualquiera de
-- ellos tiene pagos, el preflight anterior ya detuvo toda la migracion.
with duplicate_schedules as materialized (
  select id
  from (
    select
      ps.id,
      row_number() over (
        partition by ps.membership_id, ps.period_year, coalesce(ps.period_month, 0)
        order by ps.created_at desc, ps.id desc
      ) as position
    from public.payment_schedules ps
    join public.catalog_items cs on cs.id = ps.collection_status_id
    where ps.is_deleted = false and cs.code <> 'ANULADO'
  ) ranked
  where position > 1
)
update public.payment_schedules ps
set collection_status_id = public.find_catalog_item_id('COLLECTION_STATUS', 'ANULADO'),
    is_operational = false,
    is_paid = false,
    paid_at = null,
    notes = concat_ws(E'\n', nullif(ps.notes, ''), 'Anulada automaticamente por S22: cuota duplicada.'),
    updated_at = now()
from duplicate_schedules duplicate
where ps.id = duplicate.id;

update public.payment_schedules ps
set is_operational = cs.code <> 'ANULADO',
    updated_at = now()
from public.catalog_items cs
where cs.id = ps.collection_status_id
  and ps.is_deleted = false
  and ps.is_operational is distinct from (cs.code <> 'ANULADO');

create unique index if not exists uq_payment_schedules_operational_period
  on public.payment_schedules (
    membership_id,
    period_year,
    (coalesce(period_month, 0))
  )
  where is_operational = true and is_deleted = false;

-- Reestablecer un solo registro administrativo mas reciente por asociado.
update public.memberships
set is_current = false, updated_at = now()
where is_current = true and is_deleted = false;

with ranked as (
  select m.id,
         row_number() over (
           partition by m.associate_id
           order by m.created_at desc, m.id desc
         ) as position
  from public.memberships m
  where m.is_deleted = false
)
update public.memberships m
set is_current = true, updated_at = now()
from ranked r
where r.id = m.id
  and r.position = 1;

-- Mantener compatible el marcador administrativo de S21: el registro mas
-- reciente tambien refleja la categoria editable actual del asociado.
update public.memberships m
set category_id = a.category_id, updated_at = now()
from public.associates a
where m.associate_id = a.id
  and m.is_current and not m.is_deleted and not a.is_deleted
  and a.category_id is not null
  and m.category_id is distinct from a.category_id;


commit;
