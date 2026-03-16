-- ============================================
-- Tabla: captadores
-- Personas que captan prospectos (internas o externas)
-- Clave para el seguimiento de comisiones
-- ============================================

create table if not exists public.captadores (
  id              uuid primary key default gen_random_uuid(),
  full_name       varchar(180) not null,
  is_internal     boolean not null default false,
  user_profile_id uuid references public.user_profiles(id),
  email           varchar(180),
  phone           varchar(30),
  notes           text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references public.user_profiles(id),
  updated_by      uuid references public.user_profiles(id),
  is_deleted      boolean not null default false,
  deleted_at      timestamptz,
  deleted_by      uuid references public.user_profiles(id)
);

create index if not exists idx_captadores_active
  on public.captadores(is_active) where is_deleted = false;

-- ============================================
-- Agregar columna captador_id a prospects
-- Reemplaza captured_by_user_id como referencia principal
-- ============================================

alter table public.prospects
  add column if not exists captador_id uuid references public.captadores(id);

create index if not exists idx_prospects_captador
  on public.prospects(captador_id);

-- Comentario para dejar claro que captured_by_user_id queda deprecado
comment on column public.prospects.captured_by_user_id is
  'Deprecado: usar captador_id en su lugar';
