# Release notes MVP interno

## Versión

MVP interno del Sistema de Asociados.

## Alcance incluido

- Autenticación con Supabase.
- Usuarios, perfiles, roles, permisos y RLS.
- Configuraciones base, catálogos y categorías.
- Gestión de captadores.
- Gestión de prospectos.
- Evaluaciones, cotizaciones e historial de estado.
- Conversión transaccional de prospecto aprobado a asociado.
- Ficha principal de asociado.
- Personas vinculadas y contactos por área.
- Membresías y cronograma.
- Registro transaccional de pagos.
- Acciones de cobranza.
- Resumen financiero del asociado.
- Gestión documental con Storage privado.
- Detalle documental, metadatos y versionamiento mínimo.
- Reportes por módulo.
- Exportación Excel individual y multi-hoja.
- Vistas SQL de reportes.
- Modelo persistente base para automatizaciones.

## Hitos de subsanación incluidos

- S0: calidad técnica transversal, lint, build y base TypeScript incremental.
- S1: seguridad, roles, permisos, RLS, auditoría y Storage policies.
- S2: conversión transaccional prospecto-asociado.
- S3: pagos, cobranza y salud financiera.
- S4: detalle documental y validación de Storage.
- S5: vistas de reportes, exportaciones optimizadas y automatizaciones base.
- S6: QA, seeds y checklist de release interno.

## Cambios técnicos relevantes

- Las operaciones críticas de conversión y pago se movieron a RPCs transaccionales.
- Las policies RLS protegen tablas operativas.
- El bucket `documents` es privado y usa URL firmada.
- `xlsx` y `file-saver` cargan con dynamic import.
- Las páginas pesadas se cargan con lazy loading.
- El build ya no emite warning de chunk mayor a 500 kB.

## Validaciones técnicas ejecutadas

- `yarn lint`: OK.
- `yarn build`: OK.
- Audits S2, S3, S4, S5 y S6 revisados con evidencia enviada por SQL Editor.

## Pendientes antes de uso operativo amplio

- Validar usuarios reales por rol: ADMIN, OPERADOR y CONSULTA.
- Ejecutar pruebas funcionales del checklist MVP.
- Rotar credenciales del administrador inicial si se usó el seed base.
- Definir quién opera las automatizaciones candidatas.
- Resolver o retirar acciones administrativas visibles que aún muestran mensaje de funcionalidad pendiente.

## Criterio de aprobación de release interno

El release interno se considera aprobado cuando:

- todos los checks críticos del QA checklist están en `OK`
- no existen incidencias `BLOQ`
- el build de producción pasa
- el bucket documental está validado
- los seeds mínimos están confirmados
- los roles fueron probados en frontend y backend
