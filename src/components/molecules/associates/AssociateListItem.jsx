import { Badge } from '../../atoms/Badge'
import { formatDate } from '../../../utils/helpers'
import {
  ASSOCIATE_STATUS_VARIANT,
  PAYMENT_HEALTH_VARIANT,
} from '../../../utils/associateConstants'

export function AssociateListItem({ associate, onClick }) {
  const statusCode = associate.associate_status?.code
  const statusLabel = associate.associate_status?.label || 'Sin estado'
  const variant = ASSOCIATE_STATUS_VARIANT[statusCode] || 'default'
  const phone =
    associate.mobile_phone_1 ||
    associate.mobile_phone_2 ||
    associate.landline_phone
  const responsible = formatUserName(associate.affiliation_responsible)
  const healthCode = associate.payment_health?.code
  const healthLabel = associate.payment_health?.label || 'Sin calcular'
  const healthVariant = PAYMENT_HEALTH_VARIANT[healthCode] || 'default'

  return (
    <button
      type="button"
      className="w-full text-left bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      onClick={() => onClick?.(associate)}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {associate.company_name}
            </h3>
            <Badge variant={variant}>{statusLabel}</Badge>
            {associate.category?.name && (
              <Badge variant="default">{associate.category.name}</Badge>
            )}
          </div>
          {associate.trade_name && (
            <p className="text-xs text-slate-400 truncate">
              {associate.trade_name}
            </p>
          )}
        </div>

        <div className="text-xs text-slate-400 md:text-right">
          <p>Asociado desde: {formatDate(associate.association_date) || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 text-xs">
        <Item label="Código" value={associate.internal_code} strong />
        <Item label="RUC" value={associate.ruc} />
        <Item label="Responsable" value={responsible} />
        <Item label="Comité" value={associate.primary_committee?.name} />
        <Item label="Salud de pago" value={healthLabel}>
          <Badge variant={healthVariant}>{healthLabel}</Badge>
        </Item>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <Item label="Captador" value={associate.captador?.full_name} inline />
        <Item label="Correo" value={associate.corporate_email} inline />
        <Item label="Teléfono" value={phone} inline />
      </div>
    </button>
  )
}

function Item({ label, value, inline = false, strong = false, children }) {
  const content = value || '—'
  const valueClass = strong ? 'font-semibold text-slate-900' : 'text-slate-600'

  if (inline) {
    return (
      <span className="min-w-0">
        <span className="font-medium text-slate-700">{label}:</span>{' '}
        <span className={valueClass}>{content}</span>
      </span>
    )
  }

  return (
    <div className="min-w-0">
      <p className="font-medium text-slate-500">{label}</p>
      {children || <p className={`${valueClass} truncate`}>{content}</p>}
    </div>
  )
}

function formatUserName(user) {
  if (!user) return ''
  return [user.first_name, user.last_name].filter(Boolean).join(' ')
}
