-- ============================================================
-- Hito S19: reporte actual de comites
-- ============================================================

drop policy if exists committees_reports_read on public.committees;
create policy committees_reports_read on public.committees
  for select to authenticated
  using (
    is_deleted = false
    and public.has_module_permission('reportes', 'read')
  );

drop policy if exists associate_committees_reports_read on public.associate_committees;
create policy associate_committees_reports_read on public.associate_committees
  for select to authenticated
  using (
    is_deleted = false
    and public.has_module_permission('reportes', 'read')
  );

grant select on public.committees, public.associate_committees to authenticated;

create or replace view public.report_committee_assignments_current
with (security_invoker = true)
as
select
  a.id as associate_id,
  a.internal_code as associate_internal_code,
  a.company_name as associate_company_name,
  a.ruc as associate_ruc,
  ast.code as associate_status_code,
  ast.label as associate_status_label,
  cat.code as category_code,
  cat.name as category_name,
  ac.id as committee_assignment_id,
  c.id as committee_id,
  c.code as committee_code,
  c.name as committee_name,
  c.is_active as committee_is_active,
  ac.joined_at
from public.associates a
left join public.associate_committees ac
  on ac.associate_id = a.id
 and ac.is_primary = true
 and ac.is_active = true
 and ac.is_deleted = false
left join public.committees c
  on c.id = ac.committee_id
 and c.is_deleted = false
left join public.catalog_items ast on ast.id = a.associate_status_id
left join public.categories cat on cat.id = a.category_id
where a.is_deleted = false
  and public.has_module_permission('reportes', 'read');

grant select on public.report_committee_assignments_current to authenticated;

comment on view public.report_committee_assignments_current is
  'Fotografia actual de asociados y su comite principal vigente para reportes';
