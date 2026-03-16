-- ============================================
-- Seed: Grupos de catálogos del sistema
-- Basado en el diccionario de tablas v2
-- ============================================

insert into public.catalog_groups (code, name, description) values
  ('PROSPECT_STATUS',      'Estado de prospecto',          'Estados del ciclo de vida del prospecto'),
  ('ASSOCIATE_STATUS',     'Estado de asociado',           'Estados del ciclo de vida del asociado'),
  ('MEMBERSHIP_STATUS',    'Estado de membresía',          'Estados de la membresía'),
  ('MEMBERSHIP_TYPE',      'Tipo de membresía',            'Tipos de membresía disponibles'),
  ('PAYMENT_METHOD',       'Método de pago',               'Medios de pago aceptados'),
  ('CONTACT_TYPE',         'Tipo de contacto',             'Medios de contacto para cobranza'),
  ('COMPANY_SIZE',         'Tamaño de empresa',            'Clasificación por tamaño'),
  ('ACTIVITY_TYPE',        'Tipo de actividad',            'Tipos de actividad económica'),
  ('DOCUMENT_TYPE',        'Tipo de documento',            'Tipos de documentos almacenables'),
  ('DOCUMENT_CATEGORY',    'Categoría de documento',       'Categorías documentales'),
  ('COLLECTION_STATUS',    'Estado de cobranza',           'Estados del proceso de cobranza'),
  ('COLLECTION_RESULT',    'Resultado de gestión',         'Resultados de una gestión de cobranza'),
  ('PERSON_ROLE',          'Rol de persona',               'Roles de personas vinculadas al asociado'),
  ('AREA',                 'Área empresarial',             'Áreas de contacto del asociado'),
  ('PAYMENT_HEALTH',       'Salud de pago',                'Indicador de salud de pagos del asociado'),
  ('QUOTE_STATUS',         'Estado de cotización',         'Estados de la cotización del prospecto'),
  ('NODE_TYPE',            'Tipo de nodo',                 'Tipos de nodo para almacenamiento documental'),
  ('DRIVE_SYNC_STATUS',    'Estado de sincronización',     'Estados de sincronización hacia Drive'),
  ('SUMMARY_STATUS',       'Estado de resumen IA',         'Estados del resumen generado por IA')
on conflict (code) do nothing;
