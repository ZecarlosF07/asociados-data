-- ============================================
-- Tabla: prospect_status_history
-- Historial de cambios de estado del prospecto
-- ============================================

create table if not exists public.prospect_status_history (
  id                  uuid primary key default gen_random_uuid(),
  prospect_id         uuid not null references public.prospects(id) on delete cascade,
  previous_status_id  uuid references public.catalog_items(id),
  new_status_id       uuid not null references public.catalog_items(id),
  change_reason       text,
  changed_at          timestamptz not null default now(),
  changed_by          uuid references public.user_profiles(id),
  notes               text,
  is_deleted          boolean not null default false,
  deleted_at          timestamptz,
  deleted_by          uuid references public.user_profiles(id)
);

create index if not exists idx_prospect_status_history_prospect
  on public.prospect_status_history(prospect_id);
