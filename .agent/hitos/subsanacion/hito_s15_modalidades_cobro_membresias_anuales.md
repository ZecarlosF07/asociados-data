# Hito S15: Evolucion post-release del Hito 6 - Modalidades de cobro para membresias anuales

## 1. Objetivo del hito

Extender el modulo financiero para soportar nuevas modalidades de cobro sobre una membresia de cobertura anual:

- mensual
- trimestral
- cuatrimestral
- semestral
- anual

La membresia sigue siendo anual en vigencia. La modalidad no cambia la duracion base de la membresia; solo define cada cuanto se generan las cuotas del cronograma dentro de ese periodo anual.

Este hito debe permitir registrar una membresia anual y generar automaticamente su cronograma de cobro segun la modalidad seleccionada, respetando la fecha de inicio, el dia de cobro y las reglas de fechas calendario ya corregidas en hitos anteriores.

## 2. Hitos que evoluciona

Este hito evoluciona y refuerza:

- **Hito 6 - Membresias, pagos y cobranza**
- **S3 - Subsanacion del Hito 6: membresias, pagos y cobranza**
- **S7 - Correccion de fechas de membresias y cronograma**
- **S12 - Correccion de vencimiento de membresia anual**
- **S14 - Hardening preproduccion: auditoria confiable y fechas de pago**

La razon es que el sistema ya tiene:

- tabla `memberships`
- tabla `payment_schedules`
- catalogo `MEMBERSHIP_TYPE`
- formulario de membresia
- generacion automatica de cronograma
- pagos transaccionales por RPC
- utilidades `dateOnly.js` para fechas calendario

Este hito no debe rehacer el modelo financiero. Debe extender la regla actual de generacion de cronograma.

## 3. Estado actual detectado

### 3.1 Tipos de membresia

El catalogo `MEMBERSHIP_TYPE` contiene actualmente:

```txt
MENSUAL
ANUAL
```

Archivo base:

```txt
supabase/migrations/20260312120000_seed_catalog_items.sql
```

El frontend consume este catalogo desde:

```txt
src/components/molecules/financial/MembershipForm.jsx
src/pages/financial/MembershipsPage.jsx
src/utils/financialConstants.js
```

### 3.2 Generacion de cronograma

La logica esta centralizada en:

```txt
src/services/memberships.service.js
```

Metodo:

```txt
membershipsService.generateSchedule(...)
```

Comportamiento actual:

- `MENSUAL`: genera 12 cuotas.
- `ANUAL`: genera 1 cuota con vencimiento al dia siguiente de la fecha fin efectiva.

La logica ya usa helpers de fecha calendario:

```txt
getDateOnlyParts
buildDateOnly
addDaysToDateOnly
addYearsToDateOnly
todayDateOnly
```

### 3.3 Formulario

El formulario de membresia tiene el campo:

```txt
monthly_billing_day
```

Actualmente se muestra como "Dia de cobro mensual" y se exige solo para membresias mensuales.

Para este hito, el campo debe interpretarse como dia de cobro de modalidades periodicas. El nombre de columna puede mantenerse para evitar una migracion innecesaria, pero el texto de UI y la validacion deben aclarar el uso real.

### 3.4 Fechas sensibles

El proyecto ya tuvo bugs donde fechas `date` como `start_date`, `end_date` y `due_date` se desplazaban un dia al ser parseadas como UTC.

Regla vigente:

```txt
No usar new Date('YYYY-MM-DD') ni toISOString() para calcular, comparar o mostrar fechas calendario de negocio.
```

Toda fecha de negocio debe usar:

```txt
src/utils/dateOnly.js
```

## 4. Regla funcional principal

La membresia mantiene cobertura anual.

La modalidad seleccionada define la frecuencia de cobro del cronograma:

| Codigo | Etiqueta | Cuotas | Intervalo |
|---|---|---:|---:|
| MENSUAL | Mensual | 12 | 1 mes |
| TRIMESTRAL | Trimestral | 4 | 3 meses |
| CUATRIMESTRAL | Cuatrimestral | 3 | 4 meses |
| SEMESTRAL | Semestral | 2 | 6 meses |
| ANUAL | Anual | 1 | No aplica a cobros periodicos |

`fee_amount` sigue representando el monto anual total negociado de la membresia.

El monto esperado por cuota se calcula como:

```txt
expected_amount = fee_amount / cantidad_de_cuotas
```

El redondeo debe mantenerse a dos decimales, como la regla mensual actual.

