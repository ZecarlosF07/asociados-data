# Hito S7: Corrección post-release del Hito 6 - Fechas de membresías y cronograma de cobro

## 1. Objetivo del hito

Corregir el bug de fechas calendario detectado en el módulo de membresías y cronograma de pagos. La fecha de inicio, fecha de fin y fechas de vencimiento deben respetar exactamente el día calendario ingresado por el usuario, sin desplazamientos por zona horaria, y el cronograma mensual debe calcularse desde la fecha de inicio de la membresía usando el día de cobro configurado.

Este hito se considera una corrección post-release del **Hito 6: Membresías, pagos y cobranza** y del **Hito S3: Subsanación del Hito 6**, porque afecta la consistencia del cronograma financiero ya implementado.

## 2. Hito original que corrige

Este hito corrige el comportamiento del **Hito 6: Membresías, pagos y cobranza**.

El Hito 6 exige:

- registrar membresías con vigencia
- generar cronograma de pagos
- definir fechas de cobro o vencimiento
- identificar cuotas pendientes, vencidas o pagadas
- mantener consistencia entre membresía, cronograma y pagos

La brecha detectada es que las fechas tipo `date` se están tratando como timestamps JavaScript, lo que desplaza visualmente y lógicamente las fechas en zonas horarias como Perú.

## 3. Problema detectado

### 3.1 Síntoma funcional

Al crear una membresía con:

- fecha de inicio: `01/01/2026`
- fecha de fin: `31/12/2026`
- día de cobro mensual: `1`

la interfaz muestra:

- inicio: `31/12/2025`
- fin: `30/12/2026`
- primer período del cronograma: `12/2025`
- vencimiento visible: `30/11/2025` o fechas desplazadas un día hacia atrás

### 3.2 Causa técnica

El frontend usa `new Date('YYYY-MM-DD')` para fechas provenientes de columnas `date`.

En JavaScript, una cadena `YYYY-MM-DD` se interpreta como medianoche UTC. En una zona horaria como `America/Lima` (`UTC-5`), al formatear esa fecha en hora local se muestra el día anterior.

Ejemplo:

```txt
new Date('2026-01-01') mostrado en es-PE => 31/12/2025
new Date('2026-12-31') mostrado en es-PE => 30/12/2026
```

Además, `membershipsService.generateSchedule(...)` calcula `year`, `month` y `startMonth` a partir de `new Date(membership.start_date)`, por lo que el cronograma puede iniciar en el mes anterior al correcto.

## 4. Alcance funcional

### 4.1 Fechas de membresía

El sistema debe mostrar exactamente:

- `start_date` como la fecha de inicio registrada
- `end_date` como la fecha de fin registrada
- fechas de cronograma sin desplazamiento por zona horaria

Si la membresía se registra con `2026-01-01`, debe mostrarse como `01/01/2026`.

Si la membresía se registra con `2026-12-31`, debe mostrarse como `31/12/2026`.

### 4.2 Cronograma mensual

Para membresías mensuales:

- El cálculo debe partir de `membership.start_date`.
- El día de vencimiento debe respetar `membership.monthly_billing_day`.
- El cronograma debe generar 12 obligaciones mensuales.
- `period_year` y `period_month` deben corresponder al período real de la obligación.
- Ninguna cuota debe quedar con fecha de vencimiento anterior a la fecha de inicio de la membresía.

Regla base:

- Si el día de cobro es mayor o igual al día de inicio, el primer vencimiento ocurre en el mismo mes de inicio.
- Si el día de cobro es menor al día de inicio, el primer vencimiento ocurre en el mes siguiente.

Ejemplos esperados:

| Fecha inicio | Día cobro | Primer vencimiento esperado |
|---|---:|---|
| `2026-01-01` | 1 | `2026-01-01` |
| `2026-01-15` | 20 | `2026-01-20` |
| `2026-01-15` | 1 | `2026-02-01` |

### 4.3 Membresía anual

Para membresías anuales:

- Debe mantenerse una sola obligación.
- La fecha de vencimiento debe ser la fecha de inicio de la membresía, salvo que el negocio defina una regla distinta.
- Si `end_date` no viene informado, debe calcularse como `start_date + 1 año - 1 día`.
- El cálculo debe hacerse como fecha calendario, no como timestamp UTC.

### 4.4 Estados de vencimiento

Las comparaciones de vencimiento deben hacerse contra fecha calendario local normalizada, no comparando `new Date('YYYY-MM-DD')` directamente contra `new Date()`.

