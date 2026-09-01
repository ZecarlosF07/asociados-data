import { Badge } from '../../atoms/Badge'
import { Button } from '../../atoms/Button'
import { formatDate, formatCurrency } from '../../../utils/helpers'
import { MEMBERSHIP_STATUS_VARIANT } from '../../../utils/financialConstants'

export function MembershipList(props) {
  const { currentMembership, history, canRenew, canCancel, onCancel, onRenew } = props
  return (
    <div className="space-y-4">
      {currentMembership && (
        <CurrentMembershipCard membership={currentMembership}
          canRenew={canRenew} canCancel={canCancel}
          onRenew={onRenew} onCancel={onCancel} />
      )}
      {history.length > 0 && <MembershipHistory memberships={history} />}
    </div>
  )
}

function CurrentMembershipCard({ membership, canRenew, canCancel, onRenew, onCancel }) {
  const variant = MEMBERSHIP_STATUS_VARIANT[membership.membership_status?.code] || 'default'
  return (
    <article className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
      <div className="border-b border-blue-100 bg-blue-50/70 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={variant}>{membership.membership_status?.label || 'Vigente'}</Badge>
              <span className="text-xs font-medium text-slate-500">Membresía actual</span>
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              {membership.membership_type?.label || 'Membresía'}
            </h4>
            <p className="mt-1 text-sm text-blue-800">{membership.category?.name || 'Sin categoría'}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tarifa</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(membership.fee_amount)}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <MembershipFact label="Inicio" value={formatDate(membership.start_date)} />
        <MembershipFact label="Fin" value={membership.end_date ? formatDate(membership.end_date) : 'Por calcular'} />
        <MembershipFact label="Día de cobro" value={membership.monthly_billing_day || 'No aplica'} />
      </div>
      {membership.negotiation_notes && (
        <div className="border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-700">Acuerdo: </span>{membership.negotiation_notes}
        </div>
      )}
      {(canRenew || canCancel) && (
        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500 sm:mr-auto">Renovar conserva este periodo en el historial.</p>
          {canCancel && <Button variant="secondary" onClick={() => onCancel(membership)}>Cancelar membresía</Button>}
          {canRenew && <Button onClick={() => onRenew(membership)}>Renovar membresía</Button>}
        </div>
      )}
    </article>
  )
}

function MembershipFact({ label, value }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function MembershipHistory({ memberships }) {
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
  const variant = MEMBERSHIP_STATUS_VARIANT[membership.membership_status?.code] || 'default'
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
        {formatDate(membership.start_date)} — {membership.end_date ? formatDate(membership.end_date) : 'Sin fecha de fin'}
      </p>
      <p className="text-sm font-semibold text-slate-800">{formatCurrency(membership.fee_amount)}</p>
    </div>
  )
}
