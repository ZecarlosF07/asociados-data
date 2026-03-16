-- ============================================
-- Seed: Ítems de catálogos del sistema
-- ============================================

-- Helper: insertar ítems usando el code del grupo
-- Usamos una CTE para evitar repetir subqueries

-- ==========================================
-- PROSPECT_STATUS
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('NUEVO',          'Nuevo',              1),
  ('EN_EVALUACION',  'En evaluación',      2),
  ('COTIZADO',       'Cotizado',           3),
  ('EN_SEGUIMIENTO', 'En seguimiento',     4),
  ('APROBADO',       'Aprobado',           5),
  ('CONVERTIDO',     'Convertido a socio', 6),
  ('DESCARTADO',     'Descartado',         7)
) as v(code, label, sort_order)
where g.code = 'PROSPECT_STATUS'
on conflict do nothing;

-- ==========================================
-- ASSOCIATE_STATUS
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('ACTIVO',      'Activo',      1),
  ('INACTIVO',    'Inactivo',    2),
  ('SUSPENDIDO',  'Suspendido',  3),
  ('EN_PROCESO',  'En proceso',  4)
) as v(code, label, sort_order)
where g.code = 'ASSOCIATE_STATUS'
on conflict do nothing;

-- ==========================================
-- MEMBERSHIP_STATUS
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('VIGENTE',    'Vigente',     1),
  ('VENCIDA',    'Vencida',     2),
  ('CANCELADA',  'Cancelada',   3),
  ('RENOVADA',   'Renovada',    4)
) as v(code, label, sort_order)
where g.code = 'MEMBERSHIP_STATUS'
on conflict do nothing;

-- ==========================================
-- MEMBERSHIP_TYPE
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('MENSUAL',  'Mensual',  1),
  ('ANUAL',    'Anual',    2)
) as v(code, label, sort_order)
where g.code = 'MEMBERSHIP_TYPE'
on conflict do nothing;

-- ==========================================
-- PAYMENT_METHOD
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('TRANSFERENCIA',     'Transferencia bancaria',  1),
  ('DEPOSITO',          'Depósito en cuenta',      2),
  ('CHEQUE',            'Cheque',                  3),
  ('EFECTIVO',          'Efectivo',                4),
  ('OTRO',              'Otro',                    5)
) as v(code, label, sort_order)
where g.code = 'PAYMENT_METHOD'
on conflict do nothing;

-- ==========================================
-- CONTACT_TYPE
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('CORREO',     'Correo electrónico',  1),
  ('TELEFONO',   'Teléfono',            2),
  ('WHATSAPP',   'WhatsApp',            3),
  ('PRESENCIAL', 'Presencial',          4),
  ('OTRO',       'Otro',                5)
) as v(code, label, sort_order)
where g.code = 'CONTACT_TYPE'
on conflict do nothing;

-- ==========================================
-- COMPANY_SIZE
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('MICRO',    'Microempresa',     1),
  ('PEQUENA',  'Pequeña empresa',  2),
  ('MEDIANA',  'Mediana empresa',  3),
  ('GRANDE',   'Gran empresa',     4)
) as v(code, label, sort_order)
where g.code = 'COMPANY_SIZE'
on conflict do nothing;

-- ==========================================
-- ACTIVITY_TYPE
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('INDUSTRIAL',   'Industrial',   1),
  ('COMERCIAL',    'Comercial',    2),
  ('SERVICIOS',    'Servicios',    3),
  ('AGROPECUARIO', 'Agropecuario', 4),
  ('MINERO',       'Minero',       5),
  ('OTRO',         'Otro',         6)
) as v(code, label, sort_order)
where g.code = 'ACTIVITY_TYPE'
on conflict do nothing;

-- ==========================================
-- DOCUMENT_TYPE
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('ACTA',           'Acta',                 1),
  ('LISTA_INVITADOS','Lista de invitados',   2),
  ('LISTA_ASISTENTES','Lista de asistentes', 3),
  ('OFICIO',         'Oficio',               4),
  ('CARTA',          'Carta',                5),
  ('FORMATO',        'Formato',              6),
  ('CERTIFICADO',    'Certificado',          7),
  ('INFORME',        'Informe',              8),
  ('OTRO',           'Otro documento',       9)
) as v(code, label, sort_order)
where g.code = 'DOCUMENT_TYPE'
on conflict do nothing;

