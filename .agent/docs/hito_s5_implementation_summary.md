# Hito S5 — Subsanación Hito 8: Reportes, exportaciones y automatizaciones

## Estado

Implementado en código, migración y documentación técnica.

## Base de datos

Archivo:

- `supabase/migrations/20260511010000_s5_reports_automation_foundation.sql`

Se agregaron vistas:

- `report_prospects_summary`
- `report_associates_summary`
- `report_memberships_summary`
- `report_payments_summary`
- `report_schedules_summary`
- `report_collections_summary`
- `report_documents_summary`
- `dashboard_kpis`

Las vistas usan `security_invoker = true`, filtran `is_deleted = false` y exponen campos listos para reportes.

También se agregaron:

- `automation_jobs`
- `automation_job_runs`

Ambas tablas tienen RLS:

- lectura con `reportes/read`
- escritura con `reportes/admin`

## Frontend

`ReportsPage.jsx` quedó reducido a orquestación de tabs.

Se crearon secciones:

- `ReportsSummaryTab`
- `ProspectsReportTab`
- `AssociatesReportTab`
- `MembershipsReportTab`
- `PaymentsCollectionsReportTab`
- `DocumentsReportTab`

Se centralizó configuración en:

- `src/utils/reportConfigs.js`

Se agregó:

- `ReportExportButton`

## Servicios

`reports.service.js` ahora consume vistas SQL y normaliza la respuesta al shape que usan las tablas y exportaciones.

`dashboard_kpis` reemplaza el cálculo distribuido por múltiples queries frontend.

## Exportaciones

`exportUtils.js` usa dynamic import para:

- `xlsx`
- `file-saver`

Esto saca esas dependencias del bundle principal.

Se agregó exportación de gestiones de cobranza y la exportación multi-hoja incluye:

- Prospectos
- Asociados
- Membresías
- Pagos
- Cronograma
- Gestiones
- Documentos

## Rendimiento

`AppRouter.jsx` ahora usa lazy loading de páginas con `React.lazy` y `Suspense`.

Resultado del build:

- `xlsx` quedó en chunk separado.
- `file-saver` quedó en chunk separado.
- el chunk principal bajó a `420.83 kB`.
- desapareció el warning de chunks mayores a 500 kB.

## Automatizaciones

Documentación:

- `.agent/docs/hito_s5_automatizaciones.md`

Jobs candidatos registrados como `PAUSED`:

- `RECALCULATE_PAYMENT_HEALTH`
- `DETECT_OVERDUE_SCHEDULES`
- `PREPARE_COLLECTION_REMINDERS`
- `GENERATE_OPERATIONAL_SUMMARY`
- `DETECT_UNCONTEXTUALIZED_DOCUMENTS`

## Auditoría

Archivo:

- `supabase/audits/hito_s5_reports_audit.sql`

Valida:

- vistas creadas
- tablas de automatización
- RLS de automatización
- policies
- jobs candidatos
- salida de `dashboard_kpis`

## Validaciones ejecutadas

```bash
yarn lint
yarn build
```

Resultado:

- `yarn lint` pasó correctamente.
- `yarn build` pasó correctamente.
- no queda warning de chunk grande.

## Pendiente operativo

Aplicar la migración S5 en Supabase y ejecutar el audit S5 en SQL Editor.
