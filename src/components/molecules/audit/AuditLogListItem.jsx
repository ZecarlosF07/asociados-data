import { Badge } from '../../atoms/Badge'
import {
  formatAuditAction,
  formatAuditActor,
  formatAuditChangeSummary,
  formatAuditDate,
  formatAuditEntity,
  formatAuditSubject,
} from '../../../utils/auditFormatters'

const ACTION_VARIANTS = {
  insert: 'success',
  update: 'warning',
  delete: 'danger',
  convert_to_associate: 'info',
  create_direct_associate: 'info',
  register_payment: 'success',
  purge_old_audit_logs: 'danger',
}

export function AuditLogListItem({ log, onClick }) {
  const variant = ACTION_VARIANTS[log.action_type] || 'default'
  const subject = formatAuditSubject(log)
  const changes = formatAuditChangeSummary(log)

  return (
    <button
      type="button"
      className="w-full text-left bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      onClick={() => onClick?.(log)}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant={variant}>{formatAuditAction(log.action_type)}</Badge>
            <span className="text-sm font-bold text-slate-900">
              {formatAuditEntity(log.entity_name)}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800">
            {subject}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">Hecho por:</span>{' '}
            {formatAuditActor(log)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">Cambios:</span>{' '}
            {changes}
          </p>
        </div>
        <span className="text-xs text-slate-400 md:text-right">
          {formatAuditDate(log.event_at)}
        </span>
      </div>

      {log.summary && (
        <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
          {log.summary}
        </p>
      )}
    </button>
  )
}
