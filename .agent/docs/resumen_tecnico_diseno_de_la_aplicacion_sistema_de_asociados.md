# Resumen Técnico del Diseño de la Aplicación
## Sistema de Asociados

## 1. Propósito del documento
Este documento resume el diseño técnico propuesto para la aplicación **Sistema de Asociados**, tomando como base el análisis funcional previamente definido y las decisiones tecnológicas ya confirmadas para esta etapa.

El objetivo de este documento es traducir el alcance funcional del sistema a una estructura técnica clara, implementable y escalable, sin entrar todavía en un nivel de detalle extremo de desarrollo por componente o por script de base de datos. Su finalidad es servir como marco técnico de referencia para la construcción del sistema.

---

## 2. Decisiones técnicas base del proyecto

### 2.1 Frontend y backend
La solución se desarrollará utilizando:

- **React** para el frontend.
- **Supabase** como backend, base de datos, autenticación, almacenamiento y servicios auxiliares.

La lógica general del sistema estará orientada a una arquitectura moderna de aplicación web con un frontend altamente interactivo y una capa de datos conectada directamente a Supabase.

### 2.2 Estrategia de acceso a datos
Se establece como lineamiento principal lo siguiente:

- **Plan A:** realizar consultas directas desde el frontend hacia Supabase.
- **Plan B:** utilizar **API Routes** únicamente en casos estrictamente necesarios.

Esto significa que, por defecto, la aplicación consumirá directamente:
- tablas,
- vistas,
- procedimientos,
- almacenamiento,
- autenticación,

desde el cliente.

Las **API Routes** solo se contemplan para escenarios como:
- protección de secretos o `api_keys`,
- integraciones externas que no deban exponerse en el cliente,
- operaciones sensibles que requieran encapsulamiento adicional,
- generación de archivos o procesos especiales que no convenga resolver directamente desde el frontend.

Esta decisión busca mantener una arquitectura simple, reducir tiempo de implementación y aprovechar al máximo las capacidades nativas de Supabase.

### 2.3 Seguridad y políticas RLS
En esta etapa **no se priorizará la definición de políticas RLS**.

Las políticas de seguridad a nivel de fila serán configuradas posteriormente, cuando el modelo de datos, los flujos y los permisos funcionales estén completamente estables.

Por tanto, en esta fase de diseño técnico sí se documentará:
- la estructura esperada de roles,
- la lógica de permisos,
- las restricciones funcionales del sistema,

pero **no se desarrollará aún una especificación detallada de políticas RLS por tabla**.

### 2.4 Filosofía de componentes
Se establece como requerimiento obligatorio el uso de **Atomic Design**.

Esto implica que el frontend deberá construirse con componentes lo más atómicos posible, priorizando:
- alta reutilización,
- separación clara de responsabilidades,
- consistencia visual y funcional,
- facilidad de mantenimiento,
- crecimiento ordenado del sistema.

Esta decisión impactará directamente en la estructura del frontend, el sistema de diseño, la organización de carpetas y la forma de construir pantallas, formularios y tablas.

---

## 3. Objetivo técnico de la solución
Desde el punto de vista técnico, el sistema debe permitir construir una plataforma web interna capaz de administrar de forma centralizada:

- documentación institucional asociada al módulo de almacenamiento,
- prospectos y su seguimiento,
- socios y su historial,
- membresías,
- pagos y cobranzas,
- auditoría,
- reportes,
- procesos documentales,
- control de acceso por tipo de usuario.

El diseño técnico debe asegurar que el sistema:
- sea modular,
- pueda evolucionar por fases,
- soporte crecimiento funcional,
- mantenga orden estructural,
- facilite futuras reglas de seguridad,
- permita una implementación rápida sin sacrificar calidad técnica.

---

## 4. Principios técnicos del diseño

Para este proyecto se propone trabajar bajo los siguientes principios:

### 4.1 Simplicidad arquitectónica
Evitar capas innecesarias cuando Supabase ya resuelve de forma nativa una necesidad.

### 4.2 Modularidad
Cada módulo funcional del sistema debe poder evolucionar sin afectar de forma desordenada a los demás.

### 4.3 Reutilización
La aplicación debe construirse con componentes, hooks, servicios y utilidades reutilizables.

### 4.4 Separación de responsabilidades
La vista, la lógica de interacción, la lógica de acceso a datos y la transformación de información deben mantenerse desacopladas.

### 4.5 Escalabilidad progresiva
Aunque inicialmente se priorice rapidez de implementación, el diseño debe dejar preparado el camino para:
- RLS,
- automatizaciones,
- integraciones externas,
- reportes más complejos,
- crecimiento en volumen de usuarios y datos.

### 4.6 Trazabilidad
Las operaciones importantes del sistema deben poder rastrearse por historial, auditoría y estado.

---

## 5. Arquitectura general de la solución

## 5.1 Enfoque arquitectónico
La aplicación se plantea como una arquitectura web con frontend desacoplado que consume Supabase de forma directa.

### Capas principales

#### a) Capa de presentación
Implementada en React. Contendrá:
- layouts,
- páginas,
- componentes atómicos,
- formularios,
- tablas,
- dashboards,
- flujos de usuario.

#### b) Capa de interacción del cliente
Contendrá:
- hooks personalizados,
- manejo de estado local y compartido,
- validaciones de interfaz,
- transformación de datos para visualización,
- control de formularios,
- gestión de sesiones.

#### c) Capa de acceso a datos
Implementada principalmente mediante el cliente de Supabase en el frontend.

Aquí se centralizarán:
- consultas a tablas,
- llamadas a vistas,
- inserciones,
- actualizaciones,
- almacenamiento de archivos,
- autenticación,
- procedimientos o funciones cuando existan.

#### d) Capa de persistencia y servicios backend
Gestionada por Supabase:
- PostgreSQL,
- Auth,
- Storage,
- funciones auxiliares si fueran necesarias,
- triggers o lógica de base de datos en escenarios específicos.

### 5.2 Uso excepcional de API Routes
Las API Routes no serán el centro de la arquitectura. Solo se aplicarán cuando exista justificación clara, por ejemplo:

- ocultar credenciales de terceros,
- consumir servicios externos,
- generar documentos mediante lógica sensible,
- ejecutar procesos técnicos que no deban residir en el cliente.

Esto evita complejidad innecesaria y acelera la entrega del sistema.

---

## 6. Diseño del modelo de datos

El modelo de datos será el núcleo técnico del sistema, ya que gran parte del comportamiento funcional depende de relaciones entre entidades, estados, historial y trazabilidad.

## 6.1 Objetivo del modelo de datos
Diseñar una base de datos relacional que permita:
- registrar entidades principales del negocio,
- preservar historial,
- evitar duplicidad,
- soportar flujos de conversión,
- permitir auditoría,
- facilitar reportes,
- escalar sin rediseños estructurales drásticos.

## 6.2 Entidades principales esperadas
El sistema deberá contemplar como mínimo entidades equivalentes a las siguientes:

- usuarios
- rangos o tipos de usuario
- prospectos
- historial de prospectos
- cotizaciones
- socios
- representantes
- contactos por área
- membresías
- cronograma o programación de pagos
- pagos realizados
- gestiones de cobranza
- auditoría
- documentos
- comités
- relación socio-comité
- catálogos generales
- configuraciones del sistema

## 6.3 Lineamientos técnicos del modelo

### a) Identificadores
Cada entidad debe manejar identificadores únicos estables. Se recomienda el uso de `uuid` como identificador principal.

### b) Fechas de control
Las tablas deben contemplar, según corresponda:
- fecha de creación,
- fecha de actualización,
- fecha de eliminación lógica,
- usuario creador,
- usuario actualizador.

