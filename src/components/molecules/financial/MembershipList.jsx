import { Badge } from '../../atoms/Badge'
import { Button } from '../../atoms/Button'
import { formatDate, formatCurrency } from '../../../utils/helpers'
import { MEMBERSHIP_STATUS_VARIANT } from '../../../utils/financialConstants'

export function MembershipList({ memberships, canEdit, onSelect, onDelete }) {
  if (memberships.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-6">
        No hay membresías registradas.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {memberships.map((m) => {
        const statusCode = m.membership_status?.code
        const variant = MEMBERSHIP_STATUS_VARIANT[statusCode] || 'default'

        return (
          <div
            key={m.id}
            className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-all ${
              m.is_current
                ? 'border-blue-200 bg-blue-50/30'
                : 'border-slate-200'
            }`}
            onClick={() => onSelect?.(m)}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {m.membership_type?.label || 'Membresía'}
                  </h4>
                  <Badge variant={variant}>
                    {m.membership_status?.label || '—'}
                  </Badge>
                  {m.is_current && (
                    <Badge variant="info">Vigente</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {m.category?.name || 'Sin categoría'}
                </p>
              </div>
              <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                {formatCurrency(m.fee_amount)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>
                <span className="font-medium text-slate-700">Inicio:</span>{' '}
                {formatDate(m.start_date)}
              </span>
              {m.end_date && (
                <span>
                  <span className="font-medium text-slate-700">Fin:</span>{' '}
                  {formatDate(m.end_date)}
                </span>
              )}
              {m.monthly_billing_day && (
                <span>
                  <span className="font-medium text-slate-700">Día cobro:</span>{' '}
                  {m.monthly_billing_day}
                </span>
              )}
            </div>

            {canEdit && (
              <div className="flex justify-end mt-2 pt-2 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(m)
                  }}
                >
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
