# Hito S19: Reporte actual de comites

## 1. Objetivo del hito

Agregar una nueva pestana `Comites` dentro del modulo `/reportes` para consultar
cuantos asociados pertenecen actualmente a cada comite institucional.

El reporte debe permitir:

- conocer cuantos asociados tienen comite principal vigente
- identificar asociados sin comite
- comparar la cantidad de asociados entre comites
- explicar cada total mediante el estado actual de los asociados
- consultar el detalle que compone cada indicador
- exportar a Excel exactamente el resultado filtrado

S19 es una fotografia operativa actual. No reconstruye movimientos historicos por
periodo.

## 2. Hitos que mejora

Este hito evoluciona:

- **S5**, que consolido vistas SQL, servicios, pestanas y exportaciones de reportes
- **S16**, que creo `committees`, `associate_committees` y el comite principal vigente
- **S17 y S18**, que centralizaron la auditoria obligatoria de descargas Excel

El mantenimiento de comites permanece en `/comites`. S19 agrega analisis y
exportacion dentro de `/reportes`, sin duplicar funciones administrativas.

## 3. Estado actual detectado

### 3.1 Modelo disponible

La base de datos ya contiene:

```txt
committees
associate_committees
```

`associate_committees` conserva:

- asociado
- comite
- fecha de incorporacion
- fecha de salida
- indicador de comite principal
- estado vigente o cerrado
- soft delete

La restriccion `uq_associate_committees_primary` permite un solo comite principal
vigente por asociado.

### 3.2 Modulo de comites

El modulo `/comites` permite administrar comites y consultar los asociados vigentes
de un comite individual. No ofrece una comparacion global entre todos los comites.

### 3.3 Modulo de reportes

`/reportes` contiene pestanas para resumen, prospectos, asociados, membresias,
pagos/cobranza y documentos. No existe una pestana de comites ni una vista SQL
preparada para este reporte.

Las exportaciones ya usan `exportToExcel` y `exportMultiSheetExcel`, que registran
la descarga en auditoria antes de generar el archivo.

### 3.4 Brecha de permisos

Las politicas actuales de `committees` y `associate_committees` permiten lectura
mediante los modulos `comites` o `asociados`. Un usuario con `reportes:read`, como
Alta Direccion, puede no tener esos permisos operativos.

S19 debe habilitar lectura especifica para reportes sin conceder creacion,
actualizacion, administracion ni acceso al modulo operativo de comites.

## 4. Regla de conteo

Un asociado cuenta dentro de un comite cuando existe un vinculo que cumple:

```txt
associate_committees.is_primary = true
associate_committees.is_active = true
associate_committees.is_deleted = false
```

Tambien deben cumplirse:

```txt
associates.is_deleted = false
committees.is_deleted = false
```

Reglas funcionales:

- se cuentan asociados de cualquier estado
- los estados `ACTIVO`, `INACTIVO`, `SUSPENDIDO` y `EN_PROCESO` se desglosan
- un asociado sin vinculo principal vigente cuenta como `Sin comite`
- asignaciones cerradas, eliminadas o secundarias no cuentan en la fotografia actual
- un asociado nunca debe contarse dos veces en el total actual
- un comite sin asociados debe poder identificarse con total cero

## 5. Alcance funcional

### 5.1 Nueva pestana

Agregar a `REPORT_TABS`:

```js
{ key: 'committees', label: 'Comités' }
```

Ubicacion recomendada: despues de `Asociados`.

La pestana permanece dentro de la ruta existente:

```txt
/reportes
```

No se crea una ruta nueva ni una entrada adicional en el sidebar.

### 5.2 Indicadores

Mostrar como minimo:

- asociados evaluados por los filtros
- asociados sin comite
- comites representados en el resultado

Agregar como indicadores complementarios:

- cobertura de asignacion: porcentaje de asociados evaluados que tienen comite
- comites activos sin asociados en el resultado filtrado
- comite con mas asociados, mostrando nombre y cantidad
- promedio de asociados por comite representado

