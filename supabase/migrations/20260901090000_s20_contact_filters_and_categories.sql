-- ============================================================
-- Hito S20: categorías operativas A-C
-- Los filtros de contactos son un cambio de frontend sin esquema nuevo.
-- ============================================================

do $$
declare
  v_missing_codes text;
  v_operational_references text;
begin
  select string_agg(required.code, ', ' order by required.code)
    into v_missing_codes
  from (values ('CAT_A'), ('CAT_B'), ('CAT_C')) as required(code)
  left join public.categories category_record
    on category_record.code = required.code
  where category_record.id is null;

  if v_missing_codes is not null then
    raise exception 'No se encontraron las categorias requeridas: %', v_missing_codes;
  end if;

  with retired_categories as (
    select id
    from public.categories
    where code in ('CAT_D', 'CAT_E')
  ), operational_references as (
    select 'asociados' as source, count(*)::int as total
    from public.associates
    where category_id in (select id from retired_categories)
      and is_deleted = false
    union all
    select 'prospectos abiertos', count(*)::int
    from public.prospects
    where current_category_id in (select id from retired_categories)
      and converted_to_associate_id is null
      and is_deleted = false
    union all
    select 'membresias vigentes', count(*)::int
    from public.memberships
    where category_id in (select id from retired_categories)
      and is_current = true
      and is_deleted = false
    union all
    select 'evaluaciones vigentes', count(*)::int
    from public.prospect_evaluations
    where suggested_category_id in (select id from retired_categories)
      and is_current = true
      and is_deleted = false
  )
  select string_agg(source || ': ' || total, ', ' order by source)
    into v_operational_references
  from operational_references
  where total > 0;

  if v_operational_references is not null then
    raise exception
      'No se pueden retirar CAT_D y CAT_E. Existen referencias operativas (%).',
      v_operational_references;
  end if;
end $$;

update public.categories
set
  name = case code
    when 'CAT_A' then 'Categoría A - Corporativo'
    when 'CAT_B' then 'Categoría B - Empresarial'
    when 'CAT_C' then 'Categoría C - Ejecutivo'
  end,
  min_score = case code
    when 'CAT_A' then 2.26
    when 'CAT_B' then 1.50
    when 'CAT_C' then 0.75
  end,
  max_score = case code
    when 'CAT_A' then 3.00
    when 'CAT_B' then 2.25
    when 'CAT_C' then 1.49
  end,
  sort_order = case code
    when 'CAT_A' then 1
    when 'CAT_B' then 2
    when 'CAT_C' then 3
  end,
  is_active = true,
  is_deleted = false,
  deleted_at = null,
  deleted_by = null,
  updated_at = now()
where code in ('CAT_A', 'CAT_B', 'CAT_C');

update public.categories
set
  is_active = false,
  is_deleted = true,
  deleted_at = coalesce(deleted_at, now()),
  updated_at = now()
where code in ('CAT_D', 'CAT_E')
  and (is_active = true or is_deleted = false);
