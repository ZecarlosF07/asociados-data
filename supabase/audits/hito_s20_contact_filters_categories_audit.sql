-- ============================================================
-- Auditoria Hito S20: filtros de contactos y categorias A-C
-- Ejecutar despues de aplicar la migracion S20.
-- ============================================================

select
  's20_operational_categories' as check_name,
  count(*)::int as found,
  3 as expected,
  coalesce(jsonb_agg(code || ':' || name order by sort_order), '[]'::jsonb) as detail
from public.categories
where code in ('CAT_A', 'CAT_B', 'CAT_C')
  and is_active = true
  and is_deleted = false
  and (
    (code = 'CAT_A' and name = 'Categoría A - Corporativo' and min_score = 2.26 and max_score = 3.00)
    or (code = 'CAT_B' and name = 'Categoría B - Empresarial' and min_score = 1.50 and max_score = 2.25)
    or (code = 'CAT_C' and name = 'Categoría C - Ejecutivo' and min_score = 0.75 and max_score = 1.49)
  );

select
  's20_retired_categories' as check_name,
  count(*)::int as found,
  2 as expected,
  coalesce(jsonb_agg(code order by code), '[]'::jsonb) as detail
from public.categories
where code in ('CAT_D', 'CAT_E')
  and is_active = false
  and is_deleted = true
  and deleted_at is not null;

with retired_categories as (
  select id from public.categories where code in ('CAT_D', 'CAT_E')
), invalid_references as (
  select 'asociados' as source, id
  from public.associates
  where category_id in (select id from retired_categories) and is_deleted = false
  union all
  select 'prospectos abiertos', id
  from public.prospects
  where current_category_id in (select id from retired_categories)
    and converted_to_associate_id is null and is_deleted = false
  union all
  select 'membresias vigentes', id
  from public.memberships
  where category_id in (select id from retired_categories)
    and is_current = true and is_deleted = false
  union all
  select 'evaluaciones vigentes', id
  from public.prospect_evaluations
  where suggested_category_id in (select id from retired_categories)
    and is_current = true and is_deleted = false
)
select
  's20_no_operational_retired_references' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(source || ':' || id order by source, id), '[]'::jsonb) as detail
from invalid_references;