Los siete indicadores deben recalcularse al aplicar filtros. Deben presentarse en
dos grupos responsivos: tres indicadores principales y cuatro complementarios.

`Asociados con comite` no se muestra como tarjeta porque es redundante con el
total, los asociados sin comite y la cobertura. Su conteo se conserva solo como
calculo interno para las demas formulas.

Reglas:

- la cobertura es `0%` cuando no existen asociados evaluados
- `Comites sin asociados` considera solo comites activos y usa los conteos filtrados
- el comite con mas asociados excluye la fila `Sin comite`
- en caso de empate, gana el primer comite por nombre ascendente
- si ningun comite tiene asociados, el indicador muestra `—` y cantidad cero
- el promedio es cero cuando no existen comites representados

### 5.3 Graficos

Mostrar:

- distribucion de asociados por comite, incluyendo `Sin comite`
- distribucion de asociados por estado

Los graficos deben usar los mismos registros filtrados que el detalle y no realizar
un conteo independiente.

### 5.4 Resumen por comite

Mostrar una fila por cada comite no eliminado y una fila adicional `Sin comite`.

Columnas minimas:

- codigo del comite
- nombre del comite
- estado activo/inactivo del comite
- total asignado
- asociados activos
- asociados inactivos
- asociados suspendidos
- asociados en proceso

Los comites sin asociados deben aparecer con conteo cero cuando no se haya elegido
otro comite en los filtros.

### 5.5 Detalle de asociados

Mostrar una fila por asociado con:

- comite o `Sin comite`
- codigo del comite
- razon social
- codigo interno del asociado
- RUC
- estado del asociado
- categoria
- fecha de incorporacion al comite

La fila debe navegar a:

```txt
/asociados/:id
```

`joined_at` es una fecha calendario y debe mostrarse mediante las utilidades de
`src/utils/dateOnly.js`.

### 5.6 Filtros

Agregar filtros por:

- busqueda por comite, razon social, codigo interno o RUC
- comite, con opciones `Todos` y `Sin comite`
- estado del asociado
- categoria del asociado

Contrato obligatorio:

```txt
DEFAULT_COMMITTEE_REPORT_FILTERS = {
  search: '',
  committeeId: '',
  statusCode: '',
  categoryCode: ''
}

WITHOUT_COMMITTEE = 'WITHOUT_COMMITTEE'
```

- `committeeId` usa el UUID del comite o `WITHOUT_COMMITTEE`
- `statusCode` usa el codigo estable de `ASSOCIATE_STATUS`
- `categoryCode` usa `category.code`, siguiendo el patron actual de reportes
- los selectores de estado y categoria se construyen desde los datos normalizados
- no se deben mezclar UUID, etiqueta y codigo dentro de un mismo filtro
- la accion `Limpiar` restablece exactamente `DEFAULT_COMMITTEE_REPORT_FILTERS`

Todos los indicadores, graficos, resumen, detalle y exportaciones deben respetar
los mismos filtros.

Reglas exactas de filtrado:

1. `filteredAssociates` se calcula aplicando comite, estado, categoria y busqueda
   sobre la lista normalizada de asociados.
2. La busqueda coincide contra nombre/codigo del comite, razon social, codigo
   interno, RUC y la etiqueta normalizada `Sin comite`.
3. Sin filtro de comite ni busqueda, el resumen conserva todos los comites no
   eliminados y la fila `Sin comite`, aunque sus conteos resulten cero.
4. Al elegir un comite concreto, el resumen muestra solo ese comite, incluso si
   los demas filtros dejan su conteo en cero.
5. Al elegir `Sin comite`, el resumen muestra solo esa fila.
6. Con busqueda activa, el resumen muestra los comites cuyo codigo o nombre
   coincide y los comites referenciados por asociados coincidentes. Un comite cuyo
   nombre coincide permanece visible aunque no tenga asociados.
   La fila `Sin comite` permanece visible cuando la busqueda coincide con esa
   etiqueta o con al menos un asociado no asignado.
