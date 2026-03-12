-- ============================================
-- Seed: Roles iniciales del sistema
-- ============================================

insert into public.roles (code, name, description, is_active, is_system) values
  ('ADMIN', 'Administrador', 'Acceso total al sistema. Puede gestionar usuarios, configuración y todos los módulos.', true, true),
  ('OPERADOR', 'Operador', 'Acceso a módulos operativos: prospectos, asociados, membresías, cobranza y documentos.', true, true),
  ('CONSULTA', 'Solo consulta', 'Acceso de solo lectura a la información del sistema. No puede crear ni editar registros.', true, true)
on conflict (code) do nothing;
