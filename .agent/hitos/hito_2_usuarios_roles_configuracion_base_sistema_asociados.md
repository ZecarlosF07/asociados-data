# Hito 2: Usuarios, roles y configuración base

## 1. Objetivo del hito
Construir la base administrativa y de control de acceso del Sistema de Asociados, permitiendo identificar a los usuarios del sistema, asociarlos a un rol y establecer una primera capa de permisos y configuraciones generales. Este hito tiene como finalidad dejar resuelto el núcleo de seguridad funcional del producto para que los módulos posteriores operen sobre una estructura de acceso ordenada, controlada y escalable.

En esta etapa ya no solo se prepara la base técnica, sino que se incorporan elementos clave para la operación interna: perfiles de usuario, roles, permisos iniciales, parámetros generales y trazabilidad mínima de acciones relevantes.

---

## 2. Tareas del hito

### 2.1 Modelado de usuarios y roles
- Crear la tabla de roles del sistema.
- Crear la tabla de perfiles de usuario.
- Definir la relación entre usuario autenticado y perfil del sistema.
- Establecer campos base para identificación, estado y trazabilidad del usuario.
- Definir estados de usuario según las necesidades operativas.

### 2.2 Configuración de acceso y permisos
- Definir los tipos de rol que existirán en la plataforma.
- Establecer permisos iniciales por módulo o capacidad.
- Preparar lógica para restringir acceso según rol.
- Preparar validaciones para vistas protegidas por tipo de usuario.
- Establecer comportamiento base ante accesos no autorizados.

### 2.3 Configuración general del sistema
- Crear la tabla de configuraciones generales.
- Definir parámetros iniciales del sistema.
- Preparar una estructura flexible para futuras configuraciones.
- Registrar valores iniciales que serán usados por el sistema.

### 2.4 Auditoría base
- Definir estructura mínima para auditoría de acciones.
- Registrar eventos clave como inicio de sesión, cierre de sesión o accesos relevantes, según el alcance definido.
- Preparar la base para trazabilidad futura de cambios por módulo.

### 2.5 Integración frontend de gestión base
- Preparar servicios para consulta de roles, perfiles y configuraciones.
- Integrar la sesión autenticada con el perfil interno del sistema.
- Mostrar información básica del usuario autenticado dentro de la aplicación.
- Preparar guards o validaciones visuales según permisos.

### 2.6 Pantallas base o componentes de apoyo
- Crear vistas o estructuras mínimas para validar usuarios y roles.
- Preparar componentes o estados visuales para acceso denegado.
- Preparar lectura de configuraciones generales desde frontend.

### 2.7 Datos iniciales
- Cargar roles base del sistema.
- Crear configuraciones iniciales requeridas para la operación.
- Registrar usuarios iniciales de prueba o administración si corresponde al entorno.

---

## 3. Requerimientos técnicos del hito

### 3.1 Estructura de datos
- Debe existir una tabla de roles claramente definida.
- Debe existir una tabla de perfiles de usuario separada de la autenticación.
- La relación entre autenticación y perfil interno debe quedar clara y estable.
- Debe existir una tabla de configuración general del sistema.
- Debe existir una base mínima de auditoría.

### 3.2 Seguridad y control de acceso
- El sistema debe poder identificar el rol del usuario autenticado.
- Debe existir una forma de proteger funcionalidades según permisos.
- Las validaciones de acceso no deben depender únicamente de la interfaz visual.
- El sistema debe estar preparado para escalar a controles más estrictos en hitos posteriores.

### 3.3 Organización del código
- Los permisos y validaciones de acceso deben estar centralizados o claramente organizados.
- Los servicios de usuario, roles y configuración no deben estar dispersos en múltiples pantallas.
- Debe mantenerse separación entre lógica de presentación, lógica de acceso y lógica de datos.

### 3.4 Parametrización
- Las configuraciones generales deben almacenarse de forma flexible.
- La solución debe permitir agregar nuevas configuraciones sin rediseñar la base.
- Los valores iniciales deben quedar versionados mediante migraciones o seeds.