7. Estado y categoria recalculan los conteos, pero no eliminan por si solos las
   filas candidatas del resumen.
8. Indicadores, graficos y detalle se calculan exclusivamente desde
   `filteredAssociates`; los comites con cero no se agregan a los graficos.

Estas reglas deben implementarse en `buildCommitteeReportModel`, no en los
componentes.

### 5.7 Estados de interfaz

La pestana debe manejar:

- carga inicial
- error de consulta
- ausencia total de datos
- resultado vacio por filtros
- exportacion deshabilitada solo cuando no existen filas de resumen ni de detalle

Un comite con cero asociados sigue siendo una fila de resumen valida. Por tanto,
debe poder exportarse aunque la hoja de detalle quede vacia.

## 6. Exportacion Excel

La exportacion propia de la pestana debe generar un archivo multihoja:

```txt
reporte_comites_DD-MM-YYYY.xlsx
```

Debe reutilizar el patron actual:

```txt
reportFilename('reporte_comites', formatDate(new Date()))
```

La fecha del nombre de archivo sigue el formato vigente del modulo Reportes. No se
debe introducir un segundo generador de nombres.

La pestana muestra una sola accion `Exportar Excel` en el encabezado de la seccion
`Resumen por comite`. Esa accion genera las dos hojas. La seccion de detalle no
debe agregar un segundo boton de exportacion.

Hojas:

```txt
Resumen comités
Asociados por comité
```

### 6.1 Hoja de resumen

Debe contener las columnas definidas en el resumen por comite y respetar los
filtros activos.

### 6.2 Hoja de detalle

Debe contener las columnas definidas en el detalle de asociados y respetar los
filtros activos.

### 6.3 Exportar todo

El boton global `Exportar todo` debe incorporar ambas hojas sin filtros locales,
usando nombres que no colisionen con las hojas existentes.

La exportacion global pasa de siete a nueve hojas. Las dos nuevas se agregan al
final con estos nombres exactos:

```txt
Resumen comités
Asociados por comité
```

`Exportar todo` debe invocar la misma funcion pura que usa la pestana, pasando los
filtros iniciales. No debe volver a implementar agrupamientos ni reglas de conteo.

### 6.4 Auditoria

Toda descarga debe reutilizar la auditoria centralizada:

```txt
entity_name = excel_exports
action_type = export_excel
```

Debe registrar nombre del archivo, hojas, columnas y cantidad de filas. Si la
auditoria falla, la descarga se bloquea.

No se debe crear una segunda implementacion de auditoria dentro de la pestana.

## 7. Alcance tecnico

### 7.1 Vista SQL

Crear una migracion aditiva con la vista obligatoria:

```txt
public.report_committee_assignments_current
```

La vista debe:

- usar `security_invoker = true`
- devolver una fila por asociado no eliminado
- usar `left join` para conservar asociados sin comite
- unir solo el vinculo principal vigente y no eliminado
- exponer datos de comite, asociado, estado, categoria y `joined_at`
- comprobar `has_module_permission('reportes', 'read')`
- no exponer asignaciones historicas cerradas

La estructura de joins debe preservar expresamente a los asociados sin comite:

```sql
from public.associates a
left join public.associate_committees ac
  on ac.associate_id = a.id
 and ac.is_primary = true
 and ac.is_active = true
 and ac.is_deleted = false
left join public.committees c
  on c.id = ac.committee_id
 and c.is_deleted = false
```

Los predicados de `associate_committees` y `committees` deben permanecer en las
clausulas `ON`. No deben moverse al `WHERE`, porque eso convertiria la consulta en
un filtro efectivo de tipo `inner join` y eliminaria los asociados sin comite.

El `WHERE` se limita a:

```sql
where a.is_deleted = false
  and public.has_module_permission('reportes', 'read')
```

Campos obligatorios:

```txt
associate_id
associate_internal_code
associate_company_name
associate_ruc
associate_status_code
associate_status_label
category_code
category_name
committee_assignment_id
committee_id
committee_code
committee_name
committee_is_active
joined_at
```

