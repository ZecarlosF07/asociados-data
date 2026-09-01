# Hito S20: Filtros combinados de contactos y categorías A-C

## Objetivo

Mejorar el directorio `/contactos-empresas` con selección múltiple por tipo o área
y por comité principal, y dejar como categorías operativas únicamente A, B y C.

## Filtros de contactos

`Tipo / área` reemplaza los selectores separados. Su checklist contiene los dos
tipos de representante y cada área activa. Varias selecciones se combinan con OR.

`Comités` permite elegir varios comités activos y `Sin comité`. Dentro del
checklist también se aplica OR. Los distintos grupos de filtros se combinan con
AND junto con búsqueda, estado, categoría y solo principales.

La exportación continúa usando `filteredContacts`, por lo que genera una fila por
cada contacto que cumpla todos los filtros activos.

## Categorías

Las categorías operativas quedan definidas así:

| Código | Nombre | Puntaje |
|---|---|---:|
| `CAT_A` | Categoría A - Corporativo | 2.26–3.00 |
| `CAT_B` | Categoría B - Empresarial | 1.50–2.25 |
| `CAT_C` | Categoría C - Ejecutivo | 0.75–1.49 |

Los puntajes menores a 0.75 no califican. Las tarifas vigentes no cambian.

`CAT_D` y `CAT_E` se inactivan y eliminan lógicamente. No se borran físicamente
porque pueden existir referencias históricas. La migración se detiene si todavía
hay asociados, prospectos abiertos, membresías vigentes o evaluaciones vigentes
que dependan de ellas.

## Criterios de aceptación

- El checklist combinado permite mezclar representantes y áreas.
- El checklist de comités permite selección múltiple y `Sin comité`.
- Limpiar filtros restablece todos los resultados.
- El Excel contiene exactamente el resultado filtrado.
- Solo A-C aparecen en selectores operativos.
- D/E no tienen referencias operativas al aplicar la migración.
- Los límites de puntaje producen la categoría o `No califica` esperados.
- `yarn lint`, `yarn build` y `git diff --check` pasan.
