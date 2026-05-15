import { Badge } from '../../atoms/Badge'
import { formatCurrency, formatDate } from '../../../utils/helpers'
import { PROSPECT_STATUS_VARIANT } from '../../../utils/prospectConstants'

export function ProspectListItem({ prospect, onClick }) {
  const statusCode = prospect.prospect_status?.code
  const statusLabel = prospect.prospect_status?.label || 'Sin estado'
  const variant = PROSPECT_STATUS_VARIANT[statusCode] || 'default'
  const fee = prospect.negotiated_fee ?? prospect.suggested_fee
  const feeLabel = prospect.negotiated_fee != null ? 'Tarifa neg.' : 'Tarifa sug.'

  return (
    <button
      type="button"
      className="w-full text-left bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      onClick={() => onClick?.(prospect)}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {prospect.company_name}
            </h3>
            <Badge variant={variant}>{statusLabel}</Badge>
          </div>
          {prospect.trade_name && (
            <p className="text-xs text-slate-400 truncate">
              {prospect.trade_name}
            </p>
          )}
        </div>

        <div className="text-xs text-slate-400 md:text-right">
          <p>Creado: {formatDate(prospect.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs">
        <Item label="RUC" value={prospect.ruc} />
        <Item label="Categoría" value={prospect.current_category?.name} />
        <Item label="Captador" value={prospect.captador?.full_name} />
        <Item label="Contacto" value={prospect.contact_name} />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <Item label="Correo" value={prospect.contact_email} inline />
        <Item label="Teléfono" value={prospect.contact_phone} inline />
        {fee != null && (
          <Item label={feeLabel} value={formatCurrency(fee)} inline strong />
        )}
      </div>
    </button>
  )
}

function Item({ label, value, inline = false, strong = false }) {
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
      <p className={`${valueClass} truncate`}>{content}</p>
    </div>
  )
}
