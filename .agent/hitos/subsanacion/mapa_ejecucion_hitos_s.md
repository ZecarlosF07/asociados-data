# Mapa de Ejecución de Hitos S

## Estado de entrada

Fecha de revisión: 2026-05-07

Comandos ejecutados:

```bash
yarn lint
yarn build
```

Resultado:

- `yarn lint`: falla con 7 errores y 5 warnings.
- `yarn build`: pasa correctamente.
- `yarn build` muestra advertencia de bundle grande: JS principal aproximado de 878 kB.

Este mapa confirma que los hitos S están correctamente orientados al código actual y que cada subsanación tiene puntos concretos de intervención.

## S0 - Subsanación transversal de calidad técnica

### Estado actual

No está cerrado. Es el primer hito que debe ejecutarse porque el lint falla y hay archivos grandes que incumplen reglas internas.

### Evidencia en código

Archivos grandes detectados:

- `src/pages/financial/PendingPaymentsPage.jsx`
- `src/pages/reports/ReportsPage.jsx`
- `src/pages/dashboard/DashboardPage.jsx`
- `src/pages/associates/AssociateDetailPage.jsx`
- `src/pages/associates/sections/AssociateDetailTabs.jsx`
- `src/components/molecules/associates/AssociateForm.jsx`
- `src/components/molecules/prospects/ProspectForm.jsx`
- `src/components/molecules/documents/DocumentUploadForm.jsx`

Errores actuales de lint:

- `src/components/molecules/associates/AssociateInfoSection.jsx`: import no usado.
- `src/utils/exportUtils.js`: import no usado.
- `src/pages/associates/AssociatesPage.jsx`: variable no usada.
- `src/pages/financial/PendingPaymentsPage.jsx`: prop/variable no usada.
- `src/context/AuthContext.jsx`: Fast Refresh.
- `src/context/NotificationContext.jsx`: Fast Refresh.
- `src/context/UserProfileContext.jsx`: Fast Refresh.

Warnings actuales:

- `src/components/molecules/documents/DocumentFilters.jsx`
- `src/pages/settings/CatalogsPage.jsx`
- `src/pages/settings/CategoriesPage.jsx`
- `src/pages/settings/SettingsPage.jsx`
- `src/pages/users/UsersPage.jsx`

### Archivos principales a tocar

- `src/context/AuthContext.jsx`
- `src/context/NotificationContext.jsx`
- `src/context/UserProfileContext.jsx`
- `src/hooks/useAuth.js`
- `src/hooks/useNotification.js`
- `src/hooks/useUserProfile.js`
- `src/pages/financial/PendingPaymentsPage.jsx`
- `src/pages/reports/ReportsPage.jsx`
- `src/pages/dashboard/DashboardPage.jsx`
- `src/pages/associates/AssociateDetailPage.jsx`
- `src/pages/associates/sections/AssociateDetailTabs.jsx`
- `src/utils/exportUtils.js`

### Validación de cierre

- `yarn lint`
- `yarn build`

## S1 - Subsanación Hito 2: seguridad, roles y permisos

### Estado actual

No está cerrado. La seguridad existe principalmente como protección frontend.

### Evidencia en código

Permisos actuales:

- `src/utils/permissions.js`
- `src/hooks/usePermissions.js`
- `src/router/PermissionGuard.jsx`

Modelo base:

- `supabase/migrations/20260312010000_create_roles.sql`
- `supabase/migrations/20260312020000_create_user_profiles.sql`
- `supabase/migrations/20260312030000_create_system_settings.sql`
- `supabase/migrations/20260312040000_create_audit_logs.sql`

No se encontraron:

- `enable row level security`
- `create policy`
- policies de `storage.objects`
- funciones SQL de autorización por rol

### Archivos principales a tocar

- `supabase/migrations/*` con nuevas migraciones de RLS.
- `src/utils/permissions.js`
- `src/hooks/usePermissions.js`
- `src/router/PermissionGuard.jsx`
- `src/services/audit.service.js`
- servicios de módulos operativos para registrar auditoría.

