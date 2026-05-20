# Hito S14: Hardening preproduccion - auditoria confiable y fechas de pago

## 1. Objetivo del hito

Cerrar los dos hallazgos tecnicos pendientes antes de pasar a produccion:

- endurecer la escritura de `audit_logs` para que la auditoria no pueda ser falsificada desde el cliente
- eliminar o corregir el metodo latente `paymentSchedulesService.markAsPaid`, que podria reintroducir desfases de fecha usando `new Date().toISOString()`

Este hito no agrega una funcionalidad nueva para el usuario final. Es un hito de hardening preproduccion para asegurar que los flujos ya validados no queden expuestos a regresiones de seguridad o fechas.

## 2. Hitos que refuerza

Este hito refuerza:

- **S3 - Membresias, pagos y cobranza**
- **S7 - Correccion de fechas de membresias y cronograma**
- **S10 - Modulo de auditoria operativa**
- **S12 - Correccion de vencimiento de membresia anual**
- **S13 - Generacion de usuarios y roles operativos**

La razon es que el sistema ya tiene pagos, auditoria y roles funcionales, pero todavia quedan dos puntos de riesgo tecnico:

- la auditoria puede recibir inserts directos si la policy `audit_logs_insert` sigue abierta para usuarios autenticados
- existe codigo no usado que puede volver a escribir `paid_at` con una fecha UTC calculada en navegador

## 3. Estado actual detectado

### 3.1 Auditoria

Archivos relevantes:

```txt
supabase/migrations/20260312040000_create_audit_logs.sql
supabase/migrations/20260507010000_s1_permissions_rls.sql
src/services/audit.service.js
src/utils/userAudit.js
src/hooks/useAuditLogs.js
```

La tabla `audit_logs` ya existe y es usada por el modulo `/auditoria`.

Tambien existen triggers y funciones de auditoria para registrar cambios operativos en tablas del sistema.

El problema esta en la policy:

```txt
audit_logs_insert
```

Si esta policy permite `INSERT` directo desde cualquier usuario autenticado, un cliente podria crear eventos falsos, alterar el sentido de la trazabilidad o generar ruido operativo.

### 3.2 Fechas de pago

Archivos relevantes:

```txt
src/services/paymentSchedules.service.js
supabase/migrations/20260507030000_s3_payments_financial_integrity.sql
supabase/migrations/20260520090000_fix_payment_paid_at_lima_date.sql
```

El flujo vigente de registro de pagos debe pasar por la RPC:

```txt
register_payment(...)
```

La migracion de correccion de fechas ya ajusto `paid_at` para que la fecha elegida por el usuario se guarde respetando `America/Lima`.

Sin embargo, en `paymentSchedulesService.markAsPaid` existe una ruta tecnica no usada que escribe:

```txt
paid_at: paidAt || new Date().toISOString()
```

Aunque no se use actualmente, si un desarrollador la reutiliza en el futuro puede volver a aparecer el desfase de fecha.

## 4. Problemas que debe resolver

### 4.1 Auditoria falsificable desde cliente

La auditoria debe ser confiable. El cliente no debe poder insertar eventos arbitrarios en `audit_logs` enviando:

- `actor_user_id`
- `entity_name`
- `entity_id`
- `action_type`
- `previous_data`
- `new_data`
- `extra_meta`

El sistema debe registrar eventos de auditoria desde fuentes controladas:

- triggers de base de datos
- funciones `security definer`
- RPCs internas con validaciones
- Edge Functions administrativas, cuando corresponda

### 4.2 Escritura insegura de `paid_at`

Ningun flujo debe escribir fechas de negocio usando `new Date().toISOString()` desde el navegador.

Para pagos, la fecha de pago debe provenir de:

- un campo `date` elegido por el usuario
- la RPC `register_payment(...)`
- conversion controlada en BD con `America/Lima`

## 5. Alcance funcional

### 5.1 Auditoria

El modulo `/auditoria` debe seguir mostrando eventos como hasta ahora.

Los eventos validos deben seguir generandose para:

- creacion y actualizacion de usuarios
- reseteo de contrasena
- alta directa de asociado
- conversion de prospecto a asociado
- registro de pagos
- cambios en membresias
- cambios operativos cubiertos por triggers

No debe existir una pantalla para crear auditoria manual.

### 5.2 Pagos

El usuario final no debe notar cambios visuales en cobranza o reportes.

El resultado esperado es preventivo:

- evitar que se use un metodo inseguro en el futuro
- mantener una sola ruta oficial para registrar pagos
- preservar la regla de fechas en zona `America/Lima`

## 6. Alcance tecnico

### 6.1 Migracion de base de datos

Crear una migracion:

```txt
supabase/migrations/YYYYMMDDHHMMSS_s14_hardening_audit_logs_and_payment_dates.sql
```

La migracion debe:

1. Eliminar la policy de insercion directa sobre `public.audit_logs`.

```sql
drop policy if exists audit_logs_insert on public.audit_logs;
```

2. Mantener la policy de lectura segun permisos existentes.

3. Mantener la capacidad de escritura interna desde funciones controladas.

