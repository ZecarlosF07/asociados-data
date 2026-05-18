# Hito S13: Mejora post-release del Hito 2 - Generacion de usuarios y roles operativos

## 1. Objetivo del hito

Implementar la generacion operativa de usuarios internos desde el sistema y ampliar la matriz de roles para cubrir perfiles de trabajo mas especificos:

- `CAPTACION`
- `FACTURACION`
- `FIDELIZACION`

Este hito completa una brecha pendiente del **Hito 2: Usuarios, roles y configuracion base**, porque actualmente existe la estructura de perfiles y roles, pero la pantalla de usuarios no permite crear usuarios reales del sistema.

El objetivo no es solo registrar una fila en `user_profiles`, sino crear un usuario capaz de iniciar sesion y quedar asociado a un perfil interno, rol y permisos correctos.

## 2. Hito original que mejora

Este hito mejora el comportamiento del **Hito 2: Usuarios, roles y configuracion base** y complementa la subsanacion **S1: Seguridad, roles y permisos**.

El sistema ya cuenta con:

- tabla `roles`
- tabla `user_profiles`
- tabla `modules`
- tabla `permissions`
- tabla `role_permissions`
- funciones de autorizacion como `has_module_permission(...)`
- pantalla `/usuarios`
- servicio `userProfilesService`

La brecha actual es que:

- el boton `Nuevo usuario` esta pendiente
- crear un perfil interno no crea necesariamente un usuario de Auth
- el frontend conserva permisos hardcodeados en `src/utils/permissions.js`
- los roles actuales son demasiado generales para la operacion real

## 3. Estado actual detectado

### 3.1 Roles actuales

Archivo:

```txt
supabase/migrations/20260312050000_seed_roles.sql
```

Roles base:

- `ADMIN`
- `OPERADOR`
- `CONSULTA`

### 3.2 Modelo de permisos

Archivo:

```txt
supabase/migrations/20260507010000_s1_permissions_rls.sql
```

Existe una matriz parametrizable:

- `modules`
- `permissions`
- `role_permissions`

Modulos actuales:

- `dashboard`
- `prospectos`
- `asociados`
- `membresias`
- `cobranza`
- `documentos`
- `reportes`
- `usuarios`
- `configuracion`
- `auditoria`

### 3.3 Permisos frontend

Archivo:

```txt
src/utils/permissions.js
```

Actualmente el frontend define permisos por rol de forma hardcodeada.

Si se crean nuevos roles en BD sin actualizar este archivo, el menu y los `PermissionGuard` no funcionaran para esos roles.

### 3.4 Pantalla de usuarios

Archivo:

```txt
src/pages/users/UsersPage.jsx
```

El boton actual:

```txt
Nuevo usuario
```

solo muestra:

```txt
Crear usuario: funcionalidad pendiente
```

### 3.5 Servicio de usuarios

Archivo:

```txt
src/services/userProfiles.service.js
```

Existe `create(profile)`, pero solo inserta en:

```txt
public.user_profiles
```

Eso no crea un usuario en Supabase Auth. Por seguridad, la creacion de usuarios Auth no debe hacerse desde el frontend con una service role key.

## 4. Problemas detectados

### 4.1 Usuario incompleto

Si solo se crea `user_profiles`:

- no existe necesariamente `auth.users`
- el usuario no puede iniciar sesion
- puede quedar un perfil huerfano
- se rompe la relacion `auth_user_id`

### 4.2 Roles operativos insuficientes

Los roles actuales son demasiado amplios:

- `OPERADOR` puede operar multiples modulos
- `CONSULTA` es solo lectura general
- no existe separacion por area real de trabajo

### 4.3 Rutas y menu

La ruta `/dashboard` actualmente existe como entrada general. Si un rol no debe ver Dashboard, el sistema debe:

- ocultarlo del menu
- bloquear la ruta
- redirigir despues del login al primer modulo permitido

De lo contrario, un usuario de `CAPTACION`, `FACTURACION` o `FIDELIZACION` podria caer en una pantalla no permitida o ver acceso denegado al iniciar sesion.

## 5. Roles nuevos requeridos

### 5.1 CAPTACION

Rol orientado al equipo de captacion comercial.

Acceso funcional:

```txt
Prospectos
```

Permisos esperados:

