# Validación de seeds MVP

## Objetivo

Confirmar que un entorno limpio tenga los datos mínimos para operar el MVP sin carga manual extensa.

## Audit

Ejecutar en SQL Editor:

```sql
-- contenido de supabase/audits/hito_s6_seed_release_audit.sql
```

## Resultado esperado

### Roles base

Debe existir al menos:

- `ADMIN`
- `OPERADOR`
- `CONSULTA`

### Usuario administrador inicial

Debe existir al menos un perfil activo con rol `ADMIN`.

Antes de uso operativo:

- confirmar correo real
- rotar credenciales iniciales
- validar acceso desde la pantalla de login

### Configuraciones generales

Deben existir:

- `app_name`
- `app_currency`
- `pagination_default_size`
- `prospect_evaluation_max_score`
- `membership_default_currency`
- `audit_enabled`

### Grupos de catálogo

Deben existir:

- `PROSPECT_STATUS`
- `ASSOCIATE_STATUS`
- `MEMBERSHIP_STATUS`
- `MEMBERSHIP_TYPE`
- `PAYMENT_METHOD`
- `CONTACT_TYPE`
- `COMPANY_SIZE`
- `ACTIVITY_TYPE`
- `DOCUMENT_TYPE`
- `DOCUMENT_CATEGORY`
- `COLLECTION_STATUS`
- `COLLECTION_RESULT`
- `PERSON_ROLE`
- `AREA`
- `PAYMENT_HEALTH`
- `QUOTE_STATUS`
- `NODE_TYPE`
- `DRIVE_SYNC_STATUS`
- `SUMMARY_STATUS`

### Ítems críticos de catálogo

Validar que tengan registros activos:

- estados de prospecto
- estados de asociado
- estados de membresía
- tipos de membresía
- métodos de pago
- tipos de contacto
- estados de cobranza
- resultados de cobranza
- tipos documentales
- categorías documentales
- tipos de nodo
- estados de sincronización
- salud de pago

### Categorías

Deben existir al menos 5 categorías operativas:

- `CAT_A`
- `CAT_B`
- `CAT_C`
- `CAT_D`
- `CAT_E`

### Storage

Debe existir el bucket:

- `documents`

Con:

- `public = false`
- `file_size_limit = 20971520`
- MIME types permitidos configurados

### Estructuras S

Validar existencia de:

- `modules`
- `permissions`
- `role_permissions`
- `automation_jobs`
- `automation_job_runs`
- vistas `report_*`
- `dashboard_kpis`

## Criterio de aprobación

La validación de seeds queda aprobada si:

- todos los `found` son mayores o iguales a `expected_min`
- los catálogos críticos tienen al menos un ítem activo
- el bucket `documents` aparece correctamente configurado
- las estructuras de seguridad, reportes y automatización existen

## Incidencias frecuentes

| Incidencia | Acción |
|---|---|
| Falta admin inicial | Crear usuario Auth y perfil `user_profiles` con rol `ADMIN`. |
| Faltan catálogos | Revisar migraciones `seed_catalog_groups` y `seed_catalog_items`. |
| Faltan categorías | Revisar `seed_categories`. |
| Bucket ausente | Ejecutar S1 o crear bucket `documents` con configuración esperada. |
| Views de reportes ausentes | Ejecutar migración S5. |
