-- ============================================================
-- Hito S22C: reconciliacion posterior al audit S22
-- ============================================================
-- Preserva pagos e historial. No elimina membresias, cuotas ni movimientos.

begin;

-- Bloquear cualquier variante distinta de las causas revisadas en el preflight.
do $$
declare
  v_cross_associate_links jsonb;
  v_invalid_deleted_memberships jsonb;
  v_paid_schedules_beyond_annual jsonb;
begin
  select coalesce(jsonb_agg(child.id order by child.id), '[]'::jsonb)
  into v_cross_associate_links
  from public.memberships child
  join public.memberships parent on parent.id = child.renewed_from_membership_id
  where not child.is_deleted
    and child.associate_id is distinct from parent.associate_id;

  select coalesce(jsonb_agg(m.id order by m.id), '[]'::jsonb)
  into v_invalid_deleted_memberships
  from public.memberships m
  left join public.associates a on a.id = m.associate_id
  left join public.categories c on c.id = a.category_id
  left join public.catalog_items mt on mt.id = m.membership_type_id
  left join public.catalog_groups mtg on mtg.id = mt.group_id
  where m.is_deleted
    and (
      exists (
        select 1 from public.payments p
        where p.membership_id = m.id and not p.is_deleted and not p.is_reversed
      )
      or exists (
        select 1 from public.payment_schedules ps
        where ps.membership_id = m.id and not ps.is_deleted
      )
    )
    and (
      a.id is null or a.is_deleted or a.category_id is null or c.id is null
      or m.fee_amount <= 0 or m.end_date is null or m.end_date < m.start_date
      or mtg.code is distinct from 'MEMBERSHIP_TYPE'
    );

  select coalesce(jsonb_agg(distinct ps.id order by ps.id), '[]'::jsonb)
  into v_paid_schedules_beyond_annual
  from public.payment_schedules ps
  join public.memberships m on m.id = ps.membership_id
  join public.catalog_items mt on mt.id = m.membership_type_id
  where not ps.is_deleted
    and ps.due_date > public.membership_annual_end_date(m.start_date)
      + case when mt.code = 'ANUAL' then 1 else 0 end
    and exists (
      select 1 from public.payments p
      where p.payment_schedule_id = ps.id and not p.is_deleted and not p.is_reversed
    );

  if jsonb_array_length(v_cross_associate_links) > 0
    or jsonb_array_length(v_invalid_deleted_memberships) > 0
    or jsonb_array_length(v_paid_schedules_beyond_annual) > 0 then
    raise exception 'S22C bloqueado. enlaces_cruzados=%, membresias_eliminadas_invalidas=%, cuotas_con_pagos_fuera_del_anio=%',
      v_cross_associate_links, v_invalid_deleted_memberships,
      v_paid_schedules_beyond_annual
      using errcode = '23514';
  end if;
end $$;

-- Los enlaces con inicio igual o anterior no representan renovaciones reales.
update public.memberships child
set renewed_from_membership_id = null,
    updated_at = now()
from public.memberships parent
where parent.id = child.renewed_from_membership_id
  and not child.is_deleted
  and child.associate_id = parent.associate_id
  and child.start_date <= parent.start_date;

-- Restaurar como historial cancelado toda membresia eliminada que conserve
-- pagos o cronogramas. La categoria vuelve a provenir del asociado.
do $$
declare
  v_membership_ids uuid[];
  r record;
begin
  select coalesce(array_agg(distinct m.id), array[]::uuid[])
  into v_membership_ids
  from public.memberships m
  where m.is_deleted
    and (
      exists (
        select 1 from public.payments p
        where p.membership_id = m.id and not p.is_deleted and not p.is_reversed
      )
      or exists (
        select 1 from public.payment_schedules ps
        where ps.membership_id = m.id and not ps.is_deleted
      )
    );

  if cardinality(v_membership_ids) = 0 then
    return;
  end if;

  update public.memberships m
  set is_deleted = false,
      deleted_at = null,
      deleted_by = null,
      category_id = a.category_id,
      membership_status_id = public.find_catalog_item_id('MEMBERSHIP_STATUS', 'CANCELADA'),
      operational_end_date = least(m.end_date, public.business_today()),
      is_current = false,
      negotiation_notes = concat_ws(E'\n', nullif(m.negotiation_notes, ''),
        'Restaurada por S22C para preservar pagos y cronogramas historicos.'),
      updated_at = now()
  from public.associates a
  where m.id = any(v_membership_ids)
    and a.id = m.associate_id;

  update public.payment_schedules ps
  set collection_status_id = public.find_catalog_item_id('COLLECTION_STATUS', 'ANULADO'),
      is_operational = false,
      is_paid = false,
      paid_at = null,
      notes = concat_ws(E'\n', nullif(ps.notes, ''),
        'Anulada por S22C: obligacion posterior al cierre del historial restaurado.'),
      updated_at = now()
  where ps.membership_id = any(v_membership_ids)
    and not ps.is_deleted
    and ps.due_date > public.business_today()
    and not exists (
      select 1 from public.payments p
      where p.payment_schedule_id = ps.id and not p.is_deleted and not p.is_reversed
    );

  for r in
    select distinct ps.id
    from public.payment_schedules ps
    join public.payments p on p.payment_schedule_id = ps.id
      and not p.is_deleted and not p.is_reversed
    where ps.membership_id = any(v_membership_ids)
      and not ps.is_deleted
  loop
    perform public.fn_recalculate_schedule(r.id, null);
  end loop;
