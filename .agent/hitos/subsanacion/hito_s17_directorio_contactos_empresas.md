# Hito S17: Directorio operativo de contactos de empresas

## 1. Objetivo del hito

Crear una vista operativa para consultar en una sola lista todos los contactos por area registrados en las empresas asociadas, con filtros por area y exportacion a Excel del resultado filtrado.

El objetivo es que el usuario no tenga que entrar asociado por asociado para ubicar contactos comerciales, administrativos, financieros u operativos.

## 2. Hito original que mejora

Este hito mejora el comportamiento del **Hito 5: Conversion a asociado y ficha principal**.

El Hito 5 ya permite registrar contactos por area dentro de la ficha del asociado mediante `associate_area_contacts`. S17 no cambia esa captura; agrega una capa operativa transversal para explotar esos datos.

## 3. Estado actual detectado

### 3.1 Modelo existente

La tabla ya existe:

```txt
associate_area_contacts
```

Campos relevantes:

- `associate_id`
- `area_id`
- `full_name`
- `position`
- `email`
- `phone`
- `is_primary`
- `notes`
- `is_deleted`

Tambien existen indices utiles:

- `idx_area_contacts_associate`
- `idx_area_contacts_area`
- `idx_area_contacts_not_deleted`

### 3.2 Servicio actual

Archivo:

```txt
src/services/associates.service.js
```

Actualmente expone lectura por asociado:

```txt
getAreaContacts(associateId)
```

Eso sirve para la ficha individual, pero no para una lista global de contactos.

### 3.3 UI actual

Archivo:

```txt
src/components/molecules/associates/AreaContactList.jsx
```

Muestra contactos dentro de un asociado especifico. No existe una pantalla para consultar todos los contactos de todas las empresas.

## 4. Problema detectado

La informacion de contactos esta capturada, pero queda aislada dentro de cada ficha de asociado.

Esto genera problemas operativos:

- no se puede listar todos los contactos de un area especifica
- no se puede ubicar rapidamente un correo o telefono sin conocer primero la empresa
- no se puede exportar una base de contactos filtrada
- se obliga al usuario a navegar ficha por ficha

## 5. Alcance funcional

### 5.1 Nueva pantalla operativa

Crear una pantalla de directorio:

```txt
/contactos-empresas
```

Nombre sugerido en sidebar:

```txt
Contactos
```

La pantalla debe mostrar contactos no eliminados de empresas asociadas no eliminadas.
No debe filtrar por estado `ACTIVO` por defecto; el estado del asociado se maneja como filtro operativo.

### 5.2 Datos visibles por fila

Cada fila debe mostrar:

- nombre del contacto
- area
- cargo
- correo
- telefono
- si es contacto principal del area
- razon social del asociado
- codigo interno del asociado
- RUC
- estado del asociado
- categoria del asociado
- comite principal si existe

La razon social debe permitir navegar a:

```txt
/asociados/:id
```

### 5.3 Filtros

La pantalla debe incluir como minimo:

- busqueda textual por contacto, cargo, correo, telefono, razon social, RUC y codigo interno
- filtro por area
- filtro por estado del asociado
- filtro por categoria del asociado
- filtro para mostrar solo contactos principales

El filtro por area es obligatorio para cerrar este hito.
Debe reutilizar el catalogo existente `ASSOCIATE_CATALOG_GROUPS.AREA`.

### 5.4 Exportacion a Excel

Agregar un boton en el extremo derecho del encabezado o barra de filtros:

```txt
Exportar Excel
```

Reglas:

- exporta solo el resultado filtrado visible
- respeta busqueda y filtros activos
- se deshabilita si no hay contactos para exportar
- registra la descarga en auditoria antes de generar el archivo
- nombre sugerido del archivo:

```txt
contactos_empresas_filtrado_YYYY-MM-DD.xlsx
```

Columnas minimas:

- Contacto
- Area
- Cargo
- Email
- Telefono
- Principal
- Asociado
- Codigo asociado
- RUC
- Estado asociado
- Categoria
- Comite principal
- Observaciones

### 5.5 Estados de UI

La pantalla debe manejar:

- carga inicial
- lista vacia sin contactos
- lista vacia por filtros
- error de consulta
- exportacion sin registros bloqueada

## 6. Alcance tecnico

### 6.1 Servicio

Crear un servicio dedicado:

```txt
src/services/companyContacts.service.js
```

Responsabilidades:

- consultar `associate_area_contacts`
- excluir `is_deleted = true`
- traer `area`
- traer datos del asociado no eliminado
- traer estado, categoria y comite principal del asociado si esta disponible
- centralizar el mapeo de datos para que los componentes no dependan del shape crudo de Supabase
- no excluir asociados por estado salvo que el usuario aplique un filtro de estado

No se recomienda reutilizar `associatesService.getAreaContacts`, porque ese metodo esta orientado a una ficha individual.

### 6.2 Hook

Crear:

```txt
src/hooks/useCompanyContacts.js
```

Responsabilidades:

- cargar contactos
- exponer `contacts`, `filteredContacts`, `loading`, `error`
- administrar filtros locales
- exponer accion de limpieza de filtros

### 6.3 Componentes

Crear componentes pequenos:

```txt
src/components/molecules/contacts/CompanyContactFilters.jsx
src/components/molecules/contacts/CompanyContactList.jsx
src/components/molecules/contacts/CompanyContactListItem.jsx
```

Regla tecnica:

- ningun componente nuevo o modificado debe superar 120 lineas
- no duplicar logica de filtros entre pagina y hook

### 6.4 Pagina y rutas

Crear:

```txt
src/pages/contacts/CompanyContactsPage.jsx
```

Agregar ruta:

