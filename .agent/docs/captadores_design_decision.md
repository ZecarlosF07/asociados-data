# Captadores: Decisión de diseño y arquitectura

## Contexto y problema

Inicialmente, el campo `captured_by_user_id` en la tabla `prospects` referenciaba directamente a `user_profiles`, asumiendo que el captador siempre era un usuario del sistema (personal interno con acceso a la plataforma).

**El usuario indicó que esto era incorrecto** porque:
- El captador puede ser **cualquier persona interna de la Cámara**, no solo usuarios del sistema
- También puede ser **personas externas** que no tienen acceso a la plataforma
- Incluso puede ser la **institución misma** como captador
- El captador es clave para el **seguimiento de comisiones**: cuando un prospecto se convierte en asociado, el captador recibe una comisión

## Solución implementada

Se creó una **tabla independiente `captadores`** que permite registrar tanto personas internas como externas.

### Estructura de la tabla

```sql
-- Archivo: supabase/migrations/20260316050000_create_captadores.sql
captadores (
  id              uuid PK,
  full_name       varchar(180) NOT NULL,    -- Nombre completo
  is_internal     boolean DEFAULT false,     -- ¿Es personal interno?
  user_profile_id uuid FK → user_profiles,  -- Enlace opcional a usuario del sistema
  email           varchar(180),
  phone           varchar(30),
  notes           text,
  is_active       boolean DEFAULT true,
  -- campos de auditoría estándar...
)
```

> [!IMPORTANT]
> La misma migración agrega `captador_id` a la tabla `prospects` y marca `captured_by_user_id` como **deprecado**.

### Archivos creados/modificados

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| [20260316050000_create_captadores.sql](file:///Users/areadeti/Proyectos/asociados-mvp/supabase/migrations/20260316050000_create_captadores.sql) | **Nuevo** | Tabla `captadores` + ALTER a `prospects` |
| [captadores.service.js](file:///Users/areadeti/Proyectos/asociados-mvp/src/services/captadores.service.js) | **Nuevo** | CRUD completo para captadores |
| [useCaptadores.js](file:///Users/areadeti/Proyectos/asociados-mvp/src/hooks/useCaptadores.js) | **Nuevo** | Hook para listar captadores activos |
| [CaptadorSelect.jsx](file:///Users/areadeti/Proyectos/asociados-mvp/src/components/molecules/CaptadorSelect.jsx) | **Nuevo** | Select que muestra `nombre (interno/externo)` |
| [NewCaptadorModal.jsx](file:///Users/areadeti/Proyectos/asociados-mvp/src/components/molecules/prospects/NewCaptadorModal.jsx) | **Nuevo** | Modal para crear captador rápido desde el formulario de prospecto |
| [ProspectForm.jsx](file:///Users/areadeti/Proyectos/asociados-mvp/src/components/molecules/prospects/ProspectForm.jsx) | **Modificado** | Reemplazó `UserProfileSelect` por `CaptadorSelect` + botón "Nuevo" |
| [prospects.service.js](file:///Users/areadeti/Proyectos/asociados-mvp/src/services/prospects.service.js) | **Modificado** | SELECT join cambiado de `captured_by` a `captador` |
| [ProspectCard.jsx](file:///Users/areadeti/Proyectos/asociados-mvp/src/components/molecules/prospects/ProspectCard.jsx) | **Modificado** | Muestra `captador.full_name` |
| [ProspectInfoSection.jsx](file:///Users/areadeti/Proyectos/asociados-mvp/src/components/molecules/prospects/ProspectInfoSection.jsx) | **Modificado** | Muestra captador con indicador (interno/externo) |
| [prospectValidation.js](file:///Users/areadeti/Proyectos/asociados-mvp/src/utils/prospectValidation.js) | **Modificado** | Validación de `captador_id` como obligatorio |
| [ProspectCreatePage.jsx](file:///Users/areadeti/Proyectos/asociados-mvp/src/pages/prospects/ProspectCreatePage.jsx) | **Modificado** | Quitada asignación automática de `captured_by_user_id` |

### Relación de campos en `prospects`

| Campo | Estado | Referencia |
|-------|--------|-----------|
| `captador_id` | **Activo** | → `captadores.id` |
| `captured_by_user_id` | **Deprecado** | → `user_profiles.id` |
| `created_by` | **Activo (auditoría)** | → `user_profiles.id` — el usuario logueado que registró |

> [!WARNING]
> `captured_by_user_id` sigue existiendo en la tabla por compatibilidad, pero NO debe usarse en código nuevo. Todo el código actual usa `captador_id`.

## Flujo del captador en el formulario

1. El usuario ve un **select** con captadores activos (muestra nombre + tipo)
2. Si el captador no existe, presiona **"+ Nuevo"** → se abre un modal
3. En el modal registra: nombre, tipo interno/externo, email, teléfono, notas
4. Al guardar, el captador se crea y se **auto-selecciona** en el formulario
5. El `captador_id` es **obligatorio** — no se puede registrar un prospecto sin captador

## Regla de negocio clave

> [!CAUTION]
> **Comisiones**: El captador que logra que un prospecto pase a asociado (conversión en Hito 5) recibe una comisión. Por eso es fundamental que este campo se registre correctamente desde el inicio y no se auto-asigne al usuario logueado. El campo `is_internal` servirá para diferenciar el tipo de comisión aplicable.

## Archivos que quedaron sin uso (pero no eliminados)

- [UserProfileSelect.jsx](file:///Users/areadeti/Proyectos/asociados-mvp/src/components/molecules/UserProfileSelect.jsx) — Ya no se usa en prospectos, podría servir en otros módulos
- [useActiveUsers.js](file:///Users/areadeti/Proyectos/asociados-mvp/src/hooks/useActiveUsers.js) — Idem, disponible para otros contextos