end $$;

-- Toda cuota que excede incluso la cobertura anual y no tiene pagos deja de ser
-- una obligacion operativa. Se ejecuta despues de restaurar sus membresias para
-- que la validacion de correspondencia permanezca activa.
update public.payment_schedules ps
set collection_status_id = public.find_catalog_item_id('COLLECTION_STATUS', 'ANULADO'),
    is_operational = false,
    is_paid = false,
    paid_at = null,
    notes = concat_ws(E'\n', nullif(ps.notes, ''),
      'Anulada por S22C: cuota fuera de la cobertura contractual anual.'),
    updated_at = now()
from public.memberships m
join public.catalog_items mt on mt.id = m.membership_type_id
where ps.membership_id = m.id
  and not m.is_deleted
  and not ps.is_deleted
  and ps.due_date > public.membership_annual_end_date(m.start_date)
    + case when mt.code = 'ANUAL' then 1 else 0 end
  and not exists (
    select 1 from public.payments p
    where p.payment_schedule_id = ps.id and not p.is_deleted and not p.is_reversed
  );

-- Las modalidades heredadas guardaban en end_date el fin de la frecuencia de
-- cobro. Para registros no cancelados se restaura la cobertura contractual anual.
with memberships_to_extend as materialized (
  select distinct m.id,
    public.membership_annual_end_date(m.start_date) as annual_end
  from public.memberships m
  join public.catalog_items ms on ms.id = m.membership_status_id
  join public.payment_schedules ps on ps.membership_id = m.id and not ps.is_deleted
  join public.catalog_items mt on mt.id = m.membership_type_id
  where not m.is_deleted
    and ms.code not in ('CANCELADA', 'RENOVADA')
    and ps.due_date > m.end_date + case when mt.code = 'ANUAL' then 1 else 0 end
    and ps.due_date <= public.membership_annual_end_date(m.start_date)
      + case when mt.code = 'ANUAL' then 1 else 0 end
)
update public.memberships m
set end_date = extend.annual_end,
    membership_status_id = public.find_catalog_item_id(
      'MEMBERSHIP_STATUS',
      case
        when m.start_date > public.business_today() then 'PROGRAMADA'
        when least(extend.annual_end, coalesce(m.operational_end_date, extend.annual_end))
          < public.business_today() then 'VENCIDA'
        else 'VIGENTE'
      end
    ),
    updated_at = now()
from memberships_to_extend extend
where m.id = extend.id
  and m.end_date < extend.annual_end;

-- En canceladas o renovadas solo se anulan obligaciones posteriores al cierre;
-- las cuotas devengadas y todos los pagos se conservan.
update public.payment_schedules ps
set collection_status_id = public.find_catalog_item_id('COLLECTION_STATUS', 'ANULADO'),
    is_operational = false,
    is_paid = false,
    paid_at = null,
    notes = concat_ws(E'\n', nullif(ps.notes, ''),
      'Anulada por S22C: cuota posterior a la cobertura efectiva.'),
    updated_at = now()
from public.memberships m
join public.catalog_items ms on ms.id = m.membership_status_id
where ps.membership_id = m.id
  and not ps.is_deleted
  and ms.code in ('CANCELADA', 'RENOVADA')
  and ps.due_date > least(m.end_date, coalesce(m.operational_end_date, m.end_date))
  and not exists (
    select 1 from public.payments p
    where p.payment_schedule_id = ps.id and not p.is_deleted and not p.is_reversed
  );

-- Una cobertura que vuelve a ser anual puede quedar sin cronograma operativo si
-- su unica cuota heredada estaba fuera del año. Solo se regenera cuando no hay
-- pagos que deban revisarse o redistribuirse manualmente.
do $$
declare
  v_paid_mismatches jsonb;
  r record;
