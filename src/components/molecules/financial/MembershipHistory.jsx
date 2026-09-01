import { Badge } from '../../atoms/Badge'
import { formatCurrency, formatDate } from '../../../utils/helpers'
import { MEMBERSHIP_STATUS_VARIANT } from '../../../utils/financialConstants'

export function MembershipHistory({ memberships }) {
  return (
    <details className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <summary className="cursor-pointer px-5 py-4">
        <span className="block text-sm font-semibold text-slate-800">Historial de membresías ({memberships.length})</span>
        <span className="text-xs text-slate-500">Periodos anteriores · solo consulta</span>
      </summary>
      <div className="divide-y divide-slate-100 border-t border-slate-100">
        {memberships.map((membership) => (
          <HistoryRow key={membership.id} membership={membership} />
        ))}
      </div>
    </details>
  )
}

function HistoryRow({ membership }) {
  const statusCode = membership.membership_status?.code
  const variant = MEMBERSHIP_STATUS_VARIANT[statusCode] || 'default'

  return (
    <div className="grid gap-3 px-5 py-4 sm:grid-cols-[1.4fr_1fr_auto] sm:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">{membership.membership_type?.label || 'Membresía'}</p>
          <Badge variant={variant}>{membership.membership_status?.label || '—'}</Badge>
        </div>
        <p className="mt-1 text-xs text-slate-500">{membership.category?.name || 'Sin categoría registrada'}</p>
      </div>
      <p className="text-xs text-slate-500">
        {formatDate(membership.start_date)} — {formatDate(membership.effective_end_date || membership.end_date)}
      </p>
      <p className="text-sm font-semibold text-slate-800">{formatCurrency(membership.fee_amount)}</p>
    </div>
  )
}