La vista no debe realizar los agrupamientos finales. El frontend debe derivar
indicadores, graficos y resumen desde una unica lista normalizada para evitar
conteos divergentes al filtrar.

### 7.2 Politicas RLS

Agregar politicas de solo lectura para `reportes:read` en:

```txt
committees
associate_committees
```

Nombres obligatorios:

```txt
committees_reports_read
associate_committees_reports_read
```

Expresiones obligatorias:

```sql
create policy committees_reports_read on public.committees
  for select to authenticated
  using (
    is_deleted = false
    and public.has_module_permission('reportes', 'read')
  );

create policy associate_committees_reports_read on public.associate_committees
  for select to authenticated
  using (
    is_deleted = false
    and public.has_module_permission('reportes', 'read')
  );
```

La migracion debe reafirmar de forma idempotente los privilegios base requeridos
por la vista `security_invoker`:

```sql
grant select on public.committees, public.associate_committees to authenticated;
```

Estos grants ya existen desde S16 y no amplian las filas visibles: RLS continua
decidiendo el acceso. S19 no debe conceder privilegios de escritura.

Reglas:

- conservar las politicas existentes de `comites` y `asociados`
- limitar la lectura a registros no eliminados
- no otorgar permisos de insert, update o delete
- otorgar `select` sobre la vista solo a `authenticated`
- impedir que un usuario sin `reportes:read` obtenga filas desde la vista

Los `DROP POLICY IF EXISTS` solo pueden reemplazar
`committees_reports_read` y `associate_committees_reports_read`. No se deben
eliminar tablas, datos ni politicas de otros hitos.

### 7.3 Servicio y hook

Agregar a `reportsService`:

```txt
getCommitteesReport()
```

Debe consultar en paralelo:

- la vista de asignaciones actuales
- el catalogo de comites no eliminados, para conservar comites con conteo cero

La respuesta normalizada debe ser:

```txt
{
  committees: [
    {
      id,
      code,
      name,
      is_active
    }
  ],
  associates: [
    {
      id: associate_id,
      assignment_id,
      internal_code,
      company_name,
      ruc,
      joined_at,
      associate_status,
      category,
      committee
    }
  ]
}
```

Reglas del contrato:

- `associates[].id` siempre es `associate_id`, para navegacion y `ReportTable`
- `assignment_id` puede ser `null` cuando el asociado no tiene comite
- `committee` puede ser `null` y representa `Sin comite`
- cada fila de resumen usa `id = committee.id`
- la fila `Sin comite` usa el identificador estable `WITHOUT_COMMITTEE`
- no se deben usar indices del arreglo como identificadores de tabla

Extender `useReportData` con el tipo `committees`.

### 7.4 Funciones puras

Crear un archivo dedicado:

```txt
src/utils/committeeReportUtils.js
```

Debe exponer una funcion compartida:

```txt
buildCommitteeReportModel(reportData, filters)
```

La funcion debe devolver:

```txt
{
  filteredAssociates,
  summaryRows,
  indicators,
  distributionByCommittee,
  distributionByStatus
}
```

Contrato de `indicators`:

```txt
{
  totalAssociates,
  unassignedAssociates,
  representedCommittees,
  assignmentCoveragePercentage,
  emptyActiveCommittees,
  largestCommittee: {
    id,
    name,
    total
  },
  averageAssociatesPerCommittee
}
```

Formulas obligatorias:

```txt
totalAssociates = filteredAssociates.length
assignedCount = asociados con committee.id, solo como valor interno
unassignedAssociates = asociados con committee = null
representedCommittees = cantidad de committee.id distintos, sin contar Sin comite
assignmentCoveragePercentage = assignedCount / totalAssociates * 100
emptyActiveCommittees = comites activos de summaryRows con total_assigned = 0
largestCommittee = fila real con total_assigned > 0 y mayor conteo; empate por nombre ascendente
averageAssociatesPerCommittee = assignedCount / representedCommittees
```

