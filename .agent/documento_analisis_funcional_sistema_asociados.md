# Documento de Análisis del Proyecto

## Sistema Interno de Asociados

## 1. Descripción general del proyecto
El proyecto consiste en el desarrollo de un sistema interno para el área de asociados, orientado a centralizar la gestión de socios, prospectos, cobranzas y documentos institucionales dentro de una sola plataforma. Su propósito es reemplazar procesos dispersos actualmente manejados en Excel, Drive y controles manuales, permitiendo una operación más ordenada, trazable y sostenible.

El sistema busca resolver principalmente la falta de centralización de la información, el desorden documental, la pérdida de historial y la dificultad para dar seguimiento a la relación con prospectos y socios desde un único entorno de trabajo. A través de esta solución, se espera fortalecer el control operativo del área, mejorar la calidad del registro institucional y facilitar la consulta de información relevante para la toma de decisiones.

## 2. Objetivo del sistema
Centralizar el control de socios, cobranzas y documentos con trazabilidad completa, reduciendo la dependencia de herramientas dispersas como Excel y Drive, y permitiendo una gestión interna más ordenada, auditable y sostenible.

## 3. Problemas que se buscan resolver
Actualmente se identifican los siguientes problemas operativos:

- Drive desordenado.
- Pérdida de historial.
- Gestión manual en Excel.
- Baja trazabilidad de cambios.
- Información institucional dispersa.
- Dificultad para controlar socios, membresías y cobranzas desde un solo lugar.

## 4. Alcance funcional del sistema
El alcance principal del sistema estará compuesto por tres módulos globales:

### 4.1 Almacenamiento
Módulo orientado a organizar la documentación institucional mediante una estructura ordenada por categorías, comités, socios y tipos documentales. Permitirá alojar información clave del área de asociados y mantener una lógica clara de consulta y administración documental.

### 4.2 Prospectos
Módulo destinado al registro y seguimiento de empresas prospecto, incluyendo el cálculo de membresía, la sugerencia de categoría, el monto referencial, la generación de cotizaciones y el historial de evolución hasta su posible conversión en socio.

### 4.3 Base de datos de socios
Módulo central del sistema, enfocado en la gestión integral de las empresas asociadas. Incluirá la administración de la ficha institucional del socio, sus representantes y contactos, la categorización, el seguimiento de membresías, la visualización del flujo de caja, el control de cobranza y la gestión documental vinculada.

## 5. Fuera de alcance
En esta etapa, el sistema no incluirá:

- pagos online
- firma digital
- integraciones contables

## 6. Actores del sistema

### 6.1 Administrador
Habrá un único Administrador.

Este usuario tendrá acceso total al sistema y será responsable de:
- ver todos los módulos
- crear usuarios
- desactivar usuarios
- ver auditoría
- acceder al módulo de almacenamiento
- administrar toda la información

Actualmente este rol corresponde a Flavia.

### 6.2 Usuarios internos por rango
El sistema manejará visibilidad por rango, no permisos finos por rol.

Rangos actuales:
- Administrador
- Fidelización
- Revista

Rangos futuros previstos:
- Dirección Ejecutiva
- Administrador de la Cámara

### 6.3 Visibilidad actual
- Administrador: acceso total.
- Fidelización: base de datos de socios y flujo de caja.
- Revista: base de datos de socios y flujo de caja.

Revista y Fidelización pueden editar todo lo que esté dentro de su alcance:
- empresa
- contactos
- plan
- tarifa
- inactivación de socio
- registro de pagos

## 7. Administración de usuarios
El sistema debe permitir al Administrador:

- crear usuarios
- desactivar usuarios
- mantener un único administrador activo

### 7.1 Datos del usuario
- nombres y apellidos
- correo institucional
- DNI
- rango
- estado activo/inactivo

## 8. Auditoría
La auditoría será obligatoria y global.

### 8.1 Reglas generales
- Se debe registrar todo cambio realizado en la plataforma.
- Solo el Administrador puede ver la auditoría.
- El filtro requerido será solo por usuario.
- La retención será de 6 meses.
- Luego de 6 meses, la auditoría se elimina.

### 8.2 Eventos mínimos auditables
- creación
- edición
- inactivación
- eliminación lógica
- cambios de estado
- gestión de cobranzas
- creación de cotizaciones
- conversión de prospecto a socio
- subida, renovación o reemplazo de documentos
- gestión de usuarios

## 9. Módulo de Prospectos

### 9.1 Objetivo
Permitir registrar empresas prospecto, calcular su categoría de membresía, generar cotización y hacer seguimiento hasta su eventual conversión a socio.

### 9.2 Datos principales del prospecto
- razón social
- tipo de actividad
- correo
- nombre de contacto
- cargo
- celular
- actividad
- captador

### 9.3 Estados del prospecto
- Nuevo
- Cotizado
- Cotización enviada
- En seguimiento
- Convertido a socio
- Descartado

### 9.4 Cálculo de membresía
El sistema debe guardar también la información del cálculo de membresía.

