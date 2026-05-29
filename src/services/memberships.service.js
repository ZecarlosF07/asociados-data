import { supabase } from '../lib/supabaseClient'
import {
  addDaysToDateOnly,
  addYearsToDateOnly,
  buildDateOnly,
  getDateOnlyParts,
  todayDateOnly,
} from '../utils/dateOnly'
import { getMembershipPaymentFrequency } from '../utils/financialConstants'

const MEMBERSHIP_SELECT = `
  *,
  membership_type:membership_type_id(id, code, label),
  category:category_id(id, code, name, base_fee),
  membership_status:membership_status_id(id, code, label)
`

export const membershipsService = {
  async getAll({ search, statusId, typeId } = {}) {
    let query = supabase
      .from('memberships')
      .select(`
        ${MEMBERSHIP_SELECT},
        associate:associate_id(id, company_name, ruc, internal_code, trade_name)
      `)
      .eq('is_deleted', false)
      .order('start_date', { ascending: false })

    if (statusId) query = query.eq('membership_status_id', statusId)
    if (typeId) query = query.eq('membership_type_id', typeId)

    const { data, error } = await query
    if (error) throw error

    if (search) {
      const term = search.toLowerCase()
      return data.filter(
        (m) =>
          m.associate?.company_name?.toLowerCase().includes(term) ||
          m.associate?.ruc?.includes(term) ||
          m.associate?.internal_code?.toLowerCase().includes(term)
      )
    }

    return data
  },

  async getByAssociate(associateId) {
    const { data, error } = await supabase
      .from('memberships')
      .select(MEMBERSHIP_SELECT)
      .eq('associate_id', associateId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('memberships')
      .select(MEMBERSHIP_SELECT)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data
  },

  async create(membership) {
    // Marcar membresías anteriores como no vigentes
    if (membership.is_current !== false) {
      await supabase
        .from('memberships')
        .update({ is_current: false, updated_at: new Date().toISOString() })
        .eq('associate_id', membership.associate_id)
        .eq('is_current', true)
        .eq('is_deleted', false)
    }

    const { data, error } = await supabase
      .from('memberships')
      .insert(membership)
      .select(MEMBERSHIP_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('memberships')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(MEMBERSHIP_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async cancel(id, userId) {
    // Buscar estado CANCELADA
    const { data: statuses } = await supabase
      .from('catalog_items')
      .select('id, group:group_id(code)')
      .eq('code', 'CANCELADA')

    const cancelStatus = statuses?.find(
      (s) => s.group?.code === 'MEMBERSHIP_STATUS'
    )
    if (!cancelStatus) throw new Error('Estado CANCELADA no encontrado')

    const { data, error } = await supabase
      .from('memberships')
      .update({
        membership_status_id: cancelStatus.id,
        is_current: false,
        end_date: todayDateOnly(),
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .select(MEMBERSHIP_SELECT)
      .single()

    if (error) throw error

    // Eliminar cuotas no pagadas
    await supabase
      .from('payment_schedules')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('membership_id', id)
      .eq('is_paid', false)

    return data
  },

  async renew(oldMembershipId, newMembershipData, userId) {
    // Marcar la anterior como RENOVADA
    const { data: statuses } = await supabase
      .from('catalog_items')
      .select('id, group:group_id(code)')
      .eq('code', 'RENOVADA')

    const renewedStatus = statuses?.find(
      (s) => s.group?.code === 'MEMBERSHIP_STATUS'
    )

    if (renewedStatus) {
      await supabase
        .from('memberships')
        .update({
          membership_status_id: renewedStatus.id,
          is_current: false,
          end_date: todayDateOnly(),
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', oldMembershipId)
    }

    // Crear nueva membresía
    const created = await membershipsService.create({
      ...newMembershipData,
      is_current: true,
      created_by: userId,
    })

    return created
  },


  async softDelete(id, deletedBy) {
    const { error } = await supabase
      .from('memberships')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Genera el cronograma de pagos para una membresía.
   * - Modalidades periódicas: cuotas según frecuencia y día de cobro
   * - ANUAL: 1 cuota con vencimiento al día siguiente de la fecha de fin
   */
  async generateSchedule({ membership, defaultStatusId, userId }) {
    const startDate = getDateOnlyParts(membership.start_date)
    const membershipTypeCode = membership.membership_type?.code
    const frequency = getMembershipPaymentFrequency(membershipTypeCode)

    if (!frequency) {
      throw new Error(`Tipo de membresía no soportado: ${membershipTypeCode || 'sin tipo'}`)
    }

    const effectiveEndDate = await ensureMembershipEndDate({
      membership,
      userId,
    })

    const schedules = frequency.requiresBillingDay
      ? buildPeriodicSchedules({
        membership,
        startDate,
        frequency,
        defaultStatusId,
        userId,
      })
      : buildAnnualSchedule({
        membership,
        startDate,
        effectiveEndDate,
        defaultStatusId,
        userId,
      })


    const { data, error } = await supabase
      .from('payment_schedules')
      .insert(schedules)
      .select()

    if (error) throw error
    return data
  },
}

async function ensureMembershipEndDate({ membership, userId }) {
  if (membership.end_date) return membership.end_date

  const effectiveEndDate = addDaysToDateOnly(
    addYearsToDateOnly(membership.start_date, 1),
    -1
  )

  const { error } = await supabase
    .from('memberships')
    .update({
      end_date: effectiveEndDate,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    })
    .eq('id', membership.id)

  if (error) throw error
  return effectiveEndDate
}

function buildPeriodicSchedules({
  membership,
  startDate,
  frequency,
  defaultStatusId,
  userId,
}) {
  const billingDay = Number(membership.monthly_billing_day)

  if (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 28) {
    throw new Error('El día de cobro debe estar entre 1 y 28.')
  }

  const firstDueOffset = billingDay >= startDate.day ? 0 : 1
  const expectedAmount = roundMoney(
    Number(membership.fee_amount) / frequency.installments
  )

  return Array.from({ length: frequency.installments }, (_, index) => {
    const dueDate = buildDateOnly(
      startDate.year,
      startDate.month + ((firstDueOffset + index) * frequency.intervalMonths),
      billingDay
    )
    const dueParts = getDateOnlyParts(dueDate)

    return {
      membership_id: membership.id,
      associate_id: membership.associate_id,
      due_date: dueDate,
      period_year: dueParts.year,
      period_month: dueParts.month,
      expected_amount: expectedAmount,
      collection_status_id: defaultStatusId,
      created_by: userId,
    }
  })
}

function buildAnnualSchedule({
  membership,
  startDate,
  effectiveEndDate,
  defaultStatusId,
  userId,
}) {
  return [{
    membership_id: membership.id,
    associate_id: membership.associate_id,
    due_date: addDaysToDateOnly(effectiveEndDate, 1),
    period_year: startDate.year,
    period_month: null,
    expected_amount: membership.fee_amount,
    collection_status_id: defaultStatusId,
    created_by: userId,
  }]
}

function roundMoney(value) {
  return Math.round(value * 100) / 100
}
