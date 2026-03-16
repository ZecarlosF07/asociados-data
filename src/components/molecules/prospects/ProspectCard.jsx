import { Badge } from '../../atoms/Badge'
import { formatDate, formatCurrency } from '../../../utils/helpers'
import { PROSPECT_STATUS_VARIANT } from '../../../utils/prospectConstants'

export function ProspectCard({ prospect, onClick }) {
  const statusCode = prospect.prospect_status?.code
  const statusLabel = prospect.prospect_status?.label || '—'
  const variant = PROSPECT_STATUS_VARIANT[statusCode] || 'default'

  return (
    <div
      className="bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
      onClick={() => onClick?.(prospect)}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900 truncate">
            {prospect.company_name}
          </h3>
          {prospect.trade_name && (
            <p className="text-xs text-slate-400 truncate">
              {prospect.trade_name}
            </p>
          )}
        </div>
        <Badge variant={variant}>{statusLabel}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
        {prospect.ruc && (
          <span>
            <span className="font-medium text-slate-700">RUC:</span>{' '}
            {prospect.ruc}
          </span>
        )}
        {prospect.contact_name && (
          <span className="truncate">
            <span className="font-medium text-slate-700">Contacto:</span>{' '}
            {prospect.contact_name}
          </span>
        )}
        {prospect.current_category && (
          <span>
            <span className="font-medium text-slate-700">Categoría:</span>{' '}
            {prospect.current_category.name}
          </span>
        )}
        {prospect.negotiated_fee != null && (
          <span>
            <span className="font-medium text-slate-700">Tarifa:</span>{' '}
            {formatCurrency(prospect.negotiated_fee)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[0.7rem] text-slate-400">
        <span>{formatDate(prospect.created_at)}</span>
        {prospect.captador && (
          <span>{prospect.captador.full_name}</span>
        )}
      </div>
    </div>
  )
}
