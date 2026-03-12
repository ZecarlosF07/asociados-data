-- ============================================
-- Tabla: audit_logs
-- Bitácora global de auditoría
-- No usa soft delete (registros permanentes)
-- ============================================

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_at timestamptz not null default now(),
  actor_user_id uuid,
  entity_name varchar(120) not null,
  entity_id uuid,
  action_type varchar(60) not null,
  previous_data jsonb,
  new_data jsonb,
  summary text,
  ip_address inet,
  user_agent text,
  extra_meta jsonb,

  constraint fk_audit_logs_actor foreign key (actor_user_id) references public.user_profiles(id)
);

-- Índices para consultas de auditoría
create index idx_audit_logs_event_at on public.audit_logs(event_at desc);
create index idx_audit_logs_actor on public.audit_logs(actor_user_id);
create index idx_audit_logs_entity on public.audit_logs(entity_name, entity_id);
create index idx_audit_logs_action on public.audit_logs(action_type);

comment on table public.audit_logs is 'Registro permanente de acciones del sistema. No debe usar soft delete.';
