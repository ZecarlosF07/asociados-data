# Hito 3: Catálogos y reglas maestras

## 1. Objetivo del hito
Construir la base de parametrización del Sistema de Asociados mediante catálogos, categorías y reglas maestras que permitan controlar los valores operativos del sistema sin depender de datos fijos escritos directamente en el frontend. Este hito tiene como finalidad dejar preparada una estructura flexible, mantenible y escalable para soportar formularios, estados, tipos, clasificaciones y demás elementos reutilizables que serán consumidos por los módulos funcionales posteriores.

En esta etapa se busca que la aplicación empiece a trabajar con datos configurables del negocio, reduciendo el hardcodeo, facilitando ajustes futuros y permitiendo que el comportamiento del sistema pueda evolucionar sin rehacer la base técnica ni alterar la lógica principal de las pantallas.

---

## 2. Tareas del hito

### 2.1 Modelado de catálogos generales
- Crear la tabla de grupos de catálogos.
- Crear la tabla de ítems de catálogo.
- Definir la relación entre grupo e ítem.
- Establecer campos de orden, estado, código interno y visibilidad si corresponde.
- Preparar la estructura para que distintos módulos consuman los catálogos de forma reutilizable.

### 2.2 Modelado de categorías
- Crear la tabla de categorías del sistema.
- Definir su estructura independiente cuando represente una entidad de negocio con mayor relevancia.
- Preparar la base para que una categoría pueda crecer en lógica, relaciones y atributos en etapas posteriores.
- Registrar los campos mínimos necesarios para su uso operativo inicial.

### 2.3 Definición de datos maestros
- Registrar estados operativos del sistema.
- Registrar tipos de actividad.
- Registrar tamaños de empresa.
- Registrar tipos y clasificaciones necesarias para formularios.
- Registrar demás opciones maestras que utilizarán prospectos, asociados, membresías, documentos u otros módulos.

### 2.4 Seeds y carga inicial
- Preparar seeds o datos iniciales necesarios para que el sistema funcione.
- Cargar valores base en catálogos y categorías.
- Versionar la carga inicial para mantener control de cambios.
- Validar consistencia de los datos cargados.

### 2.5 Servicios y consumo desde frontend
- Crear servicios de lectura de catálogos y categorías.
- Preparar una forma estandarizada de consultar opciones reutilizables.
- Integrar catálogos en selects, formularios y vistas base.
- Preparar caché ligera o estrategia de reutilización si aplica.

### 2.6 Validaciones y reglas iniciales
- Definir qué catálogos son obligatorios para cada flujo futuro.
- Preparar validaciones para evitar duplicidad o inconsistencia en los registros maestros.
- Establecer reglas básicas para activación, inactivación u orden visual de catálogos.

### 2.7 Base para escalabilidad futura
- Preparar la estructura para que nuevos catálogos puedan agregarse sin rediseñar el sistema.
- Permitir que algunas entidades evolucionen de catálogo simple a entidad funcional si el negocio lo requiere.
- Mantener una separación clara entre catálogos genéricos y entidades que ameriten tabla propia.

---

## 3. Requerimientos técnicos del hito

### 3.1 Estructura de datos
- Debe existir una tabla de grupos de catálogos.
- Debe existir una tabla de ítems de catálogo relacionada a su grupo.
- Debe existir una tabla de categorías separada cuando corresponda a una entidad del negocio.
- La estructura debe permitir ordenar, activar, desactivar y clasificar registros maestros.

### 3.2 Parametrización y mantenibilidad
- Los valores operativos no deben quedar quemados en el frontend cuando deban ser configurables.
- El sistema debe permitir agregar nuevos ítems a un catálogo sin alterar la lógica principal de la aplicación.
- La parametrización debe ser lo suficientemente flexible para acompañar el crecimiento del producto.

### 3.3 Organización del código
- Los servicios de catálogos y categorías deben estar centralizados.
- Los formularios no deben repetir lógica innecesaria para obtener opciones maestras.
- Debe existir una forma estándar de consumir catálogos desde el frontend.

