-- ============================================
-- Tabla: associate_people
-- Personas principales vinculadas al asociado
-- (representante legal, gerente general, etc.)
-- ============================================

create table if not exists public.associate_people (
  id              uuid primary key default gen_random_uuid(),
  associate_id    uuid not null references public.associates(id),
  person_role_id  uuid not null references public.catalog_items(id),
  full_name       varchar(180) not null,
  position        varchar(120),
  email           varchar(180),
  dni             varchar(20),
  phone           varchar(30),
  birthday        date,
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
create index if not exists idx_associate_people_associate
  on public.associate_people(associate_id);

create index if not exists idx_associate_people_role
  on public.associate_people(person_role_id);

create index if not exists idx_associate_people_not_deleted
  on public.associate_people(is_deleted)
  where is_deleted = false;
