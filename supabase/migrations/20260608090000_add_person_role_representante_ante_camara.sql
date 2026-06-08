-- ============================================
-- Agrega rol de persona: Representante ante la camara
-- ============================================

with person_role_group as (
  select id
  from public.catalog_groups
  where code = 'PERSON_ROLE'
    and is_active = true
),
desired_roles as (
  select *
  from (values
    ('REPRESENTANTE_LEGAL', 'Representante legal', 1),
    ('REPRESENTANTE_ANTE_CAMARA', 'Representante ante la cámara', 2),
    ('GERENTE_GENERAL', 'Gerente general', 3),
    ('ASISTENTE_GERENCIA', 'Asistente de gerencia', 4),
    ('CONTACTO_PRINCIPAL', 'Contacto principal', 5)
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
  r.code,
  r.label,
  r.sort_order,
  true
from person_role_group g
cross join desired_roles r
on conflict (group_id, code) where is_deleted = false
do update set
  label = excluded.label,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();
