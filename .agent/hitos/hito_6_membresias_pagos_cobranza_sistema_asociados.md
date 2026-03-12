# Hito 6: Membresías, pagos y cobranza

## 1. Objetivo del hito
Construir el módulo financiero-operativo del Sistema de Asociados, permitiendo administrar la membresía de cada asociado, registrar sus pagos, controlar su cronograma de cobro y realizar seguimiento de cobranza. Este hito tiene como finalidad dar continuidad al ciclo de vida del asociado dentro del sistema, asegurando control sobre sus obligaciones económicas, su estado de cumplimiento y las acciones de seguimiento realizadas por la organización.

En esta etapa el sistema ya no solo administra datos de asociados, sino también su relación económica con la institución, lo que convierte a este módulo en una pieza clave para la operación diaria, el control administrativo y la sostenibilidad del servicio.

---

## 2. Tareas del hito

### 2.1 Modelado de datos del módulo
- Crear la tabla de membresías.
- Crear la tabla de cronograma de pagos.
- Crear la tabla de pagos.
- Crear la tabla de acciones de cobranza.
- Definir relaciones entre asociado, membresía, cronograma, pagos y seguimiento.
- Definir campos de estado, fechas clave, montos, periodicidad y trazabilidad.

### 2.2 Gestión de membresía
- Diseñar la estructura para registrar la membresía del asociado.
- Permitir asociar tipo de membresía, vigencia, monto, periodicidad y condiciones aplicables.
- Registrar el estado de la membresía.
- Preparar reglas básicas para membresía activa, vencida, suspendida o equivalente según el negocio.

### 2.3 Cronograma de pagos
- Implementar estructura para generar o registrar cronogramas de pago.
- Permitir definir fechas de cobro o vencimiento.
- Relacionar cada obligación con la membresía del asociado.
- Preparar lógica para identificar cuotas pendientes, vencidas o pagadas.
- Garantizar consistencia entre cronograma y pagos registrados.

### 2.4 Registro de pagos
- Desarrollar formulario o flujo para registrar pagos.
- Permitir registrar fecha, monto, referencia, método de pago u otros datos necesarios.
- Relacionar el pago con el asociado y la obligación correspondiente.
- Validar que el pago impacte correctamente en el estado del cronograma o de la membresía cuando aplique.

### 2.5 Seguimiento de cobranza
- Implementar estructura para registrar acciones de cobranza.
- Permitir registrar observaciones, fechas, usuario responsable y tipo de acción realizada.
- Mantener historial de seguimiento por asociado.
- Preparar base para acciones como llamada, correo, recordatorio, visita u otras que defina el negocio.

### 2.6 Vistas funcionales del módulo
- Desarrollar vista de membresía por asociado.
- Desarrollar vista de pagos registrados.
- Desarrollar vista de obligaciones pendientes.
- Desarrollar vista o historial de cobranza.
- Integrar esta información en la ficha o contexto general del asociado.

### 2.7 Listados y control operativo
- Implementar listados de asociados con deuda, pagos pendientes o estados de cobranza.
- Incorporar filtros por estado de pago, rango de fechas, asociado o tipo de membresía.
- Permitir búsqueda operativa para seguimiento administrativo.

### 2.8 Validaciones y reglas del negocio
- Validar consistencia entre membresía, pagos y cronograma.
- Validar que no existan pagos inválidos o duplicados según las reglas del negocio.
- Preparar base para tratamiento de pagos parciales, pagos completos o regularizaciones si aplica.
- Preparar lógica para actualización de estados según cumplimiento.

### 2.9 Integración con frontend y servicios
- Crear servicios del módulo de membresías, pagos y cobranza.
- Integrar formularios, listados y vistas con Supabase.
- Organizar consultas, inserciones y actualizaciones del módulo.
- Aplicar manejo de errores, cargas y feedback visual.

### 2.10 Preparación para reportes futuros
- Dejar la información estructurada para reportes financieros y operativos.
- Preparar base para indicadores de morosidad, cumplimiento, cobranza y membresías activas.

---

## 3. Requerimientos técnicos del hito

### 3.1 Estructura de datos
- Debe existir una tabla de membresías correctamente definida.
- Debe existir una tabla de cronograma de pagos correctamente definida.
- Debe existir una tabla de pagos correctamente definida.
- Debe existir una tabla de acciones de cobranza correctamente definida.
- Las relaciones entre asociado, membresía, pagos, cronograma y cobranza deben estar definidas de forma consistente.

### 3.2 Integridad y trazabilidad
- Cada registro económico debe contar con trazabilidad mínima de creación y actualización.
- El sistema debe permitir identificar con claridad la relación entre obligación, pago y estado resultante.
- Las acciones de cobranza deben quedar asociadas al asociado y, cuando aplique, a una obligación específica.

### 3.3 Organización del código
- Debe existir un servicio centralizado para el módulo financiero.
- La lógica de membresía, pagos y cobranza no debe quedar dispersa entre múltiples pantallas.
- La capa visual debe mantenerse separada de la lógica de acceso a datos y reglas de negocio.

