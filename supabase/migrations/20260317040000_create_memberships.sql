-- ============================================
-- Tabla: memberships
-- Membresías del asociado
-- ============================================

create table if not exists public.memberships (
  id                    uuid primary key default gen_random_uuid(),
  associate_id          uuid not null references public.associates(id),
  membership_type_id    uuid not null references public.catalog_items(id),
  category_id           uuid references public.categories(id),
  fee_amount            numeric(12,2) not null,
  currency_code         varchar(10) not null default 'PEN',
  start_date            date not null,
  monthly_billing_day   smallint,
  end_date              date,
  membership_status_id  uuid not null references public.catalog_items(id),
  negotiation_notes     text,
  is_current            boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  created_by            uuid references public.user_profiles(id),
  updated_by            uuid references public.user_profiles(id),
  is_deleted            boolean not null default false,
  deleted_at            timestamptz,
  deleted_by            uuid references public.user_profiles(id)
);

-- Índices
create index if not exists idx_memberships_associate
  on public.memberships(associate_id);

create index if not exists idx_memberships_status
  on public.memberships(membership_status_id);

create index if not exists idx_memberships_current
  on public.memberships(is_current)
  where is_current = true and is_deleted = false;

create index if not exists idx_memberships_not_deleted
  on public.memberships(is_deleted)
  where is_deleted = false;
