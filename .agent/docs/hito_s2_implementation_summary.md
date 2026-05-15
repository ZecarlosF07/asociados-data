# Hito S2 — Subsanación Hito 5: Conversión e integridad del asociado

## Estado

Implementado a nivel de migración, servicio frontend y manejo visible de errores.

## Cambios técnicos

### Base de datos

Archivo:

- `supabase/migrations/20260507020000_s2_associate_conversion_integrity.sql`

Se agregó:

- Tabla `public.entity_counters` para correlativos transaccionales por entidad y año.
- Inicialización del contador `ASSOCIATES` desde códigos existentes con formato `ASO-YYYY-XXXX`.
- Función `public.next_entity_code(...)` con `insert ... on conflict do update`, usando bloqueo transaccional de fila.
- RPC `public.convert_prospect_to_associate(...)` como `security definer`.
- Índice único parcial `idx_associates_prospect_origin_unique`.
- Índice único parcial `idx_prospects_converted_associate_unique`.
- Revocación de acceso directo a `entity_counters` para `anon` y `authenticated`.
- Permiso de ejecución solo para `convert_prospect_to_associate(...)` en rol `authenticated`.

### RPC de conversión

La función `public.convert_prospect_to_associate(...)` ejecuta en una sola transacción:

- valida permisos `prospectos:update` y `asociados:create`
- identifica al usuario autenticado con `current_user_profile_id()`
- bloquea el prospecto con `for update`
- valida prospecto existente, activo y aprobado
- valida que no esté convertido
- valida RUC obligatorio y no duplicado en asociados activos
- valida estado inicial de asociado
- valida responsable de afiliación activo cuando se envía
- genera `internal_code` con formato `ASO-YYYY-XXXX`
- inserta el asociado
- actualiza `prospects.converted_to_associate_id`
- actualiza `prospects.converted_at`
- registra auditoría explícita `convert_to_associate`
- retorna el asociado creado

### Frontend

Archivos modificados:

- `src/services/associates.service.js`
- `src/pages/prospects/ProspectDetailPage.jsx`
- `src/components/molecules/associates/ConvertProspectModal.jsx`

Cambios:

- Se eliminó la generación frontend por conteo.
- `convertFromProspect(...)` llama a `supabase.rpc('convert_prospect_to_associate', ...)`.
- El servicio recupera el asociado con joins mediante `getById(...)` después de la RPC.
- Se mapearon errores de permiso y duplicidad a mensajes de negocio.
- El modal ahora muestra errores de backend dentro del formulario.
- La página limpia errores al abrir/cerrar el modal.

## Auditoría operativa

Archivo:

- `supabase/audits/hito_s2_conversion_audit.sql`

Permite revisar:

- funciones creadas y si son `security definer`
- índices únicos requeridos
- estado del contador `ASSOCIATES`

## Validaciones ejecutadas

```bash
yarn lint
yarn build
```

Resultado:

- `yarn lint` pasó correctamente.
- `yarn build` pasó correctamente.
- El build mantiene el warning existente de chunk mayor a 500 kB.

## Validación de base de datos

La migración S2 fue aplicada por el responsable de BD y el audit fue validado por SQL Editor. Se confirmó:

- contador `ASSOCIATES` operativo
- RPC `convert_prospect_to_associate`
- RPC `next_entity_code`
- índices únicos de integridad para asociados y conversión

Audit usado: `supabase/audits/hito_s2_conversion_audit.sql`.

## Pruebas funcionales recomendadas

1. Convertir un prospecto aprobado y validar navegación a ficha de asociado.
2. Intentar convertir nuevamente el mismo prospecto.
3. Intentar convertir un prospecto no aprobado.
4. Intentar convertir con RUC ya usado por un asociado activo.
5. Validar que el prospecto queda con `converted_to_associate_id` y `converted_at`.
6. Validar que el asociado queda con `prospect_origin_id`.
7. Validar que se crea auditoría `convert_to_associate`.
8. Validar que el correlativo avanza por año.