-- ==========================================
-- DOCUMENT_CATEGORY
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('COMITES',     'Comités',               1),
  ('SOCIOS',      'Socios',                2),
  ('LOGOTIPOS',   'Logotipos',             3),
  ('GACETA',      'Gaceta',               4),
  ('REVISTA',     'Revista',              5),
  ('FORMATOS',    'Formatos generales',    6)
) as v(code, label, sort_order)
where g.code = 'DOCUMENT_CATEGORY'
on conflict do nothing;

-- ==========================================
-- COLLECTION_STATUS
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('PENDIENTE',    'Pendiente',            1),
  ('EN_GESTION',   'En gestión',           2),
  ('PARCIAL',      'Parcialmente pagado',  3),
  ('PAGADO',       'Pagado',               4),
  ('VENCIDO',      'Vencido',              5),
  ('ANULADO',      'Anulado',              6)
) as v(code, label, sort_order)
where g.code = 'COLLECTION_STATUS'
on conflict do nothing;

-- ==========================================
-- COLLECTION_RESULT
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('CONTACTADO',       'Contactado',            1),
  ('NO_CONTACTADO',    'No contactado',         2),
  ('COMPROMISO_PAGO',  'Compromiso de pago',    3),
  ('RECHAZO',          'Rechazo',               4),
  ('SIN_RESPUESTA',    'Sin respuesta',         5)
) as v(code, label, sort_order)
where g.code = 'COLLECTION_RESULT'
on conflict do nothing;

-- ==========================================
-- PERSON_ROLE
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('REPRESENTANTE_LEGAL',   'Representante legal',    1),
  ('GERENTE_GENERAL',       'Gerente general',        2),
  ('ASISTENTE_GERENCIA',    'Asistente de gerencia',  3),
  ('CONTACTO_PRINCIPAL',    'Contacto principal',     4)
) as v(code, label, sort_order)
where g.code = 'PERSON_ROLE'
on conflict do nothing;

-- ==========================================
-- AREA
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('GERENCIA',       'Gerencia',                1),
  ('ADMINISTRACION', 'Administración',          2),
  ('CONTABILIDAD',   'Contabilidad',            3),
  ('RRHH',           'Recursos humanos',        4),
  ('COMERCIAL',      'Comercial',               5),
  ('LOGISTICA',      'Logística',               6),
  ('LEGAL',          'Legal',                   7),
  ('MARKETING',      'Marketing',               8),
  ('TI',             'Tecnología',              9),
  ('OTRO',           'Otra área',              10)
) as v(code, label, sort_order)
where g.code = 'AREA'
on conflict do nothing;

-- ==========================================
-- PAYMENT_HEALTH
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('AL_DIA',      'Al día',        1),
  ('POR_VENCER',  'Por vencer',    2),
  ('MOROSO',      'Moroso',        3),
  ('CRITICO',     'Crítico',       4)
) as v(code, label, sort_order)
where g.code = 'PAYMENT_HEALTH'
on conflict do nothing;

-- ==========================================
-- QUOTE_STATUS
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('BORRADOR',   'Borrador',     1),
  ('EMITIDA',    'Emitida',      2),
  ('ENVIADA',    'Enviada',      3),
  ('ACEPTADA',   'Aceptada',     4),
  ('RECHAZADA',  'Rechazada',    5),
  ('VENCIDA',    'Vencida',      6)
) as v(code, label, sort_order)
where g.code = 'QUOTE_STATUS'
on conflict do nothing;

-- ==========================================
-- NODE_TYPE
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('CARPETA',    'Carpeta',    1),
  ('SECCION',    'Sección',    2),
  ('AÑO',       'Año',        3),
  ('MES',        'Mes',        4)
) as v(code, label, sort_order)
where g.code = 'NODE_TYPE'
on conflict do nothing;

-- ==========================================
-- DRIVE_SYNC_STATUS
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('PENDIENTE',   'Pendiente',    1),
  ('EN_PROGRESO', 'En progreso',  2),
  ('COMPLETADO',  'Completado',   3),
  ('ERROR',       'Error',        4)
) as v(code, label, sort_order)
where g.code = 'DRIVE_SYNC_STATUS'
on conflict do nothing;

-- ==========================================
-- SUMMARY_STATUS
-- ==========================================
insert into public.catalog_items (group_id, code, label, sort_order)
select g.id, v.code, v.label, v.sort_order
from public.catalog_groups g
cross join (values
  ('PENDIENTE',  'Pendiente',   1),
  ('GENERADO',   'Generado',    2),
  ('REVISADO',   'Revisado',    3),
  ('ERROR',      'Error',       4)
) as v(code, label, sort_order)
where g.code = 'SUMMARY_STATUS'
on conflict do nothing;
