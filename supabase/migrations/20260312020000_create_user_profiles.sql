-- ============================================
-- Tabla: user_profiles
-- Perfil interno del usuario autenticado
-- ============================================

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null,
  role_id uuid not null,
  first_name varchar(120) not null,
  last_name varchar(120) not null,
  institutional_email varchar(180) not null,
  dni varchar(20) not null,
  is_active boolean not null default true,
  last_login_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid,

  constraint uq_user_profiles_auth_user_id unique (auth_user_id),
  constraint uq_user_profiles_email unique (institutional_email),
  constraint uq_user_profiles_dni unique (dni),
  constraint fk_user_profiles_role foreign key (role_id) references public.roles(id),
  constraint fk_user_profiles_created_by foreign key (created_by) references public.user_profiles(id),
  constraint fk_user_profiles_updated_by foreign key (updated_by) references public.user_profiles(id),
  constraint fk_user_profiles_deleted_by foreign key (deleted_by) references public.user_profiles(id)
);

-- Trigger para updated_at
create trigger trg_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function public.fn_set_updated_at();

-- Índices
create index idx_user_profiles_role_id on public.user_profiles(role_id);
create index idx_user_profiles_is_active on public.user_profiles(is_active) where is_deleted = false;

comment on table public.user_profiles is 'Perfil interno del usuario autenticado, separado de auth.users';