4. Si el frontend necesita registrar algun evento manual no cubierto por trigger, crear una RPC controlada:

```txt
public.log_audit_event(...)
```

Reglas minimas de la RPC:

- debe ser `security definer`
- debe fijar `actor_user_id` usando `current_user_profile_id()`
- no debe aceptar `actor_user_id` desde el cliente
- debe validar que el usuario este autenticado
- debe permitir solo entidades/acciones necesarias para eventos manuales reales
- debe insertar en `audit_logs` desde el contexto seguro de la funcion

Si despues de revisar el codigo se confirma que `auditService.log` no es necesario para flujos vigentes, se debe preferir eliminar las llamadas manuales antes que crear una RPC nueva.

### 6.2 Frontend de auditoria

Revisar:

```txt
src/services/audit.service.js
src/utils/userAudit.js
```

Acciones esperadas:

- conservar metodos de lectura usados por `useAuditLogs`
- eliminar o adaptar el metodo `auditService.log`
- si se crea RPC `log_audit_event`, `auditService.log` debe llamar esa RPC y no insertar directo en `audit_logs`
- si los eventos de usuarios ya quedan cubiertos por triggers, retirar la auditoria manual duplicada desde `userAudit.js`

El objetivo es que ningun servicio frontend haga:

```txt
supabase.from('audit_logs').insert(...)
```

### 6.3 Servicio de cronograma de pagos

Revisar:

```txt
src/services/paymentSchedules.service.js
```

Acciones esperadas:

- eliminar `markAsPaid` si no tiene usos reales
- si se decide conservarlo, debe dejar de escribir `paid_at` con `new Date().toISOString()`
- cualquier marcado de pago debe pasar por `paymentsService.registerPayment` o por la RPC `register_payment(...)`

No debe quedar ningun camino de escritura de pago que actualice:

```txt
payment_schedules.paid_at
```

desde el cliente con una fecha generada en JavaScript.

## 7. Fuera de alcance

Este hito no debe:

- limpiar data de prueba
- cambiar la matriz de roles operativos
- cambiar reportes ya validados
- redisenar el modulo de auditoria
- cambiar la estructura de `payment_schedules`
- cambiar la logica de membresias mensuales o anuales
- modificar Edge Functions salvo que se detecte una llamada directa a `audit_logs` que deba adaptarse

## 8. Criterios de aceptacion

El hito se considera cerrado cuando:

- no existe policy `audit_logs_insert` que permita insercion directa desde usuarios autenticados
- el modulo `/auditoria` sigue leyendo eventos correctamente
- los flujos administrativos siguen generando eventos de auditoria validos
- no existe ningun `supabase.from('audit_logs').insert(...)` en codigo frontend
- `auditService.log` fue eliminado o adaptado a una RPC segura
- `paymentSchedulesService.markAsPaid` fue eliminado o corregido
- no existe ningun uso de `new Date().toISOString()` para escribir `paid_at`
- `register_payment(...)` conserva la conversion de fecha con `America/Lima`
- `yarn lint` pasa sin errores
- `yarn build` pasa sin errores

## 9. Auditoria SQL requerida

Crear un archivo:

```txt
supabase/audits/hito_s14_preprod_hardening_audit.sql
```

Debe validar como minimo:

### 9.1 Policy de insert directo removida

Verificar que no exista una policy de `INSERT` directa sobre `public.audit_logs` para usuarios autenticados.

Resultado esperado:

```txt
audit_logs_direct_insert_policy_removed = true
```

### 9.2 RLS de auditoria activo

Verificar:

- `public.audit_logs` tiene RLS activo
- conserva policy de lectura
- conserva policy de eliminacion administrativa si fue definida por S10

### 9.3 Fuentes internas de auditoria

Verificar que existen las funciones/triggers de auditoria usados por el sistema.

### 9.4 Registro de pagos seguro

Verificar en `pg_proc` que la funcion `register_payment(...)` contiene:

```txt
at time zone 'America/Lima'
```

y no contiene:

```txt
p_payment_date::timestamptz
```

## 10. Validacion manual

Validar en ambiente local o staging:

1. Iniciar sesion como `ADMIN`.
2. Crear o actualizar un usuario interno.
3. Revisar que el evento aparezca en `/auditoria`.
4. Registrar un pago con fecha del dia actual.
5. Revisar que cobranza, reportes y ficha del asociado muestren la misma fecha calendario.
6. Intentar insertar manualmente en `audit_logs` desde un cliente autenticado no autorizado.
7. Confirmar que el insert directo falla.
8. Confirmar que `yarn lint` y `yarn build` pasan.

## 11. Entregables

El desarrollador debe entregar:

- migracion S14
- audit SQL S14
- ajuste de `audit.service.js` y/o `userAudit.js`
- ajuste de `paymentSchedules.service.js`
- evidencia de `yarn lint`
- evidencia de `yarn build`
- resultado del audit SQL

## 12. Nota operativa

Este hito debe ejecutarse antes de limpiar la base de datos para carga real.

La limpieza de datos es un paso operativo separado. Primero debe cerrarse el hardening para que la base limpia arranque con reglas de auditoria y fechas ya seguras.
