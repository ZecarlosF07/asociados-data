-- ============================================================
-- Auditoria Hito S16: comites y asignaciones de asociados
-- Ejecutar despues de aplicar la migracion S16.
-- Los checks de datos deben retornar 0 filas problemáticas.
-- ============================================================

select
  's16_tables' as check_name,
  count(*)::int as found,
  2 as expected,
  coalesce(jsonb_agg(table_name order by table_name), '[]'::jsonb) as detail
from information_schema.tables
where table_schema = 'public'
  and table_name in ('committees', 'associate_committees');

select
  's16_document_foreign_keys' as check_name,
  count(*)::int as found,
  2 as expected,
  coalesce(jsonb_agg(source_table || '->' || target_table order by source_table), '[]'::jsonb) as detail
from (
  select source.relname as source_table, target.relname as target_table
  from pg_constraint constraint_record
  join pg_class source on source.oid = constraint_record.conrelid
  join pg_namespace source_namespace on source_namespace.oid = source.relnamespace
  join pg_class target on target.oid = constraint_record.confrelid
  join pg_namespace target_namespace on target_namespace.oid = target.relnamespace
  where constraint_record.contype = 'f'
    and source_namespace.nspname = 'public'
    and target_namespace.nspname = 'public'
    and target.relname = 'committees'
    and constraint_record.conname in ('fk_storage_nodes_committee', 'fk_documents_committee')
    and source.relname in ('storage_nodes', 'documents')
) foreign_keys;

select
  's16_assignment_foreign_keys' as check_name,
  count(*)::int as found,
  2 as expected,
  coalesce(jsonb_agg(source_table || '->' || target_table order by source_table, target_table), '[]'::jsonb) as detail
from (
  select
    source.relname as source_table,
    target.relname as target_table
  from pg_constraint constraint_record
  join pg_class source on source.oid = constraint_record.conrelid
  join pg_namespace source_namespace on source_namespace.oid = source.relnamespace
  join pg_class target on target.oid = constraint_record.confrelid
  join pg_namespace target_namespace on target_namespace.oid = target.relnamespace
  where constraint_record.contype = 'f'
    and source_namespace.nspname = 'public'
    and target_namespace.nspname = 'public'
    and source.relname = 'associate_committees'
    and target.relname in ('associates', 'committees')
) foreign_keys;

select
  's16_required_checks' as check_name,
  count(*)::int as found,
  5 as expected,
  coalesce(jsonb_agg(constraint_name order by constraint_name), '[]'::jsonb) as detail
from information_schema.table_constraints
where table_schema = 'public'
  and constraint_name in (
    'chk_committees_name_not_blank',
    'chk_committees_deleted_inactive',
    'chk_associate_committees_dates',
    'chk_associate_committees_active_dates',
    'chk_associate_committees_deleted_closed'
  );

select
  's16_required_columns' as check_name,
  count(*)::int as found,
  4 as expected,
  coalesce(jsonb_agg(table_name || '.' || column_name order by table_name, column_name), '[]'::jsonb) as detail
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'committees' and column_name in ('code', 'name'))
    or (table_name = 'associate_committees' and column_name in ('committee_id', 'is_primary'))
  );

select
  's16_required_indexes' as check_name,
  count(*)::int as found,
  9 as expected,
  coalesce(jsonb_agg(indexname order by indexname), '[]'::jsonb) as detail
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'uq_committees_code_active',
    'uq_committees_name_active',
    'idx_committees_active',
    'idx_associate_committees_associate',
    'idx_associate_committees_committee',
    'uq_associate_committees_active_pair',
    'uq_associate_committees_primary',
    'idx_storage_nodes_committee',
    'idx_documents_committee'
  );

select
  's16_rls_enabled' as check_name,
  count(*)::int as found,
  2 as expected,
  coalesce(jsonb_agg(c.relname order by c.relname), '[]'::jsonb) as detail
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('committees', 'associate_committees')
  and c.relrowsecurity = true;

select
  's16_policies' as check_name,
  count(*)::int as found,
  4 as expected,
  coalesce(jsonb_agg(actual.tablename || ':' || actual.policyname || ':' || actual.cmd order by actual.tablename, actual.policyname), '[]'::jsonb) as detail
from (values
  ('committees', 'committees_read', 'SELECT'),
  ('committees', 'committees_create', 'INSERT'),
  ('committees', 'committees_update', 'UPDATE'),
  ('associate_committees', 'associate_committees_read', 'SELECT')
) expected(tablename, policyname, cmd)
join pg_policies actual
  on actual.schemaname = 'public'
  and actual.tablename = expected.tablename
  and actual.policyname = expected.policyname
  and actual.cmd = expected.cmd;

select
  's16_committee_permissions' as check_name,
  coalesce(
    jsonb_agg(r.code || ':' || p.action_code order by r.code, p.action_code),
    '[]'::jsonb
  ) as found,
  '["ADMIN:admin","ADMIN:create","ADMIN:delete","ADMIN:read","ADMIN:update","FIDELIZACION:create","FIDELIZACION:read","FIDELIZACION:update"]'::jsonb as expected
