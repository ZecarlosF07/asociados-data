-- ============================================
-- Hito S2: conversion transaccional prospecto -> asociado
-- ============================================

-- Contador anual para codigos correlativos por entidad.
create table if not exists public.entity_counters (
  entity_code   varchar(50) not null,
  period_year   integer not null,
  last_sequence integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint entity_counters_pkey primary key (entity_code, period_year),
  constraint entity_counters_last_sequence_check check (last_sequence >= 0)
);

comment on table public.entity_counters is
  'Contadores transaccionales por entidad y periodo para codigos de negocio.';

revoke all on table public.entity_counters from anon, authenticated;

drop trigger if exists trg_entity_counters_updated_at on public.entity_counters;
create trigger trg_entity_counters_updated_at
before update on public.entity_counters
for each row execute function public.fn_set_updated_at();

insert into public.entity_counters (
  entity_code,
  period_year,
  last_sequence
)
select
  'ASSOCIATES',
  substring(a.internal_code from '^ASO-([0-9]{4})-[0-9]+$')::integer,
  max(substring(a.internal_code from '^ASO-[0-9]{4}-([0-9]+)$')::integer)
from public.associates a
where a.internal_code ~ '^ASO-[0-9]{4}-[0-9]+$'
group by substring(a.internal_code from '^ASO-([0-9]{4})-[0-9]+$')::integer
on conflict (entity_code, period_year)
do update
  set last_sequence = greatest(
        public.entity_counters.last_sequence,
        excluded.last_sequence
      ),
      updated_at = now();

-- Un prospecto activo solo puede originar un asociado activo.
create unique index if not exists idx_associates_prospect_origin_unique
  on public.associates(prospect_origin_id)
  where prospect_origin_id is not null and is_deleted = false;

-- Un asociado convertido solo puede quedar referenciado por un prospecto activo.
create unique index if not exists idx_prospects_converted_associate_unique
  on public.prospects(converted_to_associate_id)
  where converted_to_associate_id is not null and is_deleted = false;

