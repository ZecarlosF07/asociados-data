# Hito S19 - Reporte actual de comites: resumen de implementacion

## Estado

Implementado en codigo y migracion local el 2026-07-07. Pendiente aplicar la
migracion y ejecutar el audit en la instancia desplegada de Supabase.

## Base de datos

- `supabase/migrations/20260707100000_s19_committee_reports.sql`
- `supabase/audits/hito_s19_committee_reports_audit.sql`

La migracion agrega la vista `report_committee_assignments_current` con
`security_invoker = true`, lectura por `reportes:read` y politicas especificas
sobre `committees` y `associate_committees`. No concede escrituras ni permisos del
modulo operativo de comites.

## Reporte

Se agrego la pestana `Comites` en `/reportes` con:

- filtros por busqueda, comite, estado y categoria
- asociados evaluados, sin comite y comites representados
- cobertura, comites activos vacios, comite mayor y promedio por comite
- distribuciones por comite y estado
- resumen por comite, incluyendo conteos cero y `Sin comite`
- detalle navegable hacia `/asociados/:id`

`buildCommitteeReportModel` concentra filtros, indicadores, agrupamientos y filas
de resumen para que pantalla y exportaciones usen las mismas reglas.

## Excel y auditoria

La pestana genera un archivo de dos hojas:

- `Resumen comités`
- `Asociados por comité`

`Exportar todo` incorpora esas hojas y genera nueve en total. Las descargas pasan
por las utilidades centralizadas que registran `excel_exports` con accion
`export_excel` antes de generar el archivo.

## Estructura frontend

Se agregaron `CommitteesReportTab`, `CommitteeReportFilters`,
`CommitteeReportKpis` y `ReportsExportAllButton`. Los componentes modificados y
nuevos permanecen debajo de 120 lineas.

## Validaciones locales

- `yarn lint`: correcto
- `yarn build`: correcto
- `git diff --check`: correcto
- modelo puro: 12 casos funcionales correctos

## Validacion operativa pendiente

1. Aplicar `20260707100000_s19_committee_reports.sql` en Supabase.
2. Ejecutar `hito_s19_committee_reports_audit.sql` y comprobar todos los conteos.
3. Validar la pestana y ambas rutas de exportacion con usuarios `ADMIN` y
   `ALTA_DIRECCION`.
4. Confirmar los registros de auditoria de las descargas Excel.
