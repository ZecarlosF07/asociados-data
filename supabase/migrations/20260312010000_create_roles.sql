-- ============================================
-- Tabla: roles
-- Rangos o perfiles funcionales del sistema
-- ============================================

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code varchar(50) not null,
  name varchar(100) not null,
  description text,
  is_active boolean not null default true,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_roles_code unique (code)
);

-- Trigger para actualizar updated_at automáticamente
create or replace function public.fn_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_roles_updated_at
  before update on public.roles
  for each row
  execute function public.fn_set_updated_at();

comment on table public.roles is 'Roles o rangos funcionales del sistema';