La cobertura se redondea al entero mas cercano y el promedio a un decimal. Cuando
el denominador es cero, el resultado es cero. `largestCommittee` usa
`{ id: null, name: '', total: 0 }` cuando no existe un comite representado.

Contrato de cada fila de `summaryRows`:

```txt
{
  id,
  committee_code,
  committee_name,
  committee_status,
  total_assigned,
  active_count,
  inactive_count,
  suspended_count,
  in_process_count
}
```

Para un comite real, `id` es su UUID. Para `Sin comite`, `id` es
`WITHOUT_COMMITTEE`, codigo y estado quedan vacios, y el nombre es `Sin comite`.

Los conteos usan `associate_status.code`. Para cada fila debe cumplirse:

```txt
total_assigned = active_count + inactive_count + suspended_count + in_process_count
```

`committee_status` se obtiene como `Activo` o `Inactivo` desde `committee.is_active`.

`distributionByCommittee` y `distributionByStatus` son objetos
`Record<string, number>` cuyas claves son etiquetas visibles y cuyos valores son
conteos de `filteredAssociates`.

Orden obligatorio:

- `summaryRows`: comites por nombre ascendente y `Sin comite` al final
- `filteredAssociates`: nombre de comite ascendente, luego razon social ascendente
- asociados sin comite: despues de los comites, ordenados por razon social
- tabla y Excel conservan el mismo orden producido por la utilidad

Internamente debe resolver:

- aplicar todos los filtros
- agrupar asociados por comite
- agrupar por estado
- construir filas de resumen
- calcular indicadores

Las filas de resumen y detalle deben tener shapes compatibles con
`REPORT_TABLE_COLUMNS` y `EXPORT_COLUMNS`, evitando un segundo mapeo de negocio.

Nombres obligatorios de configuracion:

```txt
REPORT_TABLE_COLUMNS.committeeSummary
REPORT_TABLE_COLUMNS.committeeAssociates
EXPORT_COLUMNS.committeeSummary
EXPORT_COLUMNS.committeeAssociates
```

`committeeAssociates` consume directamente `filteredAssociates`, usando rutas
anidadas como `committee.name`, `associate_status.label` y `category.name`.

La pestana debe invocarla con los filtros activos. `Exportar todo` debe invocarla
con `DEFAULT_COMMITTEE_REPORT_FILTERS`. Asi pantalla, exportacion individual y
exportacion global comparten exactamente las mismas reglas.

La pagina no debe duplicar estas reglas ni mutar los datos recibidos.

### 7.5 Componentes

Crear o modificar estos componentes:

```txt
src/pages/reports/sections/CommitteesReportTab.jsx
src/components/molecules/reports/CommitteeReportFilters.jsx
src/components/molecules/reports/CommitteeReportKpis.jsx
src/components/molecules/reports/ReportsExportAllButton.jsx
src/components/molecules/reports/ReportSection.jsx
src/components/molecules/reports/ReportExportButton.jsx
```

Se deben reutilizar `ReportKpiCard`, `DistributionChart`, `ReportSection` y
`ReportTable`. Ningun componente nuevo o modificado debe superar 120 lineas.

`ReportsPage.jsx` ya se encuentra cerca del limite. Antes de agregar la nueva
pestana se debe extraer su funcion interna `ExportAllButton` a
`ReportsExportAllButton.jsx`. La consulta global, construccion de hojas y estado de
carga quedan en el componente extraido; `ReportsPage` conserva solo la orquestacion
de pestanas.

Para representar el estado de exportacion requerido se debe extender el contrato
reutilizable:

```txt
ReportSection({ ..., exportDisabled = false })
ReportExportButton({ ..., disabled = false })
```

`ReportSection` pasa `exportDisabled` como `disabled` a `ReportExportButton`, y
`ReportExportButton` lo entrega al atomo `Button`. El estado de carga existente se
conserva y `Button` sigue combinando `disabled || loading`.

`CommitteesReportTab` calcula:

```txt
exportDisabled = summaryRows.length === 0 && filteredAssociates.length === 0
```