create or replace function public.next_entity_code(
  p_entity_code text,
  p_prefix text,
  p_year integer default extract(year from now())::integer,
  p_pad integer default 4
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next integer;
begin
  if nullif(trim(p_entity_code), '') is null then
    raise exception 'La entidad del correlativo es obligatoria.'
      using errcode = '22023';
  end if;

  if nullif(trim(p_prefix), '') is null then
    raise exception 'El prefijo del correlativo es obligatorio.'
      using errcode = '22023';
  end if;

  if p_year is null or p_year < 2000 then
    raise exception 'El año del correlativo no es valido.'
      using errcode = '22023';
  end if;

  insert into public.entity_counters (
    entity_code,
    period_year,
    last_sequence
  ) values (
    upper(trim(p_entity_code)),
    p_year,
    1
  )
  on conflict (entity_code, period_year)
  do update
    set last_sequence = public.entity_counters.last_sequence + 1,
        updated_at = now()
  returning last_sequence into v_next;

  return upper(trim(p_prefix))
    || '-'
    || p_year::text
    || '-'
    || lpad(v_next::text, greatest(coalesce(p_pad, 4), 1), '0');
end;
$$;

create or replace function public.convert_prospect_to_associate(
  p_prospect_id uuid,
  p_ruc text,
  p_associate_status_id uuid,
  p_association_date date,
  p_responsible_user_id uuid default null,
  p_notes text default null
)
returns public.associates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_associate public.associates%rowtype;
  v_code text;
  v_normalized_ruc text;
  v_prospect public.prospects%rowtype;
  v_status_code text;
begin
  if not (
    public.has_module_permission('prospectos', 'update')
    and public.has_module_permission('asociados', 'create')
  ) then
    raise exception 'No tienes permisos para convertir prospectos en asociados.'
      using errcode = '42501';
  end if;

  v_actor := public.current_user_profile_id();

  if v_actor is null then
    raise exception 'No se pudo identificar el usuario autenticado para la conversion.'
      using errcode = '42501';
  end if;

  if p_prospect_id is null then
    raise exception 'El prospecto es obligatorio para la conversion.'
      using errcode = '22023';
  end if;

  v_normalized_ruc := nullif(trim(p_ruc), '');

  if v_normalized_ruc is null then
    raise exception 'El RUC es obligatorio para convertir el prospecto.'
      using errcode = '22023';
  end if;

  if p_associate_status_id is null then
    raise exception 'El estado inicial del asociado es obligatorio.'
      using errcode = '22023';
  end if;

  if p_association_date is null then
    raise exception 'La fecha de asociacion es obligatoria.'
      using errcode = '22023';
  end if;

  select p.*
  into v_prospect
  from public.prospects p
  where p.id = p_prospect_id
    and p.is_deleted = false
  for update;

  if not found then
    raise exception 'Prospecto no encontrado o eliminado.'
      using errcode = 'P0002';
  end if;

  select ci.code
  into v_status_code
  from public.catalog_items ci
  join public.catalog_groups cg on cg.id = ci.group_id
    where ci.id = v_prospect.prospect_status_id
      and ci.is_active = true
      and ci.is_deleted = false
      and cg.is_active = true
      and cg.code = 'PROSPECT_STATUS';

  if coalesce(v_status_code, '') <> 'APROBADO' then
    raise exception 'Solo los prospectos aprobados pueden convertirse en asociados.'
      using errcode = 'P0001';
  end if;

  if v_prospect.converted_to_associate_id is not null then
    raise exception 'Este prospecto ya fue convertido a asociado.'
      using errcode = '23505';
  end if;

  if exists (
    select 1
    from public.associates a
    where a.prospect_origin_id = p_prospect_id
      and a.is_deleted = false
  ) then
    raise exception 'Este prospecto ya tiene un asociado activo de origen.'
      using errcode = '23505';
  end if;

  if exists (
    select 1
    from public.associates a
    where a.ruc = v_normalized_ruc
      and a.is_deleted = false
  ) then
    raise exception 'Ya existe un asociado activo con este RUC.'
      using errcode = '23505';
  end if;

  if not exists (
    select 1
    from public.catalog_items ci
    join public.catalog_groups cg on cg.id = ci.group_id
    where ci.id = p_associate_status_id
      and ci.is_active = true
      and ci.is_deleted = false
      and cg.is_active = true
      and cg.code = 'ASSOCIATE_STATUS'
  ) then
    raise exception 'El estado inicial del asociado no es valido.'
      using errcode = '22023';
  end if;

  if p_responsible_user_id is not null and not exists (
    select 1
    from public.user_profiles up
    where up.id = p_responsible_user_id
      and up.is_active = true
      and up.is_deleted = false
  ) then
    raise exception 'El responsable de afiliacion no es valido o esta inactivo.'
      using errcode = '22023';
  end if;

  v_code := public.next_entity_code(
    'ASSOCIATES',
    'ASO',
    extract(year from p_association_date)::integer,
    4
  );

  insert into public.associates (
    internal_code,
    ruc,
    company_name,
    trade_name,
    economic_activity,
    activity_type_id,
    company_size_id,
    corporate_email,
    category_id,
    captador_id,
    prospect_origin_id,
    associate_status_id,
    association_date,
    affiliation_responsible_user_id,
    notes,
    created_by
  ) values (
    v_code,
    v_normalized_ruc,
    v_prospect.company_name,
    v_prospect.trade_name,
    v_prospect.economic_activity,
    v_prospect.activity_type_id,
    v_prospect.company_size_id,
    v_prospect.primary_email,
    v_prospect.current_category_id,
    v_prospect.captador_id,
    v_prospect.id,
    p_associate_status_id,
    p_association_date,
    coalesce(p_responsible_user_id, v_actor),
    nullif(trim(p_notes), ''),
    v_actor
  )
  returning * into v_associate;

  update public.prospects
  set converted_to_associate_id = v_associate.id,
      converted_at = now(),
      updated_by = v_actor,
      updated_at = now()
  where id = v_prospect.id;

  insert into public.audit_logs (
    actor_user_id,
    entity_name,
    entity_id,
    action_type,
    previous_data,
    new_data,
    summary,
    extra_meta
  ) values (
    v_actor,
    'prospects',
    v_prospect.id,
    'convert_to_associate',
    to_jsonb(v_prospect),
    jsonb_build_object(
      'prospect_id', v_prospect.id,
      'associate_id', v_associate.id,
      'associate_code', v_associate.internal_code,
      'ruc', v_associate.ruc,
      'association_date', v_associate.association_date
    ),
    'Prospecto convertido a asociado',
    jsonb_build_object(
      'associate_id', v_associate.id,
      'source', 'convert_prospect_to_associate'
    )
  );

  return v_associate;
exception
  when unique_violation then
    raise exception 'No se pudo convertir: ya existe un asociado activo con el mismo RUC, codigo o prospecto de origen.'
      using errcode = '23505';
end;
$$;

revoke all on function public.next_entity_code(text, text, integer, integer) from public;
revoke all on function public.convert_prospect_to_associate(uuid, text, uuid, date, uuid, text) from public;
grant execute on function public.convert_prospect_to_associate(uuid, text, uuid, date, uuid, text) to authenticated;
