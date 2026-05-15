# QA checklist MVP

## Estado de uso

Marcar cada punto como:

- `OK`: validado correctamente.
- `OBS`: hay observación menor.
- `BLOQ`: bloquea release interno.
- `N/A`: no aplica en este entorno.

## 1. Acceso y seguridad

| Check | Estado | Evidencia |
|---|---:|---|
| Login con usuario ADMIN | Pendiente |  |
| Logout limpia sesión | Pendiente |  |
| ADMIN accede a todos los módulos | Pendiente |  |
| OPERADOR no administra usuarios/configuración crítica | Pendiente |  |
| CONSULTA no puede crear/editar/eliminar | Pendiente |  |
| Rutas no autorizadas muestran bloqueo | Pendiente |  |
| RLS bloquea operaciones no permitidas desde backend | Pendiente |  |

## 2. Configuración y catálogos

| Check | Estado | Evidencia |
|---|---:|---|
| Roles base visibles | Pendiente |  |
| Configuraciones generales visibles | Pendiente |  |
| Catálogos cargan en formularios | Pendiente |  |
| Categorías disponibles para prospectos/asociados | Pendiente |  |

## 3. Prospectos

| Check | Estado | Evidencia |
|---|---:|---|
| Crear captador | Pendiente |  |
| Crear prospecto | Pendiente |  |
| Editar prospecto | Pendiente |  |
| Registrar evaluación | Pendiente |  |
| Registrar cotización | Pendiente |  |
| Cambiar estado | Pendiente |  |
| Ver historial de estados | Pendiente |  |
| Aprobar prospecto | Pendiente |  |

## 4. Asociados

| Check | Estado | Evidencia |
|---|---:|---|
| Convertir prospecto aprobado | Pendiente |  |
| Bloquear doble conversión | Pendiente |  |
| Bloquear RUC duplicado en conversión | Pendiente |  |
| Editar ficha de asociado | Pendiente |  |
| Registrar persona vinculada | Pendiente |  |
| Registrar contacto por área | Pendiente |  |
| Consultar ficha principal completa | Pendiente |  |

## 5. Finanzas

| Check | Estado | Evidencia |
|---|---:|---|
| Crear membresía | Pendiente |  |
| Generar cronograma | Pendiente |  |
| Consultar cuotas | Pendiente |  |
| Registrar pago completo | Pendiente |  |
| Registrar pago parcial | Pendiente |  |
| Validar actualización transaccional de cuota | Pendiente |  |
| Registrar acción de cobranza | Pendiente |  |
| Consultar resumen financiero del asociado | Pendiente |  |

## 6. Documentos

| Check | Estado | Evidencia |
|---|---:|---|
| Subir documento general | Pendiente |  |
| Subir documento desde asociado | Pendiente |  |
| Consultar listado documental | Pendiente |  |
| Abrir detalle documental | Pendiente |  |
| Descargar documento con URL firmada | Pendiente |  |
| Editar metadatos | Pendiente |  |
| Reemplazar versión | Pendiente |  |
| Eliminar lógicamente | Pendiente |  |

## 7. Reportes y exportaciones

| Check | Estado | Evidencia |
|---|---:|---|
| Abrir reportes | Pendiente |  |
| Validar KPIs | Pendiente |  |
| Validar reporte de prospectos | Pendiente |  |
| Validar reporte de asociados | Pendiente |  |
| Validar reporte financiero | Pendiente |  |
| Validar reporte documental | Pendiente |  |
| Exportar Excel individual | Pendiente |  |
| Exportar Excel multi-hoja | Pendiente |  |

## 8. Cierre técnico

| Check | Estado | Evidencia |
|---|---:|---|
| `yarn lint` pasa | OK | Ejecutado en S6 |
| `yarn build` pasa | OK | Ejecutado en S6 |
| No hay warning de chunk grande | OK | Resuelto en S5 |
| Audit S1 ejecutado | Pendiente |  |
| Audit S2 ejecutado | OK | Validado previamente |
| Audit S3 ejecutado | OK | Validado previamente |
| Audit S4 ejecutado | OK | Validado previamente |
| Audit S5 ejecutado | OK | Validado previamente |
| Audit S6 ejecutado | OK | Validado por SQL Editor el 2026-05-11 |

## Incidencias residuales

| ID | Prioridad | Descripción | Acción |
|---|---:|---|---|
| QA-001 | Media | Validar S1 en BD si no se ejecutó audit completo de roles/RLS. | Ejecutar audit S1 o consultas equivalentes. |
| QA-002 | Media | Validar flujos por rol con usuarios reales ADMIN/OPERADOR/CONSULTA. | Crear usuarios de prueba o asignar roles temporalmente. |
| QA-003 | Baja | Confirmar usuario administrador inicial y rotación de credenciales antes de uso productivo. | Cambiar credenciales iniciales y registrar responsable. |
| QA-004 | Baja | Existen acciones visibles con mensaje de funcionalidad pendiente: crear usuario y crear categoría. | Decidir si se implementan en una mejora menor o si se ocultan hasta habilitar el flujo administrativo completo. |
