-- ============================================
-- Limpieza operativa para inicio con datos reales
-- ============================================
-- Ejecutar manualmente desde Supabase SQL Editor.
--
-- Conserva:
-- - estructura de BD
-- - roles, modulos, permisos y role_permissions
-- - catalog_groups, catalog_items, categories
-- - system_settings
-- - storage.buckets
-- - automation_jobs base
-- - todos los usuarios internos en public.user_profiles
-- - todos los usuarios Auth
--
-- Elimina:
-- - prospectos, asociados y dependencias operativas
-- - membresias, cronogramas, pagos y gestiones de cobranza
-- - documentos y nodos documentales
-- - auditoria
-- - corridas de automatizacion
-- - contadores de codigos
-- - no elimina usuarios internos ni usuarios Auth

begin;

-- Archivos en Storage: NOTA: Supabase tiene una función/trigger de protección (storage.protect_delete())
-- que impide borrar directamente sobre storage.objects mediante SQL.
-- Para vaciar de forma segura los archivos físicos en el Storage de Supabase, vaciar/limpiar
-- el bucket 'documents' directamente desde la interfaz web (Storage UI) del Dashboard de Supabase.

-- Dependencias documentales.
delete from public.documents;
delete from public.storage_nodes;

-- Finanzas y cobranza.
delete from public.payments;
delete from public.collection_actions;
delete from public.payment_schedules;
delete from public.memberships;

-- Datos del asociado.
delete from public.associate_area_contacts;
delete from public.associate_people;

-- Romper enlace circular prospecto <-> asociado antes de borrar asociados.
update public.prospects
set converted_to_associate_id = null,
    converted_at = null;

delete from public.associates;

-- Datos del prospecto.
delete from public.prospect_status_history;
delete from public.prospect_quotes;
delete from public.prospect_evaluations;
delete from public.prospects;

-- Captadores creados para pruebas.
delete from public.captadores;

-- Automatizaciones: conservar jobs base, limpiar ejecuciones.
delete from public.automation_job_runs;

-- Contadores de negocio para que el primer dato real empiece limpio.
delete from public.entity_counters;

-- Auditoria completa de pruebas.
delete from public.audit_logs;

commit;

-- Validacion rapida posterior.
select 'prospects' as table_name, count(*)::int as row_count from public.prospects
union all select 'associates', count(*)::int from public.associates
union all select 'memberships', count(*)::int from public.memberships
union all select 'payment_schedules', count(*)::int from public.payment_schedules
union all select 'payments', count(*)::int from public.payments
union all select 'collection_actions', count(*)::int from public.collection_actions
union all select 'documents', count(*)::int from public.documents
union all select 'storage_nodes', count(*)::int from public.storage_nodes
union all select 'audit_logs', count(*)::int from public.audit_logs
union all select 'automation_job_runs', count(*)::int from public.automation_job_runs
union all select 'entity_counters', count(*)::int from public.entity_counters
order by table_name;