#### Criterios evaluados
1. Exporta / importa
2. Partícipe en temas sociales
3. Empresa innovadora
4. PRICO
5. Tamaño de mercado
6. Oportunidad de crecimiento
7. Empresa representativa
8. Personal calificado
9. Ventaja competitiva

#### Regla de cálculo
La puntuación final se obtiene por promedio de los 9 criterios.

#### Puntajes por criterio
**1. Exporta / importa**
- Sí (internacionalmente): 3
- No: 0

**2. Partícipe en temas sociales**
- Sí (inversión activa): 3
- Necesariamente (cumplimiento legal): 2
- No: 0

**3. Empresa innovadora**
- Sí (alta inversión): 3
- Sí (regular): 2
- Necesariamente (básico): 1
- No: 0

**4. PRICO**
- Sí: 3
- No: 0

**5. Tamaño de mercado**
- Internacional: 3
- Nacional: 2
- Local: 1

**6. Oportunidad de crecimiento**
- Excelente / alta: 3
- Regular / media: 2
- Poca / baja: 1
- Nula: 0

**7. Empresa representativa**
- Sí (posicionada / líder): 3
- Medianamente: 2
- Conocida: 1
- No: 0

**8. Personal calificado**
- Sí (altamente calificado): 3
- Sí (estándar): 2
- No necesariamente (empírico): 1
- No: 0

**9. Ventaja competitiva**
- Sí (diferenciada): 3
- Sí (estándar): 2
- Necesariamente (básica): 1
- No: 0

### 9.5 Categorías sugeridas
| Categoría | Monto sugerido | Rango de puntuación |
|---|---:|---:|
| Corporativo | S/ 3,200.00 | 2.26 – 3.00 |
| Empresarial | S/ 2,300.00 | 1.50 – 2.25 |
| Ejecutivo | S/ 1,500.00 | 0.75 – 1.49 |
| No califica | S/ 0.00 | 0.00 – 0.74 |

### 9.6 Historial
El sistema debe guardar:
- respuestas seleccionadas
- puntaje por criterio
- puntaje final
- categoría sugerida
- monto sugerido
- historial de cálculos/cotizaciones

### 9.7 Cotización
- Debe existir número correlativo para la cotización.
- Cada recálculo debe mantenerse en historial.
- Los correos/cotizaciones deben poder enviarse manualmente.

### 9.8 Conversión a socio
- Cualquiera puede convertir un prospecto a socio.
- El prospecto convertido no se elimina; queda en historial.
- Para convertirlo deben existir como mínimo:
  - razón social
  - RUC
  - contacto principal
  - plan
  - tarifa final
  - fecha de inicio
  - frecuencia
  - estado inicial de membresía

## 10. Módulo de Base de Datos de Socios

### 10.1 Objetivo
Gestionar de forma integral la información de cada empresa asociada.

### 10.2 Estructura de la ficha del socio

#### 1. Información interna
- N°
- Código
- Libro o padrón
- Estado
- Bienvenida
- Afiliación
- Responsable
- Categoría

**Definiciones:**
- Bienvenida: confirmación.
- Afiliación: persona que lo afilió, usada para control de comisión.
- Categoría: categoría que le corresponde al socio.

#### 2. Datos de la empresa
- Comité
- RUC
- Razón social
- Nombre comercial

#### 3. Datos institucionales
- Dirección
- Fecha de asociación
- Fecha de aniversario
- Teléfono fijo
- Celular 1
- Celular 2
- Correo corporativo
- Página web
- Actividad
- Tipo de actividad
- Tamaño

#### 4. Representante legal
- Nombres y apellidos
- Cargo
- Email
- DNI
- Número de contacto
- Onomástico

#### 5. Representante ante la Cámara
- Nombres y apellidos
- Cargo
- Email
- DNI
- Número de contacto
- Onomástico

#### 6. Contactos de áreas
Una empresa puede tener varios contactos de áreas.

Campos:
- nombre y apellidos
- área
- cargo
- email
- número de contacto

## 11. Membresías

### 11.1 Tipos
- mensual
- anual

### 11.2 Reglas
- la fecha de inicio se define manualmente
- el día de cobro mensual se elige por socio
- la membresía anual vence 12 meses después
- la tarifa puede ajustarse por negociación

### 11.3 Inactivación
- cualquier usuario con acceso puede inactivar un socio
- debe registrarse un motivo
- al inactivar un socio, los pagos futuros programados se eliminan
- el nivel de cumplimiento queda con lo pagado hasta ese momento

## 12. Cumplimiento

### 12.1 Regla general
- membresía anual pagada = 100%
- membresía mensual = porcentaje acumulado según los meses pagados del año

Ejemplo:
- 1 mes pagado = 8.33%
- 6 meses pagados = 50%
- 12 meses pagados = 100%

## 13. Flujo de caja y cobranza

### 13.1 Objetivo
Controlar ingresos por membresías y el estado de pago de los socios.

### 13.2 Alcance
El flujo de caja se refiere únicamente a ingresos por membresías.

### 13.3 Estados de cobranza
- vencido
- riesgo
- próximo

