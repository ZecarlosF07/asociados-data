# Hito S11: Mejora post-release del Hito 5 - Asociados en lista operativa

## 1. Objetivo del hito

Convertir el listado principal de asociados a un formato de lista operativa vertical, reemplazando la visualizacion actual en tarjetas por filas/bloques de lectura rapida.

El objetivo es que el usuario pueda revisar asociados reales de forma mas eficiente, especialmente cuando empiece la carga de informacion historica y el volumen de registros aumente.

Este hito mejora la experiencia del **Hito 5: Conversion a asociado y ficha principal**, porque mantiene el flujo funcional existente pero optimiza la pantalla desde donde se consulta y accede a la ficha de cada asociado.

## 2. Hito original que mejora

Este hito mejora el comportamiento del **Hito 5: Conversion a asociado y ficha principal**.

El Hito 5 ya permite:

- listar asociados
- abrir la ficha principal
- consultar informacion basica del asociado
- mantener asociados creados por conversion o alta directa

La observacion actual no es de modelo de datos, sino de experiencia operativa: el formato de tarjetas ocupa demasiado espacio y dificulta revisar muchos asociados en una sola pantalla.

## 3. Estado actual detectado

### 3.1 Pagina actual

Archivo:

```txt
src/pages/associates/AssociatesPage.jsx
```

Actualmente renderiza asociados con:

```txt
AssociateCard
```

en una grilla:

```txt
grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
```

### 3.2 Componente actual

Archivo:

```txt
src/components/molecules/associates/AssociateCard.jsx
```

El componente funciona como tarjeta resumen. Es util para pocos registros, pero no es el formato recomendado para carga y revision masiva de asociados.

### 3.3 Servicio actual

Archivo:

```txt
src/services/associates.service.js
```

El servicio ya devuelve informacion suficiente para una lista operativa:

- `internal_code`
- `company_name`
- `trade_name`
- `ruc`
- `association_date`
- `corporate_email`
- `phone`
- `mobile_phone`
- `associate_status`
- `category`
- `captador`

No se requiere una migracion de base de datos para este hito.

## 4. Problema detectado

El listado en tarjetas genera estos problemas operativos:

- baja densidad de informacion por pantalla
- comparacion dificil entre asociados
- menor velocidad para revisar RUC, razon social, estado, categoria y captador
- experiencia distinta al nuevo patron de prospectos en lista implementado en S8
- menor escalabilidad visual cuando se carguen asociados reales uno por uno

## 5. Alcance funcional

### 5.1 Listado vertical

La pantalla `/asociados` debe mostrar los asociados en formato lista.

Cada asociado debe ocupar una fila o bloque horizontal con informacion jerarquizada:

- razon social como dato principal
- codigo interno
- RUC
- estado
- categoria
- nombre comercial si existe
- fecha de asociacion
- captador si existe
- correo corporativo si existe
- telefono o celular si existe

El listado debe permitir escanear rapidamente muchos asociados sin entrar a cada ficha.

### 5.2 Acceso a ficha

Cada item de la lista debe seguir permitiendo abrir la ficha del asociado.

Regla:

```txt
click en item -> navegar a /asociados/:id
```

El comportamiento debe conservar la navegacion actual.

### 5.3 Boton de alta directa

Debe mantenerse visible la accion:

```txt
+ Nuevo asociado
```

Solo debe mostrarse cuando el usuario tenga permiso de creacion sobre el modulo `asociados`.

La ruta debe seguir siendo:

```txt
/asociados/nuevo
```

### 5.4 Filtros existentes

El hito debe conservar los filtros actuales del modulo de asociados.

Como minimo:

- busqueda textual
- estado
- categoria

Si la estructura actual ya tiene otros filtros, deben mantenerse.

No se debe eliminar funcionalidad ya existente.

### 5.5 Estados de UI

La pantalla debe mantener estados claros:

- carga inicial
- lista vacia sin filtros
- lista vacia con filtros aplicados
- error de consulta si el hook/servicio lo expone

El estado vacio con filtros debe invitar a limpiar filtros o modificar busqueda.

## 6. Alcance tecnico

### 6.1 Crear componente de lista

