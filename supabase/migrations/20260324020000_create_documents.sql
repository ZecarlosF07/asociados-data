-- ============================================
-- Hito 7: Tabla de documentos
-- Metadatos de archivos almacenados en Supabase Storage
-- ============================================

create table if not exists public.documents (
  id                      uuid primary key default gen_random_uuid(),
  storage_node_id         uuid null references public.storage_nodes(id),
  associate_id            uuid null references public.associates(id),
  prospect_id             uuid null references public.prospects(id),
  committee_id            uuid null,
  committee_meeting_id    uuid null,
  document_category_id    uuid null references public.catalog_items(id),
  document_type_id        uuid null references public.catalog_items(id),
  title                   varchar(220) not null,
  original_filename       varchar(255) not null,
  storage_bucket          varchar(100) not null default 'documents',
  storage_path            text not null,
  mime_type               varchar(120) null,
  file_extension          varchar(20) null,
  size_bytes              bigint null,
  version_number          integer not null default 1,
  replaces_document_id    uuid null references public.documents(id),
  is_latest_version       boolean not null default true,
  uploaded_by_user_id     uuid null,
  uploaded_at             timestamptz not null default now(),
  mirror_drive_status_id  uuid null references public.catalog_items(id),
  mirror_drive_path       text null,
  notes                   text null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  created_by              uuid null,
  updated_by              uuid null,
  is_deleted              boolean not null default false,
  deleted_at              timestamptz null,
  deleted_by              uuid null
);

-- Índice único en storage_path
create unique index if not exists idx_documents_storage_path
  on public.documents(storage_path)
  where is_deleted = false;

-- Índices de búsqueda
create index if not exists idx_documents_associate
  on public.documents(associate_id)
  where is_deleted = false and associate_id is not null;

create index if not exists idx_documents_prospect
  on public.documents(prospect_id)
  where is_deleted = false and prospect_id is not null;

create index if not exists idx_documents_category
  on public.documents(document_category_id)
  where is_deleted = false;

create index if not exists idx_documents_type
  on public.documents(document_type_id)
  where is_deleted = false;

create index if not exists idx_documents_node
  on public.documents(storage_node_id)
  where is_deleted = false and storage_node_id is not null;

create index if not exists idx_documents_latest_version
  on public.documents(is_latest_version)
  where is_deleted = false and is_latest_version = true;