## 5. Reglas de fechas y vencimiento

### 5.1 Vigencia anual

Si `end_date` no viene informado, el sistema debe calcular:

```txt
end_date = start_date + 1 año - 1 dia
```

Esta regla aplica a todas las modalidades.

### 5.2 Dia de cobro

Para modalidades periodicas:

```txt
MENSUAL
TRIMESTRAL
CUATRIMESTRAL
SEMESTRAL
```

el campo `monthly_billing_day` debe ser obligatorio y debe estar entre 1 y 28.

Aunque el nombre tecnico siga siendo `monthly_billing_day`, funcionalmente representa:

```txt
dia de cobro de la modalidad periodica
```

### 5.3 Primer vencimiento

La generacion de cronograma debe partir de `memberships.start_date`.

La primera cuota debe respetar la misma regla ya usada en mensual:

- si `billing_day >= dia(start_date)`, el primer vencimiento cae en el mismo periodo de inicio
- si `billing_day < dia(start_date)`, el primer vencimiento cae en el siguiente periodo de la modalidad

Ejemplos:

| Inicio | Modalidad | Dia cobro | Primer vencimiento |
|---|---|---:|---|
| 2026-01-15 | MENSUAL | 20 | 2026-01-20 |
| 2026-01-15 | MENSUAL | 1 | 2026-02-01 |
| 2026-01-15 | TRIMESTRAL | 20 | 2026-01-20 |
| 2026-01-15 | TRIMESTRAL | 1 | 2026-04-01 |
| 2026-01-15 | CUATRIMESTRAL | 1 | 2026-05-01 |
| 2026-01-15 | SEMESTRAL | 1 | 2026-07-01 |

### 5.4 Membresia anual

La modalidad `ANUAL` conserva la regla corregida en S12:

```txt
vencimiento de cuota anual = end_date efectiva + 1 dia
```

No debe requerir `monthly_billing_day`.

La modalidad `ANUAL` no usa la regla de primer vencimiento por dia de cobro. Su unico vencimiento depende siempre de la fecha fin efectiva.

Ejemplo:

```txt
Inicio: 2026-01-01
Fin:    2026-12-31
Vence:  2027-01-01
```

## 6. Alcance funcional

### 6.1 Nuevas modalidades

Agregar al catalogo `MEMBERSHIP_TYPE`:

```txt
TRIMESTRAL
CUATRIMESTRAL
SEMESTRAL
```

Etiquetas:

```txt
Trimestral
Cuatrimestral
Semestral
```

Orden recomendado:

```txt
MENSUAL        1
TRIMESTRAL    2
CUATRIMESTRAL 3
SEMESTRAL     4
ANUAL         5
```

### 6.2 Formulario de membresia

Actualizar:

```txt
src/components/molecules/financial/MembershipForm.jsx
src/utils/financialValidation.js
```

Cambios esperados:

- cambiar el label "Dia de cobro mensual" por "Dia de cobro"
- actualizar el help text para indicar que aplica a mensual, trimestral, cuatrimestral y semestral
- actualizar el help text de fecha fin para indicar que se calcula automaticamente para la cobertura anual cuando no se informa
- exigir dia de cobro para modalidades periodicas
- mantener dia de cobro no requerido para modalidad anual

### 6.3 Cronograma de pagos

Actualizar:

```txt
src/services/memberships.service.js
```

Cambios esperados:

- reemplazar la logica binaria `MENSUAL` vs `ANUAL`
- crear una configuracion interna por codigo de membresia
- generar cuotas segun cantidad e intervalo de meses
- usar `start_date` como base del cronograma
- aplicar la regla de primer vencimiento con `billing_day`
- conservar la regla anual de S12
- conservar `period_year` y `period_month` coherentes con cada cuota

Pseudocodigo orientativo:

```js
const PAYMENT_FREQUENCIES = {
  MENSUAL: { installments: 12, intervalMonths: 1, requiresBillingDay: true },
  TRIMESTRAL: { installments: 4, intervalMonths: 3, requiresBillingDay: true },
  CUATRIMESTRAL: { installments: 3, intervalMonths: 4, requiresBillingDay: true },
  SEMESTRAL: { installments: 2, intervalMonths: 6, requiresBillingDay: true },
  ANUAL: { installments: 1, intervalMonths: 12, requiresBillingDay: false },
}
```

La configuracion debe quedar en una utilidad o constante reutilizable si tambien se usa en validaciones.

