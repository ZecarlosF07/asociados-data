-- ============================================
-- Tabla: associate_area_contacts
-- Contactos por área del asociado
-- ============================================

create table if not exists public.associate_area_contacts (
  id              uuid primary key default gen_random_uuid(),
  associate_id    uuid not null references public.associates(id),
  area_id         uuid not null references public.catalog_items(id),
  full_name       varchar(180) not null,
  position        varchar(120),
  email           varchar(180),
  phone           varchar(30),
  is_primary      boolean not null default false,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references public.user_profiles(id),
  updated_by      uuid references public.user_profiles(id),
  is_deleted      boolean not null default false,
  deleted_at      timestamptz,
  deleted_by      uuid references public.user_profiles(id)
);

-- Índices
create index if not exists idx_area_contacts_associate
  on public.associate_area_contacts(associate_id);

create index if not exists idx_area_contacts_area
  on public.associate_area_contacts(area_id);

create index if not exists idx_area_contacts_not_deleted
  on public.associate_area_contacts(is_deleted)
  where is_deleted = false;
