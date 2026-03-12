# Hito 5: Conversión a asociado y ficha principal

## 1. Objetivo del hito
Construir el núcleo central del Sistema de Asociados mediante la implementación del proceso de conversión de un prospecto a asociado y el desarrollo de la ficha principal del asociado como entidad operativa del negocio. Este hito tiene como finalidad permitir que la información capturada en la etapa comercial o de evaluación se transforme en un registro formal de asociado, conservando trazabilidad, estructura de datos consistente y capacidad de gestión integral dentro del sistema.

En esta etapa el producto pasa de gestionar interesados potenciales a administrar asociados reales, con su información empresarial, datos institucionales, personas vinculadas, contactos relevantes y estado general dentro de la organización.

---

## 2. Tareas del hito

### 2.1 Modelado de datos del asociado
- Crear la tabla principal de asociados.
- Definir la relación entre asociado y prospecto de origen, cuando corresponda.
- Definir campos principales de identificación interna, estado, fechas relevantes y trazabilidad.
- Preparar estructura para almacenar información institucional, comercial y administrativa del asociado.

### 2.2 Personas vinculadas al asociado
- Crear la tabla de personas vinculadas al asociado.
- Permitir registrar distintos tipos de personas relacionadas, como representante legal, representante ante cámara u otros perfiles definidos por el negocio.
- Definir campos personales y de contacto necesarios.
- Relacionar correctamente cada persona con su asociado correspondiente.

### 2.3 Contactos por área o función
- Crear la tabla de contactos por área.
- Permitir registrar contactos diferenciados por función, área o necesidad operativa.
- Preparar la estructura para que el asociado tenga múltiples contactos organizados.
- Relacionar estos contactos con la ficha principal del asociado.

### 2.4 Proceso de conversión de prospecto a asociado
- Diseñar el flujo de conversión de un prospecto aprobado a asociado formal.
- Definir qué datos se reutilizan desde el prospecto y cuáles se completan en esta etapa.
- Evitar duplicidad innecesaria de información.
- Registrar trazabilidad del proceso de conversión.
- Validar que un prospecto no se convierta múltiples veces de forma incorrecta.

### 2.5 Ficha principal del asociado
- Desarrollar la vista principal o ficha del asociado.
- Mostrar la información general del asociado.
- Mostrar datos empresariales e institucionales.
- Mostrar estado del asociado.
- Mostrar fechas importantes, responsables u otros datos operativos relevantes.
- Integrar personas vinculadas y contactos relacionados dentro de la ficha.

### 2.6 Listado general de asociados
- Desarrollar listado general de asociados.
- Mostrar información resumida por asociado.
- Implementar búsqueda básica.
- Implementar filtros por estado, categoría u otros criterios relevantes.
- Permitir acceso rápido al detalle del asociado.

### 2.7 Edición y mantenimiento de información
- Desarrollar formularios de edición de la ficha del asociado.
- Permitir actualización de datos principales.
- Permitir registrar, editar o inactivar personas vinculadas y contactos según corresponda.
- Validar consistencia de la información actualizada.

### 2.8 Historial y trazabilidad básica
- Preparar el registro de cambios relevantes de la ficha del asociado.
- Asociar cambios importantes a usuario y fecha cuando aplique.
- Mantener una base mínima de trazabilidad para soporte operativo y auditoría futura.

### 2.9 Integración con frontend y servicios
- Crear servicios del módulo de asociados.
- Integrar formularios, listados y fichas con Supabase.
- Organizar consultas, inserciones y actualizaciones del módulo.
- Aplicar manejo de errores, cargas y feedback visual.

### 2.10 Preparación para módulos posteriores
- Dejar la ficha del asociado preparada para conectarse con membresías, pagos, cobranza y documentos.
- Garantizar que el asociado sea tratado como entidad central del sistema en los hitos siguientes.

---

## 3. Requerimientos técnicos del hito

### 3.1 Estructura de datos
- Debe existir una tabla principal de asociados correctamente definida.
- Debe existir una tabla de personas vinculadas al asociado.
- Debe existir una tabla de contactos por área o función.
- Las relaciones entre asociado, prospecto, personas vinculadas y contactos deben estar definidas de forma consistente.
- Debe existir trazabilidad mínima de creación y actualización.

### 3.2 Integridad del proceso de conversión
- El sistema debe controlar la relación entre prospecto y asociado cuando exista conversión.
- Debe evitarse la creación inconsistente o duplicada de asociados desde un mismo prospecto.
- La conversión debe permitir reutilizar información relevante del módulo anterior.

