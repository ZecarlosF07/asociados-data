-- ============================================
-- Seed: Categorías iniciales del sistema
-- Basado en la estructura del negocio
-- ============================================

insert into public.categories (code, name, description, min_score, max_score, base_fee, sort_order)
values
  ('CAT_A', 'Categoría A', 'Categoría principal — empresas de mayor representatividad', 2.50, 3.00, 15000.00, 1),
  ('CAT_B', 'Categoría B', 'Empresas con presencia significativa en el mercado',        2.00, 2.49,  9000.00, 2),
  ('CAT_C', 'Categoría C', 'Empresas medianas con participación regular',               1.50, 1.99,  5500.00, 3),
  ('CAT_D', 'Categoría D', 'Empresas pequeñas o en etapa de crecimiento',               1.00, 1.49,  3000.00, 4),
  ('CAT_E', 'Categoría E', 'Empresas micro o de reciente incorporación',                0.00, 0.99,  1500.00, 5)
on conflict (code) do nothing;
