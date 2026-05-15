-- ============================================
-- Hito S9: Alta directa de asociados historicos
-- - Codigo interno: A + YY(fecha de asociacion) + ultimos 6 digitos del RUC
-- - RPC para crear asociados sin prospecto origen
-- - Conversion de prospecto reutiliza el mismo generador
-- ============================================

create or replace function public.generate_associate_internal_code(
  p_ruc text,
  p_association_date date
)
returns text
language plpgsql
stable
as $$
declare
  v_ruc text;
begin
  v_ruc := regexp_replace(coalesce(p_ruc, ''), '[[:space:]]+', '', 'g');

  if v_ruc !~ '^[0-9]{11}$' then
    raise exception 'El RUC debe tener 11 digitos numericos.'
      using errcode = '22023';
  end if;

  if p_association_date is null then
    raise exception 'La fecha de asociacion es obligatoria.'
      using errcode = '22023';
  end if;

  return 'A' || to_char(p_association_date, 'YY') || right(v_ruc, 6);
end;
$$;

create or replace function public.create_direct_associate(
  p_company_name text,
  p_ruc text,
  p_associate_status_id uuid,
  p_association_date date,
  p_trade_name text default null,
  p_economic_activity text default null,
  p_activity_type_id uuid default null,
  p_company_size_id uuid default null,
  p_address text default null,
  p_corporate_email text default null,
  p_landline_phone text default null,
  p_mobile_phone_1 text default null,
  p_mobile_phone_2 text default null,
  p_website text default null,
  p_anniversary_date date default null,
  p_category_id uuid default null,
  p_affiliation_responsible_user_id uuid default null,
  p_captador_id uuid default null,
  p_book_registry text default null,
  p_welcome_status boolean default false,
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
  v_company_name text;
  v_ruc text;
begin
  if not public.has_module_permission('asociados', 'create') then
    raise exception 'No tienes permisos para crear asociados.'
      using errcode = '42501';
  end if;

  v_actor := public.current_user_profile_id();

  if v_actor is null then
    raise exception 'No se pudo identificar el usuario autenticado para crear el asociado.'
      using errcode = '42501';
  end if;

  v_company_name := nullif(trim(p_company_name), '');
  v_ruc := regexp_replace(coalesce(p_ruc, ''), '[[:space:]]+', '', 'g');

  if v_company_name is null then
    raise exception 'La razon social es obligatoria.'
      using errcode = '22023';
  end if;

  if p_associate_status_id is null then
    raise exception 'El estado del asociado es obligatorio.'
      using errcode = '22023';
  end if;

  v_code := public.generate_associate_internal_code(v_ruc, p_association_date);

  if exists (
    select 1
    from public.associates a
    where a.ruc = v_ruc
      and a.is_deleted = false
  ) then
    raise exception 'Ya existe un asociado activo con este RUC.'
      using errcode = '23505';
  end if;

  if exists (
    select 1
    from public.associates a
    where a.internal_code = v_code
      and a.is_deleted = false
  ) then
    raise exception 'Ya existe un asociado activo con el codigo interno calculado.'
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
    raise exception 'El estado del asociado no es valido.'
      using errcode = '22023';
  end if;

  if p_activity_type_id is not null and not exists (
    select 1
    from public.catalog_items ci
    join public.catalog_groups cg on cg.id = ci.group_id
    where ci.id = p_activity_type_id
      and ci.is_active = true
      and ci.is_deleted = false
      and cg.is_active = true
      and cg.code = 'ACTIVITY_TYPE'
  ) then
    raise exception 'El tipo de actividad no es valido.'
      using errcode = '22023';
  end if;

  if p_company_size_id is not null and not exists (
    select 1
    from public.catalog_items ci
    join public.catalog_groups cg on cg.id = ci.group_id
    where ci.id = p_company_size_id
      and ci.is_active = true
      and ci.is_deleted = false
      and cg.is_active = true
      and cg.code = 'COMPANY_SIZE'
  ) then
    raise exception 'El tamano de empresa no es valido.'
      using errcode = '22023';
  end if;

  if p_category_id is not null and not exists (
    select 1
    from public.categories c
    where c.id = p_category_id
      and c.is_active = true
      and c.is_deleted = false
  ) then
    raise exception 'La categoria no es valida o esta inactiva.'
      using errcode = '22023';
  end if;

  if p_affiliation_responsible_user_id is not null and not exists (
    select 1
    from public.user_profiles up
    where up.id = p_affiliation_responsible_user_id
      and up.is_active = true
      and up.is_deleted = false
  ) then
    raise exception 'El responsable de afiliacion no es valido o esta inactivo.'
      using errcode = '22023';
  end if;

  if p_captador_id is not null and not exists (
    select 1
    from public.captadores cap
    where cap.id = p_captador_id
      and cap.is_active = true
      and cap.is_deleted = false
  ) then
    raise exception 'El captador no es valido o esta inactivo.'
      using errcode = '22023';
  end if;

  insert into public.associates (
    internal_code,
    book_registry,
    welcome_status,
    affiliation_responsible_user_id,
    category_id,
    associate_status_id,
    ruc,
    company_name,
    trade_name,
    address,
    association_date,
    anniversary_date,
    landline_phone,
    mobile_phone_1,
    mobile_phone_2,
    corporate_email,
    website,
    economic_activity,
    activity_type_id,
    company_size_id,
    captador_id,
    notes,
    created_by
  ) values (
    v_code,
    nullif(trim(p_book_registry), ''),
    coalesce(p_welcome_status, false),
    p_affiliation_responsible_user_id,
    p_category_id,
    p_associate_status_id,
    v_ruc,
    v_company_name,
    nullif(trim(p_trade_name), ''),
    nullif(trim(p_address), ''),
    p_association_date,
    p_anniversary_date,
    nullif(trim(p_landline_phone), ''),
    nullif(trim(p_mobile_phone_1), ''),
    nullif(trim(p_mobile_phone_2), ''),
    nullif(trim(p_corporate_email), ''),
    nullif(trim(p_website), ''),
    nullif(trim(p_economic_activity), ''),
    p_activity_type_id,
    p_company_size_id,
    p_captador_id,
    nullif(trim(p_notes), ''),
    v_actor
  )
  returning * into v_associate;

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
    'associates',
    v_associate.id,
    'create_direct_associate',
    null,
    to_jsonb(v_associate),
    'Asociado creado por alta directa',
    jsonb_build_object(
      'source', 'direct_historical_associate',
      'associate_id', v_associate.id,
      'associate_code', v_associate.internal_code,
      'ruc', v_associate.ruc,
      'association_date', v_associate.association_date
    )
  );

  return v_associate;
