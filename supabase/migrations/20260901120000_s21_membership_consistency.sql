-- ============================================================
-- Hito S21: consistencia de membresias y categoria del asociado
-- ============================================================

-- Conservar como vigente el registro creado mas recientemente.
with ranked_memberships as (
  select
    m.id,
    row_number() over (
      partition by m.associate_id
      order by m.created_at desc, m.id desc
    ) as position
  from public.memberships m
  where m.is_current = true
    and m.is_deleted = false
)
update public.memberships m
set
  is_current = false,
  membership_status_id = coalesce(
    public.find_catalog_item_id('MEMBERSHIP_STATUS', 'RENOVADA'),
    m.membership_status_id
  ),
  updated_at = now()
from ranked_memberships ranked
where ranked.id = m.id
  and ranked.position > 1;

-- Recuperar categorias ausentes y sincronizar la membresia vigente.
update public.memberships m
set
  category_id = a.category_id,
  updated_at = now()
from public.associates a
where a.id = m.associate_id
  and a.is_deleted = false
  and a.category_id is not null
  and m.is_deleted = false
  and (
    m.category_id is null
    or (m.is_current = true and m.category_id is distinct from a.category_id)
  );

do $$
declare
  v_invalid_current_memberships integer;
begin
  select count(*)::integer
  into v_invalid_current_memberships
  from public.memberships m
  join public.associates a on a.id = m.associate_id
  where m.is_current = true
    and m.is_deleted = false
    and (
      a.is_deleted = true
      or a.category_id is null
      or m.category_id is null
      or not exists (
        select 1
        from public.categories c
        where c.id = a.category_id
          and c.is_active = true
          and c.is_deleted = false
      )
    );

  if v_invalid_current_memberships > 0 then
    raise exception
      'No se puede aplicar S21: % membresias vigentes tienen un asociado sin categoria activa.',
      v_invalid_current_memberships;
  end if;
end $$;

create unique index if not exists uq_memberships_current_associate
  on public.memberships (associate_id)
  where is_current = true and is_deleted = false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'chk_memberships_current_category'
      and conrelid = 'public.memberships'::regclass
  ) then
    alter table public.memberships
      add constraint chk_memberships_current_category
      check (not (is_current = true and is_deleted = false) or category_id is not null);
  end if;
end $$;

create or replace function public.fn_prepare_membership_category()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category_id uuid;
begin
  if tg_op = 'UPDATE' and new.is_current = false then
    new.category_id := old.category_id;
    return new;
  end if;

  select a.category_id
  into v_category_id
  from public.associates a
  join public.categories c on c.id = a.category_id
  where a.id = new.associate_id
    and a.is_deleted = false
    and c.is_active = true
    and c.is_deleted = false;

  if v_category_id is null and new.is_current = true and new.is_deleted = false then
    raise exception 'Asigna una categoria al asociado desde Informacion antes de crear la membresia.'
      using errcode = '23514';
  end if;

  if tg_op = 'INSERT' or (new.is_current = true and new.is_deleted = false) then
    new.category_id := v_category_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_memberships_prepare_category on public.memberships;
create trigger trg_memberships_prepare_category
  before insert or update of associate_id, category_id, is_current, is_deleted
  on public.memberships
  for each row execute function public.fn_prepare_membership_category();

create or replace function public.fn_sync_current_membership_category()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.category_id is not distinct from old.category_id then
    return new;
  end if;

  if exists (
    select 1
    from public.memberships m
    where m.associate_id = new.id
      and m.is_current = true
      and m.is_deleted = false
  ) and (
    new.category_id is null
    or not exists (
      select 1
      from public.categories c
      where c.id = new.category_id
        and c.is_active = true
        and c.is_deleted = false
    )
  ) then
    raise exception 'No se puede dejar sin categoria a un asociado con membresia vigente.'
      using errcode = '23514';
  end if;

  update public.memberships
  set category_id = new.category_id, updated_at = now()
  where associate_id = new.id
    and is_current = true
    and is_deleted = false;

  return new;
end;
$$;

drop trigger if exists trg_associates_sync_membership_category on public.associates;
create trigger trg_associates_sync_membership_category
  after update of category_id on public.associates
  for each row execute function public.fn_sync_current_membership_category();

