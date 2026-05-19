-- ============================================
-- Hito S13 ajuste: lecturas internas transversales
-- ============================================
-- Los permisos por modulo siguen controlando navegacion y acciones.
-- Estas policies solo habilitan lectura basica para que las pantallas puedan
-- resolver nombres, etiquetas y relaciones sin abrir escritura fuera del rol.

drop policy if exists associates_memberships_reference_read on public.associates;
drop policy if exists categories_memberships_reference_read on public.categories;

drop policy if exists associates_internal_reference_read on public.associates;
create policy associates_internal_reference_read on public.associates
  for select to authenticated
  using (
    is_deleted = false
    and public.current_user_profile_id() is not null
  );

drop policy if exists prospects_internal_reference_read on public.prospects;
create policy prospects_internal_reference_read on public.prospects
  for select to authenticated
  using (
    is_deleted = false
    and public.current_user_profile_id() is not null
  );

drop policy if exists captadores_internal_reference_read on public.captadores;
create policy captadores_internal_reference_read on public.captadores
  for select to authenticated
  using (
    is_deleted = false
    and public.current_user_profile_id() is not null
  );

drop policy if exists categories_internal_reference_read on public.categories;
create policy categories_internal_reference_read on public.categories
  for select to authenticated
  using (
    is_deleted = false
    and public.current_user_profile_id() is not null
  );

drop policy if exists catalog_items_operational_reference_read on public.catalog_items;
drop policy if exists catalog_items_internal_reference_read on public.catalog_items;
create policy catalog_items_internal_reference_read on public.catalog_items
  for select to authenticated
  using (
    is_deleted = false
    and public.current_user_profile_id() is not null
  );

drop policy if exists catalog_groups_operational_reference_read on public.catalog_groups;
drop policy if exists catalog_groups_internal_reference_read on public.catalog_groups;
create policy catalog_groups_internal_reference_read on public.catalog_groups
  for select to authenticated
  using (
    is_active = true
    and public.current_user_profile_id() is not null
  );

drop policy if exists user_profiles_internal_reference_read on public.user_profiles;
create policy user_profiles_internal_reference_read on public.user_profiles
  for select to authenticated
  using (
    is_deleted = false
    and public.current_user_profile_id() is not null
  );
