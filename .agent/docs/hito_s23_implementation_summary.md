# Hito S23 — Baja y reincorporación de empresas

Fecha: 2026-09-22

## Estado

Implementado en el repositorio. El usuario aplicó la migración S23 en la instancia
objetivo y compartió el preflight y audit S23 del 2026-09-22: los controles bloqueantes
del preflight fueron `0` y los 10 checks del audit coincidieron con `expected`.
Esta validación se basa en las capturas compartidas, no en una conexión directa desde
este entorno. S22 permanece sin modificaciones.

## Reglas de negocio

- `En proceso`: empresa sin historial de membresía y sin baja administrativa.
- `Activo`: empresa con membresía efectivamente vigente y sin baja.
- `Inactivo`: empresa con historial sin membresía vigente, o con baja administrativa.
- `Suspendido`: retirado del catálogo operativo. Los registros existentes se migran a baja
  administrativa con motivo identificable.
- La baja entra en vigor el día de negocio de Lima. No admite fecha retroactiva.
- Reincorporar quita la baja, pero no restaura membresías ni comités; el estado se vuelve
  a calcular con las reglas anteriores. El motivo y fecha guardan la última baja.

## Cambios de datos

La migración [`20260922170000_s23_associate_offboarding.sql`](../../supabase/migrations/20260922170000_s23_associate_offboarding.sql)
añade `associates.is_offboarded`, actualiza `associate_operational_summary` y crea las
RPC `offboard_associate` y `reinstate_associate`. La baja bloquea la empresa, exige
motivo, cancela primero la renovación programada y luego la membresía vigente, cierra
todas las asignaciones activas a comités, registra motivo/fecha y sincroniza el estado.
Todo ocurre en una transacción: cualquier fallo revierte el conjunto.

Se conservan pagos, cronogramas y membresías históricas. Se mantienen cobrables las
cuotas ya devengadas; las obligaciones futuras impagas se anulan según S22, sin
eliminar registros. Una renovación programada con pagos bloquea la baja para revisión
contable. Triggers impiden crear/renovar membresías o asignar comités mientras la baja
esté activa. La antigua RPC de suspensión permanece solo como objeto de compatibilidad
para el audit S22, pero rechaza llamadas y ya no tiene permiso de ejecución para
usuarios autenticados.

## Interfaz y permisos

En la ficha se muestra `Dar de baja`, `Formalizar baja` o `Reincorporar` según el estado.
La confirmación de baja exige motivo y presenta las membresías, renovaciones y comités
que se cerrarán, además de la deuda vencida que seguirá cobrable. El Resumen muestra
motivo y fecha de la baja. La sección Membresía conserva el historial y oculta las
acciones de creación/renovación mientras la empresa esté dada de baja.

Se exige edición de Asociados. Si existe una membresía vigente o programada, también
se exige edición de Membresías. La RPC verifica que el estado visible no haya cambiado
desde que se abrió la confirmación. Los filtros, reportes y Excel ya no incluyen la
columna o categoría `Suspendido`.

## Despliegue y verificación

1. Ejecutar [`hito_s23_preflight.sql`](../../supabase/audits/hito_s23_preflight.sql).
   Los checks `s23_blocking_*` deben devolver `0`; los demás indican el alcance de
   la migración. Revisar casos con pagos programados antes de continuar.
2. Aplicar la migración S23 completa en una sola transacción. No ejecutar fragmentos.
3. Ejecutar [`hito_s23_associate_offboarding_audit.sql`](../../supabase/audits/hito_s23_associate_offboarding_audit.sql),
   luego los audits S21 y S22 de regresión. Cada `found` debe coincidir con `expected`.
4. Desplegar el frontend coordinadamente y probar baja desde Activo, En proceso e
   Inactivo, reincorporación, permisos, deuda parcial, comités, dashboard, filtros,
   reportes y Excel en escritorio y móvil.

## Validación local

- `yarn test`: 14/14 pruebas correctas.
- `yarn lint`, `yarn build` y `git diff --check`: correctos.
- Prueba SQL en base local: no disponible en este entorno porque faltan Docker/Podman.
- Preflight S23 compartido: 1 Suspendido a migrar, 1 comité activo a cerrar y
  0 bloqueos.
- Audit S23 compartido: 10/10 comprobaciones correctas.
- Audit S21 de regresión compartido: 6/6 comprobaciones correctas.
- Audit S22 de regresión compartido: 24/24 comprobaciones correctas tras sincronizar
  la caché de salud de pago de 18 empresas (`s22_associate_operational_cache_drift`: 0).
- La sincronización anterior corrige el desfase actual, pero la salud calculada puede
  volver a diferir de la caché cuando cambia el día de negocio sin una operación.
  Queda pendiente una solución permanente para la actualización por fecha.
- Pruebas de interfaz en la instancia: pendientes.