Crear un componente nuevo:

```txt
src/components/molecules/associates/AssociateListItem.jsx
```

Responsabilidades:

- recibir `associate`
- recibir `onClick`
- renderizar informacion principal y secundaria
- mostrar badges de estado/categoria
- evitar logica de consulta
- no mutar datos

El componente debe seguir el patron visual de:

```txt
src/components/molecules/prospects/ProspectListItem.jsx
```

cuando aplique.

### 6.2 Actualizar pagina de asociados

Modificar:

```txt
src/pages/associates/AssociatesPage.jsx
```

Reemplazar la grilla de tarjetas por una lista vertical:

```txt
space-y-3
```

o una estructura equivalente que no use columnas de tarjetas.

### 6.3 Mantener compatibilidad

No eliminar `AssociateCard.jsx` si existe riesgo de uso futuro o referencias indirectas.

Si ya no queda referenciado, se puede conservar temporalmente para reducir riesgo en este hito.

### 6.4 Formato de datos

El componente debe manejar valores nulos o vacios:

- sin nombre comercial
- sin correo
- sin telefono
- sin captador
- sin categoria

No debe mostrar `undefined`, `null` ni textos tecnicos al usuario final.

### 6.5 Responsive

En escritorio:

- la razon social y RUC deben leerse rapidamente
- los datos secundarios pueden agruparse en columnas internas

En movil:

- el item debe apilar la informacion
- no debe desbordar horizontalmente
- el click debe seguir siendo comodo

## 7. Fuera de alcance

Este hito no incluye:

- cambios de base de datos
- nuevas columnas para asociados
- cambios en conversion de prospecto a asociado
- cambios en alta directa de asociados
- nuevos filtros avanzados
- exportacion de asociados
- paginacion server-side
- cambios en la ficha de asociado

## 8. Archivos esperados

### Nuevos

```txt
src/components/molecules/associates/AssociateListItem.jsx
```

### Modificados

```txt
src/pages/associates/AssociatesPage.jsx
```

Opcionalmente:

```txt
src/components/molecules/associates/index.js
```

si el proyecto usa barrel exports para componentes.

## 9. Criterios de aceptacion

El hito queda aprobado cuando:

- `/asociados` muestra asociados en formato lista vertical.
- Ya no se renderiza la grilla de `AssociateCard` como vista principal.
- Cada item muestra razon social, codigo interno y RUC.
- Cada item muestra estado y categoria cuando existan.
- Cada item muestra datos operativos secundarios sin romper si son nulos.
- El click en un asociado abre su ficha.
- El boton `+ Nuevo asociado` sigue funcionando.
- Los filtros existentes siguen funcionando.
- La vista se adapta correctamente a escritorio y movil.
- No se agregan migraciones innecesarias.
- `yarn lint` pasa sin errores.
- `yarn build` pasa sin errores.

## 10. Pruebas funcionales sugeridas

### 10.1 Listado base

1. Ingresar a `/asociados`.
2. Verificar que los asociados aparecen en lista vertical.
3. Confirmar que no hay tarjetas en columnas.

### 10.2 Navegacion

1. Hacer click en un asociado.
2. Confirmar que abre `/asociados/:id`.
3. Volver al listado.

### 10.3 Filtros

1. Buscar por razon social.
2. Filtrar por estado.
3. Filtrar por categoria.
4. Combinar busqueda y filtros.
5. Limpiar filtros.

### 10.4 Datos incompletos

1. Probar con asociado sin telefono.
2. Probar con asociado sin correo.
3. Probar con asociado sin captador.
4. Confirmar que la UI no muestra valores tecnicos vacios.

### 10.5 Responsive

1. Revisar en ancho desktop.
2. Revisar en ancho movil.
3. Confirmar que no hay desbordes horizontales.

## 11. Notas para el desarrollador

Este hito debe ejecutarse como una mejora de presentacion y ergonomia operativa.

No debe tocar la logica de creacion, conversion, membresias ni documentos del asociado.

La referencia mas cercana de experiencia es el trabajo ya realizado para prospectos en S8: lista vertical, informacion escaneable y filtros conservados.