## 7. Alcance tecnico

### 7.1 Base de datos

Crear una migracion nueva en:

```txt
supabase/migrations
```

Debe insertar los nuevos items en `catalog_items` usando el grupo `MEMBERSHIP_TYPE`.

La migracion debe ser idempotente.

No se espera modificar:

```txt
memberships
payment_schedules
payments
collection_actions
```

### 7.2 Servicios

Actualizar:

```txt
src/services/memberships.service.js
```

Requisitos:

- no duplicar bloques de generacion por cada modalidad
- no introducir parseos UTC de fechas calendario
- mantener actualizacion de `end_date` cuando no venga informado
- mantener soft delete y estados existentes sin cambios
- si el tipo de membresia es desconocido, lanzar error explicito

### 7.3 Validaciones

Actualizar:

```txt
src/utils/financialValidation.js
```

Requisitos:

- `start_date` obligatorio
- `fee_amount` mayor a cero
- `membership_status_id` obligatorio
- `membership_type_id` obligatorio
- `end_date`, si existe, no puede ser anterior a `start_date`
- `monthly_billing_day` obligatorio para modalidades periodicas
- `monthly_billing_day` entre 1 y 28

### 7.4 UI

Actualizar:

```txt
src/components/molecules/financial/MembershipForm.jsx
src/components/molecules/financial/MembershipList.jsx
src/pages/financial/MembershipsPage.jsx
```

Cambios esperados:

- mostrar nuevas modalidades desde catalogo sin hardcode innecesario
- ajustar label/help text de dia de cobro
- conservar filtros por tipo de membresia
- conservar exportacion y visualizacion de tipo/categoria/tarifa

### 7.5 Reportes y exportaciones

Revisar:

```txt
src/services/reports.service.js
src/pages/reports/sections/MembershipsReportTab.jsx
src/pages/reports/sections/PaymentsCollectionsReportTab.jsx
src/utils/exportUtils.js
src/utils/reportConfigs.js
```

No se esperan cambios estructurales si los reportes consumen el catalogo. Se debe validar que:

- las nuevas modalidades aparezcan con su etiqueta
- los cronogramas generados tengan periodos correctos
- las exportaciones no desplacen fechas

## 8. Reglas obligatorias de fechas

Este hito no debe reintroducir el bug de fecha del dia anterior.

Esta prohibido usar:

```txt
new Date('YYYY-MM-DD')
toISOString()
```

para calcular, comparar, persistir o mostrar:

```txt
start_date
end_date
due_date
period_year
period_month
payment_date
paid_at
```

Toda fecha calendario de negocio debe usar:

```txt
src/utils/dateOnly.js
```

Funciones esperadas:

```txt
getDateOnlyParts
buildDateOnly
addDaysToDateOnly
addMonthsToDateOnly
addYearsToDateOnly
compareDateOnly
todayDateOnly
formatDateOnly
```

Los timestamps tecnicos como `created_at`, `updated_at`, `deleted_at`, `event_at` y `reversed_at` pueden seguir usando timestamps reales.

## 9. Datos existentes y compatibilidad

### 9.1 Membresias existentes

No se deben regenerar cronogramas existentes automaticamente.

Las membresias ya creadas con `MENSUAL` o `ANUAL` deben conservar su comportamiento.

### 9.2 Nuevas membresias

La nueva logica aplica a membresias creadas despues de implementar este hito.

Si se requiere corregir una membresia existente, debe hacerse con una regla operativa explicita y auditada, fuera del alcance de este hito.

### 9.3 Pagos existentes

No se debe alterar:

```txt
payments
payment_schedules pagados
collection_actions
audit_logs
```

## 10. Auditoria SQL recomendada

Crear un audit SQL opcional:

```txt
supabase/audits/hito_s15_membership_modalities_audit.sql
```

Debe validar:

- existen catalogos `TRIMESTRAL`, `CUATRIMESTRAL`, `SEMESTRAL`
- no hay membresias periodicas nuevas sin `monthly_billing_day`
- cronogramas trimestrales tienen 4 cuotas activas
- cronogramas cuatrimestrales tienen 3 cuotas activas
- cronogramas semestrales tienen 2 cuotas activas
- no existen cuotas con `due_date` anterior a `start_date`
- los dias de vencimiento respetan `monthly_billing_day`
- membresias anuales siguen generando una sola cuota con `due_date = end_date + 1 dia`

