select
  'area_required_items' as check_name,
  count(*)::int as found,
  12 as expected,
  array_agg(ci.code order by ci.sort_order, ci.code) as detail
from public.catalog_groups cg
join public.catalog_items ci on ci.group_id = cg.id
where cg.code = 'AREA'
  and cg.is_active = true
  and ci.is_active = true
  and ci.is_deleted = false
  and ci.code in (
    'GERENCIA',
    'ADMINISTRACION',
    'CONTABILIDAD',
    'RRHH',
    'COMERCIAL',
    'LOGISTICA',
    'LEGAL',
    'MARKETING',
    'TI',
    'CONTACTO_NEGOCIOS',
    'RESPONSABILIDAD_SOCIAL_COMUNICACIONES',
    'OTRO'
  );

select
  ci.code,
  ci.label,
  ci.sort_order,
  ci.is_active,
  ci.is_deleted
from public.catalog_groups cg
join public.catalog_items ci on ci.group_id = cg.id
where cg.code = 'AREA'
  and ci.code in (
    'GERENCIA',
    'ADMINISTRACION',
    'CONTABILIDAD',
    'RRHH',
    'COMERCIAL',
    'LOGISTICA',
    'LEGAL',
    'MARKETING',
    'TI',
    'CONTACTO_NEGOCIOS',
    'RESPONSABILIDAD_SOCIAL_COMUNICACIONES',
    'OTRO'
  )
order by ci.sort_order, ci.code;
