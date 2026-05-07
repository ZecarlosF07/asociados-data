# Hito S5: Subsanación del Hito 8 - Reportes, exportaciones y automatizaciones

## 1. Objetivo del hito

Fortalecer la capa de reportes, exportaciones y automatizaciones para que el Hito 8 quede listo para operación y evolución. Los reportes deben apoyarse en estructuras mantenibles, las exportaciones deben ser consistentes y la base de automatizaciones debe existir de forma persistente.

## 2. Hito original que subsana

Este hito subsana el **Hito 8: Reportes, exportaciones y automatizaciones**.

El Hito 8 exige:

- reportes operativos
- exportaciones
- indicadores
- base para automatizaciones
- cierre técnico

La brecha detectada es que parte de la capa de reportes y automatizaciones está implementada como frontend/services, pero no suficientemente consolidada en base de datos o estructura persistente.

## 3. Problemas detectados

- Los reportes dependen principalmente de consultas desde services frontend.
- No hay evidencia de vistas SQL de reportes principales.
- La automatización está preparada de forma conceptual, no como modelo persistente.
- `ReportsPage.jsx` es demasiado grande.
- `yarn build` advierte bundle grande.
- `xlsx` puede estar cargándose dentro del bundle principal.

## 4. Alcance funcional

### 4.1 Reportes mínimos

Mantener reportes de:

- prospectos por estado, categoría y captador
- asociados por estado, categoría y salud de pago
- membresías vigentes, vencidas y por tipo
- pagos registrados por fecha y método
- cronograma pendiente/vencido/pagado
- cobranza por estado y responsable
- documentos por tipo, categoría y asociado

### 4.2 Exportaciones

Cada exportación debe:

- respetar filtros activos
- usar columnas definidas por dominio
- formatear fechas
- formatear moneda
- usar nombres de archivo consistentes
- manejar errores de descarga

### 4.3 Automatizaciones base

Crear estructura persistente para automatizaciones:

- `automation_jobs`
- `automation_job_runs`

Campos sugeridos:

- nombre
- código
- tipo
- estado
- configuración JSON
- última ejecución
- próxima ejecución
- resultado
- error
- usuario/servicio creador

Automatizaciones candidatas:

- recalcular salud de pago
- detectar cuotas vencidas
- preparar recordatorios de cobranza
- generar resumen operativo
- detectar documentos sin contexto

No es obligatorio enviar correos o WhatsApp en este hito, salvo que se defina explícitamente.

## 5. Alcance técnico

### 5.1 Vistas SQL o RPC

Crear vistas o RPC para:

- `report_prospects_summary`
- `report_associates_summary`
- `report_memberships_summary`
- `report_payments_summary`
- `report_schedules_summary`
- `report_collections_summary`
- `report_documents_summary`
- `dashboard_kpis`

Estas estructuras deben:

- filtrar `is_deleted = false`
- resolver joins comunes
- exponer campos listos para UI
- reducir lógica duplicada en frontend

### 5.2 Refactor de reportes

Dividir `ReportsPage.jsx` en:

- `ReportsPage`
- `ReportsSummaryTab`
- `ProspectsReportTab`
- `AssociatesReportTab`
- `MembershipsReportTab`
- `PaymentsCollectionsReportTab`
- `DocumentsReportTab`
- `ReportExportButton`

Extraer:

- columnas
- tabs
- mapeos de estados
- configuración de charts
- lógica de exportación

### 5.3 Rendimiento

- Usar lazy loading en rutas pesadas.
- Evaluar dynamic import para `xlsx`.
- Revisar tamaño del bundle después del cambio.
- Documentar si queda warning de chunk grande y por qué.

## 6. Tareas para el desarrollador

1. Crear migración de vistas SQL o RPCs de reportes.
2. Actualizar `reports.service.js` para consumir vistas/RPCs.
3. Crear tablas base de automatizaciones.
4. Refactorizar `ReportsPage.jsx`.
5. Centralizar configuración de exportaciones.
6. Implementar dynamic import de `xlsx` si aplica.
7. Validar exportación por módulo.
8. Validar exportación multi-hoja.
9. Ejecutar build y revisar tamaño del bundle.
10. Documentar automatizaciones futuras y cómo se ejecutarían.

## 7. Definition of Done

Este hito se considera terminado cuando:

- Existen vistas SQL o RPCs para reportes principales.
- Los reportes consumen estructuras centralizadas.
- Las exportaciones respetan filtros y formato.
- Existe modelo persistente para automatizaciones.
- `ReportsPage` queda dividido en componentes mantenibles.
- Se reduce o justifica la advertencia de bundle grande.
- `yarn lint` y `yarn build` pasan.