### c) Eliminación lógica
Las entidades críticas no deben eliminarse físicamente salvo casos muy excepcionales. Se priorizará el borrado lógico para preservar trazabilidad.

### d) Historial
Las operaciones relevantes del negocio deben dejar rastro histórico, especialmente en:
- prospectos,
- socios,
- pagos,
- cobranzas,
- documentación,
- estados.

### e) Integridad
El diseño debe evitar duplicidad funcional mediante restricciones, validaciones y reglas de aplicación.

## 6.4 Reglas de datos que impactan el diseño
Se deben contemplar desde el diseño técnico reglas como:
- unicidad de RUC,
- control de duplicidad de razón social,
- permanencia del historial cuando un prospecto se convierte en socio,
- consistencia entre membresía, pagos y estado del socio,
- restricción de estados inválidos,
- preservación de vínculos documentales.

---

## 7. Catálogos y parametrización

Una parte importante del sistema debe ser configurable sin necesidad de modificar código.

## 7.1 Objetivo
Separar correctamente:
- datos operativos,
- datos maestros,
- catálogos,
- parámetros de negocio.

## 7.2 Catálogos sugeridos
El diseño técnico debe contemplar catálogos para:
- rangos de usuario,
- estados de prospecto,
- estados de socio,
- tipos de membresía,
- categorías,
- comités,
- actividades económicas,
- tipos de actividad,
- tamaños de empresa,
- tipos documentales,
- secciones del módulo de almacenamiento,
- estados de cobranza,
- medios de contacto,
- tipos de gestión,
- configuraciones de reportes.

## 7.3 Beneficio técnico
Una buena parametrización permitirá:
- reducir hardcodeo,
- adaptar el sistema con menor costo,
- facilitar mantenimiento,
- habilitar futuras pantallas de administración.

---

## 8. Reglas de negocio técnicas

En esta etapa no basta describir procesos; es necesario definir cómo se implementan técnicamente las decisiones del negocio.

## 8.1 Cálculo y sugerencias
El sistema deberá soportar reglas para:
- cálculo de membresía,
- sugerencia de categoría,
- posible generación de cotización,
- transición de estados.

## 8.2 Conversión de prospecto a socio
Debe definirse técnicamente cómo se realiza la conversión:
- si se crea una nueva entidad relacionada,
- si se migra información,
- cómo se preserva el historial,
- cómo se vinculan documentos y cálculos previos,
- cómo se evita pérdida de trazabilidad.

## 8.3 Gestión de pagos y cobranza
Deben definirse reglas sobre:
- generación de pagos esperados,
- registro de pagos reales,
- identificación de pagos pendientes,
- estado de cobranza,
- comportamiento al inactivar un socio,
- indicadores para dashboard.

## 8.4 Estado del socio
La lógica técnica debe controlar cuándo un socio:
- está activo,
- se encuentra con deuda,
- está en seguimiento,
- pasa a estado inactivo,
- conserva o pierde operaciones futuras programadas.

## 8.5 Validaciones operativas
Toda regla funcional que afecte consistencia debe materializarse como:
- validación de formulario,
- validación de servicio,
- restricción de base de datos,
- lógica en procedimiento o trigger cuando aplique.

---

## 9. Diseño de permisos y accesos

Aunque las políticas RLS no se definirán todavía, sí debe diseñarse desde ahora la lógica de acceso de la aplicación.

## 9.1 Objetivo
Establecer una estructura clara de permisos funcionales para que más adelante pueda traducirse a RLS y controles más finos.

## 9.2 Enfoque inicial
Los permisos se manejarán inicialmente desde la lógica de aplicación y la estructura de roles.

## 9.3 Niveles esperados
Se deberá contemplar una estructura de acceso por rangos o perfiles, por ejemplo:
- administrador,
- usuarios operativos,
- usuarios con acceso restringido por módulo,
- usuarios de solo consulta en determinados apartados.

