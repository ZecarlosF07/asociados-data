import { Badge } from '../../atoms/Badge'
import { formatDate } from '../../../utils/helpers'
import { ASSOCIATE_STATUS_VARIANT } from '../../../utils/associateConstants'

export function AssociateCard({ associate, onClick }) {
  const statusCode = associate.associate_status?.code
  const statusLabel = associate.associate_status?.label || '—'
  const variant = ASSOCIATE_STATUS_VARIANT[statusCode] || 'default'

  return (
    <div
      className="bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
      onClick={() => onClick?.(associate)}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900 truncate">
            {associate.company_name}
          </h3>
          {associate.trade_name && (
            <p className="text-xs text-slate-400 truncate">
              {associate.trade_name}
            </p>
          )}
        </div>
        <Badge variant={variant}>{statusLabel}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>
          <span className="font-medium text-slate-700">Código:</span>{' '}
          {associate.internal_code}
        </span>
        <span>
          <span className="font-medium text-slate-700">RUC:</span>{' '}
          {associate.ruc}
        </span>
        {associate.category && (
          <span>
            <span className="font-medium text-slate-700">Categoría:</span>{' '}
            {associate.category.name}
          </span>
        )}
        {associate.association_date && (
          <span>
            <span className="font-medium text-slate-700">Desde:</span>{' '}
            {formatDate(associate.association_date)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[0.7rem] text-slate-400">
        <span>{formatDate(associate.created_at)}</span>
        {associate.captador && (
          <span>{associate.captador.full_name}</span>
        )}
      </div>
    </div>
  )
}
