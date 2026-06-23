# Hito S17 - Resumen de implementacion

Fecha: 2026-06-23

## Estado

Implementado en codigo. No requiere migracion de base de datos.

## Fuente de datos

El directorio usa la tabla existente:

```txt
associate_area_contacts
```

La consulta global se centralizo en:

```txt
src/services/companyContacts.service.js
```

Reglas aplicadas:

- solo contactos no eliminados
- solo asociados no eliminados
- no se filtra por estado `ACTIVO` por defecto
- se incluyen area, estado, categoria y comite principal del asociado

## Pantalla operativa

Ruta creada:

```txt
/contactos-empresas
```

Entrada de sidebar:

```txt
Contactos
```

La ruta se registro en `associateRoutes` y queda protegida con:

```txt
PermissionGuard module="asociados"
```

El item de sidebar usa `permissionModule: 'asociados'` para reutilizar el permiso existente sin crear un modulo nuevo.

## Funcionalidad

La pantalla permite:

- listar todos los contactos por area de empresas asociadas
- buscar por contacto, cargo, correo, telefono, razon social, RUC y codigo interno
- filtrar por area
- filtrar por estado del asociado
- filtrar por categoria del asociado
- mostrar solo contactos principales
- navegar desde la razon social hacia la ficha del asociado
- exportar a Excel solo el resultado filtrado

## Exportacion

Se agrego:

```txt
EXPORT_COLUMNS.companyContacts
```

El Excel incluye:

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

## Archivos principales

```txt
src/router/routes.js
src/router/associateRoutes.jsx
src/layouts/Sidebar.jsx
src/utils/constants.js
src/utils/exportUtils.js
src/utils/companyContactUtils.js
src/services/companyContacts.service.js
src/hooks/useCompanyContacts.js
src/pages/contacts/CompanyContactsPage.jsx
src/components/molecules/contacts/CompanyContactFilters.jsx
src/components/molecules/contacts/CompanyContactList.jsx
src/components/molecules/contacts/CompanyContactListItem.jsx
src/types/associates.ts
```

## Validaciones ejecutadas

```txt
yarn lint
yarn build
```

Ambos comandos pasan correctamente.
