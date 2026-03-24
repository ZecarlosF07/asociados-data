-- ============================================
-- Hito 7: Árbol lógico de almacenamiento
-- ============================================

create table if not exists public.storage_nodes (
  id              uuid primary key default gen_random_uuid(),
  parent_id       uuid null references public.storage_nodes(id),
  node_type_id    uuid not null references public.catalog_items(id),
  name            varchar(180) not null,
  slug            varchar(180) null,
  sort_order      integer not null default 0,
  associate_id    uuid null references public.associates(id),
  committee_id    uuid null,
  year_number     integer null,
  month_number    smallint null,
  is_system_generated boolean not null default false,
  notes           text null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid null,
  updated_by      uuid null,
  is_deleted      boolean not null default false,
  deleted_at      timestamptz null,
  deleted_by      uuid null
);

-- Índices
create index if not exists idx_storage_nodes_parent
  on public.storage_nodes(parent_id)
  where is_deleted = false;

create index if not exists idx_storage_nodes_associate
  on public.storage_nodes(associate_id)
  where is_deleted = false and associate_id is not null;

create index if not exists idx_storage_nodes_type
  on public.storage_nodes(node_type_id)
  where is_deleted = false;
