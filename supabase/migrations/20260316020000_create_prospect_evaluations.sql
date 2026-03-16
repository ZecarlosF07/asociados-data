-- ============================================
-- Tabla: prospect_evaluations
-- Evaluaciones de membresía realizadas al prospecto
-- ============================================

create table if not exists public.prospect_evaluations (
  id                          uuid primary key default gen_random_uuid(),
  prospect_id                 uuid not null references public.prospects(id) on delete cascade,
  export_import_score         smallint not null default 0,
  social_participation_score  smallint not null default 0,
  innovation_score            smallint not null default 0,
  prico_score                 smallint not null default 0,
  market_size_score           smallint not null default 0,
  growth_opportunity_score    smallint not null default 0,
  representative_company_score smallint not null default 0,
  qualified_staff_score       smallint not null default 0,
  competitive_advantage_score smallint not null default 0,
  average_score               numeric(5,2) not null default 0,
  suggested_category_id       uuid references public.categories(id),
  suggested_fee               numeric(12,2),
  observations                text,
  is_current                  boolean not null default true,
  created_at                  timestamptz not null default now(),
  created_by                  uuid references public.user_profiles(id),
  is_deleted                  boolean not null default false,
  deleted_at                  timestamptz,
  deleted_by                  uuid references public.user_profiles(id)
);

create index if not exists idx_prospect_evaluations_prospect
  on public.prospect_evaluations(prospect_id);
create index if not exists idx_prospect_evaluations_current
  on public.prospect_evaluations(prospect_id, is_current)
  where is_current = true and is_deleted = false;
