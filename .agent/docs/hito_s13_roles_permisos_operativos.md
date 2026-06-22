# Hito S13 - Roles y permisos operativos

## 1. Objetivo

Documentar la matriz vigente de roles, permisos funcionales y reglas RLS asociadas al hito S13.

El sistema usa dos capas de control:

- Permisos de modulo y accion: definen que modulos aparecen, que rutas se pueden abrir y que operaciones puede ejecutar cada rol.
- Lectura interna de referencia: permite resolver nombres, etiquetas y relaciones necesarias para que las pantallas no muestren datos vacios.

La lectura interna de referencia no habilita navegacion de modulos, creacion, edicion, eliminacion ni administracion.

## 2. Roles vigentes

Los roles operativos vigentes son:

- `ADMIN`
- `CAPTACION`
- `FACTURACION`
- `FIDELIZACION`
- `ALTA_DIRECCION`

Los roles retirados son:

- `OPERADOR`
- `CONSULTA`

No deben existir perfiles asociados a roles retirados.

## 3. Matriz de permisos por rol

| Rol | Modulo | Acciones permitidas |
| --- | --- | --- |
| `ADMIN` | Todos los modulos | `read`, `create`, `update`, `delete`, `admin` |
| `CAPTACION` | `prospectos` | `read`, `create`, `update` |
| `FACTURACION` | `membresias` | `read` |
| `FACTURACION` | `cobranza` | `read`, `create`, `update` |
| `FIDELIZACION` | `prospectos` | `read`, `create`, `update` |
| `FIDELIZACION` | `asociados` | `read`, `create`, `update` |
| `FIDELIZACION` | `membresias` | `read`, `create`, `update` |
| `FIDELIZACION` | `cobranza` | `read`, `create`, `update` |
| `FIDELIZACION` | `documentos` | `read`, `create`, `update` |
| `FIDELIZACION` | `comites` | `read`, `create`, `update` |
| `ALTA_DIRECCION` | `reportes` | `read` |
| `ALTA_DIRECCION` | `auditoria` | `read` |

Reglas transversales:

- Solo `ADMIN` tiene permisos `delete` y `admin`.
- Solo `ADMIN` accede al modulo `usuarios`.
- `ALTA_DIRECCION` es un rol de supervision; no opera modulos transaccionales.
- `CAPTACION` y `FIDELIZACION` pueden crear prospectos.
- `FACTURACION` puede operar cobranza y consultar membresias.
- `FIDELIZACION` no accede a Dashboard, Reportes, Usuarios, Configuracion ni Auditoria.
- `FIDELIZACION` administra comites y la asignacion del comite principal de cada asociado.

## 4. Lectura interna de referencia

Para evitar que pantallas autorizadas muestren datos incompletos por dependencias RLS, se habilita lectura interna basica para usuarios autenticados activos sobre:

- `associates`
- `prospects`
- `captadores`
- `categories`
- `catalog_items`
- `catalog_groups`
- `user_profiles`

Esta lectura se usa para resolver datos como:

- razon social del asociado
- RUC
- codigo interno
- categoria
- estado
- tipo de membresia
- captador
- usuario responsable
- actor de auditoria

No otorga permisos funcionales sobre los modulos relacionados. Por ejemplo, `FACTURACION` puede ver la razon social dentro de Membresias o Cobranza, pero no obtiene permiso de modulo `asociados`.

## 5. Lectura para reportes

Las vistas de reportes usan `security_invoker = true`, por lo que respetan RLS de las tablas base.

Para que `ALTA_DIRECCION` pueda consultar reportes sin recibir permisos operativos directos, se habilita lectura de datos base para usuarios con `reportes:read` sobre:

- `memberships`
- `payment_schedules`
- `payments`
- `collection_actions`
- `documents`

Esto permite alimentar las vistas de reportes, pero no habilita:

- navegacion a modulos operativos
- creacion
- edicion
- eliminacion
- administracion

## 6. Generacion de usuarios internos

La creacion y restablecimiento de usuarios internos se realiza mediante Edge Functions de Supabase:

- `create-internal-user`
- `reset-internal-user-password`

Estas funciones:

- deben desplegarse en Supabase Functions
- usan `--no-verify-jwt` para permitir el preflight CORS
- validan manualmente el token del usuario
- exigen rol `ADMIN`
- usan `SUPABASE_SERVICE_ROLE_KEY` solo del lado servidor
- registran auditoria sin guardar claves temporales

El frontend en Vercel no debe tener `SUPABASE_SERVICE_ROLE_KEY`.

## 7. Archivos principales

Migraciones:

- `supabase/migrations/20260519010000_s13_user_generation_operational_roles.sql`
- `supabase/migrations/20260519020000_s13_internal_reference_reads.sql`
- `supabase/migrations/20260519030000_s13_reports_operational_read.sql`

Auditoria:

- `supabase/audits/hito_s13_user_roles_audit.sql`

Frontend:

- `src/utils/permissions.js`
- `src/hooks/usePermissions.js`
- `src/router/ProtectedRoute.jsx`
- `src/router/AppRouter.jsx`
- `src/utils/roleLandingRoutes.js`
- `src/pages/users/UsersPage.jsx`

Edge Functions:

- `supabase/functions/create-internal-user/index.ts`
- `supabase/functions/reset-internal-user-password/index.ts`

## 8. Checks esperados del audit S13

El audit debe validar, como minimo:

- `roles_operativos_vigentes = 5`
- `roles_retirados_no_existen = 0`
- `perfiles_roles_retirados = 0`
- `captacion_permisos` contiene solo `prospectos:create`, `prospectos:read`, `prospectos:update`
- `facturacion_permisos` contiene `cobranza:create`, `cobranza:read`, `cobranza:update`, `membresias:read`
- `fidelizacion_sin_modulos_restringidos = 0`
- `alta_direccion_permisos` contiene solo `auditoria:read`, `reportes:read`
- `roles_operativos_sin_delete_admin = 0`
- `internal_reference_read_policies = 7`
- `facturacion_sin_asociados_module_permission = 0`
- `reportes_operational_read_policies = 5`
- `alta_direccion_sin_modulos_operativos = 0`

## 9. Criterio funcional

El criterio vigente es:

- Bloquear modulos y acciones por rol.
- Permitir lectura de referencia suficiente para que las pantallas autorizadas no queden vacias.
- Mantener las escrituras protegidas por modulo y accion.
- Mantener auditoria y usuarios como modulos restringidos.
- Evitar sobreingenieria de vistas por cada dependencia mientras no existan datos sensibles adicionales en las tablas de referencia.
