# Hito S16: Evolucion post-release de los Hitos 5 y 7 - Asignacion de comites a asociados

## 1. Objetivo del hito

Permitir identificar a que comite institucional corresponde cada asociado, mediante un modulo operativo propio, filtros, historial de asignacion y auditoria.

El usuario debe poder:

- administrar comites desde el modulo Comites
- consultar la ficha de un comite y sus asociados vigentes
- seleccionar un comite principal al crear o convertir un asociado
- asignar, cambiar o retirar el comite desde la ficha de un asociado existente
- consultar el comite desde la lista y ficha del asociado
- filtrar asociados por comite y detectar asociados sin asignacion
- cambiar la asignacion sin perder la trazabilidad anterior

## 2. Decision de diseno recomendada

No se debe agregar un campo de texto libre `committee` ni una columna directa `committee_id` en `associates`.

La documentacion funcional existente ya define:

```txt
committees
associate_committees
```

Referencias:

- `.agent/docs/diccionario_de_tablas_sistema_de_asociados_v_2.md`
- `.agent/docs/Asociadosdiagramas.md`
- `.agent/docs/documento_analisis_funcional_sistema_asociados.md`

La implementacion recomendada es:

```txt
associates 1:N associate_committees N:1 committees
```

En el primer alcance, la UI expone un solo **comite principal vigente** por asociado. La tabla intermedia conserva historial y permite evolucionar a varios comites simultaneos sin migrar nuevamente la ficha principal.

### 2.1 Alineacion con el modelo documentado

Este hito conserva las entidades y la relacion N:M del diccionario. Introduce dos precisiones deliberadas:

- `is_primary` en `associate_committees`, para resolver el campo singular solicitado sin eliminar la capacidad N:M
- unicidad de un solo vinculo principal vigente por asociado, para que listas y fichas tengan un valor no ambiguo

`is_primary` no existe en el diccionario V2 y debe agregarse a ese documento cuando el hito sea implementado. El resto de campos debe conservar los nombres ya definidos para evitar dos modelos incompatibles.

El diagrama actual propone rutas de comites dentro de Almacenamiento y Configuracion. Este hito reemplaza esa navegacion inicial por `/comites` como modulo propio. Al implementarlo se deben actualizar `Asociadosdiagramas.md` y el resumen tecnico para reflejar la nueva frontera funcional.

## 3. Por que no usar `catalog_items`

`catalog_items` esta documentado para valores simples sin logica propia. Un comite es una entidad de negocio porque puede tener:

- codigo y descripcion propios
- estado activo/inactivo
- asociados vinculados
- fechas de incorporacion y salida
- reuniones y documentos en hitos posteriores
- permisos y auditoria propios

El item `COMITES` que ya existe en `DOCUMENT_CATEGORY` es una categoria documental. No representa un comite institucional y no debe reutilizarse como tal.

## 4. Estado actual detectado

### 4.1 Base de datos

La documentacion define las tablas, pero no existen migraciones que creen:

```txt
public.committees
public.associate_committees
```

Las tablas `storage_nodes` y `documents` ya contienen columnas `committee_id`, pero actualmente no tienen una entidad implementada a la cual referenciar ni una FK hacia `committees`.

### 4.2 Modulo de asociados

El flujo actual se concentra en:

```txt
src/services/associates.service.js
src/components/molecules/associates/AssociateForm.jsx
src/components/molecules/associates/AssociateFilters.jsx
src/components/molecules/associates/AssociateListItem.jsx
src/components/molecules/associates/AssociateInfoSection.jsx
src/hooks/useAssociates.js
```

El alta directa usa la RPC `create_direct_associate` y la conversion usa `convert_prospect_to_associate`. S16 debe conservar ambas firmas intactas y exponer `create_direct_associate_with_committee` y `convert_prospect_to_associate_with_committee`, que aceptan el comite inicial de manera opcional y delegan en las RPC existentes para mantener el alta y su asignacion atomicas.

## 5. Modelo de datos propuesto

### 5.1 Tabla `committees`

