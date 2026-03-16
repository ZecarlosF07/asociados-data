-- ============================================
-- Tabla: catalog_items
-- Valores de los catálogos simples
-- ============================================

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null,
  code varchar(80) not null,
  label varchar(150) not null,
  sort_order integer not null default 0,
  meta jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid,

  constraint fk_catalog_items_group foreign key (group_id) references public.catalog_groups(id),
  constraint fk_catalog_items_deleted_by foreign key (deleted_by) references public.user_profiles(id)
);

-- Índice compuesto para unicidad de código dentro de un grupo
create unique index uq_catalog_items_group_code
  on public.catalog_items(group_id, code)
  where is_deleted = false;

-- Índices de consulta
create index idx_catalog_items_group_id on public.catalog_items(group_id);
create index idx_catalog_items_active on public.catalog_items(group_id, is_active)
  where is_deleted = false;

-- Trigger para updated_at
create trigger trg_catalog_items_updated_at
  before update on public.catalog_items
  for each row
  execute function public.fn_set_updated_at();

comment on table public.catalog_items is 'Valores de catálogos simples. No usar para entidades con lógica propia.';
