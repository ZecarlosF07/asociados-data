# Hitos de Implementación del Sistema de Asociados

## Propósito del documento
Este documento resume los hitos recomendados para la implementación del Sistema de Asociados, con una explicación clara de qué se debe desarrollar en cada etapa. El objetivo es que el equipo de desarrollo tenga una guía ordenada para construir el producto de forma progresiva, evitando desorden técnico, retrabajos y dependencias mal resueltas.

La lógica propuesta no consiste en desarrollar primero todo el frontend ni tampoco construir toda la base de datos de una sola vez sin validar módulos funcionales. La recomendación es trabajar por hitos, construyendo primero la base estructural del sistema y luego avanzando por módulos completos, cerrando cada etapa con tablas, servicios, vistas, validaciones y funcionalidades operativas.

---

## Hito 1. Base técnica del proyecto
En esta etapa se prepara la estructura técnica general sobre la cual se construirá todo el sistema.

### Qué se realiza
- Creación del proyecto base en React.
- Configuración de Supabase como backend principal.
- Integración inicial entre frontend y backend.
- Definición de la estructura de carpetas del proyecto.
- Configuración de rutas principales de la aplicación.
- Creación del layout general del sistema.
- Preparación del manejo de sesión.
- Configuración base de autenticación.
- Manejo global de estados de carga, errores y respuestas.
- Preparación de componentes comunes reutilizables.

### Resultado esperado
Al finalizar este hito, la aplicación ya debe contar con una base técnica sólida, organizada y escalable, lista para recibir los módulos funcionales sin generar desorden estructural.

---

## Hito 2. Usuarios, roles y configuración base
En esta etapa se construye la base administrativa y de seguridad del sistema.

### Qué se realiza
- Creación de la tabla de roles.
- Creación de la tabla de perfiles de usuario.
- Definición de tipos de usuario del sistema.
- Relación entre usuarios y roles.
- Configuración de permisos iniciales por módulo.
- Creación de configuraciones generales del sistema.
- Implementación de una auditoría base para registrar acciones importantes.
- Preparación de la lógica de acceso según perfil.

### Resultado esperado
Al finalizar este hito, el sistema ya podrá reconocer quién entra, qué rol tiene y qué acciones puede realizar dentro de la plataforma.

---

## Hito 3. Catálogos y reglas maestras
En esta etapa se construyen las tablas y configuraciones que servirán como base para formularios, estados y reglas del negocio.

### Qué se realiza
- Creación de grupos de catálogos.
- Creación de ítems de catálogo.
- Creación de la tabla de categorías.
- Registro de estados generales del sistema.
- Registro de tipos de actividad.
- Registro de tamaños de empresa.
- Registro de tipos y opciones necesarias para formularios.
- Carga inicial de datos base mediante seeds.

### Resultado esperado
Al finalizar este hito, el sistema ya contará con parámetros configurables y no dependerá de valores fijos escritos directamente en el frontend.

---

## Hito 4. Módulo de prospectos
En esta etapa se construye el primer módulo funcional completo del negocio.

### Qué se realiza
- Creación de la tabla de prospectos.
- Creación del historial de estados del prospecto.
- Creación del registro de evaluación del prospecto.
- Creación de la cotización o propuesta del prospecto.
- Desarrollo del formulario de registro de prospectos.
- Desarrollo del listado general de prospectos.
- Desarrollo de la vista detalle del prospecto.
- Implementación de cambio de estado.
- Implementación de cálculos o reglas de propuesta.
- Conexión del frontend con servicios y consultas en Supabase.
- Validaciones funcionales del flujo de prospectos.

### Resultado esperado
Al finalizar este hito, el sistema ya podrá registrar, evaluar, listar, consultar y dar seguimiento completo a los prospectos.

---

## Hito 5. Conversión a asociado y ficha principal
En esta etapa se construye el núcleo central del sistema: el asociado como entidad principal.

### Qué se realiza
- Creación de la tabla de asociados.
- Creación de la tabla de personas vinculadas.
- Creación de la tabla de contactos por área.
- Implementación del proceso de conversión de prospecto a asociado.
- Desarrollo de la ficha principal del asociado.
- Desarrollo de formularios de edición de datos del asociado.
- Desarrollo del listado general de asociados.
- Desarrollo de la vista detallada del asociado.
- Registro del historial básico de cambios relevantes.