begin
  with schedule_mismatches as (
    select m.id as membership_id
    from public.memberships m
    join public.catalog_items mt on mt.id = m.membership_type_id
    join public.catalog_items ms on ms.id = m.membership_status_id
    left join public.payment_schedules ps
      on ps.membership_id = m.id and not ps.is_deleted and ps.is_operational
    where not m.is_deleted and ms.code in ('VIGENTE', 'PROGRAMADA')
    group by m.id, m.fee_amount, mt.code
    having count(ps.id) <> case mt.code
        when 'MENSUAL' then 12 when 'TRIMESTRAL' then 4 when 'CUATRIMESTRAL' then 3
        when 'SEMESTRAL' then 2 when 'ANUAL' then 1 else 0 end
      or coalesce(sum(ps.expected_amount), 0) <> m.fee_amount
  )
  select coalesce(jsonb_agg(distinct mismatch.membership_id), '[]'::jsonb)
  into v_paid_mismatches
  from schedule_mismatches mismatch
  where exists (
    select 1
    from public.payments p
    left join public.payment_schedules ps on ps.id = p.payment_schedule_id
    where not p.is_deleted and not p.is_reversed
      and (p.membership_id = mismatch.membership_id
        or ps.membership_id = mismatch.membership_id)
  );

  if jsonb_array_length(v_paid_mismatches) > 0 then
    raise exception 'S22C bloqueado: cronogramas incompletos con pagos=%', v_paid_mismatches
      using errcode = '23514';
  end if;

  for r in
    select m.id as membership_id
    from public.memberships m
    join public.catalog_items mt on mt.id = m.membership_type_id
    join public.catalog_items ms on ms.id = m.membership_status_id
    left join public.payment_schedules ps
      on ps.membership_id = m.id and not ps.is_deleted and ps.is_operational
    where not m.is_deleted and ms.code in ('VIGENTE', 'PROGRAMADA')
    group by m.id, m.fee_amount, mt.code
    having count(ps.id) <> case mt.code
        when 'MENSUAL' then 12 when 'TRIMESTRAL' then 4 when 'CUATRIMESTRAL' then 3
        when 'SEMESTRAL' then 2 when 'ANUAL' then 1 else 0 end
      or coalesce(sum(ps.expected_amount), 0) <> m.fee_amount
  loop
    update public.payment_schedules ps
    set collection_status_id = public.find_catalog_item_id('COLLECTION_STATUS', 'ANULADO'),
        is_operational = false,
        is_paid = false,
        paid_at = null,
        notes = concat_ws(E'\n', nullif(ps.notes, ''),
          'Anulada por S22C: cronograma anual regenerado.'),
        updated_at = now()
    where ps.membership_id = r.membership_id
      and not ps.is_deleted;

    perform public.fn_generate_membership_schedule(r.membership_id, null);
  end loop;
end $$;

-- Fortalecer la validacion futura: solo una cuota operativa debe quedar dentro
-- de la cobertura contractual anual de su membresia.
create or replace function public.fn_assert_schedule_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_associate_id uuid;
  v_membership_start date;
  v_membership_end date;
  v_membership_type_code text;
  v_status_group text;
  v_status_code text;
begin
  select m.associate_id, m.start_date, m.end_date, mt.code
  into v_associate_id, v_membership_start, v_membership_end, v_membership_type_code
  from public.memberships m
  join public.catalog_items mt on mt.id = m.membership_type_id
  where m.id = new.membership_id and not m.is_deleted;

  if v_associate_id is null or v_associate_id is distinct from new.associate_id then
    raise exception 'La cuota no corresponde al asociado de la membresia.' using errcode = '23503';
  end if;
  if new.expected_amount <= 0
    or new.period_month is not null and new.period_month not between 1 and 12 then
    raise exception 'Importe o periodo de cuota invalido.' using errcode = '23514';
  end if;

  select cg.code, ci.code into v_status_group, v_status_code
  from public.catalog_items ci
  join public.catalog_groups cg on cg.id = ci.group_id
  where ci.id = new.collection_status_id and ci.is_active and not ci.is_deleted;

  if v_status_group is distinct from 'COLLECTION_STATUS' then
    raise exception 'Estado de cobranza invalido.' using errcode = '23514';
  end if;

  new.is_operational := v_status_code <> 'ANULADO';
  if new.is_operational and (
    new.due_date < v_membership_start
    or new.due_date > v_membership_end
      + case when v_membership_type_code = 'ANUAL' then 1 else 0 end
  ) then
    raise exception 'La cuota operativa queda fuera de la cobertura de la membresia.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

-- Reestablecer el marcador administrativo despues de restaurar historial.
update public.memberships
set is_current = false, updated_at = now()
where is_current and not is_deleted;

with ranked as (
  select m.id,
    row_number() over (
      partition by m.associate_id order by m.created_at desc, m.id desc
    ) as position
  from public.memberships m
  where not m.is_deleted
)
update public.memberships m
set is_current = true,
    category_id = a.category_id,
    updated_at = now()
from ranked r, public.associates a
where r.id = m.id
  and r.position = 1
  and a.id = m.associate_id
  and not a.is_deleted;

-- Recalcular estado y salud financiera despues de la reconciliacion.
do $$
declare r record;
begin
  for r in select id from public.associates where not is_deleted loop
    perform public.fn_sync_associate_operational_cache(r.id);
  end loop;
end $$;

commit;