from public.roles r
join public.role_permissions rp on rp.role_id = r.id and rp.is_allowed = true
join public.permissions p on p.id = rp.permission_id
join public.modules m on m.id = p.module_id
where m.code = 'comites';

select
  's16_operational_roles_without_extra_permissions' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(r.code || ':' || p.action_code order by r.code, p.action_code), '[]'::jsonb) as detail
from public.roles r
join public.role_permissions rp on rp.role_id = r.id and rp.is_allowed = true
join public.permissions p on p.id = rp.permission_id
join public.modules m on m.id = p.module_id
where m.code = 'comites'
  and r.code in ('CAPTACION', 'FACTURACION', 'ALTA_DIRECCION');

select
  's16_required_triggers' as check_name,
  count(distinct trigger_name)::int as found,
  6 as expected,
  coalesce(jsonb_agg(distinct trigger_name order by trigger_name), '[]'::jsonb) as detail
from information_schema.triggers
where event_object_schema = 'public'
  and trigger_name in (
    'trg_committees_prepare',
    'trg_committees_updated_at',
    'trg_associate_committees_prepare',
    'trg_associate_committees_updated_at',
    'trg_audit_committees',
    'trg_audit_associate_committees'
  );

select
  's16_no_assignment_write_policies' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(policyname order by policyname), '[]'::jsonb) as detail
from pg_policies
where schemaname = 'public'
  and tablename = 'associate_committees'
  and cmd <> 'SELECT';

select
  's16_required_functions' as check_name,
  count(*)::int as found,
  7 as expected,
  coalesce(jsonb_agg(p.proname order by p.proname), '[]'::jsonb) as detail
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'set_associate_primary_committee',
    'clear_associate_primary_committee',
    'set_committee_active_status',
    'filter_associate_ids_by_committee',
    'create_direct_associate_with_committee',
    'convert_prospect_to_associate_with_committee',
    'insert_initial_associate_committee'
  );

select
  's16_sensitive_committee_columns_not_granted' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(
    jsonb_agg(privilege_type || ':' || column_name order by privilege_type, column_name),
    '[]'::jsonb
  ) as detail
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'committees'
  and grantee = 'authenticated'
  and privilege_type in ('INSERT', 'UPDATE')
  and column_name not in ('code', 'name', 'description');

select
  's16_editable_committee_columns_granted' as check_name,
  count(*)::int as found,
  6 as expected,
  coalesce(
    jsonb_agg(privilege_type || ':' || column_name order by privilege_type, column_name),
    '[]'::jsonb
  ) as detail
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'committees'
  and grantee = 'authenticated'
  and privilege_type in ('INSERT', 'UPDATE')
  and column_name in ('code', 'name', 'description');

select
  's16_no_broad_write_grants' as check_name,
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
  's16_table_read_grants' as check_name,
  count(*)::int as found,
  2 as expected,
  coalesce(jsonb_agg(table_name order by table_name), '[]'::jsonb) as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('committees', 'associate_committees')
  and grantee = 'authenticated'
  and privilege_type = 'SELECT';

select
  's16_security_definer_writes' as check_name,
  count(*)::int as found,
  6 as expected,
  coalesce(jsonb_agg(p.proname order by p.proname), '[]'::jsonb) as detail
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'insert_initial_associate_committee',
    'set_associate_primary_committee',
    'clear_associate_primary_committee',
    'set_committee_active_status',
    'create_direct_associate_with_committee',
    'convert_prospect_to_associate_with_committee'
  )
  and p.prosecdef = true
  and 'search_path=public' = any(coalesce(p.proconfig, array[]::text[]));

select
  's16_filter_security_invoker' as check_name,
  count(*)::int as found,
  1 as expected,
  coalesce(jsonb_agg(p.oid::regprocedure::text), '[]'::jsonb) as detail
from pg_proc p
where p.oid = to_regprocedure('public.filter_associate_ids_by_committee(uuid,boolean)')
  and p.prosecdef = false
  and 'search_path=public' = any(coalesce(p.proconfig, array[]::text[]));

select
  's16_new_rpc_execute_privileges' as check_name,
  count(*) filter (
    where has_function_privilege('authenticated', p.oid, 'EXECUTE')
      and not has_function_privilege('anon', p.oid, 'EXECUTE')
      and not exists (
        select 1
        from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) privilege
        where privilege.grantee = 0
          and privilege.privilege_type = 'EXECUTE'
      )
  )::int as found,
  6 as expected,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'function', signature,
        'authenticated', has_function_privilege('authenticated', p.oid, 'EXECUTE'),
        'anon', has_function_privilege('anon', p.oid, 'EXECUTE'),
        'public', exists (
          select 1
          from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) privilege
          where privilege.grantee = 0
            and privilege.privilege_type = 'EXECUTE'
        )
      ) order by signature
    ),
    '[]'::jsonb
  ) as detail
