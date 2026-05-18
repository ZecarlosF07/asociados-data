-- ============================================
-- Hito S10: Retencion de auditoria
-- ============================================

create or replace function public.purge_old_audit_logs(
  p_before timestamptz default now() - interval '6 months'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_deleted_count integer;
begin
  if not public.has_module_permission('auditoria', 'admin') then
    raise exception 'No tienes permisos para depurar auditoria.'
      using errcode = '42501';
  end if;

  if p_before is null then
    raise exception 'La fecha de corte es obligatoria.'
      using errcode = '22023';
  end if;

  if p_before > now() - interval '6 months' then
    raise exception 'La fecha de corte no puede ser posterior al limite de retencion de 6 meses.'
      using errcode = '22023';
  end if;

  v_actor := public.current_user_profile_id();

  with deleted as (
    delete from public.audit_logs
    where event_at < p_before
    returning 1
  )
  select count(*)::integer
  into v_deleted_count
  from deleted;

  insert into public.audit_logs (
    actor_user_id,
    entity_name,
    entity_id,
    action_type,
    previous_data,
    new_data,
    summary,
    extra_meta
  ) values (
    v_actor,
    'audit_logs',
    null,
    'purge_old_audit_logs',
    null,
    jsonb_build_object(
      'deleted_count', v_deleted_count,
      'cutoff', p_before
    ),
    'Depuracion de eventos de auditoria antiguos',
    jsonb_build_object(
      'source', 's10_audit_retention',
      'retention_months', 6,
      'deleted_count', v_deleted_count,
      'cutoff', p_before
    )
  );

  return v_deleted_count;
end;
$$;

revoke all on function public.purge_old_audit_logs(timestamptz) from public;
grant execute on function public.purge_old_audit_logs(timestamptz) to authenticated;