### 3.3 Organización del código
- Debe existir un servicio centralizado para el módulo de asociados.
- La lógica de conversión, consulta y mantenimiento no debe quedar dispersa entre varias pantallas.
- La capa visual debe mantenerse separada de la lógica de acceso a datos.

### 3.4 Reutilización y escalabilidad
- El módulo debe reutilizar catálogos, estados y configuraciones ya definidas.
- La ficha del asociado debe quedar preparada para integrarse con módulos posteriores.
- La estructura debe permitir crecimiento futuro sin rehacer el núcleo del asociado.

### 3.5 Calidad funcional mínima
- Deben existir validaciones para campos obligatorios y relaciones clave.
- Debe existir manejo consistente de errores de formulario y persistencia.
- El módulo debe quedar listo para uso operativo real.

---

## 4. Requerimientos funcionales del hito

### 4.1 Conversión operativa a asociado
- El usuario debe poder convertir un prospecto aprobado en asociado.
- El sistema debe reutilizar información relevante del prospecto para crear el asociado.
- El sistema debe registrar la relación entre ambos registros cuando corresponda.

### 4.2 Registro y consulta del asociado
- El usuario debe poder visualizar un listado general de asociados.
- El usuario debe poder consultar la ficha detallada de cada asociado.
- El sistema debe permitir identificar claramente el estado y la información principal del asociado.

### 4.3 Gestión de información vinculada
- El usuario debe poder registrar personas vinculadas al asociado.
- El usuario debe poder registrar contactos por área o función.
- El usuario debe poder consultar y actualizar dicha información desde la ficha principal.

### 4.4 Mantenimiento de la ficha
- El usuario debe poder editar datos del asociado.
- El sistema debe conservar consistencia al actualizar la información.
- Debe existir una base de trazabilidad mínima sobre cambios relevantes.

### 4.5 Preparación para operación futura
- El asociado debe quedar listo para vincularse posteriormente con membresías, pagos, cobranza y documentos.
- La ficha debe actuar como punto central de consulta para los siguientes módulos.

---

## 5. Definition of Done (DoD)
El Hito 5 se considerará terminado únicamente cuando se cumplan todos los siguientes criterios:

### 5.1 Base de datos del módulo implementada
- La tabla de asociados está creada y operativa.
- La tabla de personas vinculadas está creada y operativa.
- La tabla de contactos por área está creada y operativa.
- Las relaciones necesarias con prospectos, categorías, estados y usuarios están funcionando correctamente.

### 5.2 Conversión funcional desde prospecto
- El usuario puede convertir un prospecto aprobado en asociado.
- El sistema reutiliza correctamente la información definida para la conversión.
- La relación entre prospecto y asociado queda registrada de forma consistente.
- El sistema evita conversiones duplicadas o inválidas.

### 5.3 Ficha principal del asociado operativa
- Existe una ficha principal del asociado funcional.
- La ficha muestra información general, institucional y operativa del asociado.
- La ficha integra personas vinculadas y contactos relacionados.

### 5.4 Consulta y mantenimiento funcionales
- Existe un listado general de asociados operativo.
- El usuario puede buscar o filtrar asociados mediante criterios básicos.
- El usuario puede editar información del asociado.
- El usuario puede registrar y mantener personas vinculadas y contactos.

### 5.5 Integración completa del módulo
- Existen servicios organizados para el módulo de asociados.
- El frontend está integrado correctamente con Supabase.
- Existe manejo de cargas, errores y feedback visual.

### 5.6 Trazabilidad básica implementada
- La ficha del asociado cuenta con trazabilidad mínima de creación y actualización.
- El sistema registra o deja preparada la base para registrar cambios relevantes por usuario y fecha.

### 5.7 Preparación para el siguiente hito
- El asociado queda listo para conectarse con el módulo de membresías, pagos y cobranza.
- No se requiere rehacer la estructura principal del módulo para continuar con la siguiente fase.
- El asociado ya funciona como entidad central del sistema.

---

## 6. Resultado esperado del hito
Al cerrar este hito, el Sistema de Asociados debe poder transformar prospectos aprobados en asociados formales y gestionar una ficha principal completa del asociado, con información institucional, personas vinculadas, contactos y trazabilidad básica. Esto permitirá consolidar el núcleo operativo del producto y preparar la integración de los módulos financieros, documentales y de seguimiento posterior.

---

## 7. Resumen ejecutivo
El Hito 5 consolida la entidad principal del negocio dentro del sistema: el asociado. Su principal aporte es convertir la gestión previa de prospectos en registros formales, organizados y reutilizables, que servirán como base para toda la operación posterior. Con este hito, la plataforma deja lista la columna vertebral sobre la cual se conectarán membresías, pagos, cobranza, documentos y demás funcionalidades del producto.

