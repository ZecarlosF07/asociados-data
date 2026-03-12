# Hito 4: Módulo de prospectos

## 1. Objetivo del hito
Construir el primer módulo funcional completo del Sistema de Asociados, enfocado en la gestión de prospectos como etapa previa a la conversión en asociado. Este hito tiene como finalidad permitir el registro, evaluación, clasificación, seguimiento y control del avance comercial o institucional de los potenciales asociados, dejando trazabilidad de su información y de sus cambios de estado dentro del proceso.

En esta etapa el sistema deja de ser únicamente una base técnica y administrativa para convertirse en una herramienta operativa del negocio, capaz de gestionar el flujo inicial de incorporación de nuevos asociados.

---

## 2. Tareas del hito

### 2.1 Modelado de datos del módulo
- Crear la tabla de prospectos.
- Crear la tabla de historial de estados del prospecto.
- Crear la tabla de evaluación del prospecto.
- Crear la tabla de cotización o propuesta del prospecto.
- Definir relaciones entre prospectos, categorías, estados y usuarios responsables.
- Definir campos mínimos para trazabilidad del registro.

### 2.2 Registro de prospectos
- Desarrollar formulario de registro de prospectos.
- Permitir capturar información general del posible asociado.
- Permitir registrar datos empresariales o institucionales según corresponda.
- Permitir asociar categoría, tipo, estado inicial u otros valores maestros necesarios.
- Validar obligatoriedad y consistencia de campos principales.

### 2.3 Listado y consulta
- Desarrollar listado general de prospectos.
- Permitir visualizar información resumida por registro.
- Implementar búsqueda básica.
- Implementar filtros por estado, categoría, responsable u otros criterios relevantes.
- Permitir acceso al detalle completo del prospecto.

### 2.4 Vista detalle del prospecto
- Desarrollar vista de detalle del prospecto.
- Mostrar información general del registro.
- Mostrar evaluación asociada.
- Mostrar cotización o propuesta asociada.
- Mostrar historial de estados o seguimiento.
- Mostrar trazabilidad básica de creación y actualización.

### 2.5 Evaluación del prospecto
- Implementar registro de evaluación del prospecto.
- Permitir consignar observaciones, criterios de evaluación o comentarios relevantes.
- Permitir registrar información que apoye la decisión de continuidad o conversión.
- Validar que la evaluación quede asociada correctamente al prospecto.

### 2.6 Cotización o propuesta
- Implementar estructura para registrar propuesta económica o institucional.
- Permitir asociar montos, categorías, condiciones o referencias necesarias.
- Preparar base para cálculo o sugerencia de propuesta según reglas del negocio.
- Permitir visualizar la propuesta desde el detalle del prospecto.

### 2.7 Gestión de estados y seguimiento
- Implementar cambio de estado del prospecto.
- Registrar cada cambio en historial.
- Permitir seguimiento del estado actual y estados anteriores.
- Preparar lógica para estados como nuevo, en evaluación, contactado, aprobado, rechazado o equivalente según definición del negocio.
- Asociar los cambios a usuario y fecha cuando corresponda.

### 2.8 Integración con servicios y frontend
- Crear servicios del módulo de prospectos.
- Organizar consultas, inserciones y actualizaciones del módulo.
- Integrar formularios, listados y detalle con Supabase.
- Aplicar manejo de errores, cargas y feedback visual.

### 2.9 Base para conversión futura a asociado
- Preparar estructura para que un prospecto pueda convertirse en asociado en el siguiente hito.
- Asegurar que la información relevante del prospecto pueda reutilizarse en el proceso de conversión.
- Evitar duplicidad innecesaria de datos al pasar de prospecto a asociado.

---

## 3. Requerimientos técnicos del hito

### 3.1 Estructura de datos
- Debe existir una tabla de prospectos correctamente definida.
- Debe existir una tabla de historial de estados del prospecto.
- Debe existir una tabla para evaluación del prospecto.
- Debe existir una tabla para propuesta o cotización del prospecto.
- Las relaciones con usuarios, categorías, catálogos y estados deben estar definidas de forma consistente.

### 3.2 Integridad y trazabilidad
- Cada prospecto debe contar con trazabilidad mínima de creación y actualización.
- Los cambios de estado deben quedar registrados de forma histórica.
- La evaluación y propuesta deben relacionarse correctamente con el prospecto.

### 3.3 Organización del código
- Debe existir un servicio centralizado para el módulo de prospectos.
- Los formularios, listados y vistas detalle no deben duplicar lógica innecesaria.
- La lógica de consulta y persistencia debe mantenerse separada de la capa visual.