## 9.4 Restricciones funcionales
El diseño debe contemplar restricciones como:
- módulos exclusivos para determinados perfiles,
- acciones críticas reservadas,
- visibilidad parcial de opciones,
- control de acciones sobre documentos,
- acceso a auditoría solo para perfiles autorizados.

## 9.5 Preparación para RLS futura
Aunque RLS no se trabajará ahora, el modelo técnico debe quedar preparado para que luego sea posible mapear:
- usuario autenticado,
- perfil,
- recursos permitidos,
- operaciones permitidas.

---

## 10. Diseño del módulo de almacenamiento documental

Este módulo tiene un peso técnico importante, porque no solo administra archivos sino también estructura, clasificación y trazabilidad documental.

## 10.1 Objetivo técnico
Permitir almacenar, organizar, consultar y relacionar archivos con entidades del sistema.

## 10.2 Componentes del diseño
Debe definirse:
- estructura lógica de almacenamiento,
- categorías documentales,
- metadatos asociados,
- estrategia de nombres,
- rutas,
- relaciones con socios, prospectos o comités,
- visualización,
- reemplazo de archivos,
- auditoría documental.

## 10.3 Supabase Storage
Supabase Storage será el mecanismo principal de almacenamiento.

La base de datos deberá mantener el registro estructurado del documento, mientras que Storage contendrá el archivo físico.

## 10.4 Metadatos recomendados
Cada documento debería asociarse, según corresponda, a:
- nombre visible,
- nombre físico,
- tipo,
- categoría,
- entidad vinculada,
- fecha de carga,
- usuario responsable,
- ruta lógica,
- estado,
- observaciones.

## 10.5 Consideraciones técnicas
Debe contemplarse:
- vista previa si el tipo de archivo lo permite,
- búsqueda por filtros,
- reemplazo controlado,
- clasificación por carpetas lógicas,
- futura sincronización o espejo hacia Google Drive.

---

## 11. Diseño del flujo de prospectos

## 11.1 Objetivo
El módulo de prospectos debe permitir registrar, calcular, cotizar, seguir y eventualmente convertir una empresa prospecto en socio.

## 11.2 Requerimientos técnicos del flujo
Debe poder manejar:
- registro inicial,
- edición,
- historial,
- cálculo de membresía,
- generación o vinculación de cotización,
- observaciones,
- seguimiento comercial,
- conversión.

## 11.3 Trazabilidad
Cada cambio importante debe quedar registrado, ya sea por historial funcional o por auditoría técnica.

## 11.4 Interoperabilidad con socios
El diseño debe asegurar que el módulo de prospectos no quede aislado, sino preparado para conectarse limpiamente con el módulo de socios.

---

## 12. Diseño del módulo de socios

## 12.1 Objetivo
Centralizar la información formal de las empresas asociadas y su estado institucional.

## 12.2 Datos esperados
El modelo técnico debe soportar:
- datos internos,
- datos de empresa,
- datos institucionales,
- representante legal,
- gerente general,
- asistente de gerencia,
- responsables por área,
- categoría,
- afiliador,
- comités,
- estado,
- historial.

## 12.3 Complejidad técnica
Este módulo no debe verse como una sola tabla, sino como una entidad principal con múltiples relaciones satélite para evitar estructuras rígidas o excesivamente anchas.

## 12.4 Beneficio del enfoque relacional
Esto permitirá:
- mejor mantenimiento,
- mayor normalización,
- formularios más organizados,
- crecimiento más limpio.

---

## 13. Diseño del módulo de membresías, pagos y cobranza

## 13.1 Objetivo
Administrar el compromiso económico del socio y su comportamiento de pago.

## 13.2 Componentes técnicos
Debe definirse:
- estructura de membresía,
- vigencia,
- monto,
- cronograma esperado,
- registro de pago,
- código de operación,
- observaciones,
- estados,
- gestiones de cobranza.

