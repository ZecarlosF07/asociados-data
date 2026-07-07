-- ============================================================
-- Auditoria Hito S19: reporte actual de comites
-- Ejecutar despues de aplicar la migracion S19.
-- ============================================================

select
  's19_report_view' as check_name,
  count(*)::int as found,
  1 as expected,
  coalesce(jsonb_agg(c.relname), '[]'::jsonb) as detail
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'report_committee_assignments_current'
  and c.relkind = 'v'
  and coalesce(c.reloptions, '{}'::text[]) @> array['security_invoker=true'];

select
  's19_report_view_columns' as check_name,
  count(*)::int as found,
  14 as expected,
  coalesce(jsonb_agg(column_name order by ordinal_position), '[]'::jsonb) as detail
from information_schema.columns
where table_schema = 'public'
  and table_name = 'report_committee_assignments_current'
  and column_name in (
    'associate_id',
    'associate_internal_code',
    'associate_company_name',
    'associate_ruc',
    'associate_status_code',
    'associate_status_label',
    'category_code',
    'category_name',
    'committee_assignment_id',
    'committee_id',
    'committee_code',
    'committee_name',
    'committee_is_active',
    'joined_at'
  );

select
  's19_report_read_policies' as check_name,
  count(*)::int as found,
  2 as expected,
  coalesce(
    jsonb_agg(tablename || ':' || policyname order by tablename),
    '[]'::jsonb
  ) as detail
from pg_policies
where schemaname = 'public'
  and cmd = 'SELECT'
  and (
    (tablename = 'committees' and policyname = 'committees_reports_read')
    or (
      tablename = 'associate_committees'
      and policyname = 'associate_committees_reports_read'
    )
  );

select
  's19_read_grants' as check_name,
  count(*)::int as found,
  3 as expected,
  coalesce(jsonb_agg(table_name order by table_name), '[]'::jsonb) as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'committees',
    'associate_committees',
    'report_committee_assignments_current'
  )
  and grantee = 'authenticated'
  and privilege_type = 'SELECT';

select
  's19_no_new_broad_write_grants' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(
    jsonb_agg(table_name || ':' || privilege_type order by table_name, privilege_type),
    '[]'::jsonb
  ) as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('committees', 'associate_committees')
  and grantee = 'authenticated'
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE');

select
  's19_original_s13_report_policies' as check_name,
  count(*)::int as found,
  5 as expected,
  coalesce(jsonb_agg(tablename || ':' || policyname order by tablename), '[]'::jsonb) as detail
from pg_policies
where schemaname = 'public'
  and (
    (tablename = 'memberships' and policyname = 'memberships_reports_read')
    or (tablename = 'payment_schedules' and policyname = 'payment_schedules_reports_read')
    or (tablename = 'payments' and policyname = 'payments_reports_read')
    or (tablename = 'collection_actions' and policyname = 'collection_actions_reports_read')
    or (tablename = 'documents' and policyname = 'documents_reports_read')
  );

select
  's19_duplicate_current_primary_assignments' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(associate_id order by associate_id), '[]'::jsonb) as detail
from (
  select associate_id
  from public.associate_committees
  where is_primary = true
    and is_active = true
    and is_deleted = false
  group by associate_id
  having count(*) > 1
) duplicates;

select
  's19_invalid_current_assignments' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(ac.id order by ac.id), '[]'::jsonb) as detail
from public.associate_committees ac
left join public.associates a on a.id = ac.associate_id
left join public.committees c on c.id = ac.committee_id
where ac.is_primary = true
  and ac.is_active = true
  and ac.is_deleted = false
  and (
    a.id is null
    or a.is_deleted = true
    or c.id is null
    or c.is_deleted = true
    or c.is_active = false
  );

with totals as (
  select
    count(*)::int as total_associates,
    count(ac.id)::int as assigned,
    count(*) filter (where ac.id is null)::int as unassigned
  from public.associates a
  left join public.associate_committees ac
    on ac.associate_id = a.id
   and ac.is_primary = true
   and ac.is_active = true
   and ac.is_deleted = false
  where a.is_deleted = false
)
select
  's19_assignment_partition' as check_name,
  assigned + unassigned as found,
  total_associates as expected,
  jsonb_build_object(
    'assigned', assigned,
    'unassigned', unassigned,
    'total', total_associates
  ) as detail
from totals;
