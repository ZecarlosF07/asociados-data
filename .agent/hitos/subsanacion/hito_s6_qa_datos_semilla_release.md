# Hito S6: QA, datos semilla y release interno del MVP

## 1. Objetivo del hito

Validar integralmente el MVP después de completar los hitos S de subsanación. Este hito asegura que el sistema pueda ejecutarse en un entorno limpio, que los datos semilla sean suficientes, que los flujos críticos funcionen y que exista un checklist formal para release interno.

## 2. Hitos originales que valida

Este hito valida el cierre conjunto de:

- Hito 1: Base técnica.
- Hito 2: Usuarios, roles y configuración.
- Hito 3: Catálogos y reglas maestras.
- Hito 4: Prospectos.
- Hito 5: Asociados.
- Hito 6: Membresías, pagos y cobranza.
- Hito 7: Documentos.
- Hito 8: Reportes y exportaciones.
- Hitos S0 a S5.

## 3. Problemas que corrige

- No hay evidencia suficiente de QA funcional de punta a punta.
- No hay checklist de release formal.
- La configuración del bucket documental debe quedar validada.
- Los seeds deben ser suficientes para ejecutar el MVP sin carga manual extensa.
- Las migraciones deben probarse en entorno limpio.

## 4. Alcance QA funcional

Validar los siguientes flujos:

### 4.1 Acceso y seguridad

- login
- logout
- acceso ADMIN
- acceso OPERADOR
- acceso CONSULTA
- bloqueo de rutas no autorizadas
- bloqueo backend por RLS

### 4.2 Configuración y catálogos

- lectura de configuraciones
- lectura de roles
- lectura de catálogos
- lectura de categorías
- uso de catálogos en formularios

### 4.3 Prospectos

- crear captador
- crear prospecto
- editar prospecto
- evaluar prospecto
- generar cotización
- cambiar estado
- revisar historial de estados
- aprobar prospecto

### 4.4 Asociados

- convertir prospecto aprobado
- validar bloqueo de doble conversión
- editar asociado
- registrar persona vinculada
- registrar contacto por área
- consultar ficha principal

### 4.5 Finanzas

- crear membresía
- generar cronograma
- consultar cuotas
- registrar pago
- validar actualización de cuota
- registrar acción de cobranza
- consultar resumen financiero

### 4.6 Documentos

- subir documento general
- subir documento desde asociado
- consultar listado documental
- abrir detalle documental
- descargar documento
- reemplazar versión si aplica
- eliminar lógicamente

### 4.7 Reportes

- abrir reportes
- validar KPIs
- validar reportes por módulo
- exportar Excel individual
- exportar Excel multi-hoja
- validar filtros

## 5. Datos semilla mínimos

Validar que existan seeds para:

- roles base
- usuario administrador inicial
- configuraciones generales
- grupos de catálogo
- estados de prospecto
- estados de asociado
- tipos de actividad
- tamaños de empresa
- categorías
- estados de membresía
- tipos de membresía
- estados de cobranza
- métodos de pago
- tipos de acción de cobranza
- tipos documentales
- categorías documentales
- estados de sincronización/documentos si aplica

## 6. Configuración externa

Documentar:

- variables de entorno requeridas
- comandos de instalación
- comandos de migración
- comando de build
- comando de lint
- bucket `documents`
- policies de Storage
- usuario admin inicial
- pasos para entorno local
- pasos para entorno Supabase remoto

## 7. Entregables

Crear en `.agent/docs`:

- `qa_checklist_mvp.md`
- `release_notes_mvp.md`
- `guia_configuracion_entorno_mvp.md`
- `validacion_seeds_mvp.md`

Cada documento debe ser breve, operativo y accionable.

## 8. Tareas para el desarrollador

1. Ejecutar migraciones en entorno limpio.
2. Validar seeds mínimos.
3. Configurar bucket documental.
4. Ejecutar `yarn lint`.
5. Ejecutar `yarn build`.
6. Probar flujos funcionales críticos.
7. Probar permisos por rol.
8. Probar exportaciones.
9. Probar upload/download documental.
10. Registrar incidencias residuales.
11. Completar checklist de release.

## 9. Definition of Done

Este hito se considera terminado cuando:

- Las migraciones corren en entorno limpio.
- Los seeds mínimos están disponibles.
- `yarn lint` pasa.
- `yarn build` pasa.
- Los flujos críticos fueron probados.
- Los roles fueron validados contra frontend y backend.
- El bucket `documents` está configurado.
- Existen documentos de QA y release.
- Las incidencias residuales están documentadas y priorizadas.