### 3.5 Trazabilidad
- Debe quedar preparada una base técnica para registrar acciones relevantes.
- El sistema debe poder asociar acciones a un usuario autenticado.

---

## 4. Requerimientos funcionales del hito

### 4.1 Identificación del usuario
- El sistema debe reconocer al usuario autenticado y vincularlo con su perfil interno.
- El usuario debe poder ingresar al sistema y operar según su rol.
- El sistema debe poder distinguir entre distintos tipos de usuario.

### 4.2 Comportamiento según rol
- El usuario debe visualizar únicamente las opciones o accesos que le correspondan según su rol.
- El sistema debe restringir el acceso a rutas o vistas no permitidas.
- Debe existir una respuesta clara cuando el usuario intente ingresar a una sección no autorizada.

### 4.3 Configuración general
- El sistema debe poder leer configuraciones generales necesarias para su funcionamiento.
- Debe existir una base para manejar parámetros del sistema sin modificar código fuente cada vez.

### 4.4 Base administrativa operativa
- Debe existir una estructura funcional para roles y perfiles.
- Debe existir al menos un conjunto inicial de roles operativos.
- Debe existir un usuario administrador o equivalente para continuar con la implementación de los siguientes hitos.

### 4.5 Trazabilidad mínima
- El sistema debe dejar preparada o registrar una base mínima de acciones relevantes realizadas por usuarios autenticados.

---

## 5. Definition of Done (DoD)
El Hito 2 se considerará terminado únicamente cuando se cumplan todos los siguientes criterios:

### 5.1 Base de usuarios y roles implementada
- La tabla de roles está creada y operativa.
- La tabla de perfiles de usuario está creada y operativa.
- Existe relación funcional entre autenticación y perfil interno.
- Existen roles iniciales cargados en el sistema.

### 5.2 Control de acceso funcional
- El sistema puede identificar el rol del usuario autenticado.
- Las rutas o vistas restringidas responden correctamente según el rol.
- Existe manejo visual y funcional para accesos no autorizados.
- La lógica base de permisos está implementada para ser reutilizada en módulos siguientes.

### 5.3 Configuración base implementada
- La tabla de configuraciones generales está creada.
- Existen configuraciones iniciales registradas.
- El frontend puede leer configuraciones generales del sistema.

### 5.4 Auditoría base preparada
- Existe una estructura mínima para registrar acciones relevantes.
- La aplicación puede asociar una acción a un usuario autenticado o, como mínimo, ya queda preparada técnicamente para hacerlo.

### 5.5 Integración operativa en frontend
- El usuario autenticado puede visualizar información básica asociada a su perfil.
- El frontend aplica validaciones base según el rol.
- Existen servicios organizados para usuarios, roles y configuraciones.

### 5.6 Preparación para el siguiente hito
- El sistema queda listo para construir catálogos y reglas maestras sin rehacer la lógica de acceso.
- El equipo puede reutilizar la estructura de roles, perfiles y permisos en los siguientes módulos.
- La base administrativa y de control de acceso ya está estabilizada.

---

## 6. Resultado esperado del hito
Al cerrar este hito, el Sistema de Asociados debe contar con una estructura funcional de usuarios, roles, permisos base, configuraciones generales y una trazabilidad mínima de acciones. Esto permitirá que los siguientes módulos del sistema se construyan sobre una capa de acceso y administración consistente, evitando improvisación en seguridad y control operativo.

---

## 7. Resumen ejecutivo
El Hito 2 consolida la base administrativa del sistema. Su principal aporte es dejar resuelto quién puede ingresar, cómo se identifica dentro de la plataforma, qué acceso tendrá según su rol y cómo el sistema comenzará a registrar acciones relevantes. Esto reduce riesgos de desorden funcional en etapas posteriores y permite construir los módulos del negocio sobre una estructura de acceso ya definida.

