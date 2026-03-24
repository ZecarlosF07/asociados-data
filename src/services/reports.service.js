import { supabase } from '../lib/supabaseClient'

export const reportsService = {
  // ──────────────────────────────────────────
  //  Prospectos
  // ──────────────────────────────────────────
  async getProspectsSummary() {
    const { data, error } = await supabase
      .from('prospects')
      .select(`
        id, company_name, ruc, created_at,
        prospect_status:prospect_status_id(id, code, label),
        category:current_category_id(id, code, name),
        captador:captador_id(id, full_name)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // ──────────────────────────────────────────
  //  Asociados
  // ──────────────────────────────────────────
  async getAssociatesSummary() {
    const { data, error } = await supabase
      .from('associates')
      .select(`
        id, company_name, ruc, internal_code, trade_name,
        association_date, corporate_email,
        associate_status:associate_status_id(id, code, label),
        category:category_id(id, code, name, base_fee),
        activity_type:activity_type_id(id, code, label),
        company_size:company_size_id(id, code, label),
        payment_health:payment_health_status_id(id, code, label)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // ──────────────────────────────────────────
  //  Membresías
  // ──────────────────────────────────────────
  async getMembershipsSummary() {
    const { data, error } = await supabase
      .from('memberships')
      .select(`
        id, fee_amount, currency_code, start_date, end_date, is_current,
        membership_type:membership_type_id(id, code, label),
        category:category_id(id, code, name),
        membership_status:membership_status_id(id, code, label),
        associate:associate_id(id, company_name, ruc, internal_code)
      `)
      .eq('is_deleted', false)
      .order('start_date', { ascending: false })

    if (error) throw error
    return data
  },

  // ──────────────────────────────────────────
  //  Pagos y cobranza
  // ──────────────────────────────────────────
  async getPaymentsSummary() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id, payment_date, amount_paid, operation_code, is_reversed,
        payment_method:payment_method_id(id, code, label),
        associate:associate_id(id, company_name, ruc, internal_code)
      `)
      .eq('is_deleted', false)
      .eq('is_reversed', false)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data
  },

  async getSchedulesSummary() {
    const { data, error } = await supabase
      .from('payment_schedules')
      .select(`
        id, due_date, expected_amount, is_paid, paid_at,
        period_year, period_month,
        collection_status:collection_status_id(id, code, label),
        associate:associate_id(id, company_name, ruc, internal_code)
      `)
      .eq('is_deleted', false)
      .order('due_date', { ascending: false })

    if (error) throw error
    return data
  },

  async getCollectionActionsSummary() {
    const { data, error } = await supabase
      .from('collection_actions')
      .select(`
        id, subject, detail, action_date, created_at,
        contact_type:contact_type_id(id, code, label),
        result:result_id(id, code, label),
        associate:associate_id(id, company_name, internal_code)
      `)
      .eq('is_deleted', false)
      .order('action_date', { ascending: false })

    if (error) throw error
    return data
  },

  // ──────────────────────────────────────────
  //  Documentos
  // ──────────────────────────────────────────
  async getDocumentsSummary() {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        id, title, original_filename, mime_type, size_bytes,
        uploaded_at, file_extension,
        document_type:document_type_id(id, code, label),
        document_category:document_category_id(id, code, label),
        associate:associate_id(id, company_name, internal_code)
      `)
      .eq('is_deleted', false)
      .eq('is_latest_version', true)
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data
  },

  // ──────────────────────────────────────────
  //  Dashboard KPIs (carga única)
  // ──────────────────────────────────────────
  async getDashboardKpis() {
    const todayStr = new Date().toISOString().split('T')[0]
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    const [
      prospectsRes,
      associatesRes,
      membershipsRes,
      pendingRes,
      overdueRes,
      monthPaymentsRes,
      documentsRes,
    ] = await Promise.all([
      supabase.from('prospects').select('id, prospect_status:prospect_status_id(code)').eq('is_deleted', false),
      supabase.from('associates').select('id, associate_status:associate_status_id(code)').eq('is_deleted', false),
      supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('is_current', true),
      supabase.from('payment_schedules').select('expected_amount').eq('is_deleted', false).eq('is_paid', false),
      supabase.from('payment_schedules').select('expected_amount').eq('is_deleted', false).eq('is_paid', false).lt('due_date', todayStr),
      supabase.from('payments').select('amount_paid').eq('is_deleted', false).eq('is_reversed', false).gte('payment_date', monthStart),
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('is_latest_version', true),
    ])

    // Prospectos por estado
    const prospectsByStatus = {}
    prospectsRes.data?.forEach((p) => {
      const code = p.prospect_status?.code || 'SIN_ESTADO'
      prospectsByStatus[code] = (prospectsByStatus[code] || 0) + 1
    })

    // Asociados por estado
    const associatesByStatus = {}
    associatesRes.data?.forEach((a) => {
      const code = a.associate_status?.code || 'SIN_ESTADO'
      associatesByStatus[code] = (associatesByStatus[code] || 0) + 1
    })

    const totalPending = pendingRes.data?.reduce((s, r) => s + Number(r.expected_amount || 0), 0) || 0
    const totalOverdue = overdueRes.data?.reduce((s, r) => s + Number(r.expected_amount || 0), 0) || 0
    const totalCollected = monthPaymentsRes.data?.reduce((s, r) => s + Number(r.amount_paid || 0), 0) || 0

    return {
      prospects: {
        total: prospectsRes.data?.length || 0,
        byStatus: prospectsByStatus,
      },
      associates: {
        total: associatesRes.data?.length || 0,
        byStatus: associatesByStatus,
      },
      memberships: membershipsRes.count || 0,
      financial: {
        pending: totalPending,
        pendingCount: pendingRes.data?.length || 0,
        overdue: totalOverdue,
        overdueCount: overdueRes.data?.length || 0,
        collectedThisMonth: totalCollected,
      },
      documents: documentsRes.count || 0,
    }
  },
}
