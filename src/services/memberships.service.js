import { supabase } from '../lib/supabaseClient'
import {
  addDaysToDateOnly,
  addYearsToDateOnly,
  buildDateOnly,
  getDateOnlyParts,
  todayDateOnly,
} from '../utils/dateOnly'

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
   * - MENSUAL: 12 cuotas con el día de cobro configurado
   * - ANUAL: 1 cuota en la fecha de inicio
   */
  async generateSchedule({ membership, defaultStatusId, userId }) {
    const schedules = []
    const startDate = getDateOnlyParts(membership.start_date)

    const isMensual = membership.membership_type?.code === 'MENSUAL'

    if (isMensual) {
      const billingDay = Number(membership.monthly_billing_day || startDate.day)
      const firstDueOffset = billingDay >= startDate.day ? 0 : 1
      const monthlyAmount = Math.round((membership.fee_amount / 12) * 100) / 100

      for (let i = 0; i < 12; i++) {
        const dueDate = buildDateOnly(
          startDate.year,
          startDate.month + firstDueOffset + i,
          billingDay
        )
        const dueParts = getDateOnlyParts(dueDate)

        schedules.push({
          membership_id: membership.id,
          associate_id: membership.associate_id,
          due_date: dueDate,
          period_year: dueParts.year,
          period_month: dueParts.month,
          expected_amount: monthlyAmount,
          collection_status_id: defaultStatusId,
          created_by: userId,
        })
      }
    } else {
      if (!membership.end_date) {
        const endDate = addDaysToDateOnly(
          addYearsToDateOnly(membership.start_date, 1),
          -1
        )

        await supabase
          .from('memberships')
          .update({
            end_date: endDate,
            updated_at: new Date().toISOString(),
            updated_by: userId,
          })
          .eq('id', membership.id)
      }

      schedules.push({
        membership_id: membership.id,
        associate_id: membership.associate_id,
        due_date: membership.start_date,
        period_year: startDate.year,
        period_month: null,
        expected_amount: membership.fee_amount,
        collection_status_id: defaultStatusId,
        created_by: userId,
      })
    }

    const { data, error } = await supabase
      .from('payment_schedules')
      .insert(schedules)
      .select()

    if (error) throw error
    return data
  },
}
