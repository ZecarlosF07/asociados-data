# Hito S10: Mejora post-release del Hito 2 - Módulo de Auditoría Operativa

## 1. Objetivo del hito

Implementar un módulo visual de auditoría operativa para que el Administrador pueda consultar desde la aplicación los cambios y acciones registradas por los usuarios en el sistema.

Este hito convierte la infraestructura de auditoría ya existente en una herramienta usable de supervisión, soporte y control interno.

El sistema ya cuenta con:

- tabla `public.audit_logs`
- índices para consulta por fecha, usuario, entidad y acción
- policies RLS para lectura con permiso `auditoria:read`
- módulo de permisos `auditoria`
- triggers automáticos de auditoría creados en S1
- registros explícitos de auditoría en flujos críticos como conversión, pagos y alta directa de asociados

La brecha actual es que no existe una pantalla `/auditoria` ni una navegación visible para revisar esos logs desde el frontend.

## 2. Hito original que mejora

Este hito mejora el comportamiento del **Hito 2: usuarios, roles, configuración base y auditoría** y complementa la subsanación **S1: seguridad, roles y permisos**.

El análisis funcional define:

- la auditoría es obligatoria y global
- solo el Administrador puede ver la auditoría
- debe registrarse todo cambio realizado en la plataforma
- el filtro requerido será por usuario
- la retención será de 6 meses

S1 dejó la infraestructura técnica lista, pero falta el módulo visual para consulta operativa.

## 3. Estado actual detectado

### 3.1 Base de datos

Archivo:

```txt
supabase/migrations/20260312040000_create_audit_logs.sql
```

Existe la tabla:

```txt
public.audit_logs
```

Campos relevantes:

- `id`
- `event_at`
- `actor_user_id`
- `entity_name`
- `entity_id`
- `action_type`
- `previous_data`
- `new_data`
- `summary`
- `ip_address`
- `user_agent`
- `extra_meta`

Índices existentes:

- `idx_audit_logs_event_at`
- `idx_audit_logs_actor`
- `idx_audit_logs_entity`
- `idx_audit_logs_action`

### 3.2 Seguridad y permisos

Archivo:

```txt
supabase/migrations/20260507010000_s1_permissions_rls.sql
```

Existe el módulo:

```txt
auditoria
```

Y la policy:

```sql
using (public.has_module_permission('auditoria', 'read'))
```

En frontend:

```txt
src/utils/permissions.js
```

Actualmente solo `ADMIN` tiene:

```js
auditoria: true
```

### 3.3 Servicio frontend

Archivo:

```txt
src/services/audit.service.js
```

Ya existe:

- `log(...)`
- `getByEntity(entityName, entityId)`
- `getRecent(limit)`

Pero falta:

- consulta paginada
- filtros por usuario
- filtros por entidad
- filtros por acción
- filtros por rango de fechas
- consulta de detalle por id
- preparación para exportación o inspección de cambios

### 3.4 UI actual

No existe:

- ruta `ROUTES.AUDITORIA`
- página `AuditPage`
- item de navegación `Auditoría`
- componentes de filtros
- lista de eventos
- detalle visual de `previous_data` y `new_data`

## 4. Alcance funcional

### 4.1 Pantalla de auditoría

Crear una pantalla:

```txt
/auditoria
```

Debe mostrar una lista operativa de eventos auditados, ordenados por fecha descendente.

Cada evento debe mostrar:

- fecha y hora
- usuario actor
- entidad afectada
- tipo de acción
- resumen
- identificador de entidad si existe

### 4.2 Acceso restringido

Solo usuarios con permiso sobre el módulo `auditoria` deben acceder.

Reglas:

- `ADMIN` puede ver la auditoría
- `OPERADOR` no puede verla
- `CONSULTA` no puede verla
- el item de navegación debe ocultarse si no hay permiso
- la ruta debe usar `PermissionGuard module="auditoria"`
- la BD debe seguir protegida por RLS

### 4.3 Filtros

El filtro requerido por negocio es el filtro por usuario.

La pantalla debe incluir como mínimo:

- usuario actor

Además, para soporte operativo, debe incluir:

- entidad
- acción
- fecha desde
- fecha hasta

