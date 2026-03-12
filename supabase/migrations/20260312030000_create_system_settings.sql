-- ============================================
-- Tabla: system_settings
-- Configuraciones globales administrables
-- ============================================

create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key varchar(120) not null,
  setting_value jsonb not null default '{}',
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid,

  constraint uq_system_settings_key unique (setting_key),
  constraint fk_system_settings_created_by foreign key (created_by) references public.user_profiles(id),
  constraint fk_system_settings_updated_by foreign key (updated_by) references public.user_profiles(id),
  constraint fk_system_settings_deleted_by foreign key (deleted_by) references public.user_profiles(id)
);

-- Trigger para updated_at
create trigger trg_system_settings_updated_at
  before update on public.system_settings
  for each row
  execute function public.fn_set_updated_at();

comment on table public.system_settings is 'Configuraciones generales del sistema, lectura desde frontend según is_public';
