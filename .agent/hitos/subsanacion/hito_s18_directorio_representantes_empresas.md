# Hito S18: Representantes en el directorio de contactos de empresas

## 1. Objetivo del hito

Ampliar el modulo operativo `Contactos` para que, ademas de los contactos por area,
incluya a las personas registradas como:

- representante legal
- representante ante la Camara

La pantalla debe permitir filtrar el directorio por tipo de contacto y exportar a
Excel exactamente el resultado visible.

## 2. Hitos que mejora

Este hito evoluciona:

- **Hito 5**, que registra personas vinculadas y contactos por area en la ficha del asociado
- **Hito S17**, que creo el directorio global `/contactos-empresas`

S18 no crea un tercer registro de contacto. Integra en una misma consulta las dos
fuentes de verdad que ya existen.

## 3. Estado actual detectado

### 3.1 Contactos por area

La tabla `associate_area_contacts` contiene:

- nombre
- area
- cargo
- correo
- telefono
- indicador principal
- observaciones

Estos registros ya aparecen en el modulo `Contactos`.

### 3.2 Representantes

La tabla `associate_people` contiene personas vinculadas con:

- rol de persona
- nombre
- cargo
- correo
- DNI
- telefono
- onomastico
- indicador principal
- observaciones

El catalogo `PERSON_ROLE` ya contiene los codigos:

```txt
REPRESENTANTE_LEGAL
REPRESENTANTE_ANTE_CAMARA
```

Los representantes se registran y mantienen en la pestana `Personas` de la ficha
del asociado, pero actualmente no aparecen en el directorio global.

### 3.3 Directorio actual

El servicio `src/services/companyContacts.service.js` consulta solamente
`associate_area_contacts`. El hook y los filtros trabajan con una unica estructura
de contacto y no distinguen el origen del registro.

## 4. Decision de modelo

Mantener las fuentes actuales:

```txt
associate_area_contacts -> contactos por area
associate_people        -> representantes
```

No se debe copiar un representante a `associate_area_contacts`. Duplicarlo haria
posible que nombre, correo o telefono queden diferentes entre la ficha y el
directorio.

El servicio del directorio debe normalizar ambas fuentes a un modelo de lectura
comun. Cada resultado debe conservar al menos:

```txt
id
source
contact_type
full_name
position
email
phone
is_primary
notes
area
person_role
dni
birthday
associate
```

Valores de `source`:

```txt
AREA_CONTACT
ASSOCIATE_PERSON
```

Valores funcionales de `contact_type`:

```txt
AREA_CONTACT
REPRESENTANTE_LEGAL
REPRESENTANTE_ANTE_CAMARA
```

## 5. Alcance funcional

### 5.1 Registros incluidos

El directorio debe incluir:

- todos los contactos por area no eliminados
- personas no eliminadas con rol `REPRESENTANTE_LEGAL`
- personas no eliminadas con rol `REPRESENTANTE_ANTE_CAMARA`
- solo registros de asociados no eliminados

No debe incluir otros roles de `associate_people`, como gerente general, asistente
de gerencia o contacto principal.

Un representante agregado o editado en la ficha del asociado debe reflejarse en
el directorio en la siguiente carga, sin crear una copia adicional.

### 5.2 Filtro por tipo de contacto

Agregar un selector visible llamado `Tipo de contacto` con estas opciones:

```txt
Todos
Contacto por area
Representante legal
Representante ante la Camara
```

Reglas:

- `Todos` muestra contactos por area y ambos tipos de representante
- `Contacto por area` muestra solo registros de `associate_area_contacts`
- cada opcion de representante filtra por el codigo estable del rol, no por su etiqueta
- el filtro se combina con busqueda, estado, categoria y solo principales

### 5.3 Relacion con el filtro de area

El area solo existe para contactos por area. Para evitar combinaciones ambiguas:

- al seleccionar un representante, limpiar y deshabilitar el filtro `Area`
- al seleccionar `Todos` o `Contacto por area`, habilitar el filtro `Area`
- si se elige un area con `Todos`, el resultado contiene solo contactos por area de esa area
- limpiar filtros restablece `Tipo de contacto = Todos` y `Area = Todas`

### 5.4 Datos visibles

Cada fila debe identificar el tipo con un texto o badge sobrio:

- `Contacto por area` y nombre del area
- `Representante legal`
- `Representante ante la Camara`

Se mantienen los datos actuales del asociado. Para representantes tambien se
puede mostrar DNI y onomastico cuando existan. La razon social sigue navegando a:

```txt
/asociados/:id
```

### 5.5 Exportacion Excel

La exportacion debe respetar todos los filtros activos e incluir una fila por cada
registro visible.

Agregar estas columnas al archivo del directorio:

- Tipo de contacto
- Area
- Contacto
- Cargo
- Email
- Telefono
- DNI
- Onomastico
- Principal
- Asociado
- Codigo asociado
- RUC
- Estado asociado
- Categoria
- Comite principal
- Observaciones

`Area`, `DNI` y `Onomastico` pueden quedar vacios cuando no correspondan al tipo.
El onomastico es una fecha calendario y debe formatearse con `dateOnly.js`.

La descarga debe seguir usando `exportToExcel`; por tanto, debe quedar registrada
antes de generarse mediante la auditoria centralizada `excel_exports` /
`export_excel`. Si la auditoria falla, la descarga se bloquea.

## 6. Alcance tecnico

### 6.1 Servicio

Modificar `src/services/companyContacts.service.js` para:

1. consultar contactos por area activos
2. consultar en paralelo personas activas con los dos codigos de rol permitidos
3. excluir asociados eliminados en ambas consultas
4. mapear ambas respuestas al modelo normalizado
5. ordenar el resultado final por nombre del contacto
6. fallar la carga completa si una de las dos consultas falla

