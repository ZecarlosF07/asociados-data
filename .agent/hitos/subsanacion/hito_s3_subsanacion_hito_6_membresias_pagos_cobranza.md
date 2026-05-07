# Hito S3: Subsanación del Hito 6 - Membresías, pagos y cobranza

## 1. Objetivo del hito

Completar el Hito 6 para que la dimensión financiera del asociado quede realmente integrada en su ficha principal y sus operaciones críticas sean consistentes. El asociado debe permitir consultar y operar membresías, cronograma, pagos y cobranza desde un mismo contexto.

## 2. Hito original que subsana

Este hito subsana el **Hito 6: Membresías, pagos y cobranza**.

El Hito 6 exige:

- registrar y consultar membresías
- registrar pagos
- consultar cronograma
- registrar acciones de cobranza
- conectar la ficha del asociado con membresías, pagos y cobranza

La brecha detectada es que la ficha del asociado integra membresías y cronograma, pero no expone de forma completa pagos y cobranza como tabs/secciones operativas.

## 3. Problemas detectados

- Falta una sección clara de pagos dentro de la ficha del asociado.
- Falta una sección clara de cobranza dentro de la ficha del asociado.
- El registro de pago y la actualización de cuota deben ser atómicos.
- La consistencia entre pagos, cronograma y estados puede depender de múltiples operaciones desde frontend.
- La lógica financiera está concentrada en componentes grandes.

## 4. Alcance funcional

### 4.1 Ficha financiera completa del asociado

Agregar a la ficha del asociado:

- tab `Membresías`
- tab `Pagos`
- tab `Cobranza`
- resumen financiero

El resumen financiero debe mostrar:

- total pendiente
- total vencido
- total pagado
- próxima fecha de cobro
- cantidad de cuotas vencidas
- última acción de cobranza
- estado de salud de pago

### 4.2 Pagos dentro del asociado

Desde la ficha del asociado el usuario debe poder:

- ver pagos registrados
- registrar un nuevo pago
- seleccionar una cuota pendiente
- autocompletar monto esperado
- registrar método, fecha, referencia y observaciones
- ver impacto del pago en el cronograma

### 4.3 Cobranza dentro del asociado

Desde la ficha del asociado el usuario debe poder:

- ver historial de cobranza
- registrar acción de cobranza
- asociar acción a una cuota si corresponde
- definir resultado
- definir próxima fecha de seguimiento
- consultar últimas gestiones

## 5. Alcance técnico

### 5.1 RPC de pago transaccional

Crear RPC:

```sql
public.register_payment(...)
```

Debe:

- validar cuota existente
- validar monto mayor a cero
- insertar pago
- actualizar cuota como pagada o parcial
- actualizar estado de cobranza si corresponde
- registrar auditoría
- ejecutarse atómicamente

### 5.2 Estados de cronograma

Definir reglas:

- pendiente
- parcial
- pagado
- vencido
- en gestión
- anulado

Estas reglas deben estar documentadas y ser consistentes en:

- base de datos
- services
- UI
- reportes

### 5.3 Refactor financiero

Crear:

- `AssociateFinancialSummary`
- `AssociatePaymentsTab`
- `AssociateCollectionsTab`
- `useAssociateFinancialActions`
- `useAssociateCollectionActions`

Reutilizar:

- `PaymentForm`
- `PaymentList`
- `CollectionActionForm`
- `CollectionActionList`
- `ScheduleTable`

## 6. Tareas para el desarrollador

1. Extender `useAssociateDetail` para exponer pagos y cobranza de forma clara.
2. Crear tabs de pagos y cobranza en ficha del asociado.
3. Crear resumen financiero del asociado.
4. Crear RPC transaccional de registro de pago.
5. Actualizar `payments.service.js` para usar RPC.
6. Validar consistencia de estados de cronograma.
7. Refactorizar handlers financieros fuera de `AssociateDetailPage`.
8. Probar pago completo.
9. Probar pago parcial si está dentro del alcance.
10. Probar cobranza asociada a cuota vencida.

## 7. Definition of Done

Este hito se considera terminado cuando:

- La ficha del asociado muestra membresías, pagos, cobranza y cronograma.
- El usuario puede registrar pagos desde la ficha.
- El usuario puede registrar acciones de cobranza desde la ficha.
- El registro de pago actualiza cronograma de forma transaccional.
- Los estados financieros se muestran de forma consistente.
- El resumen financiero del asociado está disponible.
- La lógica financiera queda separada en hooks/services.
- `yarn lint` y `yarn build` pasan.

