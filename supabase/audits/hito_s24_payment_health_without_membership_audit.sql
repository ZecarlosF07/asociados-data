-- S24: "No aplica" solo para empresas sin membresia; cache y reportes coherentes.
with checks as (
  select 1 as position, 's24_no_aplica_catalog' as check_name,
    count(*)::int as found, 1 as expected,
    coalesce(jsonb_agg(ci.id order by ci.id), '[]'::jsonb) as detail
  from public.catalog_items ci
  join public.catalog_groups cg on cg.id = ci.group_id
  where cg.code = 'PAYMENT_HEALTH' and ci.code = 'NO_APLICA'
    and ci.is_active and not ci.is_deleted
  union all
  select 2, 's24_new_associate_cache_trigger', count(*)::int, 1,
    coalesce(jsonb_agg(t.tgname), '[]'::jsonb)
  from pg_trigger t join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'associates'
    and t.tgname = 'trg_associates_initialize_operational_cache' and not t.tgisinternal
  union all
  select 3, 's24_without_membership_wrong_health', count(*)::int, 0,
    coalesce(jsonb_agg(a.id order by a.id), '[]'::jsonb)
  from public.associates a
  join public.associate_operational_summary s on s.id = a.id
  where not a.is_deleted
    and not exists (select 1 from public.memberships m
      where m.associate_id = a.id and not m.is_deleted)
    and (s.payment_health_code is distinct from 'NO_APLICA'
      or s.payment_health_label is distinct from 'No aplica · sin membresía')
  union all
  select 4, 's24_without_membership_cache_mismatch', count(*)::int, 0,
    coalesce(jsonb_agg(a.id order by a.id), '[]'::jsonb)
  from public.associates a
  left join public.catalog_items ci on ci.id = a.payment_health_status_id
  where not a.is_deleted
    and not exists (select 1 from public.memberships m
      where m.associate_id = a.id and not m.is_deleted)
    and ci.code is distinct from 'NO_APLICA'
  union all
  select 5, 's24_with_membership_marked_no_aplica', count(*)::int, 0,
    coalesce(jsonb_agg(a.id order by a.id), '[]'::jsonb)
  from public.associates a
  join public.associate_operational_summary s on s.id = a.id
  where not a.is_deleted and s.payment_health_code = 'NO_APLICA'
    and exists (select 1 from public.memberships m
      where m.associate_id = a.id and not m.is_deleted)
  union all
  select 6, 's24_report_without_membership_mismatch', count(*)::int, 0,
    coalesce(jsonb_agg(a.id order by a.id), '[]'::jsonb)
  from public.associates a
  join public.report_associates_summary r on r.id = a.id
  where not a.is_deleted
    and not exists (select 1 from public.memberships m
      where m.associate_id = a.id and not m.is_deleted)
    and (r.payment_health_code is distinct from 'NO_APLICA'
      or r.payment_health_label is distinct from 'No aplica · sin membresía')
)
select check_name, found, expected, detail from checks order by position;
