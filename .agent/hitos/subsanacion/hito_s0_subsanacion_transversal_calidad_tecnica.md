# Hito S0: Subsanación transversal de calidad técnica y reglas internas

## 1. Objetivo del hito

Corregir la deuda técnica transversal detectada en el proyecto antes de cerrar los hitos funcionales. Este hito busca que la base de código cumpla las reglas internas mínimas, compile de forma limpia, pase lint y quede preparada para mantenimiento por más de un desarrollador.

Este hito no pertenece a un módulo funcional específico. Afecta a todo el sistema y debe ejecutarse antes de continuar con correcciones por hito operativo.

## 2. Hitos originales impactados

- Hito 1: Base técnica del proyecto.
- Hito 4: Módulo de prospectos.
- Hito 5: Conversión a asociado y ficha principal.
- Hito 6: Membresías, pagos y cobranza.
- Hito 7: Gestión documental y almacenamiento.
- Hito 8: Reportes, exportaciones y automatizaciones.

## 3. Problemas detectados

- `yarn lint` falla con errores de imports o variables no usadas.
- Existen warnings de hooks por dependencias incompletas.
- Hay errores de Fast Refresh por archivos de contexto que exportan más de lo permitido.
- Existen páginas y componentes muy por encima de 120 líneas, incumpliendo `rules.md`.
- El proyecto está implementado en `.js/.jsx`, aunque las reglas internas piden TypeScript estricto.
- Hay pantallas con demasiada responsabilidad: carga de datos, handlers, reglas, renderizado y UI en el mismo archivo.

## 4. Alcance técnico

### 4.1 Corrección de lint

Corregir todos los errores reportados por:

```bash
yarn lint
```

Como mínimo revisar:

- `src/components/molecules/associates/AssociateInfoSection.jsx`
- `src/utils/exportUtils.js`
- `src/pages/associates/AssociatesPage.jsx`
- `src/pages/financial/PendingPaymentsPage.jsx`
- `src/context/AuthContext.jsx`
- `src/context/NotificationContext.jsx`
- `src/context/UserProfileContext.jsx`
- páginas de settings y usuarios con warnings de hooks

### 4.2 Refactor de archivos grandes

Reducir o justificar técnicamente los archivos que superan ampliamente el límite de 120 líneas:

- `src/pages/financial/PendingPaymentsPage.jsx`
- `src/pages/reports/ReportsPage.jsx`
- `src/pages/dashboard/DashboardPage.jsx`
- `src/pages/associates/AssociateDetailPage.jsx`
- `src/pages/associates/sections/AssociateDetailTabs.jsx`
- `src/components/molecules/associates/AssociateForm.jsx`
- `src/components/molecules/prospects/ProspectForm.jsx`
- `src/components/molecules/documents/DocumentUploadForm.jsx`

El refactor debe separar:

- hooks de carga de datos
- hooks de acciones
- componentes visuales por sección
- constantes y configuraciones
- validaciones
- columnas de tablas
- reglas de negocio

### 4.3 Separación de responsabilidades

Crear o ajustar hooks por dominio:

- `usePendingPaymentsFilters`
- `usePendingPaymentsActions`
- `useAssociateFinancialActions`
- `useAssociateDocumentActions`
- `useReportsExport`
- `useDashboardMetrics`

Crear componentes por sección cuando aplique:

- `PendingPaymentsFilters`
- `PendingPaymentsTable`
- `PendingPaymentRow`
- `ReportsSummaryTab`
- `AssociatePeopleTab`
- `AssociateContactsTab`
- `AssociateMembershipsTab`
- `AssociateDocumentsTab`

### 4.4 Estrategia TypeScript

No se debe migrar todo el proyecto a TypeScript de golpe si eso bloquea el avance. La estrategia correcta es incremental:

1. Crear `tsconfig.json` en modo estricto.
2. Habilitar migración gradual con `allowJs`.
3. Crear carpeta `src/types`.
4. Definir modelos iniciales:
   - `src/types/prospects.ts`
   - `src/types/associates.ts`
   - `src/types/financial.ts`
   - `src/types/documents.ts`
   - `src/types/reports.ts`
5. Migrar primero utilidades, constantes y validadores de bajo riesgo.
6. Documentar qué módulos quedan para migración posterior.

### 4.5 UI y estilos

- Mantener Tailwind como única fuente de estilos.
- No agregar CSS manual adicional.
- Reutilizar componentes existentes antes de crear nuevos.
- Mantener UI minimalista y consistente.
- No introducir cambios visuales fuera del alcance de refactor.

## 5. Tareas para el desarrollador

1. Ejecutar `yarn lint` y registrar errores actuales.
2. Corregir errores de lint sin cambiar comportamiento funcional.
3. Separar contextos React para cumplir Fast Refresh.
4. Refactorizar archivos grandes por dominio.
5. Crear hooks y componentes pequeños para reducir complejidad.
6. Crear estrategia TypeScript inicial.
7. Ejecutar `yarn lint`.
8. Ejecutar `yarn build`.
9. Documentar excepciones si algún archivo queda por encima de 120 líneas.

## 6. Definition of Done

Este hito se considera terminado cuando:

- `yarn lint` termina sin errores.
- `yarn build` termina sin errores.
- No quedan imports ni variables sin usar.
- Los warnings de hooks quedan corregidos o justificados.
- Los componentes críticos quedan reducidos o justificados.
- Existe carpeta `src/types` o documento de migración TypeScript incremental.
- No se introducen cambios funcionales no solicitados.