El dashboard se enfocará especialmente en membresías próximas a vencer y pagos pendientes recientes.

### 13.4 Información del dashboard
Se requiere visualizar, como mínimo:
- recaudación acumulada
- pendiente de cobro
- proyección de cierre de año
- socios o empresas con membresías próximas a vencer
- socios o empresas vencidas o en riesgo

### 13.5 Registro de pago
En lugar de adjuntar comprobante, se registrará:
- código de operación

### 13.6 Gestión de cobranza
Debe registrarse gestión de cobranza con los siguientes datos mínimos:
- fecha
- usuario
- empresa
- tipo de contacto
- asunto o motivo
- observación breve

### 13.7 Acción CONTACTAR
La acción CONTACTAR debe:
- abrir correo
- registrar la gestión realizada

### 13.8 Correos de cobranza
Los correos serán manuales, ya que deben salir desde el correo institucional del área de asociados.

## 14. Módulo de Almacenamiento

### 14.1 Objetivo
Organizar y centralizar documentos institucionales con estructura clara.

### 14.2 Acceso
Solo el Administrador puede ver este módulo.

### 14.3 Reglas generales
- Los documentos se organizan por estructura.
- Los documentos se sobreescriben sin historial.
- Debe existir buscador.
- Debe existir vista previa de documentos.

### 14.4 Categorías
Las categorías principales incluyen, entre otras:
- Comités
- Socios
- Logotipos
- Gaceta
- Revista
- Formatos

### 14.5 Estructura para comités
Ruta:

`Comités / [Nombre del comité] / [Sección] / [Año] / archivos`

#### Secciones
- Reuniones
- Actividades
- Cartas y oficios
- Constitución

#### Reuniones
Tipos documentales:
- Acta de reunión
- Lista de invitados
- Lista de asistentes
- Cuadro de resumen

#### Cartas y oficios
Además del archivo, se deben registrar:
- número
- asunto
- destinatario
- fecha

### 14.6 Estructura para socios
Ruta:

`Socios / Año / Empresa / Tipo de documento`

Tipos documentales inicialmente definidos:
- Ficha RUC
- Vigencia de poder

#### Acciones permitidas
- renovar
- descargar

La renovación reemplaza el archivo anterior.

## 15. Resumen con IA en reuniones
Cuando se suban los tres documentos de reunión:
- acta de reunión
- lista de invitados
- lista de asistentes

el sistema debe generar un resumen corto unificado basado en los tres documentos.

Ese resumen debe quedar guardado como parte de la información de la reunión.

## 16. Reportes y exportaciones

### 16.1 Formatos de exportación
Los reportes y exportaciones podrán generarse en:
- PDF
- Excel

### 16.2 Reportes requeridos
- socios activos / inactivos
- prospectos convertidos por mes
- historial de gestión de cobranza

No se requiere exportación específica para:
- cobranzas por vencer
- cobranzas vencidas

## 17. Sincronización hacia Drive

### 17.1 Objetivo funcional
Contar con una copia estructurada de respaldo en Drive, respetando la misma ruta lógica definida en el sistema.

### 17.2 Reglas funcionales
- La sincronización será solo desde la plataforma hacia Drive.
- Se hará por lotes.
- Su función será de espejo o respaldo.
- La plataforma seguirá siendo la fuente principal de información.

## 18. Requerimientos no funcionales
- trazabilidad completa mediante auditoría
- control por rangos de acceso
- existencia de un único administrador
- borrado lógico en las entidades aplicables
- consistencia en español y moneda en soles
- identificación única por RUC
- no permitir empresas duplicadas por razón social
- disponibilidad de exportación PDF y Excel
- retención de auditoría por 6 meses
- operación enfocada a un volumen aproximado de 150 socios actuales, con proyección a 180

## 19. Reglas de negocio consolidadas
- un prospecto puede convertirse en socio
- el prospecto convertido queda como historial
- la categoría de prospecto se calcula por promedio
- la tarifa sugerida depende del rango de puntuación
- la tarifa final puede negociarse
- la membresía puede ser mensual o anual
- el día de cobro mensual se define por socio
- la inactivación exige motivo
- al inactivar, se eliminan pagos futuros
- el cumplimiento se calcula sobre el año
- la cobranza se controla con estados
- los correos de cobranza son manuales
- el almacenamiento solo lo ve el administrador
- los documentos en almacenamiento se sobreescriben
- los documentos de reuniones pueden generar resumen con IA
- toda acción relevante debe quedar auditada

## 20. Observaciones finales
Con esta información ya se cuenta con una base funcional completa para pasar a una siguiente etapa de definición más detallada. Como próximos pasos, este análisis puede transformarse en:

- documento formal de requerimientos
- alcance MVP por módulos
- historias de usuario
- casos de uso
- modelo de datos conceptual

Como recomendación para la siguiente fase, será conveniente profundizar en:
- campos obligatorios y opcionales por formulario
- validaciones por campo
- catálogos cerrados como comités, áreas, tamaños y actividades
- reglas más detalladas para estados de socio y cobranza