### 3.4 Consistencia del negocio
- El sistema debe poder reflejar correctamente estados como pendiente, pagado, vencido, en seguimiento o equivalente según la lógica adoptada.
- Deben existir validaciones para evitar inconsistencias entre pagos y cronograma.
- La solución debe permitir evolución futura de reglas financieras sin rehacer el modelo principal.

### 3.5 Reutilización e integración
- El módulo debe integrarse con la ficha del asociado ya implementada.
- Debe reutilizar catálogos, estados y configuraciones previamente definidos.
- Debe quedar listo para alimentar reportes y dashboards en hitos posteriores.

---

## 4. Requerimientos funcionales del hito

### 4.1 Gestión de membresía
- El usuario debe poder registrar y consultar la membresía de un asociado.
- El sistema debe mostrar el estado general de la membresía.
- El usuario debe poder identificar la vigencia, tipo y condiciones básicas de la membresía.

### 4.2 Control de pagos
- El usuario debe poder registrar pagos asociados a una membresía u obligación.
- El sistema debe almacenar correctamente la información del pago.
- El usuario debe poder consultar pagos registrados por asociado.

### 4.3 Seguimiento de obligaciones
- El usuario debe poder visualizar obligaciones pendientes, vencidas o cumplidas.
- El sistema debe permitir identificar el estado de pago del asociado.
- El usuario debe poder consultar el cronograma asociado a la membresía.

### 4.4 Gestión de cobranza
- El usuario debe poder registrar acciones de cobranza.
- El usuario debe poder consultar el historial de cobranza de un asociado.
- El sistema debe facilitar el seguimiento administrativo de asociados con pagos pendientes.

### 4.5 Vista integrada del asociado
- El sistema debe mostrar información financiera relevante dentro del contexto del asociado.
- La ficha del asociado debe poder conectarse con membresías, pagos y cobranza.

### 4.6 Base para control y análisis futuro
- El sistema debe dejar preparada la información para reportes posteriores de pagos, deuda, cobranza y cumplimiento.

---

## 5. Definition of Done (DoD)
El Hito 6 se considerará terminado únicamente cuando se cumplan todos los siguientes criterios:

### 5.1 Base de datos del módulo implementada
- La tabla de membresías está creada y operativa.
- La tabla de cronograma de pagos está creada y operativa.
- La tabla de pagos está creada y operativa.
- La tabla de acciones de cobranza está creada y operativa.
- Las relaciones necesarias con asociados, estados y usuarios están funcionando correctamente.

### 5.2 Gestión de membresía funcional
- El usuario puede registrar y consultar la membresía de un asociado.
- El sistema muestra datos clave como vigencia, estado, periodicidad o monto según el diseño adoptado.
- La membresía está correctamente vinculada al asociado.

### 5.3 Registro y consulta de pagos funcionales
- El usuario puede registrar pagos de forma operativa.
- Los pagos quedan almacenados correctamente.
- El usuario puede consultar pagos registrados por asociado o por contexto operativo.

### 5.4 Cronograma y estado de obligaciones listos
- El sistema puede mostrar obligaciones pendientes, vencidas o pagadas.
- Existe consistencia entre cronograma y pagos registrados.
- El usuario puede consultar el estado de cumplimiento del asociado.

### 5.5 Seguimiento de cobranza implementado
- El usuario puede registrar acciones de cobranza.
- El usuario puede consultar el historial de seguimiento por asociado.
- La información registrada es utilizable para gestión administrativa.

### 5.6 Integración completa del módulo
- Existen servicios organizados para membresías, pagos y cobranza.
- El frontend está integrado correctamente con Supabase.
- Existe manejo de cargas, errores y feedback visual.
- La ficha del asociado se conecta con la información financiera relevante.

### 5.7 Preparación para el siguiente hito
- La información del módulo queda estructurada para reportes futuros.
- El asociado ya cuenta con su dimensión financiera dentro del sistema.
- No se requiere rehacer la estructura principal del módulo para continuar con gestión documental y reportes.

---

## 6. Resultado esperado del hito
Al cerrar este hito, el Sistema de Asociados debe poder administrar la membresía de cada asociado, registrar sus pagos, controlar obligaciones pendientes y ejecutar seguimiento de cobranza. Esto permitirá a la organización tener control operativo sobre la relación económica con sus asociados y preparar la base de información necesaria para reportes y análisis posteriores.

---

## 7. Resumen ejecutivo
El Hito 6 incorpora la dimensión financiera al Sistema de Asociados. Su principal aporte es convertir la ficha del asociado en una unidad operativa completa, no solo administrativa, permitiendo gestionar membresías, registrar pagos y hacer seguimiento de cobranza. Con este hito, la plataforma se acerca mucho más a una operación real y sostenible, al integrar el control económico dentro del flujo principal del negocio.