```txt
CONTACTOS_EMPRESAS: '/contactos-empresas'
```

Registrar la pagina dentro de `src/router/associateRoutes.jsx`, protegida con:

```txt
PermissionGuard module="asociados"
```

Agregar entrada en navegacion despues de Asociados:

```txt
{ label: 'Contactos', path: ROUTES.CONTACTOS_EMPRESAS, icon: '📇' }
```

### 6.5 Exportacion

Reutilizar:

```txt
src/utils/exportUtils.js
```

Agregar columnas:

```txt
EXPORT_COLUMNS.companyContacts
```

La pagina debe llamar `exportToExcel` con `filteredContacts`, no con la lista completa.
La auditoria de la descarga no debe implementarse solo en esta pagina. Debe quedar centralizada en `exportToExcel` y `exportMultiSheetExcel`, para cubrir cualquier descarga Excel del sistema.

### 6.6 Auditoria de descargas Excel

Crear una RPC segura:

```txt
public.log_excel_export(...)
```

Reglas:

- insertar en `audit_logs` desde base de datos, no desde frontend directo
- registrar `actor_user_id` con `current_user_profile_id()`
- usar entidad `excel_exports`
- usar accion `export_excel`
- guardar nombre de archivo, hojas, columnas y cantidad de registros
- bloquear la descarga si la auditoria falla
- revocar ejecucion a `public` y `anon`
- otorgar ejecucion solo a `authenticated`

## 7. Modelo de datos

No se requiere crear una tabla nueva.

La fuente de verdad sigue siendo:

```txt
associate_area_contacts
```

El hito es principalmente de consulta, filtros, exportacion y auditoria de descarga.

Se requiere migracion para la RPC de auditoria:

```txt
supabase/migrations/YYYYMMDDHHMMSS_s17_excel_export_audit.sql
```

Solo considerar una migracion adicional si se detecta bajo rendimiento en volumen real. En ese caso, agregar indices no destructivos, por ejemplo:

```txt
create index if not exists idx_area_contacts_active_area
  on public.associate_area_contacts(area_id, associate_id)
  where is_deleted = false;
```

No usar `drop` ni reemplazar tablas para este hito.

## 8. Seguridad y permisos

La lectura debe respetar permisos del modulo `asociados`.
No se debe crear un modulo nuevo de permisos para este hito.

Regla recomendada:

- usuario con `asociados:read` puede ver el directorio de contactos
- usuarios sin lectura de asociados no ven la ruta ni pueden consultar datos
- no se habilita creacion, edicion ni eliminacion desde esta pantalla

El mantenimiento de contactos sigue ocurriendo en la ficha del asociado.

## 9. UX esperada

La pantalla debe comportarse como una lista operativa, similar a asociados/cobranza:

- titulo: `Contactos de empresas`
- subtitulo: total filtrado y total general
- filtros visibles arriba
- boton `Exportar Excel` en el extremo derecho
- filas compactas para escanear muchos contactos
- click en empresa abre ficha del asociado

La accion principal no debe ser editar contacto. Esta pantalla es de consulta y exportacion.

## 10. Archivos probables

```txt
src/router/routes.js
src/router/associateRoutes.jsx
src/utils/constants.js
src/utils/exportUtils.js
src/services/companyContacts.service.js
src/hooks/useCompanyContacts.js
src/pages/contacts/CompanyContactsPage.jsx
src/components/molecules/contacts/CompanyContactFilters.jsx
src/components/molecules/contacts/CompanyContactList.jsx
src/components/molecules/contacts/CompanyContactListItem.jsx
src/types/associates.ts
```

Si se decide auditar SQL:

```txt
supabase/audits/hito_s17_company_contacts_audit.sql
```

## 11. Fuera de alcance

Queda fuera de este hito:

- crear contactos desde la lista global
- editar contactos desde la lista global
- eliminar contactos desde la lista global
- importar contactos desde Excel
- crear campanas de correo o WhatsApp
- mover contactos a una tabla nueva
- convertir esta pantalla en modulo de CRM
- agregar reportes dentro de `/reportes`
- permitir descargas Excel sin auditoria

## 12. Criterios de aceptacion

El hito queda cerrado cuando:

- existe una ruta operativa para ver todos los contactos de empresas
- la lista muestra contactos no eliminados de asociados no eliminados
- el filtro por area funciona correctamente
- busqueda y filtros se pueden combinar
- la exportacion genera Excel solo con el resultado filtrado
- la exportacion incluye datos del contacto y del asociado
- cada exportacion Excel queda registrada en `audit_logs`
- usuarios sin permiso de lectura de asociados no acceden a la pantalla
- `yarn lint` pasa
- `yarn build` pasa

## 13. Validacion manual recomendada

1. Abrir la pantalla de contactos.
2. Confirmar que se ven contactos de diferentes asociados.
3. Filtrar por un area y validar que no aparecen contactos de otras areas.
4. Buscar por nombre de contacto.
5. Buscar por razon social o RUC del asociado.
6. Combinar area + busqueda.
7. Activar solo principales.
8. Exportar y verificar que el Excel contiene solo los registros filtrados.
9. Click en una empresa y validar navegacion a su ficha.
10. Probar con usuario sin permiso de `asociados:read`.
11. Verificar en Auditoria un evento `excel_exports` / `export_excel`.

## 14. Decision recomendada

Implementar S17 como un directorio operativo independiente llamado `Contactos`, usando `associate_area_contacts` como fuente de verdad.

No conviene resolverlo dentro de Reportes porque el usuario necesita consultar, filtrar y navegar a asociados desde una lista viva. Reportes debe quedar para explotacion resumida; este hito es una pantalla operativa.
