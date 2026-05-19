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
-- - usuario ADMIN indicado abajo
--
-- Elimina:
-- - prospectos, asociados y dependencias operativas
-- - membresias, cronogramas, pagos y gestiones de cobranza
-- - documentos y nodos documentales
-- - auditoria
-- - corridas de automatizacion
-- - contadores de codigos
-- - usuarios internos de prueba excepto el ADMIN indicado
-- - usuarios Auth de prueba excepto el ADMIN indicado

begin;

-- Cambiar este correo si el ADMIN inicial real sera otro.
create temp table _reset_keep_admin (
  email text primary key
) on commit drop;

insert into _reset_keep_admin (email)
values ('fvillaruel@camaraica.org.pe');

do $$
declare
  v_admin_count integer;
begin
  select count(*) into v_admin_count
  from public.user_profiles up
  join public.roles r on r.id = up.role_id
  join _reset_keep_admin k on lower(k.email) = lower(up.institutional_email)
  where r.code = 'ADMIN'
    and up.is_active = true
    and up.is_deleted = false;

  if v_admin_count <> 1 then
    raise exception 'Limpieza detenida: debe existir exactamente un ADMIN activo con el correo configurado en _reset_keep_admin.';
  end if;
end $$;

-- Archivos en Storage: elimina objetos del bucket documents.
-- Si el dashboard mantiene archivos fisicos externos, vaciar tambien el bucket desde Storage UI.
delete from storage.objects
where bucket_id = 'documents';

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

-- Limpiar referencias de autoria en tablas maestras conservadas para poder borrar usuarios de prueba.
update public.system_settings
set created_by = null,
    updated_by = null,
    deleted_by = null;

update public.categories
set created_by = null,
    updated_by = null,
    deleted_by = null;

update public.catalog_items
set deleted_by = null;

update public.automation_jobs
set created_by = null;

-- Auditoria completa de pruebas.
delete from public.audit_logs;

-- Usuarios internos de prueba: conservar solo el ADMIN indicado.
update public.user_profiles up
set created_by = null,
    updated_by = null,
    deleted_by = null;

delete from public.user_profiles up
where not exists (
  select 1
  from _reset_keep_admin k
  where lower(k.email) = lower(up.institutional_email)
);

-- Usuarios Auth de prueba: conservar solo el ADMIN indicado.
-- Requiere ejecutarse con permisos del SQL Editor sobre schema auth.
delete from auth.users au
where not exists (
  select 1
  from _reset_keep_admin k
  where lower(k.email) = lower(au.email)
);

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
union all select 'user_profiles_non_admin', count(*)::int
from public.user_profiles up
where not exists (
  select 1
  from (values ('fvillaruel@camaraica.org.pe')) as k(email)
  where lower(k.email) = lower(up.institutional_email)
)
order by table_name;
