select
  'person_role_required_items' as check_name,
  count(*)::int as found,
  5 as expected,
  array_agg(ci.code order by ci.sort_order, ci.code) as detail
from public.catalog_groups cg
join public.catalog_items ci on ci.group_id = cg.id
where cg.code = 'PERSON_ROLE'
  and cg.is_active = true
  and ci.is_active = true
  and ci.is_deleted = false
  and ci.code in (
    'REPRESENTANTE_LEGAL',
    'REPRESENTANTE_ANTE_CAMARA',
    'GERENTE_GENERAL',
    'ASISTENTE_GERENCIA',
    'CONTACTO_PRINCIPAL'
  );

select
  ci.code,
  ci.label,
  ci.sort_order,
  ci.is_active,
  ci.is_deleted
from public.catalog_groups cg
join public.catalog_items ci on ci.group_id = cg.id
where cg.code = 'PERSON_ROLE'
  and ci.code in (
    'REPRESENTANTE_LEGAL',
    'REPRESENTANTE_ANTE_CAMARA',
    'GERENTE_GENERAL',
    'ASISTENTE_GERENCIA',
    'CONTACTO_PRINCIPAL'
  )
order by ci.sort_order, ci.code;
