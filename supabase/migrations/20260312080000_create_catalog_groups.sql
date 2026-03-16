-- ============================================
-- Tabla: catalog_groups
-- Agrupa los tipos de catálogos simples
-- ============================================

create table if not exists public.catalog_groups (
  id uuid primary key default gen_random_uuid(),
  code varchar(80) not null,
  name varchar(120) not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_catalog_groups_code unique (code)
);

-- Trigger para updated_at
create trigger trg_catalog_groups_updated_at
  before update on public.catalog_groups
  for each row
  execute function public.fn_set_updated_at();

comment on table public.catalog_groups is 'Agrupa los tipos de catálogos simples del sistema';