### Resultado esperado
Al finalizar este hito, el sistema ya podrá gestionar asociados reales, con su ficha completa, datos empresariales, contactos y trazabilidad básica de su información.

---

## Hito 6. Membresías, pagos y cobranza
En esta etapa se construye el control económico y administrativo del asociado.

### Qué se realiza
- Creación de la tabla de membresías.
- Creación de la tabla de cronograma de pagos.
- Creación de la tabla de pagos.
- Creación de la tabla de acciones de cobranza.
- Desarrollo de la vista de membresía por asociado.
- Desarrollo del registro de pagos.
- Desarrollo del seguimiento de pagos pendientes.
- Desarrollo del control de estados de cobranza.
- Desarrollo del historial de gestión de cobranza.
- Validación de reglas relacionadas con membresía activa, vencimientos y seguimiento.

### Resultado esperado
Al finalizar este hito, el sistema ya podrá controlar el ciclo de membresía del asociado, registrar pagos y realizar seguimiento de cobranza.

---

## Hito 7. Gestión documental y almacenamiento
En esta etapa se construye el módulo de documentos y organización de archivos del sistema.

### Qué se realiza
- Creación de la estructura lógica de almacenamiento.
- Creación de la tabla de documentos.
- Relación de documentos con asociados.
- Relación de documentos con comités o reuniones, si aplica.
- Desarrollo del módulo de carga de archivos.
- Desarrollo del listado de archivos.
- Desarrollo de la búsqueda de documentos.
- Clasificación documental por tipo, carpeta o contexto.
- Desarrollo de la vista detalle del documento.
- Preparación de organización documental escalable.

### Resultado esperado
Al finalizar este hito, el sistema ya podrá centralizar archivos y documentos relacionados con asociados y otros procesos internos, reduciendo la dispersión de información.

---

## Hito 8. Reportes, exportaciones y automatizaciones
En esta etapa se consolidan las capacidades de análisis, consulta y mejora operativa del sistema.

### Qué se realiza
- Creación de vistas SQL para reportes.
- Desarrollo de reportes operativos principales.
- Implementación de exportaciones a Excel o PDF.
- Desarrollo de indicadores generales del sistema.
- Desarrollo de paneles resumen o dashboards.
- Preparación de automatizaciones futuras.
- Preparación de integraciones o sincronizaciones si se requieren.
- Ajustes finales de funcionamiento, rendimiento y cierre técnico.

### Resultado esperado
Al finalizar este hito, el sistema ya contará con herramientas de consulta, análisis y explotación de información para facilitar la gestión operativa y la toma de decisiones.

---

## Recomendación de trabajo para el equipo
La implementación no debe ejecutarse como una lista desordenada de pantallas sueltas ni como una base de datos completa construida de una sola vez sin validación funcional. La forma recomendada de trabajo es la siguiente:

1. Definir las tablas, relaciones y reglas del hito.
2. Crear las migraciones correspondientes.
3. Construir los servicios y consultas del módulo.
4. Desarrollar las vistas y formularios asociados.
5. Aplicar validaciones funcionales.
6. Probar el flujo completo antes de pasar al siguiente hito.

Este enfoque permite que cada etapa quede operativa, ordenada y lista para evolucionar sin afectar negativamente el resto del sistema.

---

## Resumen ejecutivo de los hitos
- **Hito 1:** preparar la base técnica del sistema.
- **Hito 2:** preparar usuarios, roles y seguridad.
- **Hito 3:** preparar catálogos y reglas base.
- **Hito 4:** construir el módulo de prospectos.
- **Hito 5:** construir el núcleo de asociados.
- **Hito 6:** construir membresías, pagos y cobranza.
- **Hito 7:** construir gestión documental y almacenamiento.
- **Hito 8:** construir reportes, exportaciones y automatizaciones.

---

## Cierre
Estos hitos permiten implementar el Sistema de Asociados con una secuencia lógica, escalable y alineada al funcionamiento real del negocio. La principal ventaja de este enfoque es que evita improvisación técnica, facilita la coordinación entre desarrollo y análisis funcional, y permite entregar avances que sí generan valor en cada etapa.

