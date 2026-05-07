# Hito S1: Subsanación del Hito 2 - Seguridad, roles y permisos

## 1. Objetivo del hito

Cerrar las brechas de seguridad del Hito 2 para que usuarios, roles y permisos no dependan únicamente del frontend. El sistema debe aplicar controles reales en Supabase mediante RLS, policies y funciones auxiliares de autorización.

## 2. Hito original que subsana

Este hito subsana el **Hito 2: Usuarios, roles y configuración base**.

El Hito 2 exige:

- identificar roles de usuario
- restringir rutas o vistas no permitidas
- preparar permisos por módulo
- registrar trazabilidad mínima

La brecha detectada es que la restricción existe principalmente en frontend y no como control fuerte en base de datos.

## 3. Problemas detectados

- `src/utils/permissions.js` define permisos hardcodeados en frontend.
- `PermissionGuard` protege la navegación visual, pero no protege datos directamente.
- No hay evidencia suficiente de RLS en migraciones.
- Un usuario podría intentar operar contra Supabase si manipula el cliente.
- La auditoría está modelada, pero falta asegurar uso consistente.

## 4. Alcance técnico

### 4.1 Modelo de permisos

Mantener como base los roles:

- `ADMIN`
- `OPERADOR`
- `CONSULTA`

Definir permisos por módulo y acción:

- `read`
- `create`
- `update`
- `delete`
- `admin`

Módulos mínimos:

- dashboard
- prospectos
- asociados
- membresias
- cobranza
- documentos
- reportes
- usuarios
- configuracion
- auditoria

### 4.2 Tablas recomendadas

Evaluar y crear si aplica:

- `modules`
- `permissions`
- `role_permissions`

Si se decide no crear tablas de permisos, documentar por qué y dejar funciones SQL claras. La opción preferida para mantenimiento es parametrizar permisos en base de datos.

### 4.3 Funciones SQL auxiliares

Crear funciones en Supabase:

- `public.current_user_profile_id()`
- `public.current_user_role_code()`
- `public.is_admin()`
- `public.has_module_permission(module_code text, action_code text)`

Estas funciones deben ser usadas por policies para evitar duplicación de lógica.

### 4.4 RLS por tabla

Habilitar RLS y crear policies para:

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

### 4.5 Reglas mínimas de acceso

- `ADMIN`: lectura y escritura total.
- `OPERADOR`: lectura, creación y edición operativa; sin administración de usuarios ni configuración crítica.
- `CONSULTA`: solo lectura.
- Usuarios inactivos: sin acceso operativo.
- Registros con `is_deleted = true`: no visibles salvo necesidad administrativa explícita.

### 4.6 Auditoría

Registrar acciones críticas:

- creación y edición de prospectos
- cambios de estado de prospecto
- conversión a asociado
- edición de asociado
- creación/cancelación/renovación de membresía
- registro/reversa de pagos
- acciones de cobranza
- carga, descarga y eliminación lógica de documentos
- cambios en catálogos/configuración

## 5. Tareas para el desarrollador

1. Crear migración de tablas de permisos si se adopta modelo parametrizado.
2. Crear funciones SQL auxiliares.
3. Habilitar RLS tabla por tabla.
4. Crear policies por rol y acción.
5. Crear o ajustar policies del bucket `documents`.
6. Ajustar frontend para tratar `PermissionGuard` como UX, no como seguridad única.
7. Manejar errores de permiso de Supabase con mensajes claros.
8. Agregar registros de auditoría en operaciones críticas.
9. Probar acceso con usuarios `ADMIN`, `OPERADOR` y `CONSULTA`.

## 6. Definition of Done

Este hito se considera terminado cuando:

- Las tablas críticas tienen RLS habilitado.
- Las policies bloquean escritura de usuarios sin permiso.
- `CONSULTA` no puede crear, editar ni eliminar aunque manipule el frontend.
- `OPERADOR` no puede administrar usuarios/configuración.
- `ADMIN` puede operar todo el sistema.
- Las policies de Storage del bucket `documents` están creadas o documentadas.
- Las acciones críticas registran auditoría.
- Existen pruebas documentadas por rol.
- `yarn lint` y `yarn build` pasan.

