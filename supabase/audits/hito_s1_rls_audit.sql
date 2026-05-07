select
  'rls_status' as audit_section,
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'roles',
    'user_profiles',
    'system_settings',
    'audit_logs',
    'catalog_groups',
    'catalog_items',
    'categories',
    'prospects',
    'prospect_evaluations',
    'prospect_quotes',
    'prospect_status_history',
    'captadores',
    'associates',
    'associate_people',
    'associate_area_contacts',
    'memberships',
    'payment_schedules',
    'payments',
    'collection_actions',
    'storage_nodes',
    'documents',
    'modules',
    'permissions',
    'role_permissions'
  )
union all
select
  'policy_count' as audit_section,
  schemaname as schema_name,
  tablename as table_name,
  (count(*) > 0) as rls_enabled,
  false as rls_forced
from pg_policies
where schemaname in ('public', 'storage')
group by schemaname, tablename
order by schema_name, table_name, audit_section;

