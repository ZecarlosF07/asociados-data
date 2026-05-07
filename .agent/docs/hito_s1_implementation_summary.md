# Hito S1 - Seguridad, roles y permisos: resumen de implementación

## Estado

Implementado a nivel de migracion, frontend minimo y documentacion tecnica.

## Cambios realizados

### Modelo de permisos parametrizable

Se agrego la migracion:

- `supabase/migrations/20260507010000_s1_permissions_rls.sql`

La migracion crea:

- `modules`
- `permissions`
- `role_permissions`

Tambien carga la matriz inicial para los roles existentes:

- `ADMIN`: acceso total.
- `OPERADOR`: lectura, creacion y actualizacion en modulos operativos; lectura de reportes/configuracion; sin administracion de usuarios, auditoria ni configuracion.
- `CONSULTA`: solo lectura operativa.

### Funciones auxiliares de seguridad

Se agregaron funciones SQL `security definer`:

- `public.current_user_profile_id()`
- `public.current_user_role_code()`
- `public.is_admin()`
- `public.has_module_permission(module_code text, action_code text)`
- `public.touch_current_user_last_login()`

`touch_current_user_last_login()` reemplaza la actualizacion directa de `last_login_at` desde frontend para no abrir una policy amplia de `update` sobre `user_profiles`.

### RLS por tabla

La migracion habilita RLS y crea policies para:

- `roles`
- `user_profiles`
- `system_settings`
- `audit_logs`
- `catalog_groups`
- `catalog_items`
- `categories`
- `prospects`
- `prospect_evaluations`
- `prospect_quotes`
- `prospect_status_history`
- `captadores`
- `associates`
- `associate_people`
- `associate_area_contacts`
- `memberships`
- `payment_schedules`
- `payments`
- `collection_actions`
- `storage_nodes`
- `documents`

Las policies usan `has_module_permission()` para evitar duplicar reglas por rol en cada tabla.

### Storage

La migracion asegura el bucket `documents` con:

- `public = false`
- limite de 20 MB
- MIME types permitidos para documentos, imagenes, CSV, texto, ZIP y RAR

Tambien crea policies en `storage.objects` para:

- lectura con permiso `documentos/read`
- subida con permiso `documentos/create`
- actualizacion con permiso `documentos/update`
- eliminacion fisica con permiso `documentos/delete`

### Auditoria

Se agrego `public.fn_audit_row_change()` y triggers automaticos para tablas criticas.

Las operaciones `insert`, `update` y `delete` registran:

- usuario actor
- tabla
- entidad
- accion
- datos previos
- datos nuevos
- resumen

No se agrego trigger sobre `audit_logs` para evitar recursion.

### Frontend

Se actualizo:

- `src/services/userProfiles.service.js`

El metodo `updateLastLogin()` ahora usa:

```js
supabase.rpc('touch_current_user_last_login')
```

Esto mantiene `PermissionGuard` como barrera de experiencia de usuario, mientras que Supabase pasa a ser la barrera real de seguridad.

## Validaciones ejecutadas

```bash
yarn lint
yarn build
```

Resultado:

- `yarn lint` sin errores.
- `yarn build` sin errores.
- `yarn build` conserva advertencia de chunk grande, asignada a S5.

## Validacion de base de datos

Se intento ejecutar:

```bash
supabase db lint --local --schema public,storage
```

Resultado:

- No se pudo conectar a la base local porque Supabase local no esta levantado en `127.0.0.1:54322`.
- El primer intento fue bloqueado por sandbox.
- El segundo intento, con permisos elevados, devolvio `connection refused`.

Queda pendiente ejecutar esta validacion cuando la base local o remota este disponible.

## Riesgos residuales

- Las policies de S1 deben validarse contra una base Supabase real despues de aplicar migraciones.
- Las operaciones de auditoria automatica pueden generar alto volumen de registros en tablas muy activas; esto es esperado para S1, pero puede optimizarse en una fase posterior si el volumen operativo lo exige.
- Las operaciones sensibles de negocio aun requieren los RPC transaccionales de S2 y S3.

