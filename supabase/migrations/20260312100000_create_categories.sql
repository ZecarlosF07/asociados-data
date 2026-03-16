-- ============================================
-- Tabla: categories
-- Categorías del asociado o del prospecto
-- Entidad propia (no catálogo simple)
-- ============================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  code varchar(50) not null,
  name varchar(120) not null,
  description text,
  min_score numeric(5,2),
  max_score numeric(5,2),
  base_fee numeric(12,2),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid,

  constraint uq_categories_code unique (code),
  constraint fk_categories_created_by foreign key (created_by) references public.user_profiles(id),
  constraint fk_categories_updated_by foreign key (updated_by) references public.user_profiles(id),
  constraint fk_categories_deleted_by foreign key (deleted_by) references public.user_profiles(id)
);

-- Trigger para updated_at
create trigger trg_categories_updated_at
  before update on public.categories
  for each row
  execute function public.fn_set_updated_at();

-- Índice
create index idx_categories_active on public.categories(is_active)
  where is_deleted = false;

comment on table public.categories is 'Categorías del asociado o prospecto. Tabla propia por lógica de negocio.';
