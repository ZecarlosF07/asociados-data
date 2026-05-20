-- Corrige el registro de paid_at para que la fecha de pago no retroceda un dia
-- al mostrarse en America/Lima desde un timestamptz.

create or replace function public.register_payment(
  p_payment_schedule_id uuid,
  p_payment_date date,
  p_amount_paid numeric,
  p_operation_code text,
  p_payment_method_id uuid default null,
  p_reference_notes text default null
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_collection_status_code text;
  v_paid_status_id uuid;
  v_partial_status_id uuid;
  v_payment public.payments%rowtype;
  v_paid_total numeric(12,2);
  v_schedule public.payment_schedules%rowtype;
begin
  if not (
    public.has_module_permission('cobranza', 'create')
    and public.has_module_permission('cobranza', 'update')
  ) then
    raise exception 'No tienes permisos para registrar pagos.'
      using errcode = '42501';
  end if;

  v_actor := public.current_user_profile_id();

  if v_actor is null then
    raise exception 'No se pudo identificar el usuario autenticado para el pago.'
      using errcode = '42501';
  end if;

  if p_payment_schedule_id is null then
    raise exception 'La cuota a pagar es obligatoria.'
      using errcode = '22023';
  end if;

  if p_payment_date is null then
    raise exception 'La fecha de pago es obligatoria.'
      using errcode = '22023';
  end if;

  if p_amount_paid is null or p_amount_paid <= 0 then
    raise exception 'El monto pagado debe ser mayor a cero.'
      using errcode = '22023';
  end if;

  if nullif(trim(p_operation_code), '') is null then
    raise exception 'El codigo de operacion es obligatorio.'
      using errcode = '22023';
  end if;

  select ps.*
  into v_schedule
  from public.payment_schedules ps
  where ps.id = p_payment_schedule_id
    and ps.is_deleted = false
  for update;

  if not found then
    raise exception 'La cuota seleccionada no existe o fue eliminada.'
      using errcode = 'P0002';
  end if;

  if v_schedule.is_paid then
    raise exception 'La cuota seleccionada ya esta pagada.'
      using errcode = '23505';
  end if;

  select ci.code
  into v_collection_status_code
  from public.catalog_items ci
  where ci.id = v_schedule.collection_status_id
    and ci.is_deleted = false;

  if v_collection_status_code = 'ANULADO' then
    raise exception 'No se puede registrar un pago sobre una cuota anulada.'
      using errcode = 'P0001';
  end if;

  if p_payment_method_id is not null and not exists (
    select 1
    from public.catalog_items ci
    join public.catalog_groups cg on cg.id = ci.group_id
    where ci.id = p_payment_method_id
      and cg.code = 'PAYMENT_METHOD'
      and cg.is_active = true
      and ci.is_active = true
      and ci.is_deleted = false
  ) then
    raise exception 'El metodo de pago no es valido.'
      using errcode = '22023';
  end if;

  insert into public.payments (
    associate_id,
    membership_id,
    payment_schedule_id,
    payment_date,
    amount_paid,
    currency_code,
    operation_code,
    payment_method_id,
    reference_notes,
    registered_by_user_id,
    created_by
  ) values (
    v_schedule.associate_id,
    v_schedule.membership_id,
    v_schedule.id,
    p_payment_date,
    p_amount_paid,
    'PEN',
    trim(p_operation_code),
    p_payment_method_id,
    nullif(trim(p_reference_notes), ''),
    v_actor,
    v_actor
  )
  returning * into v_payment;

  select coalesce(sum(p.amount_paid), 0)
  into v_paid_total
  from public.payments p
  where p.payment_schedule_id = v_schedule.id
    and p.is_deleted = false
    and p.is_reversed = false;

  v_paid_status_id := public.find_catalog_item_id('COLLECTION_STATUS', 'PAGADO');
  v_partial_status_id := public.find_catalog_item_id('COLLECTION_STATUS', 'PARCIAL');

  if v_paid_total >= v_schedule.expected_amount then
    update public.payment_schedules
    set is_paid = true,
        paid_at = p_payment_date::timestamp at time zone 'America/Lima',
        collection_status_id = coalesce(v_paid_status_id, collection_status_id),
        updated_by = v_actor,
        updated_at = now()
    where id = v_schedule.id;
  else
    update public.payment_schedules
    set is_paid = false,
        paid_at = null,
        collection_status_id = coalesce(v_partial_status_id, collection_status_id),
        updated_by = v_actor,
        updated_at = now()
    where id = v_schedule.id;
  end if;

  perform public.refresh_associate_payment_health(v_schedule.associate_id);

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
    'payments',
    v_payment.id,
    'register_payment',
    to_jsonb(v_schedule),
    jsonb_build_object(
      'payment_id', v_payment.id,
      'payment_schedule_id', v_schedule.id,
      'associate_id', v_schedule.associate_id,
      'amount_paid', p_amount_paid,
      'paid_total', v_paid_total,
      'expected_amount', v_schedule.expected_amount
    ),
    'Pago registrado y cuota actualizada transaccionalmente',
    jsonb_build_object('source', 'register_payment')
  );

  return v_payment;
end;
$$;

revoke all on function public.register_payment(uuid, date, numeric, text, uuid, text) from public;
grant execute on function public.register_payment(uuid, date, numeric, text, uuid, text) to authenticated;
