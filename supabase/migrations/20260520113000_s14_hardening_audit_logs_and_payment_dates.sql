-- Migración S14: Hardening de Auditoría y Fechas de Pago
-- Remueve la política que permite insertar auditoría directamente desde el cliente.

drop policy if exists audit_logs_insert on public.audit_logs;
