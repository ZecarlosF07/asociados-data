# Hito S21 - Resumen de implementación

Fecha: 2026-09-01

## Estado

Implementado en código y migración local. Quedan pendientes la aplicación de S21,
la ejecución del audit en la instancia desplegada y la validación funcional autenticada.

## Consistencia de membresías

La creación y renovación usan RPC transaccionales. La base conserva una sola
membresía vigente por asociado mediante un índice único parcial, toma la categoría
desde `associates.category_id` y mantiene las renovaciones anteriores como historial.

El backfill conserva el registro vigente más reciente, marca duplicados anteriores
como renovados y recupera categorías sin eliminar membresías, pagos ni cronogramas.

## Experiencia del detalle

La ficha se reorganizó en `Resumen`, `Personas y contactos`, `Membresía`, `Pagos y
cobranza` y `Documentos`. La sección activa se guarda en `?section=`. El resumen
financiero ya no se repite, el cronograma se muestra solo junto a pagos y el historial
de membresías queda plegado y sin edición.

La sección de membresía diferencia visualmente el periodo actual, la renovación y el
historial. El formulario asigna el estado vigente automáticamente, muestra el día de
cobro solo cuando la modalidad lo requiere y presenta la categoría como dato heredado
de Información.

## Validaciones locales

- `yarn lint`: OK
- `yarn build`: OK
- `git diff --check`: OK

## Pendientes operativos

- aplicar `20260901120000_s21_membership_consistency.sql`
- ejecutar `hito_s21_membership_consistency_audit.sql`
- probar creación, conflicto, cancelación, renovación y sincronización de categoría
- revisar reportes y exportación Excel de membresías después del backfill
- validar las cinco secciones en escritorio y móvil con roles de edición y consulta
