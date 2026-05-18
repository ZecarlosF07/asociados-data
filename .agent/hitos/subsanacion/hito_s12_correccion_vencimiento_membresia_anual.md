# Hito S12: Correccion post-release del Hito 6 - Vencimiento de membresia anual

## 1. Objetivo del hito

Corregir el calculo del vencimiento de la cuota generada para membresias anuales.

Cuando se crea una membresia anual, el cronograma debe generar una sola cuota, pero su fecha de vencimiento no debe ser la fecha de inicio de la membresia. La fecha correcta debe ser el dia siguiente a la fecha de fin efectiva de la membresia.

Regla de negocio:

```txt
vencimiento de cuota anual = fecha_fin_membresia + 1 dia
```

Ejemplo:

```txt
Inicio: 01/01/2026
Fin:    31/12/2026
Vence:  01/01/2027
```

Este hito corrige una observacion funcional del **Hito 6: membresias, pagos y cobranza**.

## 2. Hito original que corrige

Este hito corrige el comportamiento del **Hito 6: membresias, pagos y cobranza**.

El Hito 6 exige:

- crear membresias
- generar cronograma de pagos
- mantener consistencia financiera
- mostrar vencimientos correctos

El bug afecta directamente la lectura de cobranza para membresias anuales, porque muestra como vencida o pendiente una cuota con una fecha que no corresponde a la regla del negocio.

## 3. Estado actual detectado

### 3.1 Servicio afectado

Archivo:

```txt
src/services/memberships.service.js
```

El metodo de generacion de cronograma documenta actualmente:

```txt
ANUAL: 1 cuota en la fecha de inicio
```

y en la rama anual genera:

```txt
due_date = membership.start_date
```

### 3.2 Comportamiento incorrecto

Si se crea una membresia anual:

```txt
start_date = 01/01/2026
end_date   = 31/12/2026
```

el sistema crea el cronograma con:

```txt
due_date = 01/01/2026
```

Eso es incorrecto.

Debe crear:

```txt
due_date = 01/01/2027
```

### 3.3 Caso con fecha fin automatica

El servicio ya calcula `end_date` si no fue enviada:

```txt
end_date = start_date + 1 año - 1 dia
```

Pero despues de calcularla, el cronograma anual sigue usando la fecha de inicio como vencimiento.

## 4. Problema detectado

El bug genera estos riesgos:

- cronogramas anuales con vencimiento anticipado
- cuotas marcadas como vencidas cuando todavia no corresponde
- cobranza anual inconsistente con la fecha de cobertura
- reportes financieros distorsionados
- confusion operativa al revisar la ficha del asociado

Este problema es de logica de negocio y debe corregirse antes de cargar datos reales de membresias anuales.

## 5. Alcance funcional

### 5.1 Membresia anual con fecha fin informada

Cuando el usuario cree una membresia anual con fecha de fin:

```txt
start_date = X
end_date = Y
```

el sistema debe crear una sola cuota con:

```txt
due_date = Y + 1 dia
```

### 5.2 Membresia anual sin fecha fin informada

Cuando el usuario cree una membresia anual sin fecha de fin, el sistema debe:

1. calcular la fecha de fin:

```txt
end_date = start_date + 1 año - 1 dia
```

2. guardar esa fecha de fin en la membresia
3. crear una sola cuota con:

```txt
due_date = end_date + 1 dia
```

### 5.3 Periodo de cobertura

Para membresias anuales, el campo `period_year` debe seguir representando el año de cobertura de la membresia.

Regla:

```txt
period_year = año de start_date
period_month = null
```

Aunque el vencimiento caiga el primer dia del año siguiente, el periodo financiero representa la membresia anual iniciada en el año de `start_date`.

### 5.4 Membresias mensuales

El hito no debe cambiar el comportamiento de membresias mensuales.

Las membresias mensuales deben seguir generando sus cuotas segun:

- fecha de inicio
- fecha de fin
- dia de cobro mensual
- reglas corregidas en S7

## 6. Alcance tecnico

### 6.1 Ajustar generacion anual

Modificar:

```txt
src/services/memberships.service.js
```

En la rama anual del metodo que genera cronogramas:

1. determinar `effectiveEndDate`
2. guardar `end_date` si estaba vacio
3. calcular `annualDueDate`
4. usar `annualDueDate` en `payment_schedules.due_date`

Pseudocodigo esperado:

```js
const effectiveEndDate =
  membership.end_date ||
  addDaysToDateOnly(addYearsToDateOnly(membership.start_date, 1), -1)

if (!membership.end_date) {
  await updateMembershipEndDate(effectiveEndDate)
}

const annualDueDate = addDaysToDateOnly(effectiveEndDate, 1)

schedules.push({
  due_date: annualDueDate,
  period_year: startDate.year,
  period_month: null,
})
```

### 6.2 Actualizar comentario tecnico