create or replace function public.fn_assert_membership_input(
  p_membership_type_id uuid,
  p_fee_amount numeric,
  p_start_date date,
  p_end_date date,
  p_monthly_billing_day integer,
  p_membership_status_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membership_type_code text;
begin
  select ci.code
  into v_membership_type_code
    from public.catalog_items ci
    join public.catalog_groups cg on cg.id = ci.group_id
    where ci.id = p_membership_type_id
      and cg.code = 'MEMBERSHIP_TYPE'
      and cg.is_active = true
      and ci.is_active = true
      and ci.is_deleted = false;

  if v_membership_type_code is null then
    raise exception 'El tipo de membresia no es valido.' using errcode = '22023';
  end if;

  if p_membership_status_id is null or not exists (
    select 1
    from public.catalog_items ci
    join public.catalog_groups cg on cg.id = ci.group_id
    where ci.id = p_membership_status_id
      and cg.code = 'MEMBERSHIP_STATUS'
      and cg.is_active = true
      and ci.is_active = true
      and ci.is_deleted = false
  ) then
    raise exception 'El estado de membresia no es valido.' using errcode = '22023';
  end if;

  if p_fee_amount is null or p_fee_amount <= 0 then
    raise exception 'La tarifa debe ser mayor a cero.' using errcode = '22023';
  end if;

  if p_start_date is null then
    raise exception 'La fecha de inicio es obligatoria.' using errcode = '22023';
  end if;

  if p_end_date is not null and p_end_date < p_start_date then
    raise exception 'La fecha de fin no puede ser anterior al inicio.' using errcode = '22023';
  end if;

  if p_monthly_billing_day is not null and
    (p_monthly_billing_day < 1 or p_monthly_billing_day > 28) then
    raise exception 'El dia de cobro debe estar entre 1 y 28.' using errcode = '22023';
  end if;

  if v_membership_type_code <> 'ANUAL' and p_monthly_billing_day is null then
    raise exception 'El dia de cobro es obligatorio para esta modalidad.' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.create_current_membership(
  p_associate_id uuid,
  p_membership_type_id uuid,
  p_fee_amount numeric,
  p_currency_code text,
  p_start_date date,
  p_end_date date,
  p_monthly_billing_day integer,
  p_membership_status_id uuid,
  p_negotiation_notes text
)
returns public.memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_associate public.associates%rowtype;
  v_membership public.memberships%rowtype;
begin
  if not public.has_module_permission('membresias', 'create') then
    raise exception 'No tienes permisos para crear membresias.' using errcode = '42501';
  end if;

  v_actor := public.current_user_profile_id();
  if v_actor is null then
    raise exception 'No se pudo identificar al usuario autenticado.' using errcode = '42501';
  end if;

  perform public.fn_assert_membership_input(
    p_membership_type_id, p_fee_amount, p_start_date, p_end_date,
    p_monthly_billing_day, p_membership_status_id
  );

  select a.* into v_associate
  from public.associates a
  where a.id = p_associate_id and a.is_deleted = false
  for update;

  if not found then
    raise exception 'El asociado no existe o fue eliminado.' using errcode = 'P0002';
  end if;

  if v_associate.category_id is null then
    raise exception 'Asigna una categoria al asociado desde Informacion antes de crear la membresia.'
      using errcode = '23514';
  end if;

  if exists (
    select 1 from public.memberships m
    where m.associate_id = p_associate_id
      and m.is_current = true
      and m.is_deleted = false
  ) then
    raise exception 'El asociado ya tiene una membresia vigente. Usa Renovar.'
      using errcode = '23505';
  end if;

  insert into public.memberships (
    associate_id, membership_type_id, fee_amount, currency_code,
    start_date, end_date, monthly_billing_day, membership_status_id,
    negotiation_notes, is_current, created_by, updated_by
  ) values (
    p_associate_id, p_membership_type_id, p_fee_amount,
    coalesce(nullif(upper(trim(p_currency_code)), ''), 'PEN'),
    p_start_date, p_end_date, p_monthly_billing_day::smallint,
    p_membership_status_id, nullif(trim(p_negotiation_notes), ''),
    true, v_actor, v_actor
  ) returning * into v_membership;

  return v_membership;
end;
$$;

create or replace function public.renew_current_membership(
  p_membership_id uuid,
  p_membership_type_id uuid,
  p_fee_amount numeric,
  p_currency_code text,
  p_start_date date,
  p_end_date date,
  p_monthly_billing_day integer,
  p_membership_status_id uuid,
  p_negotiation_notes text
)
returns public.memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_associate public.associates%rowtype;
  v_associate_id uuid;
  v_membership public.memberships%rowtype;
  v_old_membership public.memberships%rowtype;
  v_renewed_status_id uuid;
begin
  if not (
    public.has_module_permission('membresias', 'create')
    and public.has_module_permission('membresias', 'update')
  ) then
    raise exception 'No tienes permisos para renovar membresias.' using errcode = '42501';
  end if;

  v_actor := public.current_user_profile_id();
  if v_actor is null then
    raise exception 'No se pudo identificar al usuario autenticado.' using errcode = '42501';
  end if;

  perform public.fn_assert_membership_input(
    p_membership_type_id, p_fee_amount, p_start_date, p_end_date,
    p_monthly_billing_day, p_membership_status_id
  );

  select m.associate_id into v_associate_id
  from public.memberships m
  where m.id = p_membership_id and m.is_deleted = false;

  if v_associate_id is null then
    raise exception 'La membresia a renovar no existe.' using errcode = 'P0002';
  end if;

  select a.* into v_associate
  from public.associates a
  where a.id = v_associate_id and a.is_deleted = false
  for update;

  select m.* into v_old_membership
  from public.memberships m
  where m.id = p_membership_id
    and m.is_current = true
    and m.is_deleted = false
  for update;

  if not found then
    raise exception 'Solo se puede renovar la membresia vigente.' using errcode = '23514';
  end if;

  if v_associate.category_id is null then
    raise exception 'Asigna una categoria al asociado desde Informacion antes de renovar.'
      using errcode = '23514';
  end if;

  if p_start_date <= v_old_membership.start_date then
    raise exception 'La nueva fecha de inicio debe ser posterior a la membresia vigente.'
      using errcode = '22023';
  end if;

  v_renewed_status_id := public.find_catalog_item_id('MEMBERSHIP_STATUS', 'RENOVADA');
  if v_renewed_status_id is null then
    raise exception 'No se encontro el estado RENOVADA.' using errcode = 'P0002';
  end if;

  update public.memberships
  set
    membership_status_id = v_renewed_status_id,
    is_current = false,
    end_date = least(coalesce(end_date, p_start_date - 1), p_start_date - 1),
    updated_by = v_actor,
    updated_at = now()
  where id = v_old_membership.id;

  insert into public.memberships (
    associate_id, membership_type_id, fee_amount, currency_code,
    start_date, end_date, monthly_billing_day, membership_status_id,
    negotiation_notes, is_current, created_by, updated_by
  ) values (
    v_associate.id, p_membership_type_id, p_fee_amount,
    coalesce(nullif(upper(trim(p_currency_code)), ''), 'PEN'),
    p_start_date, p_end_date, p_monthly_billing_day::smallint,
    p_membership_status_id, nullif(trim(p_negotiation_notes), ''),
    true, v_actor, v_actor
  ) returning * into v_membership;

  return v_membership;
end;
$$;

revoke all on function public.fn_assert_membership_input(uuid, numeric, date, date, integer, uuid)
  from public, anon, authenticated;
revoke all on function public.fn_prepare_membership_category()
  from public, anon, authenticated;
revoke all on function public.fn_sync_current_membership_category()
  from public, anon, authenticated;
revoke all on function public.create_current_membership(uuid, uuid, numeric, text, date, date, integer, uuid, text)
  from public, anon;
revoke all on function public.renew_current_membership(uuid, uuid, numeric, text, date, date, integer, uuid, text)
  from public, anon;

grant execute on function public.create_current_membership(uuid, uuid, numeric, text, date, date, integer, uuid, text)
  to authenticated;
grant execute on function public.renew_current_membership(uuid, uuid, numeric, text, date, date, integer, uuid, text)
  to authenticated;

comment on function public.create_current_membership(uuid, uuid, numeric, text, date, date, integer, uuid, text)
  is 'Crea la unica membresia vigente usando la categoria actual del asociado.';
comment on function public.renew_current_membership(uuid, uuid, numeric, text, date, date, integer, uuid, text)
  is 'Renueva transaccionalmente la membresia vigente y conserva la anterior como historial.';
