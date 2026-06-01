-- ============================================
-- Hito S15: Subsanacion de visibilidad de modalidades de cobro
-- ============================================
-- La migracion S15 original agrego las modalidades nuevas y ordeno el catalogo.
-- Esta subsanacion asegura que los items esperados queden visibles en UI:
-- catalogos no eliminados, activos, con etiqueta y orden canonicos.

insert into public.catalog_items (group_id, code, label, sort_order, is_active)
select g.id, v.code, v.label, v.sort_order, true
from public.catalog_groups g
cross join (values
  ('TRIMESTRAL',    'Trimestral',     2),
  ('CUATRIMESTRAL', 'Cuatrimestral',  3),
  ('SEMESTRAL',     'Semestral',      4)
) as v(code, label, sort_order)
where g.code = 'MEMBERSHIP_TYPE'
  and not exists (
    select 1
    from public.catalog_items ci
    where ci.group_id = g.id
      and ci.code = v.code
      and ci.is_deleted = false
  );

update public.catalog_items ci
set label = v.label,
    sort_order = v.sort_order,
    is_active = true,
    updated_at = now()
from public.catalog_groups g
join (values
  ('MENSUAL',        'Mensual',        1),
  ('TRIMESTRAL',     'Trimestral',     2),
  ('CUATRIMESTRAL',  'Cuatrimestral',  3),
  ('SEMESTRAL',      'Semestral',      4),
  ('ANUAL',          'Anual',          5)
) as v(code, label, sort_order) on true
where ci.group_id = g.id
  and g.code = 'MEMBERSHIP_TYPE'
  and ci.code = v.code
  and ci.is_deleted = false
  and (
    ci.label is distinct from v.label
    or ci.sort_order is distinct from v.sort_order
    or ci.is_active is distinct from true
  );
