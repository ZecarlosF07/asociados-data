-- ============================================
-- Seed: Usuario administrador inicial
-- 
-- IMPORTANTE:
-- Este script crea un usuario admin en auth.users
-- de Supabase y su perfil correspondiente en
-- user_profiles.
--
-- Cambia los valores de email, password, nombre,
-- apellido y DNI según tu necesidad ANTES de ejecutar.
-- ============================================

-- 1. Crear usuario en auth.users de Supabase
-- Se usa la función de Supabase para crear un usuario con password
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) values (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'fvillarruel@camaraica.org.pe',
  crypt('FLA3QO&c26', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Admin","last_name":"Sistema"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- 2. Crear identidad vinculada al usuario
insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  u.id,
  u.id,
  json_build_object('sub', u.id::text, 'email', u.email),
  'email',
  u.id::text,
  now(),
  now(),
  now()
from auth.users u
where u.email = 'fvillarruel@camaraica.org.pe';

-- 3. Crear perfil interno vinculado
insert into public.user_profiles (
  auth_user_id,
  role_id,
  first_name,
  last_name,
  institutional_email,
  dni,
  is_active
)
select
  u.id,
  r.id,
  'Fernando',
  'Villarruel',
  'fvillarruel@camaraica.org.pe',
  '00000000',
  true
from auth.users u
cross join public.roles r
where u.email = 'fvillarruel@camaraica.org.pe'
  and r.code = 'ADMIN';