Campos minimos:

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `uuid` | PK |
| `code` | `varchar(50)` | opcional, unico cuando se informa |
| `name` | `varchar(180)` | obligatorio |
| `description` | `text` | opcional |
| `is_active` | `boolean` | `true` por defecto |
| `created_at`, `updated_at` | `timestamptz` | auditoria tecnica |
| `created_by`, `updated_by` | `uuid` | FK a `user_profiles` |
| `is_deleted`, `deleted_at`, `deleted_by` | varios | soft delete |

Reglas:

- normalizar `code`, cuando se informa, en mayusculas y sin espacios laterales
- convertir codigo vacio o compuesto solo por espacios a `null`
- aplicar `btrim` al nombre y rechazar nombres vacios
- no permitir dos codigos no eliminados iguales, ignorando mayusculas y minusculas
- no permitir dos nombres no eliminados iguales, ignorando mayusculas y minusculas
- no borrar fisicamente un comite con historial
- un comite inactivo no puede recibir nuevas asignaciones
- no permitir inactivar un comite mientras tenga asignaciones vigentes
- inactivar un comite nunca elimina sus vinculos historicos cerrados

### 5.2 Tabla `associate_committees`

Campos minimos:

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `uuid` | PK |
| `associate_id` | `uuid` | FK obligatoria a `associates` |
| `committee_id` | `uuid` | FK obligatoria a `committees` |
| `joined_at` | `date` | fecha de incorporacion, opcional |
| `left_at` | `date` | fecha de salida, opcional |
| `is_primary` | `boolean` | `true` para el comite visible en ficha/listado, `false` por defecto |
| `is_active` | `boolean` | estado vigente del vinculo, `true` por defecto |
| `notes` | `text` | opcional |
| campos de auditoria y soft delete | varios | mismo patron del proyecto |

Constraints e indices recomendados:

- indice por `associate_id`
- indice por `committee_id`
- indice unico parcial por `(associate_id, committee_id)` donde `is_active = true and is_deleted = false`
- indice unico parcial por `associate_id` donde `is_primary = true and is_active = true and is_deleted = false`
- `check (left_at is null or joined_at is null or left_at >= joined_at)`
- `check ((is_active = true and left_at is null) or (is_active = false and left_at is not null))`

No se debe imponer todavia que todo asociado tenga comite. Los registros existentes necesitan una etapa de regularizacion.

## 6. Regla funcional de asignacion

### 6.1 Alta o conversion

El campo `committee_id` es opcional durante la primera liberacion.

Si se informa:

1. validar que el comite exista, este activo y no este eliminado
2. crear el asociado
3. crear el vinculo activo y principal con `joined_at = p_association_date` en la misma transaccion
4. permitir que los triggers controlados registren la operacion en auditoria

Si falla la asignacion, debe fallar toda el alta o conversion.

### 6.2 Cambio de comite principal

El cambio debe ejecutarse mediante una RPC transaccional, por ejemplo:

```txt
set_associate_primary_committee(
  p_associate_id uuid,
  p_committee_id uuid,
  p_effective_date date,
  p_notes text default null
)
```

La RPC debe:

1. validar permiso de actualizacion sobre `asociados`
2. bloquear el asociado, el comite destino y las asignaciones vigentes durante la operacion
3. cerrar el comite principal anterior con `is_active = false` y `left_at = p_effective_date`
4. insertar un nuevo vinculo como principal, incluso si el asociado ya pertenecio antes al mismo comite
5. impedir asignar un comite inactivo
6. ser idempotente cuando el comite solicitado ya es el principal vigente
7. rechazar una fecha efectiva anterior a `joined_at` del vinculo que se cierra
8. rechazar una fecha efectiva futura, porque el nuevo vinculo queda activo inmediatamente

Un vinculo historico cerrado no debe reactivarse ni sobrescribirse. Cada reincorporacion crea un registro nuevo para conservar sus propias fechas y auditoria.

El bloqueo del comite destino debe coordinarse con la operacion de inactivacion. De esta forma no puede confirmarse una nueva asignacion mientras otra transaccion inactiva el mismo comite.

Para retirar una asignacion se recomienda otra RPC explicita, `clear_associate_primary_committee`, en vez de usar UUID nulo con semantica ambigua.