### Migraciones esperadas

Crear nuevas migraciones para:

- tablas de permisos si se parametriza el modelo
- funciones auxiliares de permisos
- habilitación RLS
- policies por tabla
- policies del bucket `documents`

### Validación de cierre

- pruebas con rol `ADMIN`
- pruebas con rol `OPERADOR`
- pruebas con rol `CONSULTA`
- intento de escritura directa con usuario sin permiso
- `yarn lint`
- `yarn build`

## S2 - Subsanación Hito 5: conversión e integridad del asociado

### Estado actual

No está cerrado. La conversión existe y funciona a nivel de servicio, pero no es transaccional.

### Evidencia en código

Conversión actual:

- `src/services/associates.service.js`
- método `generateCode`
- método `convertFromProspect`

UI relacionada:

- `src/components/molecules/associates/ConvertProspectModal.jsx`
- `src/pages/prospects/sections/ProspectDetailHeader.jsx`
- `src/pages/prospects/ProspectDetailPage.jsx`

Migraciones relacionadas:

- `supabase/migrations/20260316010000_create_prospects.sql`
- `supabase/migrations/20260317010000_create_associates.sql`

Riesgos actuales:

- código generado por conteo
- inserción de asociado y actualización de prospecto en pasos separados
- falta RPC transaccional

### Archivos principales a tocar

- nueva migración SQL para contador/RPC
- `src/services/associates.service.js`
- `src/components/molecules/associates/ConvertProspectModal.jsx`
- `src/pages/prospects/ProspectDetailPage.jsx`

### Migraciones esperadas

Crear:

- función para generar código de asociado
- RPC `convert_prospect_to_associate`
- índices únicos parciales para evitar duplicados activos
- auditoría de conversión

### Validación de cierre

- convertir prospecto aprobado
- intentar convertir prospecto no aprobado
- intentar doble conversión
- simular fallo y validar rollback
- `yarn lint`
- `yarn build`

## S3 - Subsanación Hito 6: membresías, pagos y cobranza

### Estado actual

Parcialmente mapeado. Los datos ya se cargan en `useAssociateDetail`, pero la ficha del asociado no muestra tabs de pagos ni cobranza.

### Evidencia en código

Datos ya disponibles:

- `src/hooks/useAssociateDetail.js`
- carga `paymentsService.getByAssociate`
- carga `collectionActionsService.getByAssociate`

UI actual de ficha:

- `src/pages/associates/sections/AssociateDetailTabs.jsx`
- tabs actuales: información, personas, contactos, membresías, documentos
- faltan tabs de pagos y cobranza

Servicios existentes:

- `src/services/memberships.service.js`
- `src/services/paymentSchedules.service.js`
- `src/services/payments.service.js`
- `src/services/collectionActions.service.js`

Componentes existentes reutilizables:

- `src/components/molecules/financial/PaymentForm.jsx`
- `src/components/molecules/financial/PaymentList.jsx`
- `src/components/molecules/financial/CollectionActionForm.jsx`
- `src/components/molecules/financial/CollectionActionList.jsx`
- `src/components/molecules/financial/ScheduleTable.jsx`

### Archivos principales a tocar

- `src/pages/associates/AssociateDetailPage.jsx`
- `src/pages/associates/sections/AssociateDetailTabs.jsx`
- nuevos componentes/tab financieros
- `src/services/payments.service.js`
- `src/services/paymentSchedules.service.js`

### Migraciones esperadas

Crear:

- RPC `register_payment`
- constraints/validaciones de pago y cronograma
- auditoría financiera

### Validación de cierre

- registrar pago desde ficha del asociado
- registrar cobranza desde ficha del asociado
- validar actualización de cronograma
- validar estado financiero del asociado
- `yarn lint`
- `yarn build`

## S4 - Subsanación Hito 7: documentos y almacenamiento

### Estado actual

No está cerrado. Existe ruta constante para detalle documental, pero falta página y registro de route.

### Evidencia en código

Ruta declarada:

