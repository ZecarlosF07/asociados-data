-- ============================================================
-- Auditoria Hito S21: consistencia de membresias
-- ============================================================

select
  's21_unique_current_index' as check_name,
  count(*)::int as found,
  1 as expected,
  coalesce(jsonb_agg(indexname), '[]'::jsonb) as detail
from pg_indexes
where schemaname = 'public'
  and tablename = 'memberships'
  and indexname = 'uq_memberships_current_associate';

select
  's21_required_objects' as check_name,
  count(*)::int as found,
  6 as expected,
  coalesce(jsonb_agg(object_name order by object_name), '[]'::jsonb) as detail
from (
  select proname as object_name
  from pg_proc
  join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
  where pg_namespace.nspname = 'public'
    and proname in (
      'fn_prepare_membership_category',
      'fn_sync_current_membership_category',
      'fn_assert_membership_input',
      'create_current_membership',
      'renew_current_membership'
    )
  union all
  select conname
  from pg_constraint
  where conrelid = 'public.memberships'::regclass
    and conname = 'chk_memberships_current_category'
) required_objects;

select
  's21_required_triggers' as check_name,
  count(*)::int as found,
  2 as expected,
  coalesce(jsonb_agg(tgname order by tgname), '[]'::jsonb) as detail
from pg_trigger
where tgrelid in ('public.memberships'::regclass, 'public.associates'::regclass)
  and not tgisinternal
  and tgname in (
    'trg_memberships_prepare_category',
    'trg_associates_sync_membership_category'
  );

select
  's21_duplicate_current_memberships' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(associate_id order by associate_id), '[]'::jsonb) as detail
from (
  select associate_id
  from public.memberships
  where is_current = true and is_deleted = false
  group by associate_id
  having count(*) > 1
) duplicates;

select
  's21_invalid_current_categories' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(m.id order by m.id), '[]'::jsonb) as detail
from public.memberships m
join public.associates a on a.id = m.associate_id
where m.is_current = true
  and m.is_deleted = false
  and (
    m.category_id is null
    or m.category_id is distinct from a.category_id
    or a.category_id is null
    or a.is_deleted = true
    or not exists (
      select 1
      from public.categories c
      where c.id = a.category_id
        and c.is_active = true
        and c.is_deleted = false
    )
  );

select
  's21_recoverable_historical_null_categories' as check_name,
  count(*)::int as found,
  0 as expected,
  coalesce(jsonb_agg(m.id order by m.id), '[]'::jsonb) as detail
from public.memberships m
join public.associates a on a.id = m.associate_id
where m.is_current = false
  and m.is_deleted = false
  and m.category_id is null
  and a.category_id is not null;