`clear_associate_primary_committee` debe aplicar el mismo permiso, bloqueo y validacion de fecha efectiva. Si no existe un comite principal vigente debe responder de forma idempotente sin crear historial artificial.

El modal debe iniciar `p_effective_date` con `todayDateOnly()` y permitir fechas anteriores validas, pero no fechas futuras.

### 6.3 Multiples comites

La estructura soporta varios comites, pero este hito solo administra uno como principal desde el formulario general.

Si el negocio confirma que un asociado puede participar simultaneamente en varios comites, una segunda interfaz puede administrar vinculos secundarios. No se requiere cambiar el modelo de datos.

## 7. Alcance funcional

### 7.1 Modulo de comites

Agregar un modulo operativo independiente con:

- listar comites
- crear y editar codigo, nombre y descripcion
- activar o inactivar
- buscar por codigo o nombre
- impedir eliminacion fisica
- abrir la ficha de un comite
- mostrar en la ficha los asociados vinculados actualmente

Rutas iniciales:

```txt
/comites
/comites/:id
```

La ficha del comite es de consulta en este hito. La asignacion inicial se realiza durante alta o conversion; los cambios posteriores se realizan desde una accion independiente en la ficha del asociado. No se habilita escritura de vinculos desde la ficha del comite.

El modulo puede reutilizar componentes visuales existentes, pero debe tener paginas, servicio, permisos y navegacion propios. No debe depender de `SettingsPage` ni de `catalog_items`.

### 7.2 Alta, conversion y ficha del asociado

Agregar el selector `Comite principal` en Datos de la empresa durante el alta directa y en el modal de conversion.

Comportamiento:

- mostrar solo comites activos al crear o asignar
- permitir `Sin comite` durante la regularizacion inicial
- enviar `committee_id` solo a `create_direct_associate_with_committee` o `convert_prospect_to_associate_with_committee`, nunca como columna de `associates`
- manejar `joined_at`, `left_at` y la fecha efectiva con `src/utils/dateOnly.js`

Para asociados existentes, agregar en la ficha una accion `Asignar comite`, `Cambiar comite` o `Retirar comite`, segun el estado actual. Esta accion abre un modal independiente que solicita comite, fecha efectiva y observacion, y llama exclusivamente a la RPC correspondiente.

El comite principal debe mostrarse de forma permanente en el encabezado de la ficha del asociado, debajo de sus datos de identidad. Si no existe asignacion, el encabezado debe mostrar `Sin comite asignado` y la accion `Asignar comite` para usuarios con permiso. No debe quedar oculto dentro de la pestaña Informacion ni duplicarse en Informacion interna.

El cambio de comite no debe formar parte del submit general de `AssociateEditPage`. Esto evita que una actualizacion de datos generales quede confirmada mientras la asignacion falla, o viceversa.

### 7.3 Lista y ficha

Agregar:

- comite principal en `AssociateListItem`
- comite principal en `AssociateInfoSection`
- filtro por comite en `AssociateFilters`
- opcion explicita `Sin comite`

El filtro debe operar en base de datos. No se debe cargar toda la lista para filtrar en memoria.

Para evitar una anti-union fragil desde PostgREST y conservar el `ASSOCIATE_SELECT` actual, crear la RPC:

```txt
filter_associate_ids_by_committee(
  p_committee_id uuid default null,
  p_without_committee boolean default false
)
```

La RPC devuelve una tabla de `associate_id uuid`. `p_committee_id` y `p_without_committee` son excluyentes. Debe considerar solo el vinculo que cumpla `is_primary = true`, `is_active = true` e `is_deleted = false` y asociados no eliminados.

`associatesService.getAll` debe:

1. omitir la RPC cuando no hay filtro de comite
2. obtener IDs cuando se filtra por comite o por `Sin comite`
3. retornar `[]` inmediatamente si no hay IDs
4. aplicar `.in('id', ids)` junto con los filtros actuales de busqueda, estado y categoria
5. conservar `ASSOCIATE_SELECT` y `attachComputedPaymentHealth`

El filtrado sigue ocurriendo en base de datos y no cambia el contrato existente del listado.