Esto aplica a:

- tabla de cronograma
- resumen financiero
- página de cuotas pendientes
- reportes de cobranza
- dashboard financiero

## 5. Alcance técnico

### 5.1 Utilidad centralizada para fechas calendario

Crear una utilidad centralizada, por ejemplo:

```txt
src/utils/dateOnly.js
```

Debe exponer funciones puras como mínimo:

- `parseDateOnly(dateString)`
- `formatDateOnly(dateString)`
- `toDateOnlyString(datePartsOrDate)`
- `compareDateOnly(a, b)`
- `isBeforeDateOnly(a, b)`
- `addMonthsToDateOnly(dateString, months)`
- `buildDateOnly(year, month, day)`
- `getDateOnlyParts(dateString)`

Reglas:

- No usar `new Date('YYYY-MM-DD')` directamente.
- Parsear `YYYY-MM-DD` manualmente.
- Construir fechas con `new Date(year, monthIndex, day)` solo cuando se requiera un objeto `Date` local.
- Retornar strings `YYYY-MM-DD` para persistencia.
- Mantener funciones pequeñas, puras y reutilizables.

### 5.2 Formateo visual

Actualizar el formateo de fechas para que `formatDate(...)` no desplace fechas tipo `date`.

Opciones aceptadas:

- Ajustar `src/utils/helpers.js` para detectar strings `YYYY-MM-DD` y tratarlos como fecha calendario.
- O crear `formatDateOnly(...)` y reemplazar usos donde el dato venga de columnas `date`.

Debe conservarse `formatDateTime(...)` para timestamps reales (`created_at`, `updated_at`, `paid_at`, etc.).

### 5.3 Generación de cronograma

Actualizar:

```txt
src/services/memberships.service.js
```

En `generateSchedule(...)`:

- reemplazar `new Date(membership.start_date)`
- calcular año, mes y día desde `start_date` como fecha calendario
- calcular vencimientos usando `monthly_billing_day`
- evitar que el primer vencimiento quede antes de `start_date`
- generar strings `YYYY-MM-DD` sin depender de `toISOString().split('T')[0]`
- mantener `expected_amount` y estados actuales

### 5.4 Validación del formulario

Actualizar:

```txt
src/utils/financialValidation.js
src/components/molecules/financial/MembershipForm.jsx
```

Validaciones esperadas:

- `start_date` obligatorio
- `fee_amount` mayor a cero
- `monthly_billing_day` requerido para membresía mensual
- `monthly_billing_day` entre 1 y 28 mientras esa sea la regla vigente de UI
- `end_date`, si existe, no puede ser anterior a `start_date`

Si el tipo de membresía no está disponible directamente en el validador, resolverlo en el componente o pasar metadata mínima al validador.

### 5.5 Revisión de comparaciones de vencimiento

Revisar y corregir usos de:

```js
new Date(s.due_date) < new Date()
```

Archivos identificados:

- `src/components/molecules/financial/ScheduleTable.jsx`
- `src/components/molecules/financial/AssociateFinancialSummary.jsx`
- `src/pages/financial/PendingPaymentsPage.jsx`
- `src/pages/reports/sections/PaymentsCollectionsReportTab.jsx`
- `src/pages/dashboard/DashboardPage.jsx`

Estas comparaciones deben usar utilidades de fecha calendario.

### 5.6 Revisión de exportaciones y reportes

Validar que las fechas exportadas a Excel y reportes no salgan desplazadas.

Archivos a revisar:

- `src/utils/exportUtils.js`
- `src/utils/reportConfigs.js`
- `src/services/reports.service.js`

## 6. Archivos principales a tocar

Como mínimo:

- `src/utils/helpers.js`
- `src/utils/dateOnly.js` o nombre equivalente
- `src/services/memberships.service.js`
- `src/utils/financialValidation.js`
- `src/components/molecules/financial/MembershipForm.jsx`
- `src/components/molecules/financial/MembershipList.jsx`
- `src/components/molecules/financial/ScheduleTable.jsx`
- `src/components/molecules/financial/AssociateFinancialSummary.jsx`
- `src/pages/financial/PendingPaymentsPage.jsx`
- `src/pages/reports/sections/PaymentsCollectionsReportTab.jsx`
- `src/pages/dashboard/DashboardPage.jsx`
- `src/utils/exportUtils.js`

No se espera cambio estructural de base de datos. Las columnas `date` existentes son correctas.

## 7. Datos existentes y remediación

