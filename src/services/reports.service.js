import { supabase } from '../lib/supabaseClient'

export const reportsService = {
  async getProspectsSummary() {
    const { data, error } = await supabase
      .from('report_prospects_summary')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(mapProspectReport)
  },

  async getAssociatesSummary() {
    const { data, error } = await supabase
      .from('report_associates_summary')
      .select('*')
      .order('company_name', { ascending: true })

    if (error) throw error
    return data.map(mapAssociateReport)
  },

  async getMembershipsSummary() {
    const { data, error } = await supabase
      .from('report_memberships_summary')
      .select('*')
      .order('start_date', { ascending: false })

    if (error) throw error
    return data.map(mapMembershipReport)
  },

  async getPaymentsSummary() {
    const { data, error } = await supabase
      .from('report_payments_summary')
      .select('*')
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data.map(mapPaymentReport)
  },

  async getSchedulesSummary() {
    const { data, error } = await supabase
      .from('report_schedules_summary')
      .select('*')
      .order('due_date', { ascending: false })

    if (error) throw error
    return data.map(mapScheduleReport)
  },

  async getCollectionActionsSummary() {
    const { data, error } = await supabase
      .from('report_collections_summary')
      .select('*')
      .order('action_date', { ascending: false })

    if (error) throw error
    return data.map(mapCollectionReport)
  },

  async getDocumentsSummary() {
    const { data, error } = await supabase
      .from('report_documents_summary')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data.map(mapDocumentReport)
  },

  async getDashboardKpis() {
    const { data, error } = await supabase
      .from('dashboard_kpis')
      .select('*')
      .single()

    if (error) throw error

    return {
      prospects: {
        total: data.prospects_total || 0,
        byStatus: data.prospects_by_status || {},
      },
      associates: {
        total: data.associates_total || 0,
        byStatus: data.associates_by_status || {},
      },
      memberships: data.memberships_current || 0,
      financial: {
        pending: Number(data.financial_pending || 0),
        pendingCount: data.financial_pending_count || 0,
        overdue: Number(data.financial_overdue || 0),
        overdueCount: data.financial_overdue_count || 0,
        collectedThisMonth: Number(data.financial_collected_this_month || 0),
      },
      documents: data.documents_total || 0,
    }
  },
}

function mapProspectReport(row) {
  return {
    id: row.id,
    company_name: row.company_name,
    ruc: row.ruc,
    created_at: row.created_at,
    prospect_status: buildCatalog(row.prospect_status_code, row.prospect_status_label),
    category: buildCategory(row.category_code, row.category_name),
    captador: row.captador_full_name ? { full_name: row.captador_full_name } : null,
  }
}

function mapAssociateReport(row) {
  return {
    id: row.id,
    internal_code: row.internal_code,
    company_name: row.company_name,
    trade_name: row.trade_name,
    ruc: row.ruc,
    association_date: row.association_date,
    corporate_email: row.corporate_email,
    associate_status: buildCatalog(row.associate_status_code, row.associate_status_label),
    category: buildCategory(row.category_code, row.category_name, {
      base_fee: row.category_base_fee,
    }),
    activity_type: buildCatalog(row.activity_type_code, row.activity_type_label),
    company_size: buildCatalog(row.company_size_code, row.company_size_label),
    payment_health: buildCatalog(row.payment_health_code, row.payment_health_label),
  }
}

function mapMembershipReport(row) {
  return {
    id: row.id,
    fee_amount: row.fee_amount,
    currency_code: row.currency_code,
    start_date: row.start_date,
    end_date: row.end_date,
    is_current: row.is_current,
    membership_type: buildCatalog(row.membership_type_code, row.membership_type_label),
    category: buildCategory(row.category_code, row.category_name),
    membership_status: buildCatalog(row.membership_status_code, row.membership_status_label),
    associate: buildAssociate(row),
  }
}

function mapPaymentReport(row) {
  return {
    id: row.id,
    payment_date: row.payment_date,
    amount_paid: row.amount_paid,
    operation_code: row.operation_code,
    is_reversed: row.is_reversed,
    payment_method: buildCatalog(row.payment_method_code, row.payment_method_label),
    associate: buildAssociate(row),
  }
}

function mapScheduleReport(row) {
  return {
    id: row.id,
    due_date: row.due_date,
    expected_amount: row.expected_amount,
    is_paid: row.is_paid,
    paid_at: row.paid_at,
    period_year: row.period_year,
    period_month: row.period_month,
    collection_status: buildCatalog(row.collection_status_code, row.collection_status_label),
    associate: buildAssociate(row),
  }
}

function mapCollectionReport(row) {
  return {
    id: row.id,
    subject: row.subject,
    short_observation: row.short_observation,
    action_date: row.action_date,
    created_at: row.created_at,
    contact_type: buildCatalog(row.contact_type_code, row.contact_type_label),
    action_result: buildCatalog(row.action_result_code, row.action_result_label),
    managed_by: row.managed_by_user_id
      ? { id: row.managed_by_user_id, full_name: row.managed_by_full_name }
      : null,
    associate: buildAssociate(row),
  }
}

function mapDocumentReport(row) {
  return {
    id: row.id,
    title: row.title,
    original_filename: row.original_filename,
    mime_type: row.mime_type,
    size_bytes: row.size_bytes,
    uploaded_at: row.uploaded_at,
    file_extension: row.file_extension,
    document_type: buildCatalog(row.document_type_code, row.document_type_label),
    document_category: buildCatalog(row.document_category_code, row.document_category_label),
    associate: buildAssociate(row),
  }
}

function buildCatalog(code, label) {
  if (!code && !label) return null
  return { code, label }
}

function buildCategory(code, name, extra = {}) {
  if (!code && !name) return null
  return { code, name, ...extra }
}

function buildAssociate(row) {
  if (!row.associate_id) return null
  return {
    id: row.associate_id,
    company_name: row.associate_company_name,
    ruc: row.associate_ruc,
    internal_code: row.associate_internal_code,
  }
}