from (values
  ('public.set_associate_primary_committee(uuid,uuid,date,text)'),
  ('public.clear_associate_primary_committee(uuid,date,text)'),
  ('public.set_committee_active_status(uuid,boolean)'),
  ('public.filter_associate_ids_by_committee(uuid,boolean)'),
  ('public.create_direct_associate_with_committee(text,text,uuid,date,text,text,uuid,uuid,text,text,text,text,text,text,date,uuid,uuid,uuid,text,boolean,text,uuid)'),
  ('public.convert_prospect_to_associate_with_committee(uuid,text,uuid,date,uuid,text,uuid)')
) required_functions(signature)
join pg_proc p on p.oid = to_regprocedure(signature);

select
  's16_internal_helper_not_executable' as check_name,
  (
    case when has_function_privilege('anon', p.oid, 'EXECUTE') then 1 else 0 end
    + case when has_function_privilege('authenticated', p.oid, 'EXECUTE') then 1 else 0 end
    + case when exists (
        select 1
        from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) privilege
        where privilege.grantee = 0
          and privilege.privilege_type = 'EXECUTE'
      ) then 1 else 0 end
  )::int as found,
  0 as expected,
  jsonb_build_object(
    'anon', has_function_privilege('anon', p.oid, 'EXECUTE'),
    'authenticated', has_function_privilege('authenticated', p.oid, 'EXECUTE'),
    'public', exists (
      select 1
      from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) privilege
      where privilege.grantee = 0
        and privilege.privilege_type = 'EXECUTE'
    )
  ) as detail
from pg_proc p
where p.oid = to_regprocedure('public.insert_initial_associate_committee(uuid,uuid,date)');

select
  's16_original_rpc_signatures_preserved' as check_name,
  count(*)::int as found,
  2 as expected,
  coalesce(jsonb_agg(p.oid::regprocedure::text order by p.oid::regprocedure::text), '[]'::jsonb) as detail
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.oid in (
    to_regprocedure('public.create_direct_associate(text,text,uuid,date,text,text,uuid,uuid,text,text,text,text,text,text,date,uuid,uuid,uuid,text,boolean,text)'),
    to_regprocedure('public.convert_prospect_to_associate(uuid,text,uuid,date,uuid,text)')
  );

select
  's16_duplicate_committee_codes' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(code order by code), '[]'::jsonb) as detail
from (
  select lower(btrim(code)) as code
  from public.committees
  where is_deleted = false and code is not null
  group by lower(btrim(code))
  having count(*) > 1
) duplicates;

select
  's16_invalid_normalized_committees' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(c.id order by c.id), '[]'::jsonb) as detail
from public.committees c
where c.is_deleted = false
  and (
    c.name is null
    or c.name = ''
    or c.name <> btrim(c.name)
    or (c.code is not null and (c.code = '' or c.code <> upper(btrim(c.code))))
  );

select
  's16_duplicate_committee_names' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(name order by name), '[]'::jsonb) as detail
from (
  select lower(btrim(name)) as name
  from public.committees
  where is_deleted = false
  group by lower(btrim(name))
  having count(*) > 1
) duplicates;

select
  's16_duplicate_active_links' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(associate_id::text || ':' || committee_id::text), '[]'::jsonb) as detail
from (
  select associate_id, committee_id
  from public.associate_committees
  where is_active = true and is_deleted = false
  group by associate_id, committee_id
  having count(*) > 1
) duplicates;

select
  's16_multiple_primary_links' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(associate_id order by associate_id), '[]'::jsonb) as detail
from (
  select associate_id
  from public.associate_committees
  where is_primary = true and is_active = true and is_deleted = false
  group by associate_id
  having count(*) > 1
) duplicates;

select
  's16_invalid_active_links' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(ac.id order by ac.id), '[]'::jsonb) as detail
from public.associate_committees ac
join public.committees c on c.id = ac.committee_id
where ac.is_active = true
  and ac.is_deleted = false
  and (c.is_active = false or c.is_deleted = true or ac.left_at is not null);

select
  's16_invalid_closed_link_dates' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(ac.id order by ac.id), '[]'::jsonb) as detail
from public.associate_committees ac
where ac.is_deleted = false
  and (
    (ac.is_active = false and ac.left_at is null)
    or (ac.left_at is not null and ac.joined_at is not null and ac.left_at < ac.joined_at)
  );

select
  's16_future_joined_dates' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(ac.id order by ac.id), '[]'::jsonb) as detail
from public.associate_committees ac
where ac.is_deleted = false
  and ac.joined_at > (now() at time zone 'America/Lima')::date;

select
  's16_missing_audit_actors' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(entity || ':' || id::text order by entity, id), '[]'::jsonb) as detail
from (
  select 'committees'::text as entity, id, created_by, updated_by
  from public.committees
  union all
  select 'associate_committees'::text as entity, id, created_by, updated_by
  from public.associate_committees
) records
where created_by is null or updated_by is null;
