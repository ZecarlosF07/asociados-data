-- ============================================
-- Hito S13 ajuste: lectura operativa para reportes
-- ============================================
-- Las vistas de reportes usan security_invoker, por lo que respetan RLS de
-- las tablas base. Alta Direccion tiene reportes:read, pero no necesariamente
-- permisos de lectura directa sobre membresias, cobranza o documentos.
-- Estas policies permiten alimentar reportes sin habilitar navegacion ni
-- escritura en los modulos operativos.

drop policy if exists memberships_reports_read on public.memberships;
create policy memberships_reports_read on public.memberships
  for select to authenticated
  using (
    is_deleted = false
    and public.has_module_permission('reportes', 'read')
  );

drop policy if exists payment_schedules_reports_read on public.payment_schedules;
create policy payment_schedules_reports_read on public.payment_schedules
  for select to authenticated
  using (
    is_deleted = false
    and public.has_module_permission('reportes', 'read')
  );

drop policy if exists payments_reports_read on public.payments;
create policy payments_reports_read on public.payments
  for select to authenticated
  using (
    is_deleted = false
    and public.has_module_permission('reportes', 'read')
  );

drop policy if exists collection_actions_reports_read on public.collection_actions;
create policy collection_actions_reports_read on public.collection_actions
  for select to authenticated
  using (
    is_deleted = false
    and public.has_module_permission('reportes', 'read')
  );

drop policy if exists documents_reports_read on public.documents;
create policy documents_reports_read on public.documents
  for select to authenticated
  using (
    is_deleted = false
    and public.has_module_permission('reportes', 'read')
  );
