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

## S14 - Hardening preproduccion: auditoria confiable y fechas de pago

### Estado actual

Pendiente. Nace de QA preproduccion posterior a S13.

### Evidencia en codigo

Auditoria:

- `supabase/migrations/20260507010000_s1_permissions_rls.sql`
- `src/services/audit.service.js`
- `src/utils/userAudit.js`
- `src/hooks/useAuditLogs.js`

Fechas de pago:

- `src/services/paymentSchedules.service.js`
- `supabase/migrations/20260520090000_fix_payment_paid_at_lima_date.sql`

### Riesgos detectados

- `audit_logs_insert` permite insercion directa desde cliente autenticado si no se endurece.
- `paymentSchedulesService.markAsPaid` conserva una escritura latente de `paid_at` con `new Date().toISOString()`.

### Archivos principales a tocar

- nueva migracion SQL S14
- nuevo audit SQL S14
- `src/services/audit.service.js`
- `src/utils/userAudit.js`
- `src/services/paymentSchedules.service.js`

### Validacion de cierre

- no hay insert directo frontend a `audit_logs`
- no hay policy amplia de insert directo a `audit_logs`
- auditoria operativa sigue visible en `/auditoria`
- pagos siguen mostrando fecha calendario correcta
- `yarn lint`
- `yarn build`

## S15 - Modalidades de cobro para membresias anuales

### Estado actual

Pendiente. Nace de la necesidad funcional de agregar modalidades trimestral, cuatrimestral y semestral sin cambiar la cobertura anual de la membresia.

### Evidencia en codigo

Catalogo actual:

- `supabase/migrations/20260312120000_seed_catalog_items.sql`
- grupo `MEMBERSHIP_TYPE` con `MENSUAL` y `ANUAL`

Generacion de cronograma:

- `src/services/memberships.service.js`
- metodo `membershipsService.generateSchedule(...)`
- logica actual binaria: mensual genera 12 cuotas; anual genera 1 cuota

Formulario y validacion:

- `src/components/molecules/financial/MembershipForm.jsx`
- `src/utils/financialValidation.js`
- campo `monthly_billing_day` actualmente requerido solo para mensual

Fechas calendario:

- `src/utils/dateOnly.js`
- reglas documentadas en S7, S12 y S14 para evitar desfases por zona horaria

### Riesgos detectados

- agregar nuevas modalidades copiando ramas de codigo puede duplicar reglas de fechas
- usar `new Date('YYYY-MM-DD')` o `toISOString()` puede reintroducir el bug del dia anterior
- interpretar trimestral/cuatrimestral/semestral como duracion de membresia, cuando deben ser modalidades de cobro sobre cobertura anual
- no conservar la regla anual de S12 para `ANUAL`

### Archivos principales a tocar

- nueva migracion SQL S15 para catalogos `MEMBERSHIP_TYPE`
- `src/services/memberships.service.js`
- `src/utils/financialValidation.js`
- `src/components/molecules/financial/MembershipForm.jsx`
- `src/components/molecules/financial/MembershipList.jsx`
- `src/pages/financial/MembershipsPage.jsx`
- reportes y exportaciones solo si requieren ajuste de visualizacion

### Migraciones esperadas

Crear:

- migracion idempotente para `TRIMESTRAL`, `CUATRIMESTRAL` y `SEMESTRAL`

Opcional:

- `supabase/audits/hito_s15_membership_modalities_audit.sql`

### Validacion de cierre

- crear membresia mensual y validar que no cambia el comportamiento vigente
- crear membresia trimestral y validar 4 cuotas
- crear membresia cuatrimestral y validar 3 cuotas
- crear membresia semestral y validar 2 cuotas
- crear membresia anual y validar `due_date = end_date + 1 dia`
- renovar membresia con nueva modalidad y validar cobertura anual
- validar que no hay fechas desplazadas un dia en America/Lima
- `yarn lint`
- `yarn build`

## S16 - Asignacion de comites a asociados

### Estado actual

Implementado y migrado a Supabase el 2026-06-22. La evidencia recibida confirma tablas, FKs, checks, indices, RLS, policies y matriz de permisos. Queda por confirmar el resto de controles del audit S16 y los casos operativos de cierre.

### Evidencia en codigo y documentacion

- `.agent/docs/diccionario_de_tablas_sistema_de_asociados_v_2.md`
- `.agent/docs/Asociadosdiagramas.md`
- `supabase/migrations/20260317010000_create_associates.sql`
- `src/services/associates.service.js`
- `src/components/molecules/associates/AssociateForm.jsx`
- `src/components/molecules/associates/AssociateFilters.jsx`

### Riesgos detectados

- agregar texto libre genera nombres duplicados e inconsistentes
- agregar `committee_id` directo en `associates` elimina historial y limita la evolucion a multiples comites
- reutilizar `DOCUMENT_CATEGORY.COMITES` confunde una categoria documental con una entidad institucional
- actualizar asociado y asignacion en operaciones separadas puede dejar datos parciales
- hacer obligatorio el campo inmediatamente bloquea la regularizacion de asociados existentes

### Archivos principales a tocar

- nueva migracion SQL S16 para `committees`, `associate_committees`, RPCs, RLS y permisos
- nuevo audit SQL S16
- nuevo modulo Comites con servicio, hook, selector, listado, detalle y tipos
- servicios, formularios, filtros, lista y ficha de asociados

### Validacion de cierre

- administrar comites activos e inactivos
- asignar, cambiar y retirar comite principal conservando historial
- alta directa y conversion con asignacion atomica opcional
- filtrar por comite y por `Sin comite`
- validar RLS y auditoria
- `yarn lint`
- `yarn build`