La consulta de representantes debe traer `person_role` y los mismos datos del
asociado que ya consume el directorio, incluido su comite principal.

No se debe consultar todos los roles y descartarlos solo en frontend. El servicio
debe limitar la consulta a los dos codigos requeridos.

### 6.2 Filtros y transformaciones

Modificar `src/utils/companyContactUtils.js` para:

- declarar constantes de tipo y origen
- agregar `contactType` a los filtros iniciales
- filtrar por tipo usando codigos estables
- aplicar area solo a registros que tienen `area_id`
- incluir rol y DNI en la busqueda textual
- mapear el nuevo modelo a las columnas de Excel

La logica debe permanecer en funciones puras y no duplicarse en los componentes.

### 6.3 Hook y componentes

Modificar:

```txt
src/hooks/useCompanyContacts.js
src/components/molecules/contacts/CompanyContactFilters.jsx
src/components/molecules/contacts/CompanyContactListItem.jsx
src/pages/contacts/CompanyContactsPage.jsx
```

El hook debe manejar el cambio de tipo y limpiar `areaId` al elegir un
representante. Los componentes nuevos o modificados no deben superar 120 lineas;
si la fila crece, se deben extraer sus bloques de presentacion.

### 6.4 Exportacion

Modificar `EXPORT_COLUMNS.companyContacts` en `src/utils/exportUtils.js` para
incorporar tipo, DNI y onomastico sin crear una segunda funcion de exportacion.

## 7. Base de datos y migraciones

No se requiere una nueva tabla ni una migracion de datos.

Ya existen:

- `associate_people.person_role_id`
- indice `idx_associate_people_role`
- indice parcial de personas no eliminadas
- roles requeridos en el catalogo `PERSON_ROLE`
- RLS del modulo `asociados` para ambas tablas

Antes de implementar se debe confirmar en el ambiente desplegado que la migracion
`20260608090000_add_person_role_representante_ante_camara.sql` fue aplicada.

No se requieren `drop`, reemplazo de tablas, vista SQL ni RPC para este alcance.
Solo se considerara un indice adicional si una medicion con volumen real demuestra
un problema de rendimiento.

## 8. Seguridad y permisos

La ruta permanece protegida por `asociados:read`.

- no se crea un modulo de permisos nuevo
- el frontend no debe intentar evadir RLS
- el directorio sigue siendo de consulta y exportacion
- altas, ediciones y bajas permanecen en la ficha del asociado

## 9. Fuera de alcance

- crear o editar representantes desde el directorio global
- copiar representantes a contactos por area
- incluir todos los roles de persona vinculada
- permitir multiples roles en una sola fila de `associate_people`
- fusionar automaticamente registros que tengan el mismo nombre o correo
- cambiar el formulario de personas vinculadas
- crear una tabla, vista o RPC unificada sin necesidad demostrada
- omitir la auditoria de Excel

## 10. Archivos probables

```txt
src/services/companyContacts.service.js
src/hooks/useCompanyContacts.js
src/utils/companyContactUtils.js
src/utils/exportUtils.js
src/components/molecules/contacts/CompanyContactFilters.jsx
src/components/molecules/contacts/CompanyContactListItem.jsx
src/pages/contacts/CompanyContactsPage.jsx
.agent/docs/hito_s18_implementation_summary.md
```

No se prevén cambios de rutas, sidebar ni base de datos.

## 11. Criterios de aceptacion

El hito queda cerrado cuando:

- el directorio muestra contactos por area y los dos tipos de representante
- representantes agregados en la ficha aparecen sin duplicar su registro
- el filtro `Tipo de contacto` ofrece exactamente las cuatro opciones definidas
- cada opcion devuelve solamente el tipo esperado
- al elegir un representante, el filtro de area se limpia y deshabilita
- busqueda, tipo, estado, categoria y principal se pueden combinar
- las filas identifican claramente si son contacto por area o representante
- el Excel contiene solo el resultado filtrado y todas las columnas definidas
- el onomastico no cambia de dia por zona horaria
- la exportacion queda registrada en auditoria
- usuarios sin `asociados:read` no pueden consultar ninguna de las dos fuentes
- `yarn lint` pasa
- `yarn build` pasa
- `git diff --check` pasa

## 12. Validacion manual recomendada

1. Registrar un representante legal en la pestana `Personas` de un asociado.
2. Registrar un representante ante la Camara en otro asociado.
3. Abrir `/contactos-empresas` y confirmar que ambos aparecen.
4. Filtrar por `Representante legal` y verificar que no aparecen otros tipos.
5. Filtrar por `Representante ante la Camara` y repetir la validacion.
6. Confirmar que el filtro `Area` queda limpio y deshabilitado para representantes.
7. Volver a `Todos`, seleccionar un area y verificar que solo aparecen contactos de esa area.
8. Combinar tipo con busqueda, estado, categoria y solo principales.
9. Exportar cada resultado y comparar filas y columnas con la pantalla.
10. Verificar DNI y onomastico de representantes en el Excel.
11. Verificar el evento `excel_exports` / `export_excel` en Auditoria.
12. Probar la ruta con un usuario sin permiso `asociados:read`.

## 13. Decision recomendada

Implementar S18 como una ampliacion del directorio existente mediante normalizacion
en el servicio. Los representantes deben seguir administrandose como personas
vinculadas y aparecer automaticamente en `Contactos`.

Esta solucion respeta el modelo actual, evita duplicidad y permite agregar nuevos
tipos al directorio en el futuro sin alterar la captura de contactos por area.