El bug pudo haber generado cronogramas existentes con fechas incorrectas.

El desarrollador debe:

1. Identificar membresías creadas con cronogramas desplazados.
2. Verificar si tienen pagos asociados.
3. No regenerar cronogramas con pagos asociados sin una regla explícita de conservación.
4. Preparar un audit SQL para detectar inconsistencias.
5. Preparar un script de corrección solo si el responsable de BD lo aprueba.

Audit sugerido:

```txt
supabase/audits/hito_s7_membership_date_audit.sql
```

Debe detectar:

- cronogramas cuyo primer período no corresponde a la fecha de inicio
- cuotas con `due_date` anterior a `memberships.start_date`
- cuotas cuyo día de vencimiento no coincide con `monthly_billing_day`
- membresías mensuales con menos o más de 12 cuotas activas
- membresías con cuotas pagadas que requieren revisión manual antes de regenerar

## 8. Tareas para el desarrollador

1. Crear utilidad centralizada para fechas calendario.
2. Ajustar el formateo visual de fechas `date`.
3. Refactorizar `generateSchedule(...)` para no usar parseo UTC.
4. Implementar regla de primer vencimiento según fecha de inicio y día de cobro.
5. Validar membresía mensual con día de cobro obligatorio.
6. Validar que `end_date` no sea menor que `start_date`.
7. Corregir comparaciones de vencimiento en cronograma, resumen, cobranza, reportes y dashboard.
8. Validar exportaciones Excel con fechas correctas.
9. Crear audit SQL de detección de cronogramas inconsistentes.
10. Probar creación de membresía mensual desde ficha de asociado.
11. Probar renovación de membresía.
12. Probar membresía anual.
13. Ejecutar `yarn lint`.
14. Ejecutar `yarn build`.

## 9. Casos de prueba obligatorios

### 9.1 Mensual desde primer día del mes

Entrada:

- tipo: mensual
- inicio: `2026-01-01`
- fin: `2026-12-31`
- día cobro: `1`

Resultado esperado:

- inicio visible: `01/01/2026`
- fin visible: `31/12/2026`
- primer período: `01/2026`
- primer vencimiento: `01/01/2026`
- último período: `12/2026`
- último vencimiento: `01/12/2026`

### 9.2 Mensual con cobro posterior al inicio

Entrada:

- tipo: mensual
- inicio: `2026-01-15`
- día cobro: `20`

Resultado esperado:

- primer período: `01/2026`
- primer vencimiento: `20/01/2026`
- no hay fechas anteriores al inicio

### 9.3 Mensual con cobro anterior al inicio

Entrada:

- tipo: mensual
- inicio: `2026-01-15`
- día cobro: `1`

Resultado esperado:

- primer vencimiento: `01/02/2026`
- no hay cuotas con vencimiento anterior a `15/01/2026`
- el comportamiento queda documentado como regla de negocio

### 9.4 Anual

Entrada:

- tipo: anual
- inicio: `2026-01-01`
- fin vacío

Resultado esperado:

- fin calculado: `2026-12-31`
- una sola obligación
- vencimiento: `01/01/2026`
- visualización sin desplazamiento

### 9.5 Comparación de vencidos

Entrada:

- cuota con `due_date = fecha actual`

Resultado esperado:

- no debe marcarse vencida hasta el día siguiente calendario.

## 10. Definition of Done

Este hito se considera terminado cuando:

- Las fechas `YYYY-MM-DD` se muestran sin desplazamiento por zona horaria.
- La membresía creada con inicio `01/01/2026` se muestra como `01/01/2026`.
- La fecha de fin `31/12/2026` se muestra como `31/12/2026`.
- El cronograma mensual inicia desde la fecha de inicio real de la membresía.
- Los vencimientos respetan `monthly_billing_day`.
- No se generan cuotas con vencimiento anterior a `start_date`.
- Las comparaciones de vencido usan fecha calendario.
- Reportes y exportaciones no desplazan fechas.
- Existe audit SQL para detectar cronogramas inconsistentes existentes.
- Los casos de prueba obligatorios están documentados o validados.
- `yarn lint` pasa.
- `yarn build` pasa.

## 11. Fuera de alcance

No forma parte de este hito:

- Cambiar el modelo de datos de `memberships` o `payment_schedules`.
- Rediseñar pagos parciales o cobranza.
- Cambiar el cálculo de monto mensual.
- Implementar prorrateo por días.
- Regenerar automáticamente cronogramas con pagos asociados sin aprobación explícita del responsable de BD.

