-- ============================================
-- Tabla: prospects
-- Empresas prospecto aún no convertidas en asociadas
-- ============================================

create table if not exists public.prospects (
  id                      uuid primary key default gen_random_uuid(),
  company_name            varchar(220) not null,
  trade_name              varchar(220),
  ruc                     varchar(20),
  economic_activity       varchar(180),
  activity_type_id        uuid references public.catalog_items(id),
  company_size_id         uuid references public.catalog_items(id),
  primary_email           varchar(180),
  contact_name            varchar(180),
  contact_position        varchar(120),
  contact_phone           varchar(30),
  captured_by_user_id     uuid references public.user_profiles(id),
  prospect_status_id      uuid not null references public.catalog_items(id),
  current_category_id     uuid references public.categories(id),
  suggested_fee           numeric(12,2),
  negotiated_fee          numeric(12,2),
  source                  varchar(120),
  notes                   text,
  converted_to_associate_id uuid,
  converted_at            timestamptz,
  discarded_reason        text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  created_by              uuid references public.user_profiles(id),
  updated_by              uuid references public.user_profiles(id),
  is_deleted              boolean not null default false,
  deleted_at              timestamptz,
  deleted_by              uuid references public.user_profiles(id)
);

-- Índices útiles
create index if not exists idx_prospects_status on public.prospects(prospect_status_id);
create index if not exists idx_prospects_category on public.prospects(current_category_id);
create index if not exists idx_prospects_captured_by on public.prospects(captured_by_user_id);
create index if not exists idx_prospects_not_deleted on public.prospects(is_deleted) where is_deleted = false;

-- Unique parcial para RUC (solo si no es nulo y no está eliminado)
create unique index if not exists idx_prospects_ruc_unique
  on public.prospects(ruc)
  where ruc is not null and is_deleted = false;
