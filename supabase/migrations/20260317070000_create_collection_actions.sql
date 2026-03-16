-- ============================================
-- Tabla: collection_actions
-- Gestiones de cobranza realizadas
-- ============================================

create table if not exists public.collection_actions (
  id                    uuid primary key default gen_random_uuid(),
  associate_id          uuid not null references public.associates(id),
  payment_schedule_id   uuid references public.payment_schedules(id),
  action_date           timestamptz not null default now(),
  managed_by_user_id    uuid not null references public.user_profiles(id),
  contact_type_id       uuid not null references public.catalog_items(id),
  subject               varchar(200) not null,
  short_observation     text,
  mail_to               varchar(180),
  action_result_id      uuid references public.catalog_items(id),
  next_follow_up_at     timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  created_by            uuid references public.user_profiles(id),
  updated_by            uuid references public.user_profiles(id),
  is_deleted            boolean not null default false,
  deleted_at            timestamptz,
  deleted_by            uuid references public.user_profiles(id)
);

-- Índices
create index if not exists idx_collection_associate
  on public.collection_actions(associate_id);

create index if not exists idx_collection_schedule
  on public.collection_actions(payment_schedule_id);

create index if not exists idx_collection_date
  on public.collection_actions(action_date);

create index if not exists idx_collection_not_deleted
  on public.collection_actions(is_deleted)
  where is_deleted = false;
