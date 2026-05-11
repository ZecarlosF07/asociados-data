# Hito S4 — Storage y políticas documentales

## Bucket

El bucket operativo es `documents`.

Configuración esperada:

- `public = false`
- límite máximo: `20971520` bytes, equivalente a 20 MB
- descarga mediante URL firmada
- sin exposición pública directa

## MIME types permitidos

- PDF
- Word
- Excel
- PowerPoint
- JPEG
- PNG
- WebP
- CSV
- TXT
- ZIP
- RAR

## Policies de Storage

Las policies fueron definidas en S1:

- `documents_storage_read`: requiere `documentos/read`
- `documents_storage_insert`: requiere `documentos/create`
- `documents_storage_update`: requiere `documentos/update`
- `documents_storage_delete`: requiere `documentos/delete`

## Restricción de eliminación

La UI usa eliminación lógica sobre `public.documents`.

La eliminación física del objeto de Storage queda restringida por policy a usuarios con `documentos/delete`. El flujo operativo normal no borra físicamente el archivo desde el detalle; marca el documento como eliminado para conservar trazabilidad.

## Descarga

La descarga usa:

```js
supabase.storage.from('documents').createSignedUrl(storagePath, 3600)
```

La URL firmada expira por defecto en una hora.

## Validación recomendada

Ejecutar el audit:

```sql
-- contenido de supabase/audits/hito_s4_documents_audit.sql
```

Debe confirmar:

- bucket `documents`
- policies `documents_storage_*`
- policies RLS sobre `documents` y `storage_nodes`