- `prospectos:read`
- `prospectos:create`
- `prospectos:update`

Restricciones:

- no Dashboard
- no Asociados
- no Membresias
- no Cobranza
- no Documentos
- no Reportes
- no Usuarios
- no Configuracion
- no Auditoria
- no eliminacion salvo confirmacion posterior del negocio

### 5.2 FACTURACION

Rol orientado al equipo responsable de cobranza/facturacion.

Acceso funcional visible:

```txt
Cobranza
```

Permisos esperados:

- `cobranza:read`
- `cobranza:create`
- `cobranza:update`

Restricciones:

- no Dashboard
- no Prospectos
- no Asociados como modulo visible
- no Membresias como modulo visible
- no Documentos
- no Reportes
- no Usuarios
- no Configuracion
- no Auditoria
- no eliminacion salvo confirmacion posterior del negocio

Nota tecnica:

El modulo de cobranza puede necesitar leer datos relacionados de asociados, membresias y cronogramas para mostrar razon social, RUC, periodo y monto. Si las policies RLS actuales exigen permisos de esos modulos para joins, se debe resolver con una de estas opciones:

- otorgar permisos tecnicos de lectura minima sin mostrar esos modulos en el menu, o
- crear vistas/RPC de cobranza que expongan solo los datos necesarios bajo permiso `cobranza:read`.

La opcion recomendada es usar vistas/RPC especificas de cobranza para no abrir acceso completo a fichas de asociados o membresias.

### 5.3 FIDELIZACION

Rol orientado al seguimiento y operacion de asociados existentes.

Restricciones explicitas del negocio:

```txt
NO Dashboard
NO Reportes
NO Usuarios
```

Acceso operativo permitido:

- `prospectos`
- `asociados`
- `membresias`
- `cobranza`
- `documentos`

Permisos esperados:

- `read`
- `create`
- `update`

Restricciones adicionales recomendadas:

- no `delete`
- no `admin`
- no `auditoria`
- no administracion de roles
- no configuracion critica

Nota de decision:

Aunque el requerimiento dice "todo lo demas", por seguridad este hito debe tratar `auditoria`, `usuarios` y administracion critica como funciones administrativas. Si el negocio confirma que Fidelizacion tambien debe administrar configuracion, se debe agregar explicitamente en una iteracion posterior.

## 6. Alcance funcional

### 6.1 Crear usuario desde la pantalla Usuarios

La pantalla:

```txt
/usuarios
```

debe permitir al Administrador crear usuarios reales.

Datos minimos:

- nombres
- apellidos
- correo institucional
- DNI
- rol
- estado activo/inactivo
- notas opcionales

### 6.2 Crear cuenta de acceso

El flujo debe crear:

1. usuario en Supabase Auth
2. perfil en `public.user_profiles`
3. asociacion correcta mediante `auth_user_id`
4. rol seleccionado

El usuario creado debe poder iniciar sesion.

### 6.3 Metodo de activacion

El hito debe implementar uno de estos modelos:

Opcion recomendada:

```txt
Invitacion por correo
```

El Administrador registra el usuario y el sistema envia invitacion para definir clave.

Opcion alternativa:

```txt
Clave temporal
```

El Administrador define o genera una clave temporal y el usuario la cambia despues.

Por seguridad, se recomienda invitacion por correo mediante Admin API.

### 6.4 Gestion basica de usuarios

La pantalla debe permitir:

- listar usuarios
- crear usuario
- editar datos del perfil
- cambiar rol
- activar/desactivar usuario

Desactivar usuario debe impedir acceso funcional aunque el usuario Auth exista.

### 6.5 Reglas administrativas

Solo `ADMIN` puede:

- crear usuarios
- editar roles
- activar/desactivar usuarios
- ver el modulo `usuarios`

Ningun rol operativo debe ver `/usuarios`.

## 7. Alcance tecnico

### 7.1 Migracion de roles y permisos

Crear migracion:

```txt
supabase/migrations/YYYYMMDDHHMMSS_s13_user_generation_operational_roles.sql
```

Debe:

- insertar roles `CAPTACION`, `FACTURACION`, `FIDELIZACION`
- mantener `ADMIN`, `OPERADOR`, `CONSULTA`
- insertar/actualizar `role_permissions`
- no duplicar roles si ya existen
- dejar `is_active = true`
- definir `is_system = true` para roles base/operativos del sistema