Actualizar la documentacion interna del servicio.

Debe dejar de decir:

```txt
ANUAL: 1 cuota en la fecha de inicio
```

y pasar a decir:

```txt
ANUAL: 1 cuota con vencimiento al dia siguiente de la fecha de fin
```

### 6.3 Mantener helpers date-only

La correccion debe usar los helpers existentes de fechas sin zona horaria.

No se debe introducir `new Date(...)` para calcular fechas de negocio si eso puede reabrir bugs de zona horaria corregidos en S7.

Usar funciones como:

```txt
addDaysToDateOnly
addYearsToDateOnly
parseDateOnlyParts
```

segun corresponda.

### 6.4 Datos existentes de prueba

Durante etapa de pruebas puede existir data con cronogramas anuales antiguos incorrectos.

Este hito no debe modificar automaticamente esos datos salvo que se agregue una accion explicita y aprobada para limpieza.

Debe incluirse un audit SQL para detectar membresias anuales cuyo cronograma no cumpla:

```txt
payment_schedules.due_date = memberships.end_date + 1 dia
```

## 7. Auditoria SQL requerida

Crear:

```txt
supabase/audits/hito_s12_annual_membership_due_audit.sql
```

Debe validar:

- membresias anuales existentes
- fecha de inicio
- fecha de fin
- vencimiento generado
- vencimiento esperado
- cantidad de cronogramas por membresia anual
- casos inconsistentes

Consulta esperada a nivel conceptual:

```sql
select
  a.internal_code,
  a.company_name,
  m.id as membership_id,
  m.start_date,
  m.end_date,
  ps.due_date,
  (m.end_date + interval '1 day')::date as expected_due_date
from public.memberships m
join public.associates a on a.id = m.associate_id
join public.catalog_items mt on mt.id = m.membership_type_id
left join public.payment_schedules ps on ps.membership_id = m.id
where mt.item_code = 'ANUAL'
  and coalesce(m.is_deleted, false) = false
order by m.start_date desc;
```

El SQL final debe ajustarse a los nombres reales de columnas del proyecto.

## 8. Fuera de alcance

Este hito no incluye:

- rediseño del modulo financiero
- nuevos tipos de membresia
- cambio en calculo de membresias mensuales
- recalculo automatico de toda la data historica
- migracion obligatoria de datos de prueba
- cambios en pagos ya registrados
- cambios en cobranzas
- cambios en reportes salvo que dependan directamente del vencimiento corregido

## 9. Archivos esperados

### Modificados

```txt
src/services/memberships.service.js
```

### Nuevos

```txt
supabase/audits/hito_s12_annual_membership_due_audit.sql
```

Solo se debe crear una migracion si se descubre que parte de la regla vive en base de datos. Con la estructura actual, la correccion esperada es de servicio y audit SQL.

## 10. Criterios de aceptacion

El hito queda aprobado cuando:

- una membresia anual con `end_date` genera una sola cuota con `due_date = end_date + 1 dia`
- una membresia anual sin `end_date` calcula y guarda `end_date`
- una membresia anual sin `end_date` genera `due_date = end_date calculado + 1 dia`
- `period_year` sigue representando el año de inicio de la membresia
- `period_month` queda en `null` para membresias anuales
- las membresias mensuales no cambian su comportamiento
- no hay desplazamientos por zona horaria
- el audit SQL permite detectar cronogramas anuales incorrectos
- `yarn lint` pasa sin errores
- `yarn build` pasa sin errores

## 11. Pruebas funcionales sugeridas

### 11.1 Anual con fecha fin explicita

1. Crear membresia anual.
2. Usar:

```txt
Inicio: 01/01/2026
Fin:    31/12/2026
```

3. Verificar que el cronograma genera:

```txt
Vencimiento: 01/01/2027
```

### 11.2 Anual sin fecha fin

1. Crear membresia anual con inicio:

```txt
15/02/2026
```

2. No informar fecha fin si la UI lo permite.
3. Verificar que la membresia guarda:

```txt
Fin: 14/02/2027
```

4. Verificar que el cronograma genera:

```txt
Vencimiento: 15/02/2027
```

### 11.3 Mensual sin regresion

1. Crear membresia mensual.
2. Confirmar que genera cuotas mensuales.
3. Confirmar que el dia de cobro sigue alineado con la regla corregida en S7.

### 11.4 Auditoria

1. Ejecutar el audit SQL.
2. Confirmar que las nuevas membresias anuales aparecen con vencimiento esperado.
3. Identificar datos antiguos inconsistentes si existen.

## 12. Notas para el desarrollador

Este hito es una correccion funcional prioritaria porque afecta reglas financieras.

Si se estan cargando datos reales, conviene ejecutar este hito antes de seguir creando membresias anuales.

La correccion debe ser pequena, aislada y protegida contra regresiones de fechas.