`useAssociates` debe agregar `committeeId` y `withoutCommittee` a sus filtros. `AssociateFilters` debe mantenerlos mutuamente excluyentes y `handleClearFilters` debe limpiar ambos, ademas de busqueda, estado y categoria.

## 8. Alcance tecnico

### 8.1 Migracion

Crear una migracion idempotente:

```txt
supabase/migrations/YYYYMMDDHHMMSS_s16_associate_committees.sql
```

Para garantizar la reejecucion determinista, se permite `drop trigger if exists` y `drop policy if exists` exclusivamente sobre triggers y policies creados por S16 antes de recrearlos. No se deben eliminar tablas, datos ni RPC operativas de hitos anteriores.

Debe incluir:

- tablas `committees` y `associate_committees`
- constraints e indices parciales
- FKs e indices de `storage_nodes.committee_id` y `documents.committee_id` hacia `committees.id`
- triggers `updated_at`
- triggers de auditoria para ambas tablas
- RLS y policies
- RPCs transaccionales de asignacion y retiro
- consulta SQL/RPC de listado con filtros por comite y sin comite
- nuevas RPC `create_direct_associate_with_committee` y `convert_prospect_to_associate_with_committee` con `p_committee_id uuid default null`, sin reemplazar las firmas operativas existentes
- alta del modulo `comites`, sus permisos y la matriz de roles inicial
- actualizacion de `supabase/maintenance/reset_operational_data_keep_admin.sql` para eliminar primero `associate_committees` y conservar el catalogo `committees`

No agregar una FK desde `associates` hacia `committees`.

Agregar las FKs documentales no habilita todavia la UI por comite ni crea `committee_meetings`; solo completa la integridad referencial ya prevista por el esquema V2.

Antes de crear esas FKs, la migracion debe comprobar si existen valores no nulos en `storage_nodes.committee_id` o `documents.committee_id`. Si algun UUID no existe en `committees`, debe fallar con un mensaje explicito; no debe borrar ni convertir esos valores silenciosamente. Las FKs deben usar `on delete restrict`.

Las RPC existentes `create_direct_associate` y `convert_prospect_to_associate` deben conservar su nombre, firma y permisos para no interrumpir clientes actuales. Las nuevas RPC S16 usan nombres distintos, delegan en las originales dentro de la misma transaccion y restringen su propio `EXECUTE` a `authenticated`; de esta forma no existen overloads ambiguos ni renombres destructivos.

### 8.2 Permisos y RLS

Crear el modulo de permisos:

```txt
code: comites
name: Comites
actions: read, create, update, delete, admin
```

Matriz inicial recomendada:

- `ADMIN`: acceso total
- `FIDELIZACION`: `read`, `create` y `update`
- `CAPTACION`: sin acceso; actualmente no posee `asociados.create` y no puede ejecutar la conversion
- `ALTA_DIRECCION`: sin acceso; su alcance vigente se limita a Reportes y Auditoria
- `FACTURACION`: sin acceso

Esta matriz conserva los limites definidos en S13. Si negocio amplia responsabilidades, el cambio debe actualizar en conjunto la matriz SQL, `src/utils/permissions.js` y `.agent/docs/hito_s13_roles_permisos_operativos.md`.

Politicas recomendadas:

- lectura de `committees`: permiso `read` de `comites`
- creacion y actualizacion de `committees`: permisos equivalentes de `comites`
- eliminacion fisica de `committees`: sin policy; la operacion normal usa inactivacion
- lectura de `associate_committees`: permiso de lectura de `asociados` o `comites`
- escritura de `associate_committees`: solo mediante RPC controlada con permiso de actualizacion de `asociados`

El selector no debe depender de desactivar RLS ni usar la `service_role` en frontend.

Todas las RPCs de escritura deben:

- ser `security definer` con `set search_path = public`
- obtener el usuario mediante `current_user_profile_id()`
- no aceptar `created_by`, `updated_by` ni actor de auditoria desde el cliente
- ejecutar `revoke all ... from public, anon` y otorgar solo `execute` a `authenticated`

Permisos especificos:

- `set_associate_primary_committee` y `clear_associate_primary_committee`: `asociados.update`
- `set_committee_active_status`: `comites.update`
- soft delete administrativo de comite, si se implementa: `comites.admin`
- `create_direct_associate_with_committee` y `convert_prospect_to_associate_with_committee`: delegar en las RPC originales y conservar las validaciones actuales de S9

No se deben crear policies directas de `insert`, `update` o `delete` para `associate_committees`. La lectura si debe tener una policy explicita.

La activacion o inactivacion debe pasar por `set_committee_active_status(p_committee_id uuid, p_is_active boolean)`. La operacion debe bloquear la fila del comite y quedar protegida tambien por un trigger `before update` que rechace la inactivacion si existen asignaciones vigentes. El soft delete queda reservado para `comites.admin`, debe validarse en base de datos y tampoco puede dejar referencias vigentes. Un vinculo eliminado logicamente debe cerrarse con `is_active = false` y `left_at` informado. Los campos `created_by` y `updated_by` deben establecerse en base de datos con `current_user_profile_id()` y no confiar en valores enviados por el formulario.

`filter_associate_ids_by_committee` debe ser `security invoker`, validar `has_module_permission('asociados', 'read')`, revocar ejecucion a `public` y `anon`, y otorgarla solo a `authenticated`.

### 8.3 Frontend

Archivos nuevos sugeridos:

```txt
src/services/committees.service.js
src/hooks/useCommittees.js
src/hooks/useCommitteeDetail.js
src/components/molecules/CommitteeSelect.jsx
src/components/molecules/committees/CommitteeForm.jsx
src/components/molecules/committees/CommitteeListItem.jsx
src/pages/committees/CommitteesPage.jsx
src/pages/committees/CommitteeDetailPage.jsx
src/types/committees.ts
```

Archivos a revisar:

```txt
src/services/associates.service.js
src/components/molecules/associates/AssociateForm.jsx
src/components/molecules/associates/AssociateFilters.jsx
src/components/molecules/associates/AssociateListItem.jsx
src/components/molecules/associates/AssociateInfoSection.jsx
src/components/molecules/associates/AssociateCommitteeModal.jsx
src/components/molecules/associates/ConvertProspectModal.jsx
src/hooks/useAssociates.js
src/hooks/useAssociateCommitteeActions.js
src/hooks/useAssociateDetail.js
src/hooks/useProspectDetailActions.js
src/pages/associates/AssociateCreatePage.jsx
src/pages/associates/AssociateDetailPage.jsx
src/pages/associates/AssociateEditPage.jsx
src/pages/associates/AssociatesPage.jsx
src/router/routes.js
src/router/AppRouter.jsx
src/layouts/Sidebar.jsx
src/utils/constants.js
src/utils/permissions.js
src/utils/associateValidation.js
src/types/associates.ts
```

Agregar las constantes de ruta:

```txt
COMITES: /comites
COMITES_DETALLE: /comites/:id
```

Las paginas deben quedar bajo `PermissionGuard module="comites"` y el modulo debe aparecer en `Sidebar` solo cuando el usuario tenga lectura. Las acciones de crear y editar deben respetar `usePermissions`, sin depender unicamente de ocultar controles en frontend.

Se debe agregar `MODULES.COMITES`, actualizar `PERMISSIONS` y agregar el item correspondiente a `NAVIGATION_ITEMS`. La matriz frontend y la matriz persistida en `role_permissions` deben quedar iguales.

Los siguientes componentes que deben tocarse ya superan el limite interno de 120 lineas:

```txt
src/components/molecules/associates/AssociateForm.jsx
src/components/molecules/associates/AssociateInfoSection.jsx
src/components/molecules/associates/ConvertProspectModal.jsx
src/pages/associates/AssociateDetailPage.jsx
src/pages/associates/sections/AssociateDetailTabs.jsx
src/router/AppRouter.jsx
```

Este hito debe descomponerlos antes o durante la integracion. Extraer secciones del formulario, tabs, acciones de personas/contactos/documentos y grupos de rutas segun responsabilidad. Ningun componente nuevo o modificado debe terminar con mas de 120 lineas. No duplicar estado ni reglas de negocio entre los componentes extraidos.

