# Hito S18 - Resumen de implementacion

Fecha: 2026-07-07

## Estado

Implementado en codigo. No requiere migracion nueva.

## Fuente de datos

El directorio ahora unifica:

```txt
associate_area_contacts
associate_people
```

La consulta de `associate_people` se limita en base de datos a:

```txt
REPRESENTANTE_LEGAL
REPRESENTANTE_ANTE_CAMARA
```

Ambas consultas excluyen registros y asociados eliminados, se ejecutan en paralelo
y se normalizan en `companyContacts.service.js`. Los representantes no se copian a
la tabla de contactos por area.

## Filtros

Se agrego `Tipo de contacto` con:

- Todos
- Contacto por area
- Representante legal
- Representante ante la Camara

Se conservaron busqueda, area, estado, categoria y solo principales. Al seleccionar
un representante, el valor de area se limpia y el selector queda deshabilitado.

La busqueda tambien considera DNI, rol de persona y area.

## Lista operativa

Cada fila identifica el tipo de contacto. Los representantes muestran DNI y
onomastico cuando existen. El onomastico se presenta con `formatDateOnly`, sin
conversion UTC.

La navegacion a la ficha del asociado no cambio.

## Exportacion

El Excel sigue usando `filteredContacts`, por lo que respeta todos los filtros.
Se agregaron:

- Tipo de contacto
- DNI
- Onomastico

La descarga conserva la auditoria centralizada `excel_exports` / `export_excel` y
se bloquea si el registro de auditoria falla.

## Base de datos

No se agregaron tablas, vistas, RPC, indices ni migraciones. Se reutilizan el
catalogo `PERSON_ROLE`, los indices y las politicas RLS existentes del modulo
`asociados`.

## Archivos modificados

```txt
src/services/companyContacts.service.js
src/hooks/useCompanyContacts.js
src/utils/companyContactUtils.js
src/utils/exportUtils.js
src/components/molecules/contacts/CompanyContactFilters.jsx
src/components/molecules/contacts/CompanyContactList.jsx
src/components/molecules/contacts/CompanyContactListItem.jsx
src/pages/contacts/CompanyContactsPage.jsx
```

## Validaciones ejecutadas

```txt
yarn lint
yarn build
git diff --check
```

Tambien se validaron siete casos aislados de filtros y transformacion para Excel.
Queda pendiente la prueba manual contra la instancia desplegada para confirmar los
datos reales, RLS y el evento de auditoria.
