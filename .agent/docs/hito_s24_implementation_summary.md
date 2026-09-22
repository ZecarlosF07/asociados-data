# Hito S24 — Salud de pago sin membresía

Fecha: 2026-09-22

## Cambio

Una empresa sin ningún registro de membresía ya no se clasifica como `AL_DIA`.
La vista operativa devuelve `NO_APLICA` con la etiqueta
`No aplica · sin membresía`. Una empresa que sí tiene historial conserva las reglas
S22 de salud financiera según sus cuotas cobrables. El estado de la empresa
(`EN_PROCESO`, `ACTIVO` o `INACTIVO`) no cambia.

La [migración S24](../../supabase/migrations/20260922183000_s24_payment_health_without_membership.sql)
incorpora el valor al catálogo, actualiza la vista, sincroniza la caché existente y
la inicializa al registrar empresas nuevas. No modifica membresías, cronogramas ni
pagos. S21, S22 y S23 permanecen sin cambios.

## Presentación

Listado, ficha, reportes y Excel consumen la etiqueta operativa. En el Resumen de
una empresa sin membresía se muestra una explicación breve en lugar de importes
financieros en cero que sugieran una relación de pago vigente.

## Aplicación y comprobación

1. Aplicar la migración S24 completa, una sola vez.
2. Ejecutar el [audit S24](../../supabase/audits/hito_s24_payment_health_without_membership_audit.sql):
   cada fila debe cumplir `found = expected`.
3. Ejecutar el audit S22 de regresión para comprobar que la caché sigue alineada.
4. Verificar en la interfaz una empresa sin membresía, otra con membresía y una
   inactiva con historial, incluyendo reporte y Excel.

## Estado

Implementado en el repositorio. Validación local: `yarn test` (15/15), `yarn lint`,
`yarn build` y `git diff --check` correctos. El usuario aplicó S24 y compartió el
audit de la instancia objetivo el 2026-09-22: **6/6 comprobaciones correctas**.
Este resultado se basa en la captura compartida, no en una conexión directa desde
este entorno. No se dispone de base local porque falta Docker/Podman. La validación
funcional del frontend desplegado y el audit S22 de regresión siguen pendientes.
La posible desactualización diaria de salud de pago por cambio de fecha es un asunto
separado que S24 no resuelve.
