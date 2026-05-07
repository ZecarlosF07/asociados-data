import { supabase } from '../lib/supabaseClient'

const PAYMENT_SELECT = `
  *,
  payment_schedule:payment_schedule_id(id, due_date, period_year, period_month, expected_amount, is_paid),
  payment_method:payment_method_id(id, code, label),
  registered_by:registered_by_user_id(id, first_name, last_name)
`

export const paymentsService = {
  async getByAssociate(associateId) {
    const { data, error } = await supabase
      .from('payments')
      .select(PAYMENT_SELECT)
      .eq('associate_id', associateId)
      .eq('is_deleted', false)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data
  },

  async create(payment) {
    const { data: created, error } = await supabase.rpc(
      'register_payment',
      {
        p_payment_schedule_id: payment.payment_schedule_id,
        p_payment_date: payment.payment_date,
        p_amount_paid: Number(payment.amount_paid),
        p_operation_code: payment.operation_code,
        p_payment_method_id: payment.payment_method_id || null,
        p_reference_notes: payment.reference_notes || null,
      }
    )

    if (error) throw new Error(getPaymentErrorMessage(error))
    if (!created?.id) {
      throw new Error('El registro de pago no retornó el pago creado.')
    }

    return paymentsService.getById(created.id)
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('payments')
      .select(PAYMENT_SELECT)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data
  },

  async reverse(id, { reason, userId }) {
    const { data, error } = await supabase
      .from('payments')
      .update({
        is_reversed: true,
        reversed_at: new Date().toISOString(),
        reversal_reason: reason,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .select(PAYMENT_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async softDelete(id, deletedBy) {
    const { error } = await supabase
      .from('payments')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id)

    if (error) throw error
  },
}

function getPaymentErrorMessage(error) {
  const message = error?.message || 'No se pudo registrar el pago.'

  if (error?.code === '42501') {
    return 'No tienes permisos para registrar pagos.'
  }

  if (error?.code === '23505') {
    return 'La cuota seleccionada ya está pagada.'
  }

  return message
}
