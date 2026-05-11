# Hito S5 — Automatizaciones base

## Modelo persistente

La migración S5 agrega:

- `public.automation_jobs`
- `public.automation_job_runs`

`automation_jobs` almacena la definición persistente de una automatización:

- `code`
- `name`
- `job_type`
- `status`
- `config`
- `last_run_at`
- `next_run_at`
- `last_result`
- `last_error`

`automation_job_runs` almacena ejecuciones:

- job asociado
- estado
- inicio y fin
- resultado JSON
- error
- usuario que disparó la ejecución

## Jobs candidatos

Se dejan registrados como `PAUSED`:

- `RECALCULATE_PAYMENT_HEALTH`
- `DETECT_OVERDUE_SCHEDULES`
- `PREPARE_COLLECTION_REMINDERS`
- `GENERATE_OPERATIONAL_SUMMARY`
- `DETECT_UNCONTEXTUALIZED_DOCUMENTS`

## Ejecución futura

Este hito no envía correos ni WhatsApp. La ejecución puede implementarse después con:

- Supabase Edge Functions programadas
- GitHub Actions programadas
- un worker externo
- automatizaciones internas de Codex si se decide operar desde el entorno local

Cada ejecución deberá:

1. leer jobs `ACTIVE` con `next_run_at <= now()`
2. crear `automation_job_runs`
3. ejecutar la acción específica
4. actualizar `last_run_at`, `next_run_at`, `last_result` o `last_error`

## Seguridad

Las tablas tienen RLS:

- lectura con `reportes/read`
- escritura con `reportes/admin`
