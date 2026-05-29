-- ============================================
-- Hito S15: Modalidades de cobro para membresias anuales
-- ============================================

insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
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
  );

update public.catalog_items ci
set sort_order = v.sort_order,
    updated_at = now()
from public.catalog_groups g
join (values
  ('MENSUAL',        1),
  ('TRIMESTRAL',     2),
  ('CUATRIMESTRAL',  3),
  ('SEMESTRAL',      4),
  ('ANUAL',          5)
) as v(code, sort_order) on true
where ci.group_id = g.id
  and g.code = 'MEMBERSHIP_TYPE'
  and ci.code = v.code
  and ci.sort_order is distinct from v.sort_order;
