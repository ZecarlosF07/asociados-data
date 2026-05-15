select
  'roles_base' as check_name,
  count(*)::int as found,
  3 as expected_min,
  array_agg(code order by code) as detail
from public.roles
where code in ('ADMIN', 'OPERADOR', 'CONSULTA')
  and is_active = true;

select
  'admin_inicial_activo' as check_name,
  count(*)::int as found,
  1 as expected_min,
  array_agg(institutional_email order by institutional_email) as detail
from public.user_profiles up
join public.roles r on r.id = up.role_id
where r.code = 'ADMIN'
  and up.is_active = true
  and up.is_deleted = false;

select
  'system_settings' as check_name,
  count(*)::int as found,
  6 as expected_min,
  array_agg(setting_key order by setting_key) as detail
from public.system_settings
where setting_key in (
  'app_name',
  'app_currency',
  'pagination_default_size',
  'prospect_evaluation_max_score',
  'membership_default_currency',
  'audit_enabled'
);

select
  'catalog_groups' as check_name,
  count(*)::int as found,
  19 as expected_min,
  array_agg(code order by code) as detail
from public.catalog_groups
where code in (
  'PROSPECT_STATUS',
  'ASSOCIATE_STATUS',
  'MEMBERSHIP_STATUS',
  'MEMBERSHIP_TYPE',
  'PAYMENT_METHOD',
  'CONTACT_TYPE',
  'COMPANY_SIZE',
  'ACTIVITY_TYPE',
  'DOCUMENT_TYPE',
  'DOCUMENT_CATEGORY',
  'COLLECTION_STATUS',
  'COLLECTION_RESULT',
  'PERSON_ROLE',
  'AREA',
  'PAYMENT_HEALTH',
  'QUOTE_STATUS',
  'NODE_TYPE',
  'DRIVE_SYNC_STATUS',
  'SUMMARY_STATUS'
);

select
  cg.code as group_code,
  count(ci.id)::int as item_count,
  array_agg(ci.code order by ci.sort_order, ci.code) as items
from public.catalog_groups cg
left join public.catalog_items ci
  on ci.group_id = cg.id
  and ci.is_active = true
  and ci.is_deleted = false
where cg.code in (
  'PROSPECT_STATUS',
  'ASSOCIATE_STATUS',
  'MEMBERSHIP_STATUS',
  'MEMBERSHIP_TYPE',
  'PAYMENT_METHOD',
  'CONTACT_TYPE',
  'COLLECTION_STATUS',
  'COLLECTION_RESULT',
  'DOCUMENT_TYPE',
  'DOCUMENT_CATEGORY',
  'NODE_TYPE',
  'DRIVE_SYNC_STATUS',
  'PAYMENT_HEALTH'
)
group by cg.code
order by cg.code;

select
  'categories' as check_name,
  count(*)::int as found,
  5 as expected_min,
  array_agg(code order by sort_order, code) as detail
from public.categories
where is_deleted = false;

select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id = 'documents';

select
  table_schema,
  table_name,
  table_type
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'modules',
    'permissions',
    'role_permissions',
    'automation_jobs',
    'automation_job_runs',
    'report_prospects_summary',
    'report_associates_summary',
    'report_memberships_summary',
    'report_payments_summary',
    'report_schedules_summary',
    'report_collections_summary',
    'report_documents_summary',
    'dashboard_kpis'
  )
order by table_type, table_name;
