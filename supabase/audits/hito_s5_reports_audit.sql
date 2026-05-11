select
  table_schema,
  table_name,
  table_type
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'report_prospects_summary',
    'report_associates_summary',
    'report_memberships_summary',
    'report_payments_summary',
    'report_schedules_summary',
    'report_collections_summary',
    'report_documents_summary',
    'dashboard_kpis',
    'automation_jobs',
    'automation_job_runs'
  )
order by table_type, table_name;

select
  c.relname as relation_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('automation_jobs', 'automation_job_runs')
order by c.relname;

select
  schemaname,
  tablename,
  policyname,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('automation_jobs', 'automation_job_runs')
order by tablename, policyname;

select
  code,
  name,
  job_type,
  status,
  config
from public.automation_jobs
order by code;

select *
from public.dashboard_kpis;
