# Hito S22: Consistencia integral de membresías, cobranza y estados

## Objetivo

Usar una sola definición operativa para membresías, cuotas, saldos y estado del
asociado, preservando el historial financiero y evitando que periodos reemplazados,
cancelados o futuros generen cobranza incorrecta.

## Alcance funcional

- `is_current` identifica únicamente el registro administrativo más reciente.
- La vigencia se calcula con la fecha de negocio de `America/Lima`.
- Se permite una membresía vigente y una renovación `PROGRAMADA`, sin
  superposición y sin cobro anticipado.
- Las renovaciones y cancelaciones conservan deuda devengada, pagos e historial;
  las obligaciones futuras quedan `ANULADO`.
- `associates.category_id` continúa como única categoría editable.
- El asociado es `ACTIVO`, `EN_PROCESO` o `INACTIVO` según sus membresías;
  `SUSPENDIDO` es la única excepción manual.

## Migración

La implementación se divide en tres migraciones transaccionales:

- `20260901150000_s22a_membership_data_foundation.sql`: catálogo, columnas,
  preflight bloqueante y saneamiento conservador de datos.
- `20260901151000_s22b_membership_operational_logic.sql`: vistas operativas,
  restricciones, RPC, reportes, dashboard y permisos.
- `20260901152000_s22c_post_audit_reconciliation.sql`: reconciliación conservadora
  de historial eliminado con pagos, coberturas heredadas y enlaces no cronológicos.

- agrega `PROGRAMADA`, fecha de negocio, relación de renovación y fin efectivo
- bloquea duplicados con pagos, sobrepagos, relaciones cruzadas y pagos con fechas inválidas
- sanea duplicados sin pagos y conserva sus cuotas como historial anulado
- distingue cuotas operativas y aplica unicidad por periodo sin borrar las anuladas
- centraliza estados y saldos en tres vistas operativas
- valida superposiciones, catálogos, tarifas, cuotas y total del cronograma
- reemplaza creación, renovación, cancelación, pago, reversión y gestión por RPC transaccionales
- actualiza dashboard, reportes y exportaciones para consumir reglas efectivas

## Despliegue

1. Ejecutar `supabase/audits/hito_s22_preflight.sql`.
2. Si cualquier resultado tiene `found > expected`, detener el despliegue y
   revisar los IDs con Contabilidad.
3. Ejecutar S22A y validar `supabase/audits/hito_s22a_foundation_audit.sql`.
4. Ejecutar S22B y desplegar el frontend de manera coordinada.
5. Si el audit detecta datos heredados clasificados, ejecutar S22C.
6. Ejecutar el audit S21 de regresión.
7. Ejecutar `supabase/audits/hito_s22_membership_collection_audit.sql`.
8. Validar membresía vigente/programada, cobranza, dashboard, reportes y Excel.

## Criterios de aceptación

- Nunca existen dos membresías efectivamente vigentes ni dos programadas.
- Los históricos no muestran `VIGENTE` y sus cuotas anuladas no aparecen en cobranza.
- Una cuota muestra monto esperado, pagado, saldo y estado financiero efectivo.
- Un pago futuro, anticipado a la membresía, no operativo o superior al saldo se rechaza.
- La reversión de pago y la gestión de cobranza son atómicas.
- Detalle, listado, dashboard, reportes y Excel producen los mismos estados y saldos.

## Evidencia esperada

- preflight y audit S22 sin hallazgos
- audit S21 sin regresiones
- `yarn test`, `yarn lint`, `yarn build` y `git diff --check`
- validación autenticada en escritorio y móvil

## Evidencia de aplicación — 2026-09-01

- preflight S22 sin bloqueantes
- audit S22A sin hallazgos
- S22A, S22B y S22C aplicadas correctamente
- audit S22: 18/18 objetos y 23/23 controles de integridad sin hallazgos
- audit S21: índice, objetos y triggers completos; datos sin hallazgos
- `yarn test`, `yarn lint`, `yarn build` y `git diff --check`: OK