## 13.3 Dashboard e indicadores
Los datos de este módulo deben alimentar indicadores como:
- deuda pendiente,
- pagos por período,
- socios morosos,
- cobranza próxima,
- flujo de caja esperado.

## 13.4 Reglas especiales
Debe contemplarse el comportamiento técnico cuando:
- se anula o corrige un pago,
- cambia el estado del socio,
- se inactiva una empresa,
- se requiere recalcular pagos futuros.

---

## 14. Auditoría y trazabilidad técnica

## 14.1 Objetivo
Registrar acciones críticas del sistema para fines de seguimiento, control y revisión.

## 14.2 Alcance esperado
La auditoría debe poder registrar, como mínimo:
- usuario,
- fecha y hora,
- entidad afectada,
- tipo de acción,
- estado anterior,
- estado nuevo,
- observaciones o contexto técnico.

## 14.3 Estrategia técnica
La auditoría podrá resolverse mediante combinación de:
- lógica desde frontend,
- funciones o triggers en base de datos,
- utilidades compartidas para registrar eventos.

## 14.4 Importancia
Debe pensarse desde el diseño y no como complemento posterior, porque atraviesa múltiples módulos del sistema.

---

## 15. Reportes y exportaciones

## 15.1 Objetivo
Permitir consulta y extracción de información relevante para control operativo y toma de decisiones.

## 15.2 Enfoque técnico
Debe definirse qué información se resuelve mediante:
- consultas directas,
- vistas SQL,
- funciones especializadas,
- transformaciones en frontend.

## 15.3 Tipos de salida
El sistema debe quedar preparado para:
- reportes en pantalla,
- exportación a Excel,
- exportación a PDF,
- filtros por fecha, estado, categoría y otras variables.

## 15.4 Criterio técnico recomendado
Toda lógica pesada o reutilizable para reportes debe centralizarse lo más posible en estructuras de datos consistentes, para evitar duplicar cálculos en distintas pantallas.

---

## 16. Procesos especiales y automatizaciones

## 16.1 Objetivo
Identificar procesos que no son simplemente pantallas CRUD y que requerirán diseño técnico particular.

## 16.2 Procesos previstos
Entre los procesos que deben contemplarse están:
- generación de resúmenes mediante IA cuando existan insumos documentales completos,
- sincronización o espejo documental hacia Google Drive,
- generación de correlativos,
- mantenimiento de historial,
- procesos de consolidación para reportes,
- generación de archivos especiales.

## 16.3 Tratamiento técnico
No todos estos procesos deben implementarse al inicio, pero el diseño debe dejar previsto:
- dónde vivirán,
- cómo se activarán,
- qué insumos requieren,
- qué dependencias externas tendrían.

---

## 17. Diseño del frontend con Atomic Design

Este es uno de los pilares más importantes del proyecto.

## 17.1 Objetivo
Construir una interfaz mantenible y escalable usando una jerarquía estricta de componentes reutilizables.

## 17.2 Niveles recomendados
Se propone trabajar con una estructura de Atomic Design compuesta por:

### Átomos
Componentes mínimos reutilizables, por ejemplo:
- botones,
- inputs,
- labels,
- badges,
- iconos,
- chips,
- selectores,
- checkboxes,
- radios,
- loaders,
- tooltips,
- textos base,
- contenedores visuales mínimos.

### Moléculas
Combinaciones pequeñas de átomos, por ejemplo:
- campo de formulario,
- buscador con input y botón,
- selector con etiqueta,
- tarjeta resumen,
- fila de detalle,
- item documental.

### Organismos
Bloques funcionales más complejos, por ejemplo:
- tabla de prospectos,
- formulario de socio,
- panel de filtros,
- panel de auditoría,
- visor documental,
- bloque de resumen financiero.

### Templates
Estructuras de página sin datos reales, por ejemplo:
- layout de listado,
- layout de formulario maestro,
- layout dashboard,
- layout de detalle con pestañas.

