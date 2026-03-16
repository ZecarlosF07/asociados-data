import { Badge } from '../../atoms/Badge'
import { formatDateTime } from '../../../utils/helpers'
import { COLLECTION_RESULT_VARIANT } from '../../../utils/financialConstants'

export function CollectionActionList({ actions }) {
  if (actions.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-6">
        No hay gestiones de cobranza registradas.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {actions.map((a) => {
        const resultCode = a.action_result?.code
        const resultVariant = COLLECTION_RESULT_VARIANT[resultCode] || 'default'

        return (
          <div
            key={a.id}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    {a.subject}
                  </h4>
                  <Badge variant="info">
                    {a.contact_type?.label || '—'}
                  </Badge>
                  {a.action_result && (
                    <Badge variant={resultVariant}>
                      {a.action_result.label}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {formatDateTime(a.action_date)}
                  {a.managed_by &&
                    ` · ${a.managed_by.first_name} ${a.managed_by.last_name}`}
                </p>
              </div>
            </div>

            {a.short_observation && (
              <p className="text-sm text-slate-600 mt-1">
                {a.short_observation}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              {a.mail_to && (
                <span>📧 {a.mail_to}</span>
              )}
              {a.next_follow_up_at && (
                <span>
                  📅 Próximo: {formatDateTime(a.next_follow_up_at)}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