- `src/router/routes.js`
- `DOCUMENTOS_DETALLE: '/documentos/:id'`

Ruta no registrada:

- `src/router/AppRouter.jsx`

Páginas actuales:

- `src/pages/documents/DocumentsPage.jsx`

No existe:

- `src/pages/documents/DocumentDetailPage.jsx`
- `src/pages/documents/sections/*`

Servicios existentes:

- `src/services/documents.service.js`
- `getById`
- `upload`
- `update`
- `replaceVersion`
- `softDelete`
- `getSignedUrl`

Componentes existentes:

- `src/components/molecules/documents/DocumentCard.jsx`
- `src/components/molecules/documents/DocumentList.jsx`
- `src/components/molecules/documents/DocumentUploadForm.jsx`
- `src/components/molecules/documents/DocumentFilters.jsx`

### Archivos principales a tocar

- `src/router/AppRouter.jsx`
- `src/pages/documents/DocumentDetailPage.jsx`
- `src/pages/documents/sections/DocumentDetailHeader.jsx`
- `src/pages/documents/sections/DocumentMetadataSection.jsx`
- `src/pages/documents/sections/DocumentVersionSection.jsx`
- `src/components/molecules/documents/DocumentCard.jsx`
- `src/components/molecules/documents/DocumentList.jsx`
- `src/services/documents.service.js`

### Migraciones esperadas

Si S1 no lo cubre antes:

- policies para bucket `documents`
- policies para tabla `documents`
- policies para `storage_nodes`

### Validación de cierre

- abrir detalle documental desde listado
- descargar documento desde detalle
- validar metadata completa
- validar permisos por rol
- `yarn lint`
- `yarn build`

## S5 - Subsanación Hito 8: reportes, exportaciones y automatizaciones

### Estado actual

Parcial. Reportes y exportaciones existen, pero no hay vistas SQL/RPC ni automatizaciones persistentes.

### Evidencia en código

Reportes actuales:

- `src/pages/reports/ReportsPage.jsx`
- `src/services/reports.service.js`
- `src/hooks/useReportData.js`
- `src/components/molecules/reports/*`

Exportaciones actuales:

- `src/utils/exportUtils.js`
- import estático de `xlsx`
- import de `file-saver`

No se encontraron:

- vistas SQL de reportes
- tablas `automation_jobs`
- tablas `automation_job_runs`
- lazy loading de rutas pesadas
- dynamic import de `xlsx`

### Archivos principales a tocar

- nueva migración SQL para vistas/RPCs de reportes
- nueva migración SQL para automatizaciones
- `src/services/reports.service.js`
- `src/pages/reports/ReportsPage.jsx`
- `src/utils/exportUtils.js`
- `src/router/AppRouter.jsx`

### Migraciones esperadas

Crear:

- vistas o RPCs de reportes
- `automation_jobs`
- `automation_job_runs`

### Validación de cierre

- validar KPIs
- exportar reportes por módulo
- exportar multi-hoja
- revisar bundle luego de lazy loading/dynamic import
- `yarn lint`
- `yarn build`

## S6 - QA, datos semilla y release

### Estado actual

Pendiente. Depende del cierre de S0 a S5.

### Evidencia en código

Seeds existentes:

- roles
- system settings
- admin user
- catalog groups
- catalog items
- categories

Migraciones existentes cubren:

- roles
- usuarios
- configuración
- auditoría
- catálogos
- prospectos
- captadores
- asociados
- finanzas
- documentos

Pendiente de validar en entorno limpio:

- ejecución completa de migraciones
- suficiencia de seeds
- bucket `documents`
- roles contra RLS
- flujos de punta a punta

### Entregables esperados

Crear en `.agent/docs`:

- `qa_checklist_mvp.md`
- `release_notes_mvp.md`
- `guia_configuracion_entorno_mvp.md`
- `validacion_seeds_mvp.md`

### Validación de cierre

- entorno limpio con migraciones aplicadas
- seeds validados
- bucket configurado
- QA manual documentado
- `yarn lint`
- `yarn build`