Los filtros deben poder combinarse.

La pantalla debe permitir limpiar filtros.

### 4.4 Detalle de evento

Al seleccionar un evento, el Administrador debe poder ver un detalle expandido o modal con:

- datos generales del evento
- `previous_data`
- `new_data`
- `extra_meta`

El detalle debe ser legible y seguro:

- mostrar JSON formateado
- evitar romper la UI con objetos grandes
- usar scroll interno si el contenido es extenso
- no permitir edición

### 4.5 Diferencias anterior/nuevo

Cuando existan `previous_data` y `new_data`, la UI debe ayudar a identificar cambios.

Alcance mínimo:

- listar campos modificados
- mostrar valor anterior y valor nuevo

Si el diff resulta complejo por objetos anidados, se acepta mostrar:

- resumen de campos cambiados en nivel superior
- JSON completo en secciones separadas

### 4.6 Paginación o carga incremental

La auditoría puede crecer rápido.

La pantalla no debe cargar todos los registros.

Debe usar:

- límite inicial razonable, por ejemplo 50 registros
- paginación simple o botón "Cargar más"
- consulta ordenada por `event_at desc`

### 4.7 Retención de 6 meses

El análisis funcional exige retención de 6 meses.

Este hito debe dejar implementada una estrategia técnica para eliminar logs antiguos.

Alcance requerido:

- crear función SQL `public.purge_old_audit_logs(p_before timestamptz default now() - interval '6 months')`
- permitir ejecución solo a usuarios con permiso `auditoria:admin`
- registrar un evento de auditoría sobre la purga
- no exponer botón destructivo en UI salvo decisión explícita posterior

## 5. Alcance técnico

### 5.1 Rutas y navegación

Actualizar:

```txt
src/router/routes.js
src/router/AppRouter.jsx
src/utils/constants.js
```

Agregar:

```txt
AUDITORIA: /auditoria
```

Agregar item de navegación:

```txt
Auditoría
```

El sidebar ya filtra por permisos usando el path como módulo. Por eso la ruta debe mantener el nombre:

```txt
/auditoria
```

para coincidir con `permissions.auditoria`.

### 5.2 Página principal

Crear:

```txt
src/pages/audit/AuditPage.jsx
```

Debe:

- usar `PermissionGuard module="auditoria"` desde el router
- cargar eventos con un hook dedicado
- renderizar filtros
- renderizar lista
- manejar loading, error y empty state
- permitir abrir el detalle del evento

### 5.3 Servicio de auditoría

Actualizar:

```txt
src/services/audit.service.js
```

Agregar:

```js
getAll({
  actorUserId,
  entityName,
  actionType,
  dateFrom,
  dateTo,
  limit,
  offset,
})
```

Debe consultar:

```txt
audit_logs
```

con join:

```txt
actor:actor_user_id(id, first_name, last_name, email)
```

Debe aplicar:

- `.eq('actor_user_id', actorUserId)` si existe
- `.eq('entity_name', entityName)` si existe
- `.eq('action_type', actionType)` si existe
- `.gte('event_at', dateFrom)` si existe
- `.lte('event_at', dateTo)` si existe
- `.order('event_at', { ascending: false })`
- `.range(offset, offset + limit - 1)`

Para calcular `hasMore`, usar una de estas estrategias:

- solicitar `count: 'exact'` en la consulta y comparar `offset + data.length < count`
- o pedir `limit + 1` registros y recortar el excedente antes de renderizar

También puede agregar:

```js
getById(id)
getDistinctEntities()
getDistinctActions()
```

Si Supabase no permite `distinct` de forma simple desde el cliente, se puede resolver con valores derivados de los resultados cargados. Si se requiere precisión global para los filtros, crear una vista o RPC liviana en una migración S10.

### 5.4 Hook de auditoría

Crear:

```txt
src/hooks/useAuditLogs.js
```

Debe manejar:

- `logs`
- `loading`
- `error`
- `filters`
- `hasMore`
- `updateFilters`
- `clearFilters`
- `loadMore`
- `refetch`

Debe evitar duplicados al cargar más registros.

### 5.5 Componentes UI

Crear componentes pequeños:

