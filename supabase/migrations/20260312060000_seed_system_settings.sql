-- ============================================
-- Seed: Configuraciones iniciales del sistema
-- ============================================

insert into public.system_settings (setting_key, setting_value, description, is_public) values
  ('app_name', '"Sistema de Asociados"', 'Nombre visible de la aplicación', true),
  ('app_currency', '"PEN"', 'Moneda predeterminada del sistema', true),
  ('pagination_default_size', '20', 'Cantidad de registros por página por defecto', true),
  ('prospect_evaluation_max_score', '3', 'Puntaje máximo por criterio de evaluación de prospecto', true),
  ('membership_default_currency', '"PEN"', 'Moneda predeterminada para membresías', true),
  ('audit_enabled', 'true', 'Si la auditoría global está habilitada', false)
on conflict (setting_key) do nothing;