## 11. Casos de prueba obligatorios

### 11.1 Mensual con dia posterior al inicio

Entrada:

```txt
tipo: MENSUAL
start_date: 2026-01-15
monthly_billing_day: 20
fee_amount: 1200
```

Resultado:

- 12 cuotas
- primera cuota `2026-01-20`
- monto esperado por cuota `100.00`

### 11.2 Mensual con dia anterior al inicio

Entrada:

```txt
tipo: MENSUAL
start_date: 2026-01-15
monthly_billing_day: 1
fee_amount: 1200
```

Resultado:

- 12 cuotas
- primera cuota `2026-02-01`
- no hay cuotas antes de `2026-01-15`

### 11.3 Trimestral

Entrada:

```txt
tipo: TRIMESTRAL
start_date: 2026-01-15
monthly_billing_day: 1
fee_amount: 1200
```

Resultado:

- 4 cuotas
- vencimientos: `2026-04-01`, `2026-07-01`, `2026-10-01`, `2027-01-01`
- monto esperado por cuota `300.00`

### 11.4 Cuatrimestral

Entrada:

```txt
tipo: CUATRIMESTRAL
start_date: 2026-01-15
monthly_billing_day: 15
fee_amount: 1200
```

Resultado:

- 3 cuotas
- vencimientos: `2026-01-15`, `2026-05-15`, `2026-09-15`
- monto esperado por cuota `400.00`

### 11.5 Semestral

Entrada:

```txt
tipo: SEMESTRAL
start_date: 2026-01-15
monthly_billing_day: 20
fee_amount: 1200
```

Resultado:

- 2 cuotas
- vencimientos: `2026-01-20`, `2026-07-20`
- monto esperado por cuota `600.00`

### 11.6 Anual

Entrada:

```txt
tipo: ANUAL
start_date: 2026-01-01
end_date: vacio
fee_amount: 1200
```

Resultado:

- `end_date` calculado como `2026-12-31`
- 1 cuota
- vencimiento `2027-01-01`
- monto esperado `1200.00`
- no requiere dia de cobro

### 11.7 Renovacion

Entrada:

```txt
renovar membresia vigente
nueva modalidad: TRIMESTRAL
start_date: 2027-01-01
monthly_billing_day: 1
```

Resultado:

- membresia anterior queda `RENOVADA` y `is_current = false`
- nueva membresia queda `is_current = true`
- nueva membresia mantiene cobertura anual
- cronograma trimestral se genera con 4 cuotas

## 12. Tareas para el desarrollador

1. Crear migracion para nuevos catalogos de `MEMBERSHIP_TYPE`.
2. Crear constante/configuracion de frecuencias de cobro.
3. Refactorizar `membershipsService.generateSchedule(...)`.
4. Ajustar validacion de `MembershipForm`.
5. Cambiar label y help text de dia de cobro.
6. Validar que reportes y exportaciones muestren nuevas modalidades.
7. Crear audit SQL S15 si se requiere validacion de datos.
8. Probar todos los casos obligatorios.
9. Ejecutar `yarn lint`.
10. Ejecutar `yarn build`.

## 13. Definition of Done

Este hito se considera terminado cuando:

- el catalogo `MEMBERSHIP_TYPE` contiene `TRIMESTRAL`, `CUATRIMESTRAL` y `SEMESTRAL`
- el formulario permite seleccionar las nuevas modalidades
- el dia de cobro se exige para modalidades periodicas
- la modalidad anual no exige dia de cobro
- las membresias periodicas generan cronogramas correctos segun su frecuencia
- `fee_amount` se divide correctamente entre la cantidad de cuotas
- la cobertura de la membresia sigue siendo anual
- la renovacion sigue funcionando con cobertura anual
- la regla anual de S12 se conserva
- no se introduce `new Date('YYYY-MM-DD')` para fechas calendario de negocio
- no se introduce `toISOString()` para persistir fechas calendario de negocio
- las fechas visibles no retroceden un dia en America/Lima
- `yarn lint` pasa
- `yarn build` pasa

## 14. Fuera de alcance

No forma parte de este hito:

- cambiar la duracion de la membresia a trimestral, cuatrimestral o semestral
- crear una tabla nueva de planes o modalidades
- modificar pagos ya registrados
- regenerar cronogramas existentes
- cambiar la RPC `register_payment(...)`
- cambiar reglas de cobranza, parcialidad o reversa
- cambiar roles y permisos
- redisenar reportes
