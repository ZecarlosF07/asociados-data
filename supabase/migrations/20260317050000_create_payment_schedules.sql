-- ============================================
-- Tabla: payment_schedules
-- Programación esperada de pagos
-- ============================================

create table if not exists public.payment_schedules (
  id                        uuid primary key default gen_random_uuid(),
  membership_id             uuid not null references public.memberships(id),
  associate_id              uuid not null references public.associates(id),
  due_date                  date not null,
  period_year               integer not null,
  period_month              smallint,
  expected_amount           numeric(12,2) not null,
  collection_status_id      uuid not null references public.catalog_items(id),
  is_paid                   boolean not null default false,
  paid_at                   timestamptz,
  payment_health_status_id  uuid references public.catalog_items(id),
  notes                     text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  created_by                uuid references public.user_profiles(id),
  updated_by                uuid references public.user_profiles(id),
  is_deleted                boolean not null default false,
  deleted_at                timestamptz,
  deleted_by                uuid references public.user_profiles(id)
);

-- Índices
create index if not exists idx_schedules_membership
  on public.payment_schedules(membership_id);

create index if not exists idx_schedules_associate
  on public.payment_schedules(associate_id);

create index if not exists idx_schedules_due_date
  on public.payment_schedules(due_date);

create index if not exists idx_schedules_pending
  on public.payment_schedules(is_paid, due_date)
  where is_paid = false and is_deleted = false;

create index if not exists idx_schedules_not_deleted
  on public.payment_schedules(is_deleted)
  where is_deleted = false;
