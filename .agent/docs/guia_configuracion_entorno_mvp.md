# Guía de configuración de entorno MVP

## Requisitos

- Node.js compatible con Vite.
- Yarn.
- Supabase CLI si se trabaja con flujo CLI.
- Proyecto Supabase remoto o local configurado.

## Variables de entorno frontend

Crear `.env` con:

```bash
VITE_SUPABASE_URL=<url-del-proyecto-supabase>
VITE_SUPABASE_ANON_KEY=<anon-key-del-proyecto>
```

Opcional, si se usa publishable key:

```bash
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<publishable-key>
```

No subir credenciales sensibles al repositorio.

## Instalación

```bash
yarn install
```

## Desarrollo local

```bash
yarn dev
```

## Lint

```bash
yarn lint
```

## Build de producción

```bash
yarn build
```

## Supabase remoto con SQL Editor

Si las migraciones se ejecutan manualmente desde SQL Editor:

1. Ejecutar migraciones en orden cronológico desde `supabase/migrations`.
2. Ejecutar audits desde `supabase/audits`.
3. Guardar evidencia de resultados en el checklist QA.

Orden de hitos S aplicado:

1. `20260507010000_s1_permissions_rls.sql`
2. `20260507020000_s2_associate_conversion_integrity.sql`
3. `20260507030000_s3_payments_financial_integrity.sql`
4. `20260511010000_s5_reports_automation_foundation.sql`

S4 no requiere migración porque usa el bucket y policies configuradas en S1.
S6 no requiere migración porque es QA, seeds y release.

## Supabase con CLI

Flujo esperado:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Para consultar audits:

```bash
supabase db query --linked --output json -f supabase/audits/hito_s6_seed_release_audit.sql
```

Si la cuenta CLI no tiene permisos suficientes, ejecutar el contenido del audit desde SQL Editor.

## Bucket documental

Bucket requerido:

- id: `documents`
- privado: `true`
- tamaño máximo: 20 MB

Policies esperadas:

- `documents_storage_read`
- `documents_storage_insert`
- `documents_storage_update`
- `documents_storage_delete`

La aplicación descarga mediante URL firmada con expiración.

## Usuario administrador inicial

Existe un seed de administrador inicial en:

- `supabase/migrations/20260312070000_seed_admin_user.sql`

Antes de un uso operativo real:

- revisar correo y datos del usuario
- rotar la contraseña inicial
- confirmar que el perfil interno tiene rol `ADMIN`

## Validación final

Ejecutar:

```bash
yarn lint
yarn build
```

Luego ejecutar:

```sql
-- contenido de supabase/audits/hito_s6_seed_release_audit.sql
```

Finalmente completar:

- `.agent/docs/qa_checklist_mvp.md`
