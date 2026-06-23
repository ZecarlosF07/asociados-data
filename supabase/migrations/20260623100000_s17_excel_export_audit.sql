-- ============================================
-- S17: Auditoria de descargas Excel
-- Registra toda descarga .xlsx desde funciones controladas.
-- ============================================

create or replace function public.log_excel_export(
  p_filename text,
  p_sheets jsonb default '[]'::jsonb,
  p_extra_meta jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_event_id uuid;
  v_filename text := nullif(trim(p_filename), '');
  v_sheets jsonb := coalesce(p_sheets, '[]'::jsonb);
  v_total_rows integer := 0;
begin
  v_actor := public.current_user_profile_id();

  if v_actor is null then
    raise exception 'No se pudo identificar el usuario que exporta.'
      using errcode = '42501';
  end if;

  if v_filename is null then
    raise exception 'El nombre del archivo exportado es obligatorio.'
      using errcode = '22023';
  end if;

  select coalesce(sum(coalesce((sheet->>'row_count')::integer, 0)), 0)
  into v_total_rows
  from jsonb_array_elements(v_sheets) as sheet;

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
    'excel_exports',
    null,
    'export_excel',
    null,
    jsonb_build_object(
      'filename', v_filename,
      'sheets', v_sheets,
      'total_rows', v_total_rows
    ),
    format('Descarga Excel: %s (%s registros)', v_filename, v_total_rows),
    jsonb_build_object(
      'source', 's17_excel_export_audit',
      'filename', v_filename,
      'sheets', v_sheets,
      'total_rows', v_total_rows
    ) || coalesce(p_extra_meta, '{}'::jsonb)
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;

revoke all on function public.log_excel_export(text, jsonb, jsonb) from public;
revoke all on function public.log_excel_export(text, jsonb, jsonb) from anon;
grant execute on function public.log_excel_export(text, jsonb, jsonb) to authenticated;
