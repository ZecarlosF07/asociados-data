# Hito S8: Mejora post-release del Hito 4 - Prospectos en lista y filtros operativos

## 1. Objetivo del hito

Mejorar la experiencia operativa del módulo de prospectos para que el usuario pueda consultar prospectos en una vista tipo lista, aplicar filtros reales de gestión y filtrar por captador. La pantalla debe facilitar lectura, seguimiento y búsqueda diaria sin depender de una grilla de tarjetas en filas y columnas.

Este hito se considera una mejora funcional post-release del **Hito 4: Módulo de prospectos**, porque fortalece el listado y consulta operativa ya implementados sin cambiar el modelo principal del módulo.

## 2. Hito original que mejora

Este hito mejora el comportamiento del **Hito 4: Módulo de prospectos**.

El Hito 4 exige:

- desarrollar listado general de prospectos
- permitir visualizar información resumida por registro
- implementar búsqueda básica
- implementar filtros por estado, categoría, responsable u otros criterios relevantes
- permitir acceso al detalle completo del prospecto

La brecha detectada es que la vista actual muestra prospectos en tarjetas distribuidas en columnas y los filtros disponibles no cubren todavía todos los criterios operativos esperados, especialmente el filtro por captador.

## 3. Estado actual detectado

### 3.1 Pantalla de prospectos

Archivo:

```txt
src/pages/prospects/ProspectsPage.jsx
```

La pantalla actual:

- carga prospectos con `useProspects`
- muestra `ProspectFilters`
- renderiza `ProspectCard`
- organiza los resultados con una grilla:

```txt
grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
```

Esto genera una visualización en filas y columnas, menos cómoda para revisión operativa cuando la lista crece.

### 3.2 Filtros actuales

Archivo:

```txt
src/components/molecules/prospects/ProspectFilters.jsx
```

Filtros visibles:

- búsqueda
- estado

El hook `useProspects` ya mantiene `categoryId`, pero el filtro de categoría no está expuesto en la UI.

### 3.3 Servicio actual

Archivo:

```txt
src/services/prospects.service.js
```

`getAll(...)` soporta:

- `search`
- `statusId`
- `categoryId`

No soporta todavía:

- `captadorId`

La consulta ya incluye:

```txt
captador:captador_id(id, full_name, is_internal, email, phone)
```

por lo tanto no se requiere cambiar el `select` base para mostrar captador.

### 3.4 Componentes reutilizables existentes

Ya existe:

```txt
src/components/molecules/CaptadorSelect.jsx
```

Puede reutilizarse para filtrar por captador sin crear un selector nuevo.

## 4. Alcance funcional

### 4.1 Vista de prospectos en lista

La pantalla de prospectos debe mostrar los resultados en una lista vertical, no en una grilla de cards en columnas.

La lista debe:

- mostrar un prospecto por fila visual o bloque horizontal
- mantener lectura rápida de razón social, RUC, estado, categoría, captador y contacto
- permitir hacer clic en el registro para abrir el detalle
- conservar estados de carga, vacío y error
- funcionar correctamente en desktop y mobile

No debe convertirse en una tabla densa tipo `DataTable` si eso contradice la experiencia solicitada de lista. La intención es una lista operativa escaneable, no una tabla tradicional de filas y columnas.

### 4.2 Filtros operativos

La pantalla debe permitir filtrar por:

- búsqueda textual
- estado de prospecto
- categoría
- captador

La búsqueda textual debe mantener el comportamiento actual:

- razón social
- nombre comercial
- RUC
- contacto

El filtro por captador debe consultar `prospects.captador_id`.

### 4.3 Limpieza y estado de filtros

La UI debe permitir:

- limpiar todos los filtros activos
- identificar visualmente que hay filtros aplicados
- mostrar estado vacío cuando no existan resultados para los filtros actuales

La limpieza debe resetear:

- `search`
- `statusId`
- `categoryId`
- `captadorId`

### 4.4 Persistencia y navegación

El usuario debe poder:

- abrir el detalle del prospecto desde la lista
- volver al listado sin perder una experiencia inconsistente

Opcionalmente, si se decide persistir filtros en query params, debe hacerse de forma simple y consistente. No es obligatorio para cerrar este hito.

## 5. Alcance técnico

### 5.1 Hook de prospectos

Actualizar:

```txt
src/hooks/useProspects.js
```

Debe agregar `captadorId` al estado de filtros:

```js
{
  search: '',
  statusId: '',
  categoryId: '',
  captadorId: '',
}
```

Debe mantener:

- carga reactiva
- `updateFilters`
- `refetch`
- manejo de error

### 5.2 Servicio de prospectos

Actualizar:

```txt
src/services/prospects.service.js
```

`getAll(...)` debe aceptar:

```txt
captadorId
```

y aplicar:

```js
query = query.eq('captador_id', captadorId)
```

Debe conservar filtros existentes:

- búsqueda
- estado
- categoría

### 5.3 Filtros UI

Actualizar:

```txt
src/components/molecules/prospects/ProspectFilters.jsx
```

Debe incluir:

- input de búsqueda
- select de estado con `CatalogSelect`
- select de categoría con `CategorySelect`
- select de captador con `CaptadorSelect`
- acción para limpiar filtros

Reglas:

- Reutilizar componentes existentes.
- Mantener diseño minimalista con Tailwind.
- Evitar componentes grandes.
- Mantener el archivo por debajo de 120 líneas si es posible.

### 5.4 Lista de prospectos

Crear o refactorizar componente:

