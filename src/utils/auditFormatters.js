export const AUDIT_ENTITY_OPTIONS = [
  'prospects',
  'associates',
  'memberships',
  'payment_schedules',
  'payments',
  'collection_actions',
  'documents',
  'storage_nodes',
  'user_profiles',
  'roles',
  'categories',
  'catalog_items',
  'automation_jobs',
  'automation_job_runs',
]

export const AUDIT_ACTION_OPTIONS = [
  'insert',
  'update',
  'delete',
  'convert_to_associate',
  'create_direct_associate',
  'register_payment',
  'purge_old_audit_logs',
]

const ENTITY_LABELS = {
  prospects: 'Prospectos',
  associates: 'Asociados',
  memberships: 'Membresías',
  payment_schedules: 'Cronogramas',
  payments: 'Pagos',
  collection_actions: 'Cobranza',
  documents: 'Documentos',
  storage_nodes: 'Nodos documentales',
  user_profiles: 'Usuarios',
  roles: 'Roles',
  categories: 'Categorías',
  catalog_items: 'Catálogos',
  automation_jobs: 'Automatizaciones',
  automation_job_runs: 'Ejecuciones',
  audit_logs: 'Auditoría',
}

const ACTION_LABELS = {
  insert: 'Creación',
  update: 'Actualización',
  delete: 'Eliminación',
  convert_to_associate: 'Conversión a asociado',
  create_direct_associate: 'Alta directa',
  register_payment: 'Registro de pago',
  purge_old_audit_logs: 'Purga de auditoría',
}

const FIELD_LABELS = {
  first_name: 'Nombres',
  last_name: 'Apellidos',
  institutional_email: 'Correo institucional',
  role_id: 'Rol',
  is_active: 'Activo',
  updated_at: 'Fecha de actualización',
  updated_by: 'Actualizado por',
  last_login_at: 'Último acceso',
  created_at: 'Fecha de creación',
  created_by: 'Creado por',
  company_name: 'Razón social',
  trade_name: 'Nombre comercial',
  internal_code: 'Código interno',
  ruc: 'RUC',
  associate_id: 'Asociado',
  status_id: 'Estado',
  due_date: 'Vencimiento',
  period_label: 'Periodo',
  amount_due: 'Monto',
  amount_paid: 'Monto pagado',
  payment_date: 'Fecha de pago',
  file_name: 'Archivo',
  title: 'Título',
}

const IGNORED_CHANGE_FIELDS = new Set([
  'updated_at',
  'updated_by',
  'last_login_at',
])

export function formatAuditActor(log) {
  if (!log?.actor) return log?.actor_user_id || 'Sistema'
  const fullName = `${log.actor.first_name || ''} ${log.actor.last_name || ''}`.trim()
  return fullName || log.actor.institutional_email || log.actor_user_id || 'Sistema'
}

export function formatAuditAction(actionType) {
  return ACTION_LABELS[actionType] || actionType || 'Sin acción'
}

export function formatAuditEntity(entityName) {
  return ENTITY_LABELS[entityName] || entityName || 'Sin entidad'
}

export function formatAuditDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function getAuditChangedFields(previousData, newData) {
  if (!previousData || !newData) return []

  const keys = new Set([
    ...Object.keys(previousData),
    ...Object.keys(newData),
  ])

  return [...keys]
    .filter((key) => !IGNORED_CHANGE_FIELDS.has(key))
    .filter((key) => !isSameValue(previousData[key], newData[key]))
    .map((key) => ({
      field: key,
      label: formatAuditField(key),
      previousValue: previousData[key],
      newValue: newData[key],
    }))
}

export function formatAuditSubject(log) {
  const data = log?.new_data || log?.previous_data || {}
  const associate = log?.related_associate
  const prospect = log?.related_prospect

  if (log?.entity_name === 'user_profiles') {
    const name = `${data.first_name || ''} ${data.last_name || ''}`.trim()
    return joinSubject(name, data.institutional_email)
  }

  if (log?.entity_name === 'associates') {
    return joinSubject(data.company_name, data.internal_code || data.ruc)
  }

  if (log?.entity_name === 'prospects') {
    return joinSubject(data.company_name, data.ruc)
  }

  if (log?.entity_name === 'payment_schedules') {
    return joinSubject(data.period_label, formatRelatedAssociate(associate, data.associate_id))
  }

  if (log?.entity_name === 'memberships') {
    return joinSubject(data.membership_type, formatRelatedAssociate(associate, data.associate_id))
  }

  if (log?.entity_name === 'payments') {
    return joinSubject(formatRelatedAssociate(associate, data.associate_id), data.amount_paid && `S/ ${data.amount_paid}`)
  }

  if (log?.entity_name === 'documents') {
    return joinSubject(
      data.title || data.file_name,
      formatRelatedAssociate(associate, data.associate_id)
        || formatRelatedProspect(prospect, data.prospect_id)
    )
  }

  return joinSubject(data.name || data.label || data.code || data.full_name, log?.entity_id)
}

export function formatAuditChangeSummary(log, maxItems = 3) {
  if (log?.action_type === 'insert') return 'Registro creado'
  if (log?.action_type === 'delete') return 'Registro eliminado'

  const changes = getAuditChangedFields(log?.previous_data, log?.new_data)
  if (changes.length === 0) return formatTechnicalChanges(log)

  const visible = changes
    .slice(0, maxItems)
    .map((change) => `${change.label}: ${safeJsonPreview(change.previousValue, 40)} → ${safeJsonPreview(change.newValue, 40)}`)

  const suffix = changes.length > maxItems ? ` y ${changes.length - maxItems} más` : ''
  return `${visible.join('; ')}${suffix}`
}

export function formatAuditField(field) {
  return FIELD_LABELS[field] || field
}

export function safeJsonPreview(value, maxLength = 160) {
  if (value == null) return '—'
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

function isSameValue(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function joinSubject(primary, secondary) {
  if (primary && secondary) return `${primary} (${secondary})`
  return primary || secondary || 'Registro sin nombre'
}

function formatRelatedAssociate(associate, fallbackId) {
  if (!associate) return fallbackId && `Asociado: ${fallbackId}`
  return joinSubject(associate.company_name, associate.internal_code || associate.ruc)
}

function formatRelatedProspect(prospect, fallbackId) {
  if (!prospect) return fallbackId && `Prospecto: ${fallbackId}`
  return joinSubject(prospect.company_name, prospect.ruc)
}

function formatTechnicalChanges(log) {
  const technicalChanges = getChangedKeys(log?.previous_data, log?.new_data)
    .filter((key) => IGNORED_CHANGE_FIELDS.has(key))
    .map(formatAuditField)

  if (technicalChanges.length === 0) return 'Sin cambios visibles'

  return `Solo cambió metadata técnica: ${technicalChanges.join(', ')}`
}

function getChangedKeys(previousData, newData) {
  if (!previousData || !newData) return []
  const keys = new Set([...Object.keys(previousData), ...Object.keys(newData)])
  return [...keys].filter((key) => !isSameValue(previousData[key], newData[key]))
}
