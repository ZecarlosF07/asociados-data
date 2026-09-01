import { Badge } from '../../atoms/Badge'
import { formatCurrency, formatDate } from '../../../utils/helpers'
import { MEMBERSHIP_STATUS_VARIANT } from '../../../utils/financialConstants'

export function MembershipCard({ membership, eyebrow, tone, footer, actions }) {
  const statusCode = membership.membership_status?.code
  const variant = MEMBERSHIP_STATUS_VARIANT[statusCode] || 'default'
  const toneClasses = tone === 'amber'
    ? 'border-amber-200 bg-amber-50/60'
    : 'border-blue-200 bg-blue-50/70'

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`border-b p-5 ${toneClasses}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={variant}>{membership.membership_status?.label || '—'}</Badge>
              <span className="text-xs font-medium text-slate-600">{eyebrow}</span>
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              {membership.membership_type?.label || 'Membresía'}
            </h4>
            <p className="mt-1 text-sm text-slate-700">{membership.category?.name || 'Sin categoría'}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tarifa anual</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(membership.fee_amount)}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <MembershipFact label="Inicio" value={formatDate(membership.start_date)} />
        <MembershipFact label="Fin efectivo" value={formatDate(membership.effective_end_date || membership.end_date)} />
        <MembershipFact label="Día de cobro" value={membership.monthly_billing_day || 'No aplica'} />
      </div>
      {membership.negotiation_notes && (
        <div className="border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-700">Acuerdo: </span>{membership.negotiation_notes}
        </div>
      )}
      {(actions || footer) && (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500 sm:mr-auto">{footer}</p>
          {actions}
        </div>
      )}
    </article>
  )
}

function MembershipFact({ label, value }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value || '—'}</p>
    </div>
  )
}