```txt
src/components/molecules/prospects/ProspectListItem.jsx
```

o adaptar `ProspectCard.jsx` hacia una variante de lista si se mantiene simple.

El componente debe mostrar:

- razón social
- nombre comercial si existe
- RUC
- estado
- categoría actual
- captador
- contacto principal
- fecha de creación
- tarifa negociada o sugerida si aplica

Debe ser clickeable y accesible:

- cursor claro
- hover sutil
- foco visible si se usa botón/enlace
- no depender solo de color para estado

### 5.5 Pantalla de prospectos

Actualizar:

```txt
src/pages/prospects/ProspectsPage.jsx
```

Debe reemplazar la grilla actual por una lista vertical:

```txt
space-y-3
```

o estructura equivalente.

Debe actualizar `handleClearFilters` para incluir `captadorId`.

Debe conservar:

- botón nuevo prospecto según permisos
- loader
- empty state
- navegación al detalle

### 5.6 Exportaciones o reportes

No es obligatorio modificar reportes, pero se debe validar que el filtro por captador no rompa:

- reporte de prospectos
- exportación actual de prospectos

Si existe reutilización futura del filtro, documentarla como mejora posterior.

## 6. Archivos principales a tocar

Como mínimo:

- `src/pages/prospects/ProspectsPage.jsx`
- `src/components/molecules/prospects/ProspectFilters.jsx`
- `src/components/molecules/prospects/ProspectCard.jsx` o nuevo `ProspectListItem.jsx`
- `src/hooks/useProspects.js`
- `src/services/prospects.service.js`

Componentes reutilizables:

- `src/components/molecules/CaptadorSelect.jsx`
- `src/components/molecules/CategorySelect.jsx`
- `src/components/molecules/CatalogSelect.jsx`
- `src/components/atoms/Badge.jsx`
- `src/components/atoms/Button.jsx`
- `src/components/atoms/Input.jsx`

No se espera migración de base de datos, porque `prospects.captador_id` y la tabla `captadores` ya existen.

## 7. Tareas para el desarrollador

1. Revisar la pantalla actual de prospectos y confirmar campos disponibles en `PROSPECT_SELECT`.
2. Agregar `captadorId` al estado de filtros de `useProspects`.
3. Agregar soporte `captadorId` en `prospectsService.getAll(...)`.
4. Exponer filtro de categoría en `ProspectFilters`.
5. Exponer filtro de captador usando `CaptadorSelect`.
6. Actualizar lógica `hasActiveFilters`.
7. Actualizar acción de limpiar filtros.
8. Reemplazar la grilla de cards por lista vertical.
9. Crear `ProspectListItem` o adaptar el componente actual sin romper responsabilidades.
10. Verificar responsividad mobile y desktop.
11. Probar navegación al detalle desde cada item.
12. Probar combinaciones de filtros.
13. Ejecutar `yarn lint`.
14. Ejecutar `yarn build`.

## 8. Casos de prueba obligatorios

### 8.1 Lista base sin filtros

Entrada:

- abrir `/prospectos` sin filtros

Resultado esperado:

- se muestra lista vertical de prospectos
- no se muestran cards en columnas
- cada item permite abrir el detalle

### 8.2 Búsqueda textual

Entrada:

- buscar por razón social, RUC o contacto

Resultado esperado:

- la lista muestra solo prospectos coincidentes
- el estado vacío aparece si no hay coincidencias

### 8.3 Filtro por estado

Entrada:

- seleccionar un estado de prospecto

Resultado esperado:

- se muestran solo prospectos con ese estado
- el filtro puede limpiarse

### 8.4 Filtro por categoría

Entrada:

- seleccionar una categoría

Resultado esperado:

- se muestran solo prospectos con `current_category_id` correspondiente

### 8.5 Filtro por captador

Entrada:

- seleccionar un captador

Resultado esperado:

- se muestran solo prospectos con `captador_id` correspondiente
- el nombre del captador se ve en cada item cuando exista

### 8.6 Combinación de filtros

Entrada:

- buscar por texto
- seleccionar estado
- seleccionar categoría
- seleccionar captador

Resultado esperado:

- los filtros se aplican de forma combinada
- limpiar filtros deja el listado completo nuevamente

### 8.7 Permisos

Entrada:

- usuario sin permiso de creación

Resultado esperado:

- no ve botón `Nuevo prospecto`
- puede consultar la lista si tiene permiso de lectura

## 9. Definition of Done

Este hito se considera terminado cuando:

- La pantalla de prospectos muestra resultados como lista vertical.
- Ya no se usa grilla de cards en filas y columnas para el listado principal.
- El usuario puede filtrar por búsqueda textual.
- El usuario puede filtrar por estado.
- El usuario puede filtrar por categoría.
- El usuario puede filtrar por captador.
- Los filtros pueden combinarse.
- La acción limpiar filtros restablece el listado.
- El empty state funciona con filtros aplicados.
- La navegación al detalle desde la lista funciona.
- No se agregan migraciones innecesarias.
- La UI mantiene el estilo minimalista del proyecto.
- `yarn lint` pasa.
- `yarn build` pasa.

## 10. Fuera de alcance

No forma parte de este hito:

- Crear una administración completa de captadores.
- Crear nuevas columnas en `prospects`.
- Implementar paginación avanzada.
- Persistir filtros en URL, salvo que el desarrollador lo considere de bajo riesgo.
- Cambiar reportes SQL de prospectos.
- Rediseñar el detalle de prospecto.
- Cambiar el flujo de evaluación, cotización o conversión.