```txt
src/components/molecules/audit/AuditFilters.jsx
src/components/molecules/audit/AuditLogListItem.jsx
src/components/molecules/audit/AuditLogDetailModal.jsx
src/components/molecules/audit/AuditJsonViewer.jsx
src/components/molecules/audit/AuditChangeSummary.jsx
```

Responsabilidades:

- `AuditFilters`: filtros por usuario, entidad, acción y fechas
- `AuditLogListItem`: fila/lista escaneable del evento
- `AuditLogDetailModal`: detalle completo del evento
- `AuditJsonViewer`: render JSON formateado
- `AuditChangeSummary`: resumen de campos modificados

Mantener componentes por debajo de 120 líneas cuando sea razonable.

### 5.6 Utilidades

Crear:

```txt
src/utils/auditFormatters.js
```

Debe incluir funciones puras:

- `formatAuditActor(log)`
- `formatAuditAction(actionType)`
- `formatAuditEntity(entityName)`
- `getAuditChangedFields(previousData, newData)`
- `safeJsonPreview(value)`

No mezclar lógica de formato dentro de la página.

### 5.7 Usuarios para filtro

Reutilizar:

```txt
src/services/userProfiles.service.js
```

o el hook existente:

```txt
src/hooks/useActiveUsers.js
```

Sin embargo, para auditoría conviene considerar que el actor puede ser un usuario inactivo. Por eso el selector de auditoría no debe depender estrictamente de usuarios activos si se necesita trazabilidad histórica.

Si el selector actual no sirve para todos los usuarios, crear un selector específico:

```txt
src/components/molecules/audit/AuditUserSelect.jsx
```

Debe permitir seleccionar usuario actor por `user_profiles.id`.

Reglas:

- cargar usuarios desde `userProfilesService.getAll()`
- mostrar nombre, apellido, correo y rol si están disponibles
- incluir usuarios inactivos no eliminados, porque pueden haber generado eventos históricos
- si un log no puede resolver el actor por RLS o por usuario eliminado, mostrar `actor_user_id` como fallback

### 5.8 Modal reutilizable

Existe un modal reutilizable:

```txt
src/components/organisms/Modal.jsx
```

`AuditLogDetailModal` debe reutilizarlo en lugar de crear una implementación paralela de modal.

## 6. Backend y migraciones

### 6.1 Sin nueva tabla

No se debe crear una nueva tabla de auditoría.

La fuente única sigue siendo:

```txt
public.audit_logs
```

### 6.2 Retención

Crear migración:

```txt
supabase/migrations/YYYYMMDDHHMMSS_s10_audit_retention.sql
```

Función recomendada:

```sql
public.purge_old_audit_logs(p_before timestamptz default now() - interval '6 months')
```

Reglas:

- `security definer`
- valida `has_module_permission('auditoria', 'admin')`
- elimina solo logs anteriores a `p_before`
- retorna cantidad de registros eliminados
- registra en `audit_logs` un evento `purge_old_audit_logs`
- no debe ejecutarse automáticamente sin acuerdo operativo

Nota técnica:

- `ADMIN` ya recibe permisos `admin` sobre todos los módulos por S1.
- No agregar trigger automático sobre `audit_logs`.
- Si se implementa esta función, debe hacerse con cuidado para que el evento de purga quede fuera del rango eliminado.

### 6.3 Audit SQL de validación

Crear:

```txt
supabase/audits/hito_s10_audit_module_audit.sql
```

Debe verificar:

- existe `audit_logs`
- RLS habilitado
- policy `audit_logs_read`
- policy `audit_logs_insert`
- policy `audit_logs_admin_delete`
- existencia del módulo `auditoria`
- permisos por rol para `auditoria`
- conteo de eventos por entidad
- conteo de eventos por acción
- eventos más recientes
- existencia de `purge_old_audit_logs`

## 7. Archivos principales a tocar

Frontend:

