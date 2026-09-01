# Hito S21: Consistencia de membresías y detalle de asociados

## Objetivo

Eliminar la doble fuente de categoría entre Información y Membresía, garantizar una
sola membresía vigente por asociado y reorganizar el detalle para que cada flujo
operativo tenga una ubicación inequívoca.

## Alcance funcional

- `associates.category_id` es la única categoría editable.
- Una membresía vigente conserva una copia de esa categoría como referencia.
- Las membresías renovadas permanecen como historial y no se editan.
- Solo aparecen las acciones `Nueva membresía`, `Renovar` o `Cancelar` cuando
  corresponden al estado actual.
- El detalle usa cinco secciones principales persistidas con `?section=`:
  `Resumen`, `Personas y contactos`, `Membresía`, `Pagos y cobranza` y `Documentos`.
- El cronograma existe únicamente en `Pagos y cobranza`.

## Migración

`20260901120000_s21_membership_consistency.sql`:

- conserva como vigente la membresía no eliminada con `created_at` más reciente
- mueve los duplicados al historial con estado `RENOVADA`
- completa categorías históricas recuperables y sincroniza la vigente
- detiene la ejecución si una membresía vigente no puede obtener categoría
- crea el índice único parcial `uq_memberships_current_associate`
- valida la categoría vigente mediante constraint y triggers
- agrega RPC transaccionales para crear y renovar
- mantiene intactos los pagos y cronogramas durante el backfill

## Criterios de aceptación

- No existen dos membresías vigentes para el mismo asociado.
- No se puede crear o renovar sin categoría en Información.
- Cambiar la categoría del asociado actualiza solo la membresía vigente.
- Una renovación cierra la vigente y crea la nueva en una sola transacción.
- El historial permanece plegado, visible y sin acciones de edición.
- La sección principal sobrevive a recarga y navegación atrás/adelante.
- Los reportes y Excel de membresías reflejan la categoría recuperada.

## Evidencia esperada

- `supabase/audits/hito_s21_membership_consistency_audit.sql`
- pruebas funcionales de creación, conflicto, cancelación, renovación y cambio de categoría
- revisión responsive de las cinco secciones y sus subsecciones
- `yarn lint`, `yarn build` y `git diff --check`