exception
  when unique_violation then
    raise exception 'No se pudo crear: ya existe un asociado activo con el mismo RUC o codigo interno.'
      using errcode = '23505';
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

  v_normalized_ruc := regexp_replace(coalesce(p_ruc, ''), '[[:space:]]+', '', 'g');

  if nullif(v_normalized_ruc, '') is null then
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

  v_code := public.generate_associate_internal_code(
    v_normalized_ruc,
    p_association_date
  );

  if exists (
    select 1
    from public.associates a
    where a.internal_code = v_code
      and a.is_deleted = false
  ) then
    raise exception 'Ya existe un asociado activo con el codigo interno calculado.'
      using errcode = '23505';
  end if;

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

revoke all on function public.generate_associate_internal_code(text, date) from public;
revoke all on function public.create_direct_associate(
  text, text, uuid, date, text, text, uuid, uuid, text, text, text, text,
  text, text, date, uuid, uuid, uuid, text, boolean, text
) from public;
revoke all on function public.convert_prospect_to_associate(uuid, text, uuid, date, uuid, text) from public;

grant execute on function public.generate_associate_internal_code(text, date) to authenticated;
grant execute on function public.create_direct_associate(
  text, text, uuid, date, text, text, uuid, uuid, text, text, text, text,
  text, text, date, uuid, uuid, uuid, text, boolean, text
) to authenticated;
grant execute on function public.convert_prospect_to_associate(uuid, text, uuid, date, uuid, text) to authenticated;