El servicio debe exponer `primary_committee` como objeto o `null` para lista y detalle. Si Supabase devuelve la relacion vigente como arreglo por tratarse de una relacion 1:N, el mapeo a un unico objeto debe centralizarse en `associates.service.js` y no repetirse en componentes.

### 8.4 Documentacion

Al implementar el hito se deben actualizar:

```txt
.agent/docs/diccionario_de_tablas_sistema_de_asociados_v_2.md
.agent/docs/Asociadosdiagramas.md
.agent/docs/resumen_tecnico_diseno_de_la_aplicacion_sistema_de_asociados.md
.agent/docs/hito_s13_roles_permisos_operativos.md
```

Los cambios documentales deben incluir `is_primary`, las rutas `/comites`, la frontera del modulo y la matriz definitiva de permisos.

## 9. Migracion de datos existentes

Plan recomendado:

1. desplegar tablas, RLS, RPCs y UI con comite opcional
2. crear los comites reales desde el modulo Comites
3. obtener el listado de asociados `Sin comite`
4. asignarlos manualmente o mediante una carga controlada y auditada
5. validar que no existan duplicados ni mas de un principal vigente
6. decidir con negocio si la asignacion sera obligatoria para nuevas altas

No crear un comite ficticio `SIN_COMITE`. La ausencia de asignacion debe representarse por ausencia de vinculo vigente.

No se debe ejecutar un backfill por coincidencia aproximada de textos. Toda carga masiva debe usar IDs de comite verificados, ejecutarse en una transaccion y dejar una validacion posterior.

## 10. Fuera de alcance

Este hito no incluye:

- reuniones de comite
- asistentes o invitados a reuniones
- documentos por comite
- estructura de carpetas por comite
- resumen de reuniones con IA
- responsables internos del comite
- cargos de personas dentro del comite
- administracion de multiples comites secundarios desde UI
- cambios en reportes, indicadores o exportaciones
- cambios en `report_associates_summary`

Estas capacidades pueden construirse posteriormente sobre las mismas tablas.

## 11. Criterios de aceptacion

El hito se considera cerrado cuando:

- existe administracion de comites activos e inactivos
- no se usan textos libres para representar comites
- un asociado puede quedar sin asignacion durante la regularizacion
- un asociado tiene como maximo un comite principal vigente
- alta directa y conversion guardan asociado y comite atomica y opcionalmente
- cambiar de comite conserva el historial anterior
- cambiar o retirar comite es una accion independiente de la edicion general del asociado
- no se puede asignar un comite inactivo
- no se puede inactivar un comite con asociados vigentes
- lista, ficha y filtro de asociados muestran el comite principal
- el modulo Comites muestra la ficha y asociados vigentes de cada comite
- el filtro `Sin comite` funciona desde la consulta a Supabase
- RLS impide escrituras no autorizadas
- los cambios quedan registrados en `audit_logs`
- `yarn lint` pasa sin errores
- `yarn build` pasa sin errores

## 12. Auditoria SQL requerida

Crear:

```txt
supabase/audits/hito_s16_associate_committees_audit.sql
```

Debe validar como minimo:

- existencia de tablas, FKs, checks e indices
- FKs desde `storage_nodes` y `documents` hacia `committees`
- RLS habilitado en ambas tablas
- modulo `comites`, permisos y matriz de roles creados
- matriz frontend y `role_permissions` sin diferencias
- policies coherentes con `comites` y `asociados`
- ausencia de codigos duplicados de comite no eliminados
- ausencia de codigos o nombres vacios despues de normalizacion
- ausencia de vinculos activos duplicados
- maximo un comite principal vigente por asociado
- ausencia de asignaciones vigentes a comites inactivos o eliminados
- coherencia entre `joined_at`, `left_at` e `is_active`
- triggers de auditoria instalados
- firmas operativas originales preservadas y permisos `EXECUTE` de las nuevas RPC restringidos
- consulta operativa sin filas duplicadas por asociado

## 13. Casos de prueba obligatorios