### Pages
Pantallas finales integradas con datos reales y lógica operativa.

## 17.3 Regla de atomicidad
La consigna será construir componentes lo más atómicos posibles, evitando:
- componentes gigantes,
- lógica de negocio mezclada con presentación,
- duplicidad visual,
- pantallas difíciles de mantener.

## 17.4 Beneficios esperados
Este enfoque permitirá:
- uniformidad en UI,
- velocidad de construcción,
- menor deuda técnica,
- mejor testing,
- mayor reutilización.

---

## 18. Organización técnica del frontend

## 18.1 Estructura sugerida
Aunque podrá ajustarse durante la implementación, el frontend debería organizarse en capas como:

- `app` o punto de entrada
- `routes`
- `pages`
- `templates`
- `organisms`
- `molecules`
- `atoms`
- `features`
- `hooks`
- `services`
- `lib`
- `utils`
- `types`
- `constants`

## 18.2 Organización por dominio
Se recomienda que los módulos funcionales se agrupen por dominio, por ejemplo:
- almacenamiento,
- prospectos,
- socios,
- membresías,
- cobranzas,
- auditoría,
- reportes,
- autenticación,
- configuración.

## 18.3 Separación entre UI y lógica
Dentro de cada dominio conviene separar:
- componentes visuales,
- hooks de negocio,
- servicios de datos,
- validaciones,
- mapeadores o adaptadores.

---

## 19. Estrategia de acceso a datos en frontend

## 19.1 Principio general
El frontend consumirá Supabase directamente como enfoque principal.

## 19.2 Qué debe centralizarse
Aunque se consulte directo a Supabase, no se recomienda hacer llamadas dispersas por toda la interfaz. Debe existir una capa de servicios o repositorios cliente para:
- listar,
- obtener detalle,
- crear,
- actualizar,
- inactivar,
- subir archivos,
- recuperar reportes.

## 19.3 Beneficios
Esto permite:
- mantener orden,
- reutilizar consultas,
- cambiar implementación interna sin romper pantallas,
- preparar futura migración parcial a API Routes si hiciera falta.

## 19.4 Casos para API Routes
Se usarán solo cuando el diseño lo exija realmente, como en:
- integración con IA externa,
- conexión con Google Drive,
- generación protegida de documentos,
- procesos que necesiten secretos privados.

---

## 20. Validaciones y calidad de datos

## 20.1 Objetivo
Garantizar integridad funcional y reducir errores operativos.

## 20.2 Niveles de validación
Se recomienda validar en varios niveles:
- interfaz de usuario,
- capa de servicio,
- base de datos.

## 20.3 Casos relevantes
Deben contemplarse validaciones para:
- RUC,
- correos,
- teléfonos,
- duplicidad de razón social,
- obligatoriedad por proceso,
- estados válidos,
- consistencia de fechas,
- consistencia de pagos.

## 20.4 Filosofía recomendada
La UI debe ayudar a prevenir errores, pero la integridad final no debe depender exclusivamente del frontend.

---

## 21. Manejo de estados y experiencia de usuario

## 21.1 Estados mínimos de interfaz
Cada pantalla relevante debe contemplar:
- carga,
- vacío,
- error,
- éxito,
- permisos insuficientes,
- confirmaciones de acciones críticas.

## 21.2 Formularios largos
Dado que el módulo de socios tendrá alta densidad de campos, el diseño técnico del frontend debe considerar:
- seccionamiento por bloques,
- validación progresiva,
- guardado claro,
- ayudas visuales,
- mensajes comprensibles.

## 21.3 Tablas y listados
Los listados deben pensarse con:
- filtros,
- búsqueda,
- paginación o carga incremental,
- ordenamiento,
- acciones contextuales.

---

## 22. Ambientes, despliegue y operación

