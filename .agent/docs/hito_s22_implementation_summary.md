# Hito S22 - Resumen de implementación

Fecha: 2026-09-01

## Estado

Implementado en código y aplicado en la instancia objetivo mediante S22A, S22B y
S22C. El preflight y los audits de cierre S21/S22 finalizaron sin hallazgos el
2026-09-01.

## Consistencia operativa

La migración incorpora vistas únicas para el estado efectivo de membresía, el saldo
de cuota y el estado del asociado. Los periodos reemplazados conservan pagos y deuda
devengada, mientras que las obligaciones futuras se anulan sin eliminar registros.

Los duplicados sin pagos se resuelven conservando el registro más reciente. Los
duplicados con pagos, sobrepagos, relaciones cruzadas y pagos con fechas inválidas
bloquean toda la migración y exponen los IDs involucrados.

## Operaciones y experiencia

Crear, renovar y cancelar membresías, registrar o reversar pagos y registrar una
gestión usan RPC transaccionales. La interfaz separa la membresía vigente, la próxima
renovación y el historial; muestra esperado, pagado y saldo; y oculta de cobranza las
cuotas anuladas o programadas.

El estado general deja de ser editable en la ficha. Se calcula automáticamente, con
acciones explícitas para suspender o reactivar. Dashboard, reportes y exportaciones
consumen las mismas fuentes operativas.

## Validación local

- `yarn test`: OK
- `yarn lint`: OK
- `yarn build`: OK
- `git diff --check`: OK
- lint SQL local: pendiente porque el servicio local de Supabase no está iniciado

## Validación en instancia

- preflight S22: 6/6 comprobaciones correctas
- audit intermedio S22A: 6/6 comprobaciones correctas
- audit S22: objetos requeridos 18/18 y 23 comprobaciones sin hallazgos
- audit de regresión S21: índice 1/1, objetos 6/6, triggers 2/2 y datos sin hallazgos
- pagos e historial preservados durante S22C

## Pendiente operativo

- desplegar o refrescar el frontend y validar con sesión autenticada escritorio/móvil,
  dashboard, reportes y Excel
