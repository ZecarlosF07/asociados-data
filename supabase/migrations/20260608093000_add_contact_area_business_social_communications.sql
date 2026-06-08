-- ============================================
-- Agrega areas de contacto: negocios y responsabilidad social
-- ============================================

with area_group as (
  select id
  from public.catalog_groups
  where code = 'AREA'
    and is_active = true
),
desired_areas as (
  select *
  from (values
    ('GERENCIA', 'Gerencia', 1),
    ('ADMINISTRACION', 'Administración', 2),
    ('CONTABILIDAD', 'Contabilidad', 3),
    ('RRHH', 'Recursos humanos', 4),
    ('COMERCIAL', 'Comercial', 5),
    ('LOGISTICA', 'Logística', 6),
    ('LEGAL', 'Legal', 7),
    ('MARKETING', 'Marketing', 8),
    ('TI', 'Tecnología', 9),
    ('CONTACTO_NEGOCIOS', 'Contacto de Negocios', 10),
    (
      'RESPONSABILIDAD_SOCIAL_COMUNICACIONES',
      'Responsabilidad Social y Comunicaciones',
      11
    ),
    ('OTRO', 'Otra área', 12)
  ) as v(code, label, sort_order)
)
insert into public.catalog_items (
  group_id,
  code,
  label,
  sort_order,
  is_active
)
select
  g.id,
  a.code,
  a.label,
  a.sort_order,
  true
from area_group g
cross join desired_areas a
on conflict (group_id, code) where is_deleted = false
do update set
  label = excluded.label,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();