1. Crear un comite y usarlo en el selector.
2. Intentar crear otro comite con el mismo codigo.
3. Intentar crear otro comite con el mismo nombre variando mayusculas o espacios.
4. Guardar codigo vacio y comprobar que se persiste como `null`.
5. Crear asociado sin comite durante la etapa de regularizacion.
6. Crear asociado con comite y validar atomicidad.
7. Convertir prospecto con comite y validar atomicidad.
8. Asignar comite a un asociado existente.
9. Cambiar de comite y comprobar el cierre del vinculo anterior.
10. Volver a un comite anterior y comprobar que se crea un nuevo historial.
11. Repetir la misma asignacion y comprobar idempotencia.
12. Retirar la asignacion y encontrar al asociado con el filtro `Sin comite`.
13. Intentar asignar un comite inactivo.
14. Intentar inactivar un comite con asociados vigentes.
15. Inactivar un comite sin asociados vigentes y conservar su historial cerrado.
16. Probar lectura y escritura con roles sin permisos suficientes.
17. Comprobar que las firmas originales siguen operativas e intentar ejecutar las nuevas RPC sin autenticacion.
18. Abrir la ficha de un comite y validar sus asociados vigentes.
19. Validar que el modulo no sea visible ni accesible sin `comites.read`.
20. Combinar comite con busqueda, estado y categoria sin duplicar asociados.
21. Validar que un resultado vacio del filtro no dispare una consulta sin restriccion.
22. Intentar guardar una fecha efectiva anterior al ingreso vigente.
23. Intentar guardar una fecha efectiva futura.
24. Validar que un fallo al cambiar comite no modifique los datos generales del asociado.
25. Validar las FKs documentales con un `committee_id` inexistente.
26. Simular asignacion e inactivacion concurrentes y comprobar que solo una operacion confirma.

## 14. Decision funcional pendiente

Antes de volver obligatorio el campo se debe confirmar con negocio:

```txt
¿Un asociado pertenece a un solo comite vigente o puede participar en varios al mismo tiempo?
```

Recomendacion inicial:

- permitir varios vinculos a nivel de modelo
- mostrar y filtrar por un unico comite principal
- mantener el campo opcional mientras se regularizan los asociados existentes
- habilitar gestion de comites secundarios solo cuando exista un caso operativo confirmado

Esta decision no bloquea S16. El comportamiento cerrado para este hito es: cero o un comite principal vigente por asociado; no existe UI para vinculos secundarios.

## 15. Reglas de fechas

`joined_at`, `left_at` y `p_effective_date` son fechas calendario de negocio. Deben usar columnas `date`, valores `YYYY-MM-DD` y las utilidades de `src/utils/dateOnly.js`.

Las RPCs deben validar la fecha actual con `(now() at time zone 'America/Lima')::date`; la validacion del frontend no reemplaza la validacion en base de datos.

Esta prohibido calcularlas o mostrarlas con:

```txt
new Date('YYYY-MM-DD')
toISOString()
```

Los campos tecnicos `created_at`, `updated_at`, `deleted_at` y los eventos de auditoria siguen siendo `timestamptz`.

## 16. Orden recomendado de implementacion

1. Crear migracion de tablas, constraints, indices, FKs documentales y triggers base.
2. Crear modulo `comites`, permisos, matriz de roles y RLS.
3. Crear RPCs de asignacion, retiro, inactivacion y filtro, con grants restringidos.
4. Crear auditoria SQL S16 y validar la migracion antes de desarrollar UI.
5. Descomponer los componentes afectados que superan 120 lineas.
6. Crear tipos, servicio, hooks, listado y ficha del modulo Comites.
7. Integrar comite opcional en alta directa y conversion.
8. Integrar la accion independiente de asignar, cambiar o retirar en la ficha del asociado.
9. Integrar comite principal en lista, ficha y filtros de asociados.
10. Actualizar documentacion tecnica.
11. Ejecutar casos de prueba, auditoria SQL, `yarn lint` y `yarn build`.

## 17. Definition of Done

El hito termina con migracion, auditoria SQL, servicios, modulo Comites, integracion con asociados, permisos, documentacion tecnica actualizada y pruebas. No queda cerrado si solo se agrega un selector visual o una columna aislada en `associates`.

El mantenimiento de limpieza operativa tambien debe seguir funcionando: debe eliminar los vinculos de `associate_committees` antes de borrar asociados y no debe eliminar los comites institucionales configurados.