### 7.2 Matriz de permisos BD

Matriz esperada:

| Rol | dashboard | prospectos | asociados | membresias | cobranza | documentos | reportes | usuarios | configuracion | auditoria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ADMIN | total | total | total | total | total | total | total | total | total | total |
| OPERADOR | read | r/c/u | r/c/u | r/c/u | r/c/u | r/c/u | read | no | no | no |
| CONSULTA | read | read | read | read | read | read | read | no | read | no |
| CAPTACION | no | r/c/u | no | no | no | no | no | no | no | no |
| FACTURACION | no | no | no* | no* | r/c/u | no | no | no | no | no |
| FIDELIZACION | no | r/c/u | r/c/u | r/c/u | r/c/u | r/c/u | no | no | no | no |

Leyenda:

- `r/c/u`: read, create, update
- `total`: read, create, update, delete, admin
- `no*`: no visible como modulo; puede requerir lectura tecnica via vista/RPC de cobranza

### 7.3 Permisos frontend

Actualizar:

```txt
src/utils/permissions.js
```

Debe incluir:

- `CAPTACION`
- `FACTURACION`
- `FIDELIZACION`

Tambien debe reflejar las restricciones por modulo.

Importante:

El sistema ya tiene `role_permissions` en BD, pero el frontend aun usa un mapa local. Para este hito se acepta actualizar el mapa local, pero debe quedar documentado como deuda tecnica migrar `usePermissions` a permisos dinamicos desde BD.

### 7.4 Proteger Dashboard

Actualizar:

```txt
src/router/AppRouter.jsx
```

La ruta `/dashboard` debe usar:

```txt
PermissionGuard module="dashboard"
```

Los roles sin dashboard no deben poder entrar escribiendo la URL.

### 7.5 Redireccion post-login

Crear o ajustar una utilidad:

```txt
src/utils/roleLandingRoutes.js
```

o equivalente.

Debe resolver la ruta inicial segun permisos:

- `ADMIN` -> `/dashboard`
- `OPERADOR` -> `/dashboard`
- `CONSULTA` -> `/dashboard`
- `CAPTACION` -> `/prospectos`
- `FACTURACION` -> `/cobranza`
- `FIDELIZACION` -> `/asociados`

La ruta raiz `/` y el post-login no deben asumir siempre `/dashboard`.

### 7.6 Creacion segura de usuarios Auth

No se debe exponer service role key en frontend.

Implementar una capa segura de servidor:

```txt
supabase/functions/create-internal-user/index.ts
```

Responsabilidades:

- validar JWT del usuario solicitante
- verificar que el solicitante tenga rol `ADMIN`
- crear usuario en Supabase Auth usando Admin API
- invitar usuario por correo o crear con clave temporal
- insertar `user_profiles`
- asignar `role_id`
- retornar perfil creado
- registrar auditoria

Variables requeridas:

