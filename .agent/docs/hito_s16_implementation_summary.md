# Hito S16 - Resumen de implementacion

Fecha: 2026-06-22

## Estado

Implementado en codigo y migraciones. La migracion fue aplicada manualmente al proyecto Supabase el 2026-06-22.

## Base de datos

Se creo:

```txt
supabase/migrations/20260622090000_s16_associate_committees.sql
```

Incluye:

- tablas `committees` y `associate_committees`
- indices unicos para codigo, nombre, vinculo vigente y comite principal
- FKs documentales hacia `committees`
- modulo y permisos `comites`
- RLS para lectura y administracion
- triggers de normalizacion, auditoria e inactivacion segura
- RPCs de asignacion, retiro, estado y filtro
- RPCs atomicas `create_direct_associate_with_committee` y `convert_prospect_to_associate_with_committee`, sin renombrar ni eliminar las operaciones originales de S9
- triggers y policies S16 recreables mediante `DROP IF EXISTS` limitado a esos objetos; no se eliminan tablas, datos ni RPC previas
- privilegios por columna para impedir cambios directos de estado y soft delete fuera de las RPC
- checks y trigger de integridad para cierre, actor, fechas y concurrencia de asignaciones
- mantenimiento operativo actualizado para limpiar asignaciones antes de eliminar asociados, conservando el catalogo de comites
- wrappers atomicos para alta directa y conversion
- permisos `ADMIN` y `FIDELIZACION`

Auditoria creada:

```txt
supabase/audits/hito_s16_associate_committees_audit.sql
```

## Modulo Comites

Rutas:

```txt
/comites
/comites/:id
```

Funcionalidades:

- listado y busqueda de comites
- alta y edicion
- activacion e inactivacion
- ficha con asociados vigentes
- proteccion por permiso `comites`

## Integracion con asociados

- selector opcional en alta directa
- selector opcional en conversion de prospecto
- alta y conversion atomicas con el vinculo inicial
- accion independiente para asignar, cambiar o retirar comite
- comite principal visible permanentemente en el encabezado de la ficha, con asignacion inmediata cuando falta
- comite principal visible en lista y ficha
- filtros por comite y `Sin comite`
- historial conservado en `associate_committees`

## Estructura frontend

Se dividieron los componentes grandes afectados por el hito:

- formulario de asociado por secciones
- informacion del asociado por bloques
- tabs de ficha en componentes independientes
- acciones operativas en hooks
- rutas agrupadas por dominio

Los componentes modificados quedan por debajo de 120 lineas.

## Documentacion actualizada

- diccionario de tablas
- diagramas y rutas
- resumen tecnico
- matriz de roles S13
- mapa de hitos S

## Validaciones ejecutadas

```txt
yarn lint
yarn build
```

Ambos comandos pasan correctamente.

Tambien se verifico en navegador:

- carga de la aplicacion sin errores de consola
- proteccion de `/comites` para usuarios no autenticados
- redireccion correcta a `/login`

## Validacion remota

Se recibio evidencia de resultados conformes para tablas, FKs documentales y de asignacion, checks, indices, RLS, policies, matriz de permisos y ausencia de permisos extra en roles operativos.

Queda por confirmar la salida del resto de controles incluidos en:

```txt
supabase/audits/hito_s16_associate_committees_audit.sql
```

No se modificaron reportes ni exportaciones.
