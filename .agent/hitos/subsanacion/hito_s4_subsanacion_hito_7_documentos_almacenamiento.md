# Hito S4: Subsanación del Hito 7 - Documentos y almacenamiento

## 1. Objetivo del hito

Completar el módulo documental para que cumpla el DoD del Hito 7: registro, consulta, detalle, descarga, organización, metadatos, versionamiento y políticas de almacenamiento. El módulo debe funcionar como repositorio operativo real y no solo como listado con upload.

## 2. Hito original que subsana

Este hito subsana el **Hito 7: Gestión documental y almacenamiento**.

El Hito 7 exige:

- listado documental
- búsqueda y filtros
- acceso al detalle de documento
- vinculación con asociado
- organización documental
- carga y descarga controlada

La brecha detectada es que existe ruta declarada para detalle documental, pero no implementación completa de página/ruta de detalle.

## 3. Problemas detectados

- `ROUTES.DOCUMENTOS_DETALLE` existe, pero falta ruta funcional en el router.
- Falta `DocumentDetailPage`.
- Falta vista de metadatos completa.
- Falta navegación desde listado a detalle.
- El bucket `documents` requiere configuración y policies claras.
- El versionamiento existe en modelo/servicio, pero no necesariamente en UI.

## 4. Alcance funcional

### 4.1 Detalle documental

Crear página de detalle que muestre:

- título
- nombre original de archivo
- tipo documental
- categoría documental
- asociado vinculado
- prospecto vinculado, si aplica
- nodo/ruta lógica
- bucket
- storage path
- MIME type
- extensión
- tamaño
- fecha de subida
- usuario que subió
- versión
- documento reemplazado
- estado
- notas

### 4.2 Acciones del detalle

Permitir según permisos:

- descargar archivo
- copiar referencia
- editar metadatos
- reemplazar versión
- eliminar lógicamente
- volver al listado

### 4.3 Navegación

- Agregar ruta en `AppRouter.jsx`.
- Agregar click desde `DocumentCard` o `DocumentList`.
- Mantener filtros del listado cuando sea posible.

### 4.4 Storage

Configurar y documentar:

- bucket `documents`
- tamaño máximo
- MIME types permitidos
- policies de lectura/escritura
- descarga con URL firmada
- restricción de delete físico

### 4.5 Versionamiento

Agregar vista mínima de historial:

- versión actual
- versiones anteriores
- fecha de reemplazo
- usuario
- documento anterior

Si no se implementa historial completo en UI, debe quedar documentado como alcance posterior, pero el detalle debe mostrar al menos `version_number` y `replaces_document_id`.

## 5. Alcance técnico

Crear:

- `src/pages/documents/DocumentDetailPage.jsx`
- `src/pages/documents/sections/DocumentDetailHeader.jsx`
- `src/pages/documents/sections/DocumentMetadataSection.jsx`
- `src/pages/documents/sections/DocumentVersionSection.jsx`

Actualizar:

- `src/router/AppRouter.jsx`
- `src/router/routes.js`, si aplica
- `src/components/molecules/documents/DocumentCard.jsx`
- `src/components/molecules/documents/DocumentList.jsx`
- `src/services/documents.service.js`

Agregar si falta:

- `documentsService.getVersionHistory(documentId)`
- `documentsService.updateMetadata(id, updates)`

## 6. Tareas para el desarrollador

1. Crear página de detalle documental.
2. Registrar ruta protegida en `AppRouter`.
3. Agregar navegación desde listado.
4. Mostrar metadata completa.
5. Agregar acciones de descarga y eliminación.
6. Agregar edición de metadata si está dentro del permiso.
7. Agregar reemplazo de versión si está dentro del alcance.
8. Crear o documentar policies del bucket.
9. Probar upload, detalle, descarga y soft delete.
10. Probar acceso con roles distintos.

## 7. Definition of Done

Este hito se considera terminado cuando:

- La ruta de detalle documental funciona.
- Se puede entrar al detalle desde el listado.
- El detalle muestra metadatos principales.
- El usuario puede descargar desde el detalle.
- Las acciones respetan permisos.
- El bucket `documents` y sus policies quedan configurados o documentados.
- La ficha del asociado sigue mostrando documentos vinculados.
- `yarn lint` y `yarn build` pasan.