```txt
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

La service role key solo debe existir en entorno seguro de Supabase Functions.

### 7.7 Servicio frontend

Crear o ampliar:

```txt
src/services/userProfiles.service.js
```

Metodo esperado:

```txt
createInternalUser(payload)
```

Debe invocar la Edge Function y devolver el perfil creado.

### 7.8 UI de usuarios

Crear componentes:

```txt
src/components/molecules/users/UserForm.jsx
src/components/molecules/users/UserModal.jsx
```

o una estructura equivalente segun patron del proyecto.

Actualizar:

```txt
src/pages/users/UsersPage.jsx
```

Debe reemplazar el mensaje de funcionalidad pendiente por un flujo real.

### 7.9 Auditoria

La creacion, edicion, cambio de rol y desactivacion de usuarios debe quedar auditada.

Eventos recomendados:

- `create_internal_user`
- `update_user_profile`
- `change_user_role`
- `deactivate_user`
- `reactivate_user`

## 8. Fuera de alcance

Este hito no incluye:

- recuperacion avanzada de contrasenas
- MFA
- politicas de expiracion de clave
- permisos dinamicos editables desde UI
- administracion visual de la matriz `role_permissions`
- roles por area o territorio
- auditoria forense avanzada de sesiones

## 9. Archivos esperados

### Nuevos

```txt
supabase/migrations/YYYYMMDDHHMMSS_s13_user_generation_operational_roles.sql
supabase/functions/create-internal-user/index.ts
supabase/audits/hito_s13_user_roles_audit.sql
src/components/molecules/users/UserForm.jsx
src/components/molecules/users/UserModal.jsx
```

Opcional:

```txt
src/utils/roleLandingRoutes.js
```

### Modificados

```txt
src/pages/users/UsersPage.jsx
src/services/userProfiles.service.js
src/services/roles.service.js
src/utils/permissions.js
src/router/AppRouter.jsx
src/router/routes.js
src/layouts/Sidebar.jsx
```

Modificar `routes.js` y `Sidebar.jsx` solo si la solucion requiere rutas auxiliares o cambios de visibilidad.

## 10. Auditoria SQL requerida

Crear:

```txt
supabase/audits/hito_s13_user_roles_audit.sql
```

Debe validar:

- existen roles `ADMIN`, `OPERADOR`, `CONSULTA`, `CAPTACION`, `FACTURACION`, `FIDELIZACION`
- los roles nuevos estan activos
- `CAPTACION` solo tiene permisos de `prospectos`
- `FACTURACION` solo tiene permisos funcionales de `cobranza`
- `FIDELIZACION` no tiene permisos sobre `dashboard`, `reportes`, `usuarios`, `auditoria`
- ningun rol operativo tiene `admin`
- `ADMIN` mantiene acceso total
- existe al menos un administrador activo

## 11. Criterios de aceptacion

El hito queda aprobado cuando:

- el Administrador puede crear un usuario real desde `/usuarios`
- el usuario creado puede iniciar sesion
- el perfil creado queda asociado al rol correcto
- `CAPTACION` solo ve y accede a Prospectos
- `FACTURACION` solo ve y accede a Cobranza
- `FIDELIZACION` no ve Dashboard, Reportes ni Usuarios
- `FIDELIZACION` accede a modulos operativos permitidos
- `/dashboard` esta protegido por permisos
- el login redirige a una ruta valida para cada rol
- el frontend y la BD tienen matrices de permisos coherentes
- no se expone service role key en frontend
- la creacion/cambio de usuarios queda auditada
- el audit SQL pasa sin hallazgos criticos
- `yarn lint` pasa sin errores
- `yarn build` pasa sin errores

## 12. Pruebas funcionales sugeridas

### 12.1 ADMIN crea usuario CAPTACION

1. Iniciar sesion como ADMIN.
2. Ir a `/usuarios`.
3. Crear usuario con rol `CAPTACION`.
4. Iniciar sesion con ese usuario.
5. Confirmar que solo ve Prospectos.
6. Confirmar que `/dashboard`, `/asociados`, `/cobranza`, `/usuarios` muestran acceso denegado o redirigen correctamente.

### 12.2 ADMIN crea usuario FACTURACION

1. Crear usuario con rol `FACTURACION`.
2. Iniciar sesion.
3. Confirmar que entra a Cobranza.
4. Confirmar que no ve Prospectos, Asociados, Reportes ni Usuarios.
5. Confirmar que puede registrar/actualizar acciones de cobranza segun permisos.

### 12.3 ADMIN crea usuario FIDELIZACION

1. Crear usuario con rol `FIDELIZACION`.
2. Iniciar sesion.
3. Confirmar que no ve Dashboard.
4. Confirmar que no ve Reportes.
5. Confirmar que no ve Usuarios.
6. Confirmar que puede operar Asociados, Membresias, Cobranza y Documentos.

### 12.4 Usuario desactivado

1. Desactivar usuario desde `/usuarios`.
2. Intentar iniciar sesion.
3. Confirmar que no puede operar el sistema aunque Auth permita autenticacion.

### 12.5 Auditoria

1. Crear usuario.
2. Cambiar rol.
3. Desactivar usuario.
4. Revisar `/auditoria`.
5. Confirmar eventos claros y trazables.

## 13. Notas para el desarrollador

Este hito toca seguridad. No debe implementarse solo como UI.

La regla principal es:

```txt
usuario real = auth.users + user_profiles + role_permissions coherentes
```

Si solo se inserta `user_profiles`, el hito no esta terminado.

La creacion de usuarios Auth debe hacerse desde una capa segura con service role, nunca desde el frontend.