### 3.4 Calidad y consistencia de datos
- Deben existir validaciones para evitar duplicidad de códigos o nombres críticos cuando aplique.
- Los seeds deben quedar controlados mediante migraciones o mecanismos versionables.
- La estructura debe permitir consistencia entre catálogos compartidos por varios módulos.

### 3.5 Escalabilidad funcional
- La solución debe permitir diferenciar entre un catálogo simple y una entidad que luego necesite más lógica.
- El diseño no debe bloquear la futura incorporación de beneficios, tipos de servicio u otras clasificaciones con mayor complejidad.

---

## 4. Requerimientos funcionales del hito

### 4.1 Disponibilidad de opciones maestras
- El sistema debe poder mostrar listas de opciones configurables para formularios y filtros.
- Las opciones deben poder reutilizarse en distintos módulos sin redefinirlas en cada pantalla.
- Los valores visibles para el usuario deben provenir de la base parametrizada.

### 4.2 Uso de categorías y clasificaciones
- El sistema debe contar con una estructura funcional para clasificar entidades según categorías u otras reglas maestras.
- Debe existir una base lista para usar estas clasificaciones en prospectos, asociados, pagos o documentos según se requiera en hitos posteriores.

### 4.3 Comportamiento configurable
- El sistema debe poder responder a configuraciones de estado, tipo y clasificación sin modificar código fuente en cada ajuste.
- Debe existir una base funcional que permita controlar opciones activas o inactivas.

### 4.4 Reutilización en frontend
- Los formularios deben poder consumir catálogos y categorías desde servicios comunes.
- Las vistas deben poder mostrar nombres descriptivos provenientes de tablas maestras.
- Debe existir una base para filtros por estado, categoría, tipo u otra clasificación.

---

## 5. Definition of Done (DoD)
El Hito 3 se considerará terminado únicamente cuando se cumplan todos los siguientes criterios:

### 5.1 Estructura maestra implementada
- La tabla de grupos de catálogos está creada y operativa.
- La tabla de ítems de catálogo está creada y operativa.
- La tabla de categorías está creada y operativa.
- Las relaciones y campos mínimos necesarios están definidos correctamente.

### 5.2 Datos iniciales cargados
- Existen seeds o cargas iniciales registradas para los catálogos esenciales.
- Existen categorías base creadas según la necesidad del negocio.
- Los datos cargados fueron validados y son utilizables por el sistema.

### 5.3 Consumo funcional desde frontend
- El frontend puede consultar catálogos y categorías mediante servicios organizados.
- Existen componentes o formularios base que consumen opciones desde la base de datos.
- Las opciones ya no dependen de valores fijos escritos directamente en la interfaz para los casos definidos como configurables.

### 5.4 Validaciones básicas implementadas
- Existen validaciones mínimas para evitar inconsistencias relevantes en datos maestros.
- Existe manejo de estado o activación de registros cuando corresponda.
- La estructura permite ordenar o clasificar visualmente opciones maestras.

### 5.5 Preparación para módulos posteriores
- El sistema queda listo para que el Hito 4 consuma estados, categorías, tipos y demás datos maestros sin rehacer esta base.
- El equipo puede reutilizar la estructura creada en prospectos, asociados, membresías y documentos.
- La parametrización del sistema ya está estabilizada como fundamento del negocio.

---

## 6. Resultado esperado del hito
Al cerrar este hito, el Sistema de Asociados debe contar con una estructura de catálogos, categorías y datos maestros lista para ser reutilizada por los módulos funcionales. Esto permitirá construir formularios, estados, filtros y clasificaciones sobre una base parametrizable, mantenible y coherente con el crecimiento futuro del producto.

---

## 7. Resumen ejecutivo
El Hito 3 consolida la capa de reglas maestras del sistema. Su principal aporte es eliminar la dependencia de valores fijos dispersos en el frontend y reemplazarlos por una estructura administrable desde la base de datos. Esto mejora la mantenibilidad, reduce retrabajo y prepara al sistema para crecer con mayor orden funcional y técnico.

