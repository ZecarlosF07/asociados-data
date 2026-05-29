# Hitos S de Subsanación del Sistema de Asociados

## Propósito del documento

Este documento define los hitos S de subsanación del Sistema de Asociados. Su finalidad es cerrar las brechas detectadas después de revisar los hitos funcionales originales, sin mezclar el alcance de construcción del MVP con el alcance de corrección, hardening, QA y cierre técnico.

Los hitos originales 1 al 8 deben mantenerse como línea base funcional del producto. Los hitos S deben tratarse como una etapa posterior de estabilización dentro del ciclo de vida del software.

## Decisión de estructura

La estructura correcta para ejecutar estas correcciones es híbrida:

- Un hito transversal para calidad técnica y reglas internas.
- Hitos de subsanación asociados al hito original que queda incompleto o con riesgo.
- Un hito final de QA, datos semilla y release.

Esta organización permite que un desarrollador entienda exactamente qué parte del MVP está cerrando, qué riesgo corrige y qué criterio debe cumplir para darlo por terminado.

## Hitos S propuestos

### S0. Subsanación transversal: calidad técnica y reglas internas

Corrige problemas generales que afectan a todo el proyecto:

- lint
- componentes demasiado grandes
- separación de responsabilidades
- estrategia TypeScript
- cumplimiento de reglas internas

### S1. Subsanación del Hito 2: seguridad, roles y permisos

Cierra brechas del módulo administrativo y de seguridad:

- permisos reales en backend
- RLS en Supabase
- policies por rol
- auditoría operativa

### S2. Subsanación del Hito 5: conversión e integridad del asociado

Cierra riesgos del núcleo del sistema:

- conversión transaccional de prospecto a asociado
- prevención real de duplicados
- códigos correlativos seguros
- consistencia prospecto/asociado

### S3. Subsanación del Hito 6: membresías, pagos y cobranza

Completa el cierre financiero-operativo:

- pagos dentro de ficha del asociado
- cobranza dentro de ficha del asociado
- registro de pago transaccional
- consistencia de cronograma y estados

### S4. Subsanación del Hito 7: documentos y almacenamiento

Completa el módulo documental:

- detalle documental real
- ruta de documento funcional
- políticas de Storage
- metadatos, versionamiento y configuración de bucket

### S5. Subsanación del Hito 8: reportes, exportaciones y automatizaciones

Fortalece la capa de explotación de información:

- reportes con vistas SQL o RPC
- exportaciones consistentes
- base persistente de automatizaciones
- rendimiento y división de bundle

### S6. QA, datos semilla y release interno del MVP

Cierra la etapa de estabilización:

- pruebas funcionales de punta a punta
- validación de seeds
- validación de migraciones en entorno limpio
- checklist de release

### S7. Corrección post-release del Hito 6: fechas de membresías y cronograma

Corrige un bug funcional detectado después del cierre de S6:

- fechas `date` desplazadas por zona horaria
- cálculo incorrecto de período inicial del cronograma
- vencimientos mensuales no alineados visualmente al día de cobro
- comparación de cuotas vencidas usando timestamps en vez de fechas calendario

### S8. Mejora post-release del Hito 4: prospectos en lista y filtros operativos

Mejora la consulta operativa de prospectos:

- listado vertical de prospectos en lugar de grilla de tarjetas
- filtros visibles por estado, categoría y captador
- búsqueda textual combinable con filtros
- limpieza de filtros y estados vacíos coherentes

### S9. Mejora post-release del Hito 5: alta directa de asociados históricos

Agrega un camino operativo para cargar asociados existentes sin crear prospectos ficticios:

- ruta `/asociados/nuevo`
- alta directa con código `A + YY de fecha de asociación + últimos 6 dígitos del RUC`
- validación de RUC duplicado
- auditoría de origen histórico/directo
- ficha de asociado funcionando sin `prospect_origin_id`

### S10. Mejora post-release del Hito 2: módulo de auditoría operativa

Convierte la infraestructura de auditoría existente en una pantalla administrativa usable:

- ruta `/auditoria`
- listado de eventos de `audit_logs`
- filtros por usuario, entidad, acción y rango de fechas
- detalle de `previous_data`, `new_data` y `extra_meta`
- acceso restringido por permiso `auditoria`
- estrategia de retención de 6 meses

### S11. Mejora post-release del Hito 5: asociados en lista operativa

Mejora la consulta operativa de asociados:

- listado vertical de asociados en lugar de grilla de tarjetas
- lectura rápida de razón social, código interno, RUC, estado y categoría
- acceso directo a ficha del asociado desde cada fila
- conservación de filtros existentes y alta directa

### S12. Corrección post-release del Hito 6: vencimiento de membresía anual

Corrige una regla financiera del cronograma anual:

- una membresía anual debe generar una sola cuota
- la cuota anual debe vencer al día siguiente de la fecha de fin de la membresía
- el vencimiento no debe usar la fecha de inicio de la membresía
- las membresías mensuales no deben cambiar

### S13. Mejora post-release del Hito 2: generación de usuarios y roles operativos

Completa la administración real de usuarios internos:

- creación de usuarios Auth + perfil interno desde `/usuarios`
- roles vigentes `ADMIN`, `CAPTACION`, `FACTURACION`, `FIDELIZACION` y `ALTA_DIRECCION`
- retiro de roles generales `OPERADOR` y `CONSULTA`
- matriz de permisos frontend/backend alineada
- protección de Dashboard para roles sin acceso
- redirección inicial según rol permitido
- documentación operativa de roles, permisos y lecturas RLS de referencia

### S14. Hardening preproducción: auditoría confiable y fechas de pago

Cierra hallazgos técnicos previos a producción:

- bloqueo de inserción directa a `audit_logs` desde cliente
- conservación de auditoría por triggers, RPCs o funciones controladas
- eliminación o corrección de `paymentSchedulesService.markAsPaid`
- prevención de escrituras futuras de `paid_at` con `new Date().toISOString()`
- validación de `register_payment(...)` con fechas de negocio en `America/Lima`

### S15. Evolución post-release del Hito 6: modalidades de cobro para membresías anuales

Extiende el cronograma financiero de membresías:

- nuevas modalidades de cobro `TRIMESTRAL`, `CUATRIMESTRAL` y `SEMESTRAL`
- membresía con cobertura anual, independientemente de la modalidad de cobro
- generación de 4, 3 o 2 cuotas según modalidad
- misma regla de día de cobro usada por membresías mensuales
- protección explícita contra regresiones de fechas calendario y desfases por zona horaria

## Orden recomendado de ejecución

1. S0 - Calidad transversal.
2. S1 - Seguridad y permisos.
3. S2 - Conversión e integridad del asociado.
4. S3 - Finanzas.
5. S4 - Documentos.
6. S5 - Reportes y automatizaciones.
7. S6 - QA y release.
8. S7 - Corrección post-release de fechas de membresía y cronograma.
9. S9 - Alta directa de asociados históricos.
10. S8 - Mejora post-release de listado y filtros de prospectos.
11. S10 - Módulo de auditoría operativa.
12. S11 - Asociados en lista operativa.
13. S12 - Corrección de vencimiento de membresía anual.
14. S13 - Generación de usuarios y roles operativos.
15. S14 - Hardening preproducción de auditoría y fechas de pago.
16. S15 - Modalidades de cobro para membresías anuales.

S0 debe hacerse primero porque reduce fricción técnica. S6 debe hacerse al final porque valida todo el sistema integrado.
S7 se ejecuta después de S6 porque nace de un bug funcional detectado durante validación posterior al release interno.
S9 se ejecuta después de S6 porque responde a la carga operativa real de datos históricos sin alterar el flujo normal de conversión.
S8 se ejecuta después de S9 porque mejora una experiencia operativa ya funcional y no bloquea la carga inicial de asociados reales.
S10 se ejecuta después de los flujos operativos principales porque aprovecha los eventos ya generados por los módulos estabilizados.
S11 se ejecuta después de S10 porque es una mejora de experiencia sobre un flujo ya estable.
S12 puede adelantarse a S11 si se van a seguir creando membresías anuales, porque corrige una regla financiera de cronograma.
S13 se ejecuta después de estabilizar auditoría y roles base porque introduce usuarios reales por perfil operativo y debe quedar trazado.
S14 se ejecuta después de S13 y antes de limpiar la base de datos porque endurece la auditoría y elimina un riesgo latente de fechas antes de iniciar carga real.
S15 se ejecuta después de S14 porque amplía la lógica financiera ya estabilizada y debe respetar las reglas de fechas endurecidas antes de cargar membresías reales con nuevas modalidades.

## Criterio global de cierre

La subsanación completa queda cerrada cuando:

- `yarn lint` pasa sin errores.
- `yarn build` pasa sin errores.
- Las reglas internas quedan cumplidas o documentadas con excepción técnica explícita.
- Los permisos no dependen únicamente del frontend.
- Las operaciones críticas son transaccionales o tienen mitigación documentada.
- Los DoD pendientes de los hitos 5, 6, 7 y 8 quedan cerrados.
- Las migraciones quedan versionadas en `supabase/migrations`.
- Existe checklist de QA y release completado.

## Documentos detallados

- [S0 - Calidad técnica y reglas internas](./hito_s0_subsanacion_transversal_calidad_tecnica.md)
- [S1 - Hito 2: seguridad, roles y permisos](./hito_s1_subsanacion_hito_2_seguridad_roles_permisos.md)
- [S2 - Hito 5: conversión e integridad del asociado](./hito_s2_subsanacion_hito_5_conversion_integridad_asociado.md)
- [S3 - Hito 6: membresías, pagos y cobranza](./hito_s3_subsanacion_hito_6_membresias_pagos_cobranza.md)
- [S4 - Hito 7: documentos y almacenamiento](./hito_s4_subsanacion_hito_7_documentos_almacenamiento.md)
- [S5 - Hito 8: reportes, exportaciones y automatizaciones](./hito_s5_subsanacion_hito_8_reportes_exportaciones_automatizaciones.md)
- [S6 - QA, datos semilla y release](./hito_s6_qa_datos_semilla_release.md)
- [S7 - Corrección de fechas de membresías y cronograma](./hito_s7_correccion_fechas_membresias_cronograma.md)
- [S8 - Prospectos en lista y filtros operativos](./hito_s8_mejora_prospectos_lista_filtros_captador.md)
- [S9 - Alta directa de asociados históricos](./hito_s9_alta_directa_asociados_historicos.md)
- [S10 - Módulo de auditoría operativa](./hito_s10_modulo_auditoria_operativa.md)
- [S11 - Asociados en lista operativa](./hito_s11_asociados_lista_operativa.md)
- [S12 - Corrección de vencimiento de membresía anual](./hito_s12_correccion_vencimiento_membresia_anual.md)
- [S13 - Generación de usuarios y roles operativos](./hito_s13_generacion_usuarios_roles_operativos.md)
- [S14 - Hardening preproducción de auditoría y fechas de pago](./hito_s14_hardening_preproduccion_auditoria_fechas.md)
- [S15 - Modalidades de cobro para membresías anuales](./hito_s15_modalidades_cobro_membresias_anuales.md)
- [Documento técnico S13 - Roles y permisos operativos](../../docs/hito_s13_roles_permisos_operativos.md)
