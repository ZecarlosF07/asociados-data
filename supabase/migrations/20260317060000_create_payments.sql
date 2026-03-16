-- ============================================
-- Tabla: payments
-- Pagos registrados realmente
-- ============================================

create table if not exists public.payments (
  id                      uuid primary key default gen_random_uuid(),
  associate_id            uuid not null references public.associates(id),
  membership_id           uuid references public.memberships(id),
  payment_schedule_id     uuid references public.payment_schedules(id),
  payment_date            date not null,
  amount_paid             numeric(12,2) not null,
  currency_code           varchar(10) not null default 'PEN',
  operation_code          varchar(120) not null,
  payment_method_id       uuid references public.catalog_items(id),
  reference_notes         text,
  registered_by_user_id   uuid references public.user_profiles(id),
  is_reversed             boolean not null default false,
  reversed_at             timestamptz,
  reversal_reason         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  created_by              uuid references public.user_profiles(id),
  updated_by              uuid references public.user_profiles(id),
  is_deleted              boolean not null default false,
  deleted_at              timestamptz,
  deleted_by              uuid references public.user_profiles(id)
);

-- Índices
create index if not exists idx_payments_associate
  on public.payments(associate_id);

create index if not exists idx_payments_membership
  on public.payments(membership_id);

create index if not exists idx_payments_schedule
  on public.payments(payment_schedule_id);

create index if not exists idx_payments_date
  on public.payments(payment_date);

create index if not exists idx_payments_not_deleted
  on public.payments(is_deleted)
  where is_deleted = false;
