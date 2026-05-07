# Hito S3 — Reglas de estados financieros

## Estado de cronograma

Los estados de `payment_schedules.collection_status_id` se interpretan así:

- `PENDIENTE`: cuota vigente sin pagos registrados.
- `PARCIAL`: cuota con uno o más pagos válidos, pero con suma menor al monto esperado.
- `PAGADO`: cuota con suma de pagos válidos mayor o igual al monto esperado.
- `VENCIDO`: cuota no pagada cuya fecha de vencimiento ya pasó.
- `EN_GESTION`: cuota no pagada con una acción de cobranza asociada.
- `ANULADO`: cuota excluida del flujo operativo; no debe aceptar pagos.

La función `refresh_associate_overdue_schedules(...)` actualiza de `PENDIENTE` a `VENCIDO` las cuotas no pagadas cuya fecha ya pasó. No pisa estados `PARCIAL` ni `EN_GESTION`.

## Registro de pago

El registro de pago debe pasar por la RPC:

```sql
public.register_payment(...)
```

La RPC:

- bloquea la cuota con `for update`
- inserta el pago
- recalcula la suma pagada de la cuota
- marca `PARCIAL` o `PAGADO`
- actualiza `is_paid` y `paid_at` cuando corresponde
- actualiza la salud financiera del asociado
- registra auditoría

## Salud financiera del asociado

`associates.payment_health_status_id` se actualiza con estas reglas:

- `CRITICO`: 3 o más cuotas vencidas.
- `MOROSO`: 1 o más cuotas vencidas.
- `POR_VENCER`: sin vencidas, pero con próxima cuota dentro de 7 días.
- `AL_DIA`: sin vencidas ni cuotas próximas dentro de 7 días.

## Acciones de cobranza

Cuando una gestión de cobranza se registra con `payment_schedule_id`, la cuota se marca como `EN_GESTION`.

Esta operación sigue siendo de aplicación porque no crea un movimiento monetario. La operación monetaria crítica es el pago y queda cubierta por la RPC transaccional.