No se debe ocultar el boton cuando un comite con cero asociados produce una fila
de resumen valida.

Las siete tarjetas deben renderizarse en `CommitteeReportKpis.jsx`. La pestana solo
entrega el objeto `indicators`; no debe recalcular formulas dentro del componente.

### 7.6 Tipos y configuracion

- agregar interfaces del reporte en `src/types/reports.ts`
- agregar tabla y columnas Excel en las configuraciones existentes
- agregar la pestana sin cambiar las rutas publicas
- mantener imports dinamicos de `xlsx` y `file-saver`
- actualizar `.agent/docs/hito_s13_roles_permisos_operativos.md` con la extension
  de lectura S19 sobre `committees` y `associate_committees`
- actualizar `.agent/docs/hito_s5_implementation_summary.md` con la nueva vista,
  pestana y las nueve hojas finales de la exportacion global
- actualizar `.agent/docs/hito_8_implementation_summary.md` para que su diagrama y
  listado de reportes incluyan `Comites` y corrijan el total a nueve hojas
- agregar al checklist `.agent/docs/qa_checklist_mvp.md` los casos de reporte,
  filtros y Excel de comites
- cambiar S19 de propuesto a implementado en
  `.agent/hitos/subsanacion/mapa_ejecucion_hitos_s.md` solo despues de completar
  migracion, codigo y validaciones

Interfaces minimas requeridas:

```txt
CommitteeReportCommittee
CommitteeReportAssociate
CommitteeReportData
CommitteeReportFilters
CommitteeReportIndicators
CommitteeReportSummaryRow
```

El control original `reportes_operational_read_policies = 5` del audit S13 no debe
cambiar, porque valida exclusivamente las cinco politicas creadas por S13. Las dos
politicas nuevas deben tener nombres propios y validarse en el audit S19.

## 8. Seguridad y permisos

La pestana usa exclusivamente:

```txt
reportes:read
```

Comportamiento esperado:

- Alta Direccion puede consultar el reporte sin recibir acceso a `/comites`
- un usuario con `comites:read` pero sin `reportes:read` no ve la pestana de reportes
- un usuario sin `reportes:read` no puede consultar la vista directamente
- ningun permiso de reportes permite crear, editar, asignar o inactivar comites

## 9. Migracion y auditoria SQL

Crear durante la implementacion:

```txt
supabase/migrations/YYYYMMDDHHMMSS_s19_committee_reports.sql
supabase/audits/hito_s19_committee_reports_audit.sql
```

El audit debe comprobar:

- existencia y `security_invoker` de la vista
- columnas esperadas
- grant de lectura a `authenticated`
- privilegio `select` de `authenticated` sobre ambas tablas base
- politicas `reportes:read` en ambas tablas
- ausencia de permisos de escritura adicionales
- politicas `committees_reports_read` y `associate_committees_reports_read`
- ausencia de cambios sobre las cinco politicas S13
- un solo registro por asociado en la fotografia actual
- ausencia de asignaciones cerradas o eliminadas
- consistencia entre asignados y sin comite

## 10. Fuera de alcance

- reporte historico por rango de fechas
- entradas y salidas mensuales de comites
- reactivar o modificar asignaciones desde Reportes
- administrar comites desde la pestana
- contar vinculos secundarios futuros
- crear una nueva ruta o modulo de permisos
- duplicar datos en una tabla de resumen persistente
- exportar sin auditoria

## 11. Archivos probables

```txt
supabase/migrations/YYYYMMDDHHMMSS_s19_committee_reports.sql
supabase/audits/hito_s19_committee_reports_audit.sql
src/services/reports.service.js
src/hooks/useReportData.js
src/utils/reportConfigs.js
src/utils/committeeReportUtils.js
src/utils/exportUtils.js
src/types/reports.ts
src/pages/reports/ReportsPage.jsx
src/pages/reports/sections/CommitteesReportTab.jsx
src/components/molecules/reports/CommitteeReportFilters.jsx
src/components/molecules/reports/CommitteeReportKpis.jsx
src/components/molecules/reports/ReportsExportAllButton.jsx
src/components/molecules/reports/ReportSection.jsx
src/components/molecules/reports/ReportExportButton.jsx
.agent/docs/hito_s13_roles_permisos_operativos.md
.agent/docs/hito_s5_implementation_summary.md
.agent/docs/hito_8_implementation_summary.md
.agent/docs/qa_checklist_mvp.md
.agent/docs/hito_s19_implementation_summary.md
.agent/hitos/subsanacion/mapa_ejecucion_hitos_s.md
```

