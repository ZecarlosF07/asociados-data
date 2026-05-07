# Hito S3 — Subsanación Hito 6: Membresías, pagos y cobranza

## Estado

Implementado a nivel de código, migración y documentación técnica.

## Base de datos

Archivo:

- `supabase/migrations/20260507030000_s3_payments_financial_integrity.sql`

Se agregó:

- `public.find_catalog_item_id(...)`
- `public.refresh_associate_overdue_schedules(...)`
- `public.refresh_associate_payment_health(...)`
- `public.register_payment(...)`

La RPC `register_payment(...)`:

- valida permisos de `cobranza`
- identifica usuario autenticado
- bloquea la cuota con `for update`
- valida cuota activa y no pagada
- valida monto, fecha, método y código de operación
- inserta el pago
- recalcula el total pagado por cuota
- marca la cuota como `PARCIAL` o `PAGADO`
- actualiza `is_paid` y `paid_at`
- refresca salud financiera del asociado
- registra auditoría explícita

## Frontend

Archivos creados:

- `src/components/molecules/financial/AssociateFinancialSummary.jsx`
- `src/components/molecules/financial/AssociatePaymentsTab.jsx`
- `src/components/molecules/financial/AssociateCollectionsTab.jsx`
- `src/hooks/useAssociateFinancialActions.js`
- `src/hooks/useAssociateCollectionActions.js`

Archivos modificados:

- `src/pages/associates/AssociateDetailPage.jsx`
- `src/pages/associates/sections/AssociateDetailTabs.jsx`
- `src/pages/financial/PendingPaymentsPage.jsx`
- `src/services/payments.service.js`
- `src/services/paymentSchedules.service.js`
- `src/services/collectionActions.service.js`
- `src/components/molecules/financial/PaymentForm.jsx`
- `src/components/molecules/financial/PaymentList.jsx`
- `src/components/molecules/financial/CollectionActionForm.jsx`
- `src/components/molecules/financial/CollectionActionList.jsx`
- `src/utils/financialValidation.js`

## Ficha de asociado

La ficha ahora expone:

- resumen financiero
- tab `Membresías`
- tab `Pagos`
- tab `Cobranza`
- cronograma visible desde pagos y membresías

El resumen financiero muestra:

- total pendiente
- total vencido
- total pagado
- próxima fecha de cobro
- cantidad de cuotas vencidas
- última gestión de cobranza
- salud financiera del asociado

## Pagos

`paymentsService.create(...)` ahora usa:

```js
supabase.rpc('register_payment', ...)
```

Esto reemplaza el flujo anterior de:

1. insertar pago
2. marcar cuota como pagada desde frontend

La página global de cobranza también usa la RPC.

## Cobranza

Se agregó registro de gestiones desde la ficha del asociado.

Cuando se asocia una gestión a una cuota, la cuota pasa a `EN_GESTION`.

## Documentación y auditoría

Archivos:

- `.agent/docs/hito_s3_estados_financieros.md`
- `supabase/audits/hito_s3_financial_audit.sql`

## Validaciones ejecutadas

```bash
yarn lint
yarn build
```

Resultado:

- `yarn lint` pasó correctamente.
- `yarn build` pasó correctamente.
- El build mantiene el warning existente de chunk mayor a 500 kB.

## Pendiente operativo

Aplicar la migración S3 en Supabase y luego ejecutar el audit:

```sql
-- contenido de supabase/audits/hito_s3_financial_audit.sql
```
