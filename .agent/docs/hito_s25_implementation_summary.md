# Hito S25 — Salud de pago y deuda de empresas inactivas

Fecha: 2026-09-22

## Regla

`INACTIVO` ya no recibe las etiquetas de salud `AL_DIA`, `MOROSO`, `CRITICO` o
`POR_VENCER`: muestra `NO_APLICA_INACTIVO` (`No aplica · inactivo`).
`EN_PROCESO` sin membresía conserva `NO_APLICA` (`No aplica · sin membresía`).
Una empresa `ACTIVO` mantiene las reglas de salud de pago S22.

La deuda histórica **no se elimina ni se oculta**. Las cuotas devengadas que S22
considera cobrables siguen en Pagos y cobranza; el saldo cobrable y el vencido se
muestran aparte en la ficha, el listado, el reporte y Excel. `No aplica` describe la
salud de la membresía actual, no una condonación de deuda.

## Implementación

La [migración S25](../../supabase/migrations/20260922190000_s25_inactive_payment_health.sql)
añade el valor de catálogo, actualiza `associate_operational_summary`, incorpora
`collectible_amount` y `overdue_amount` a esa vista y al reporte de asociados, y
sincroniza la caché. No modifica S21–S24 ni datos de membresías, cuotas o pagos.

## Aplicación y validación

1. Aplicar la migración S25 completa y una sola vez.
2. Ejecutar el [audit S25](../../supabase/audits/hito_s25_inactive_payment_health_audit.sql).
   Cada fila debe tener `found = expected`.
3. Ejecutar el audit S22 de regresión, pues comparte la vista y la caché operativas.
4. Probar una empresa inactiva con deuda, otra sin deuda, una activa y una en proceso,
   en ficha, listado, reporte y Excel.

## Estado

Implementado en el repositorio. Validación local: `yarn test` (19/19), `yarn lint`,
`yarn build` y `git diff --check` correctos. Aplicación y audit en la instancia
objetivo pendientes; no se dispone de base local porque falta Docker/Podman.
La posible desactualización de caché al cambiar la fecha de negocio sin operaciones
sigue siendo una limitación separada.
