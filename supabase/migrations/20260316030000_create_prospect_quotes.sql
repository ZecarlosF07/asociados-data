-- ============================================
-- Tabla: prospect_quotes
-- Cotizaciones emitidas a prospectos
-- ============================================

create table if not exists public.prospect_quotes (
  id                uuid primary key default gen_random_uuid(),
  prospect_id       uuid not null references public.prospects(id) on delete cascade,
  quote_number      varchar(40) not null unique,
  issue_date        date not null default current_date,
  expiration_date   date,
  category_id       uuid references public.categories(id),
  quoted_amount     numeric(12,2) not null,
  currency_code     varchar(10) not null default 'PEN',
  quote_status_id   uuid not null references public.catalog_items(id),
  sent_at           timestamptz,
  sent_to_email     varchar(180),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references public.user_profiles(id),
  updated_by        uuid references public.user_profiles(id),
  is_deleted        boolean not null default false,
  deleted_at        timestamptz,
  deleted_by        uuid references public.user_profiles(id)
);

create index if not exists idx_prospect_quotes_prospect
  on public.prospect_quotes(prospect_id);

-- Secuencia para el correlativo de cotización
create sequence if not exists prospect_quote_seq start 1;
