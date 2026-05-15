# Hito S4 — Subsanación Hito 7: Documentos y almacenamiento

## Estado

Implementado en código y documentado.

## Cambios principales

### Detalle documental

Archivos creados:

- `src/pages/documents/DocumentDetailPage.jsx`
- `src/pages/documents/sections/DocumentDetailHeader.jsx`
- `src/pages/documents/sections/DocumentMetadataSection.jsx`
- `src/pages/documents/sections/DocumentVersionSection.jsx`

La página de detalle muestra:

- título
- nombre original
- tipo documental
- categoría
- asociado vinculado
- prospecto vinculado
- nodo lógico
- ruta lógica
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

### Acciones del detalle

Se agregó soporte para:

- descargar con URL firmada
- copiar referencia `bucket/storage_path`
- editar metadatos
- reemplazar versión
- eliminar lógicamente
- volver al listado

### Navegación

Se registró la ruta:

- `ROUTES.DOCUMENTOS_DETALLE`
- `src/router/AppRouter.jsx`

Se agregó navegación desde:

- `DocumentsPage`
- `DocumentList`
- `DocumentCard`
- tab `Documentos` de la ficha del asociado

### Servicios

Archivo modificado:

- `src/services/documents.service.js`

Se agregó:

- `documentsService.getVersionHistory(documentId)`
- `documentsService.updateMetadata(id, updates)`

También se ajustó `replaceVersion(...)` para marcar la versión anterior como histórica después de crear la nueva versión.

### Storage

No se creó una migración nueva porque el bucket `documents` y sus policies ya fueron definidos en S1.

Documentación:

- `.agent/docs/hito_s4_storage_policies.md`

Audit:

- `supabase/audits/hito_s4_documents_audit.sql`

## Validaciones ejecutadas

```bash
yarn lint
yarn build
```

Resultado:

- `yarn lint` pasó correctamente.
- `yarn build` pasó correctamente.
- El build mantiene el warning existente de chunk mayor a 500 kB, asignado a S5.

## Validación operativa

Audit S4 ejecutado y validado por SQL Editor. Se confirmó bucket privado `documents`, policies de Storage y policies públicas del módulo documental:

```sql
-- contenido de supabase/audits/hito_s4_documents_audit.sql
```