- `src/router/routes.js`
- `src/router/AppRouter.jsx`
- `src/utils/constants.js`
- `src/services/audit.service.js`
- `src/services/userProfiles.service.js` si se requiere método específico para actores
- `src/hooks/useAuditLogs.js`
- `src/pages/audit/AuditPage.jsx`
- `src/components/molecules/audit/AuditUserSelect.jsx` si `UserProfileSelect` no cubre usuarios históricos
- `src/components/molecules/audit/AuditFilters.jsx`
- `src/components/molecules/audit/AuditLogListItem.jsx`
- `src/components/molecules/audit/AuditLogDetailModal.jsx`
- `src/components/molecules/audit/AuditJsonViewer.jsx`
- `src/components/molecules/audit/AuditChangeSummary.jsx`
- `src/utils/auditFormatters.js`

Backend:

- `supabase/migrations/YYYYMMDDHHMMSS_s10_audit_retention.sql`
- `supabase/audits/hito_s10_audit_module_audit.sql`

## 8. Reglas de seguridad

- No mostrar auditoría a usuarios sin permiso `auditoria`.
- No confiar solo en el frontend: RLS debe seguir protegiendo `audit_logs`.
- No permitir edición de logs desde UI.
- No permitir eliminación manual de logs desde UI.
- No mostrar acciones destructivas de purga salvo decisión explícita.
- No registrar logs de auditoría sobre la tabla `audit_logs` mediante trigger automático para evitar recursión.
- Evitar exponer datos sensibles de auth que no existan ya en `audit_logs`.

## 9. Casos de prueba obligatorios

### 9.1 Acceso ADMIN

Entrada:

- usuario con rol `ADMIN`

Resultado esperado:

- ve item `Auditoría` en sidebar
- puede entrar a `/auditoria`
- ve eventos recientes

### 9.2 Acceso no autorizado

Entrada:

- usuario `OPERADOR` o `CONSULTA`

Resultado esperado:

- no ve item `Auditoría`
- si intenta abrir `/auditoria`, ve acceso denegado
- la consulta directa a `audit_logs` queda bloqueada por RLS

### 9.3 Filtro por usuario

Entrada:

- seleccionar un usuario actor

Resultado esperado:

- solo se muestran eventos con `actor_user_id` igual al usuario seleccionado

### 9.4 Filtros combinados

Entrada:

- usuario
- entidad
- acción
- rango de fechas

Resultado esperado:

- los filtros se aplican combinados
- limpiar filtros restaura la consulta base

### 9.5 Detalle de evento

Entrada:

- abrir un evento con `previous_data` y `new_data`

Resultado esperado:

- se muestran datos generales
- se muestra resumen de campos modificados
- se puede inspeccionar JSON anterior y nuevo
- la UI no se rompe con JSON extenso

### 9.6 Paginación

Entrada:

- existen más de 50 eventos

Resultado esperado:

- se muestran los primeros 50
- `Cargar más` trae el siguiente bloque
- no duplica eventos

### 9.7 Retención

Entrada:

- existen eventos con más de 6 meses

Resultado esperado:

- si se ejecuta la función de retención, elimina solo eventos anteriores al corte
- registra evento de purga
- no elimina eventos recientes

## 10. Definition of Done

Este hito se considera terminado cuando:

- existe ruta `/auditoria`
- existe item de navegación `Auditoría` visible solo para ADMIN
- la ruta usa `PermissionGuard module="auditoria"`
- la pantalla lista eventos recientes desde `audit_logs`
- se puede filtrar por usuario
- se puede filtrar por entidad
- se puede filtrar por acción
- se puede filtrar por rango de fechas
- se puede limpiar filtros
- se puede abrir detalle de evento
- se muestra `previous_data`, `new_data` y `extra_meta` de forma legible
- existe resumen de campos modificados cuando aplica
- la consulta es paginada o incremental
- no se crean tablas nuevas innecesarias
- existe audit SQL de validación S10
- existe función de retención de 6 meses protegida por permiso `auditoria:admin`
- `yarn lint` pasa
- `yarn build` pasa

## 11. Fuera de alcance

No forma parte de este hito:

- Editor de logs de auditoría.
- Eliminación manual de eventos desde la UI.
- Alertas automáticas por evento sospechoso.
- Auditoría forense avanzada.
- Comparador profundo de objetos anidados.
- Integración con SIEM externo.
- Dashboard estadístico avanzado de auditoría.
- Cambio del modelo principal `audit_logs`.
