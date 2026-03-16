-- ============================================
-- Tabla: associates
-- Ficha principal de la empresa asociada
-- ============================================

create table if not exists public.associates (
  id                              uuid primary key default gen_random_uuid(),
  internal_code                   varchar(30) not null,
  book_registry                   varchar(80),
  welcome_status                  boolean not null default false,
  affiliation_responsible_user_id uuid references public.user_profiles(id),
  category_id                     uuid references public.categories(id),
  associate_status_id             uuid not null references public.catalog_items(id),
  ruc                             varchar(20) not null,
  company_name                    varchar(220) not null,
  trade_name                      varchar(220),
  address                         text,
  association_date                date,
  anniversary_date                date,
  landline_phone                  varchar(30),
  mobile_phone_1                  varchar(30),
  mobile_phone_2                  varchar(30),
  corporate_email                 varchar(180),
  website                         varchar(220),
  economic_activity               varchar(180),
  activity_type_id                uuid references public.catalog_items(id),
  company_size_id                 uuid references public.catalog_items(id),
  prospect_origin_id              uuid references public.prospects(id),
  captador_id                     uuid references public.captadores(id),
  inactivation_reason             text,
  inactivated_at                  timestamptz,
  last_interaction_at             timestamptz,
  compliance_percentage           numeric(5,2),
  payment_health_status_id        uuid references public.catalog_items(id),
  notes                           text,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now(),
  created_by                      uuid references public.user_profiles(id),
  updated_by                      uuid references public.user_profiles(id),
  is_deleted                      boolean not null default false,
  deleted_at                      timestamptz,
  deleted_by                      uuid references public.user_profiles(id)
);

-- Índices
create unique index if not exists idx_associates_code
  on public.associates(internal_code)
  where is_deleted = false;

create unique index if not exists idx_associates_ruc
  on public.associates(ruc)
  where is_deleted = false;

create index if not exists idx_associates_status
  on public.associates(associate_status_id);

create index if not exists idx_associates_category
  on public.associates(category_id);

create index if not exists idx_associates_prospect
  on public.associates(prospect_origin_id);

create index if not exists idx_associates_not_deleted
  on public.associates(is_deleted)
  where is_deleted = false;

-- Agregar FK en prospects para enlace de conversión
alter table public.prospects
  drop constraint if exists fk_prospects_converted_associate;

alter table public.prospects
  add constraint fk_prospects_converted_associate
  foreign key (converted_to_associate_id)
  references public.associates(id);
