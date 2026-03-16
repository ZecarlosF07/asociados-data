import { Badge } from '../../atoms/Badge'
import { EmptyState } from '../../atoms/EmptyState'
import { formatDateTime } from '../../../utils/helpers'
import { PROSPECT_STATUS_VARIANT } from '../../../utils/prospectConstants'

export function StatusTimeline({ history }) {
  if (!history || history.length === 0) {
    return (
      <EmptyState
        icon="📜"
        title="Sin historial"
        description="Aún no hay cambios de estado registrados."
      />
    )
  }

  return (
    <div className="space-y-0">
      {history.map((entry, idx) => {
        const isLast = idx === history.length - 1
        const variant =
          PROSPECT_STATUS_VARIANT[entry.new_status?.code] || 'default'

        return (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              {!isLast && (
                <div className="w-px flex-1 bg-slate-200 min-h-[24px]" />
              )}
            </div>

            <div className="pb-4 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                {entry.previous_status && (
                  <>
                    <Badge variant="default">
                      {entry.previous_status.label}
                    </Badge>
                    <span className="text-slate-400 text-xs">→</span>
                  </>
                )}
                <Badge variant={variant}>
                  {entry.new_status?.label || '—'}
                </Badge>
              </div>

              <p className="text-[0.7rem] text-slate-400">
                {formatDateTime(entry.changed_at)}
                {entry.changed_by_user &&
                  ` — ${entry.changed_by_user.first_name} ${entry.changed_by_user.last_name}`}
              </p>

              {entry.change_reason && (
                <p className="text-xs text-slate-500 mt-1">
                  {entry.change_reason}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