### 3.4 Parametrización y reutilización
- Los estados, categorías y demás opciones configurables deben consumirse desde la base maestra del sistema.
- El módulo debe reutilizar catálogos y configuraciones ya definidos en hitos anteriores.
- Debe quedar preparado para integrarse con el flujo de conversión a asociado.

### 3.5 Calidad funcional mínima
- Debe existir validación de campos obligatorios.
- Debe existir manejo consistente de errores de formulario o persistencia.
- El módulo debe estar listo para ser usado operativamente sin depender de ajustes manuales constantes.

---

## 4. Requerimientos funcionales del hito

### 4.1 Registro operativo de prospectos
- El usuario debe poder registrar un nuevo prospecto.
- El sistema debe almacenar la información principal del prospecto.
- El usuario debe poder asociar categoría, estado u otros datos requeridos para su clasificación.

### 4.2 Consulta y seguimiento
- El usuario debe poder visualizar un listado general de prospectos.
- El usuario debe poder consultar el detalle completo de cada prospecto.
- El usuario debe poder buscar y filtrar prospectos según criterios básicos de gestión.

### 4.3 Evaluación del prospecto
- El usuario debe poder registrar una evaluación del prospecto.
- El usuario debe poder consultar la evaluación registrada.
- El sistema debe permitir mantener observaciones o comentarios relevantes para el seguimiento.

### 4.4 Propuesta o cotización
- El usuario debe poder registrar una propuesta asociada al prospecto.
- El usuario debe poder visualizar dicha propuesta desde la ficha del prospecto.
- El sistema debe dejar preparada una base para futuras reglas de cálculo o sugerencia.

### 4.5 Cambio de estado
- El usuario debe poder actualizar el estado del prospecto.
- El sistema debe guardar el historial de cambios de estado.
- El sistema debe permitir identificar el estado actual del prospecto de forma clara.

### 4.6 Preparación para conversión
- El sistema debe dejar al prospecto listo para un proceso posterior de conversión a asociado.
- La información registrada debe ser reutilizable en el siguiente hito.

---

## 5. Definition of Done (DoD)
El Hito 4 se considerará terminado únicamente cuando se cumplan todos los siguientes criterios:

### 5.1 Base de datos del módulo implementada
- La tabla de prospectos está creada y operativa.
- La tabla de historial de estados está creada y operativa.
- La tabla de evaluación está creada y operativa.
- La tabla de propuesta o cotización está creada y operativa.
- Las relaciones necesarias con catálogos, categorías y usuarios están funcionando correctamente.

### 5.2 Flujo de registro funcional
- El usuario puede registrar prospectos mediante formulario.
- El sistema valida los campos obligatorios.
- El registro queda almacenado correctamente en la base de datos.

### 5.3 Consulta y detalle funcionales
- Existe un listado general de prospectos operativo.
- El usuario puede acceder al detalle de cada prospecto.
- Existen filtros o búsquedas básicas funcionales.

### 5.4 Evaluación y propuesta implementadas
- El usuario puede registrar y consultar la evaluación del prospecto.
- El usuario puede registrar y consultar la propuesta o cotización del prospecto.
- Ambos elementos están correctamente vinculados al registro principal.

### 5.5 Seguimiento y estados listos
- El usuario puede cambiar el estado del prospecto.
- Cada cambio queda registrado en historial.
- El sistema muestra el estado actual del prospecto de manera clara.

### 5.6 Integración completa del módulo
- Existen servicios organizados para el módulo de prospectos.
- El frontend está integrado correctamente con Supabase.
- Existe manejo de cargas, errores y feedback visual.

### 5.7 Preparación para el siguiente hito
- La información del prospecto puede reutilizarse para la futura conversión a asociado.
- El módulo queda estable y listo para conectarse con el Hito 5.
- No se requiere rehacer la estructura principal del módulo para continuar con la siguiente fase.

---

## 6. Resultado esperado del hito
Al cerrar este hito, el Sistema de Asociados debe poder registrar, consultar, evaluar, clasificar y dar seguimiento completo a prospectos. Esto permitirá que la organización gestione de forma ordenada la etapa previa al alta de un asociado, con trazabilidad, control de estados y una base lista para el proceso de conversión posterior.

---

## 7. Resumen ejecutivo
El Hito 4 representa el inicio del primer módulo funcional completo del sistema. Su principal aporte es transformar la plataforma en una herramienta operativa para gestionar el proceso inicial de captación o evaluación de futuros asociados. Con este hito, el sistema deja de ser solo una estructura técnica para convertirse en una solución aplicable al flujo real del negocio.

