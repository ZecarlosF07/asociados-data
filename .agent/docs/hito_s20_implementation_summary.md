# Hito S20 - Resumen de implementacion

Fecha: 2026-09-01

## Estado

Implementado en codigo y migracion local. Pendiente aplicar la migracion y ejecutar
el audit S20 en la instancia desplegada.

## Directorio de contactos

Los selectores separados de tipo y area fueron reemplazados por `Tipo / área`, un
checklist que combina representantes y areas activas. Las selecciones usan OR.

Se agrego el checklist `Comités`, que permite elegir varios comites activos y
`Sin comité`. Ambos checklists se combinan con AND respecto de busqueda, estado,
categoria y solo principales.

La exportacion no cambio de fuente: continua usando `filteredContacts` y por ello
incluye todos los registros que cumplen los filtros activos.

## Categorias

- A: `Categoría A - Corporativo`, 2.26-3.00
- B: `Categoría B - Empresarial`, 1.50-2.25
- C: `Categoría C - Ejecutivo`, 0.75-1.49

Las tarifas se conservan. D/E se inactivan y eliminan logicamente solo cuando no
existen referencias operativas. Los historiales mantienen sus claves foraneas.
Puntajes inferiores a 0.75 se muestran como `No califica`.

## Validaciones ejecutadas

- seis escenarios aislados de filtros combinados
- ocho limites de categoria
- `yarn lint`
- `yarn build`
- `git diff --check`

La validacion manual autenticada del frontend y el audit SQL desplegado permanecen
pendientes.
