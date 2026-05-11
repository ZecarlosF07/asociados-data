export const REPORT_TABS = [
  { key: 'overview', label: 'Resumen' },
  { key: 'prospects', label: 'Prospectos' },
  { key: 'associates', label: 'Asociados' },
  { key: 'memberships', label: 'Membresías' },
  { key: 'financial', label: 'Pagos y cobranza' },
  { key: 'documents', label: 'Documentos' },
]

export const STATUS_COLORS_PROSPECTS = {
  NUEVO: 'bg-blue-500',
  EN_EVALUACION: 'bg-amber-500',
  COTIZADO: 'bg-cyan-500',
  EN_SEGUIMIENTO: 'bg-purple-500',
  APROBADO: 'bg-emerald-500',
  CONVERTIDO: 'bg-green-700',
  DESCARTADO: 'bg-red-500',
}

export const STATUS_COLORS_ASSOCIATES = {
  ACTIVO: 'bg-emerald-500',
  INACTIVO: 'bg-slate-400',
  SUSPENDIDO: 'bg-red-500',
  EN_PROCESO: 'bg-amber-500',
}

export const REPORT_TABLE_COLUMNS = {
  prospects: [
    { key: 'company_name', label: 'Razón social' },
    { key: 'ruc', label: 'RUC' },
    {
      key: 'prospect_status.label',
      label: 'Estado',
      format: 'badge',
      badgeVariant: (val) => {
        if (val === 'Aprobado') return 'success'
        if (val === 'Descartado') return 'danger'
        if (val === 'En evaluación') return 'warning'
        return 'default'
      },
    },
    { key: 'category.name', label: 'Categoría' },
    { key: 'captador.full_name', label: 'Captador' },
    { key: 'created_at', label: 'Registro', format: 'date' },
  ],

  associates: [
    { key: 'internal_code', label: 'Código' },
    { key: 'company_name', label: 'Razón social' },
    { key: 'ruc', label: 'RUC' },
    {
      key: 'associate_status.label',
      label: 'Estado',
      format: 'badge',
      badgeVariant: (val) => {
        if (val === 'Activo') return 'success'
        if (val === 'Suspendido') return 'danger'
        if (val === 'Inactivo') return 'warning'
        return 'default'
      },
    },
    { key: 'category.name', label: 'Categoría' },
    { key: 'association_date', label: 'Asociación', format: 'date' },
    {
      key: 'payment_health.label',
      label: 'Salud de pago',
      format: 'badge',
      badgeVariant: (val) => {
        if (val === 'Al día') return 'success'
        if (val === 'Moroso' || val === 'Crítico') return 'danger'
        if (val === 'Por vencer') return 'warning'
        return 'default'
      },
    },
  ],

  memberships: [
    { key: 'associate.internal_code', label: 'Código' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'membership_type.label', label: 'Tipo' },
    { key: 'category.name', label: 'Categoría' },
    { key: 'fee_amount', label: 'Tarifa', format: 'currency', align: 'right' },
    { key: 'start_date', label: 'Inicio', format: 'date' },
    {
      key: 'membership_status.label',
      label: 'Estado',
      format: 'badge',
      badgeVariant: (val) => {
        if (val === 'Vigente') return 'success'
        if (val === 'Vencida' || val === 'Cancelada') return 'danger'
        if (val === 'Renovada') return 'info'
        return 'default'
      },
    },
    { key: 'is_current', label: 'Vigente', format: 'boolean', align: 'center' },
  ],

  payments: [
    { key: 'associate.internal_code', label: 'Código' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'payment_date', label: 'Fecha', format: 'date' },
    { key: 'amount_paid', label: 'Monto', format: 'currency', align: 'right' },
    { key: 'operation_code', label: 'Operación' },
    { key: 'payment_method.label', label: 'Método' },
  ],

  schedules: [
    { key: 'associate.internal_code', label: 'Código' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'due_date', label: 'Vencimiento', format: 'date' },
    { key: 'expected_amount', label: 'Monto', format: 'currency', align: 'right' },
    { key: 'is_paid', label: 'Pagado', format: 'boolean', align: 'center' },
    {
      key: 'collection_status.label',
      label: 'Estado',
      format: 'badge',
      badgeVariant: (val) => {
        if (val === 'Pagado') return 'success'
        if (val === 'Vencido') return 'danger'
        if (val === 'Pendiente') return 'warning'
        return 'default'
      },
    },
  ],

  collections: [
    { key: 'associate.internal_code', label: 'Código' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'action_date', label: 'Fecha', format: 'date' },
    { key: 'subject', label: 'Asunto' },
    { key: 'contact_type.label', label: 'Contacto' },
    {
      key: 'action_result.label',
      label: 'Resultado',
      format: 'badge',
      badgeVariant: (val) => {
        if (val === 'Contactado') return 'success'
        if (val === 'No contactado' || val === 'Rechazo') return 'danger'
        if (val === 'Compromiso de pago') return 'info'
        if (val === 'Sin respuesta') return 'warning'
        return 'default'
      },
    },
    { key: 'managed_by.full_name', label: 'Responsable' },
  ],

  documents: [
    { key: 'title', label: 'Título' },
    { key: 'document_type.label', label: 'Tipo' },
    { key: 'document_category.label', label: 'Categoría' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'file_extension', label: 'Ext.' },
    { key: 'uploaded_at', label: 'Carga', format: 'date' },
  ],
}

export function reportFilename(prefix, formattedDate) {
  return `${prefix}_${formattedDate.replace(/\//g, '-')}`
}