## 22.1 Ambientes mínimos
Se recomienda contemplar al menos:
- desarrollo,
- pruebas,
- producción.

## 22.2 Versionado y migraciones
El proyecto debe manejar:
- versionado de código,
- migraciones de base de datos,
- cambios controlados en catálogos,
- datos iniciales si son necesarios.

## 22.3 Variables de entorno
Debe separarse correctamente la configuración pública de la privada, sobre todo considerando que la mayor parte del acceso será desde frontend.

## 22.4 Observabilidad básica
Sería recomendable considerar, al menos en una etapa posterior cercana:
- registro de errores de frontend,
- monitoreo de fallos en procesos especiales,
- seguimiento de errores de consultas.

---

## 23. Alcance técnico del MVP

## 23.1 Propósito
Delimitar qué se construirá primero y qué quedará preparado para etapas posteriores.

## 23.2 Enfoque recomendado
El MVP técnico debe priorizar:
- autenticación básica,
- estructura de roles funcionales,
- módulo de prospectos,
- módulo de socios,
- módulo de membresías y cobranzas,
- almacenamiento documental base,
- auditoría esencial,
- reportes clave.

## 23.3 Elementos diferibles
Podrán quedar para una segunda etapa, según prioridad:
- automatizaciones avanzadas,
- integración completa con Google Drive,
- resúmenes automáticos con IA,
- endurecimiento de seguridad con RLS detallada,
- optimizaciones avanzadas de reportes.

---

## 24. Riesgos técnicos a tener en cuenta

## 24.1 Riesgo de crecimiento desordenado del frontend
Si no se aplica Atomic Design con disciplina, el frontend puede convertirse rápidamente en una mezcla de componentes duplicados y formularios rígidos.

## 24.2 Riesgo de lógica dispersa
Al usar consultas directas a Supabase desde frontend, existe el riesgo de repartir lógica de acceso por toda la app. Esto debe evitarse centralizando servicios cliente.

## 24.3 Riesgo de modelo de datos insuficiente
Si el modelo relacional no queda bien resuelto desde el inicio, luego será costoso corregir historial, trazabilidad y reportes.

## 24.4 Riesgo de seguridad diferida
Postergar RLS es válido en esta etapa, pero obliga a que el diseño de roles y permisos quede muy bien pensado para no tener que rediseñar todo después.

## 24.5 Riesgo documental
El módulo de almacenamiento puede complicarse si no se define correctamente desde el inicio la estructura de metadatos y clasificación.

---

## 25. Conclusión técnica

El diseño técnico del Sistema de Asociados debe construirse sobre una arquitectura pragmática, moderna y de implementación rápida, aprovechando al máximo la combinación **React + Supabase**.

La decisión de trabajar con **consultas directas a Supabase desde el frontend como estrategia principal** simplifica la arquitectura y acelera el desarrollo, siempre que se compense con una buena organización interna de servicios, validaciones y estructura de componentes.

La decisión de **postergar RLS** es viable en esta etapa, pero exige que los roles, accesos y restricciones funcionales queden claramente modelados desde ahora.

Por otro lado, la exigencia de usar **Atomic Design como base obligatoria del frontend** es una decisión técnicamente muy acertada para este proyecto, dado que el sistema tendrá múltiples módulos, formularios densos, tablas, paneles y componentes reutilizables.

En consecuencia, el éxito técnico del proyecto dependerá principalmente de que queden bien resueltos estos pilares:

- modelo de datos relacional,
- reglas de negocio implementables,
- arquitectura clara de acceso a datos,
- diseño modular del frontend,
- trazabilidad,
- organización documental,
- separación adecuada entre MVP y fases posteriores.

Este documento constituye la base para pasar al siguiente nivel de definición técnica, donde corresponderá desarrollar con mayor detalle:
- arquitectura de carpetas,
- modelo de base de datos,
- módulos técnicos,
- flujos,
- componentes,
- vistas,
- estrategia de implementación por etapas.