## 12. Criterios de aceptacion

El hito queda cerrado cuando:

- existe la pestana `Comites` dentro de `/reportes`
- el conteo usa solo asignaciones principales vigentes y no eliminadas
- asociados de todos los estados participan en el total
- asociados sin comite se identifican por separado
- comites sin asociados muestran conteo cero
- comites sin asociados pueden exportarse aunque la hoja de detalle este vacia
- indicadores, graficos y tablas coinciden entre si
- cobertura, comites vacios, comite mayor y promedio responden a los filtros
- el comite mayor excluye `Sin comite` y resuelve empates alfabeticamente
- el total de cada fila resumen coincide con la suma de sus cuatro estados
- busqueda y filtros se pueden combinar
- comite usa UUID y estado/categoria usan codigos estables sin mezclar identificadores
- la busqueda conserva un comite sin asociados cuando coincide con su nombre o codigo
- estado y categoria recalculan conteos sin eliminar las filas base del resumen
- el detalle navega a la ficha del asociado
- el Excel contiene resumen y detalle filtrados
- `Exportar todo` incorpora las dos hojas de comites
- la pestana y `Exportar todo` usan `buildCommitteeReportModel`
- tabla y Excel usan las mismas filas `committeeSummary` y `committeeAssociates`
- tabla y Excel conservan el mismo orden estable
- las tablas usan identificadores estables y nunca el indice del arreglo
- cada descarga queda registrada en auditoria
- `joined_at` no cambia de dia por zona horaria
- un usuario con solo `reportes:read` puede consultar el reporte
- un usuario sin `reportes:read` no puede consultar la vista
- no se conceden permisos de escritura adicionales
- `ReportsPage.jsx` y todos los componentes modificados permanecen bajo 120 lineas
- `ReportSection` y `ReportExportButton` propagan correctamente `exportDisabled`
- la documentacion S13 registra la extension sin alterar su control original de cinco politicas
- los resumenes S5/Hito 8, checklist QA y mapa de ejecucion quedan actualizados
- el audit SQL pasa
- `yarn lint` pasa
- `yarn build` pasa
- `git diff --check` pasa

## 13. Validacion manual recomendada

1. Preparar un comite con varios asociados de diferentes estados.
2. Preparar un comite sin asociados.
3. Mantener al menos un asociado sin comite.
4. Abrir `/reportes` y seleccionar `Comites`.
5. Comparar los conteos con las fichas de los comites.
6. Filtrar por cada comite y por `Sin comite`.
7. Combinar comite, estado, categoria y busqueda.
8. Confirmar que graficos, resumen y detalle usan el mismo resultado.
9. Validar cobertura, comites vacios, comite mayor y promedio con y sin filtros.
10. Probar un empate de comites y confirmar el desempate alfabetico.
11. Navegar desde una fila hacia la ficha del asociado.
12. Exportar y validar ambas hojas contra el resultado filtrado.
13. Usar `Exportar todo` y confirmar las hojas de comites.
14. Verificar el evento `excel_exports` / `export_excel` en Auditoria.
15. Probar con Alta Direccion y con un usuario sin `reportes:read`.

## 14. Decision recomendada

Implementar S19 como una pestana analitica del modulo Reportes, no como una
extension del mantenimiento `/comites`.

La fuente debe ser una vista actual de asociados con su comite principal vigente.
Los agrupamientos se derivan desde esa unica lista para que filtros, indicadores,
graficos, tablas y Excel produzcan los mismos totales.
