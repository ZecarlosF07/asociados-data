import { Badge } from '../../atoms/Badge'
import { Button } from '../../atoms/Button'
import { CollectionActionForm } from './CollectionActionForm'
import { PaymentForm } from './PaymentForm'
import { formatDate, formatDateFromDatePart, formatCurrency } from '../../../utils/helpers'

export function PendingPaymentScheduleRow({
  schedule,
  periodLabel,
  badgeVariant,
  statusLabel,
  canEdit,
  showPaidAt,
  isPayOpen,
  isCollectionOpen,
  actionLoading,
  onNavigate,
  onPayClick,
  onCollectionClick,
  onPaymentSubmit,
  onCollectionSubmit,
}) {
  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50">
        <td
          className="py-2 px-4 cursor-pointer"
          onClick={() => onNavigate(schedule.associate_id)}
        >
          <div className="font-medium text-slate-900">
            {schedule.associate?.company_name || '—'}
          </div>
          <div className="text-xs text-slate-400">
            {schedule.associate?.internal_code}
          </div>
        </td>
        <td className="py-2 px-4 text-slate-600">{periodLabel}</td>
        <td className="py-2 px-4 text-slate-600">
          {formatDate(schedule.due_date)}
        </td>
        <td className="py-2 px-4 text-right font-medium text-slate-900">
          {formatCurrency(schedule.expected_amount)}
        </td>
        <td className="py-2 px-4 text-center">
          <Badge variant={badgeVariant}>{statusLabel}</Badge>
        </td>
        {showPaidAt && (
          <td className="py-2 px-4 text-slate-600">
            {schedule.paid_at ? formatDateFromDatePart(schedule.paid_at) : '—'}
          </td>
        )}
        {canEdit && (
          <td className="py-2 px-4 text-center">
            <div className="flex gap-1 justify-center">
              <Button size="sm" variant={isPayOpen ? 'primary' : 'secondary'}
                onClick={() => onPayClick(schedule.id)}
              >
                💳 Pagar
              </Button>
              <Button size="sm" variant={isCollectionOpen ? 'primary' : 'secondary'}
                onClick={() => onCollectionClick(schedule.id)}
              >
                📞 Gestión
              </Button>
            </div>
          </td>
        )}
      </tr>

      {isPayOpen && (
        <ExpandedActionRow canEdit={canEdit} showPaidAt={showPaidAt}>
          <h4 className="text-xs font-bold text-slate-700 mb-2">
            Registrar pago — {schedule.associate?.company_name} — {periodLabel}
          </h4>
          <PaymentForm
            schedules={[schedule]}
            onSubmit={onPaymentSubmit}
            onCancel={() => onPayClick(null)}
            loading={actionLoading}
            requireSchedule
          />
        </ExpandedActionRow>
      )}

      {isCollectionOpen && (
        <ExpandedActionRow canEdit={canEdit} showPaidAt={showPaidAt} tone="amber">
          <h4 className="text-xs font-bold text-slate-700 mb-2">
            Registrar gestión — {schedule.associate?.company_name} — {periodLabel}
          </h4>
          <CollectionActionForm
            schedules={[schedule]}
            onSubmit={onCollectionSubmit}
            onCancel={() => onCollectionClick(null)}
            loading={actionLoading}
          />
        </ExpandedActionRow>
      )}
    </>
  )
}

function ExpandedActionRow({ canEdit, showPaidAt, tone = 'blue', children }) {
  const bgColor = tone === 'amber' ? 'bg-amber-50/50' : 'bg-blue-50/50'

  return (
    <tr>
      <td colSpan={getScheduleColSpan({ canEdit, showPaidAt })}
        className={`px-4 py-3 ${bgColor}`}
      >
        <div className="max-w-2xl">{children}</div>
      </td>
    </tr>
  )
}

function getScheduleColSpan({ canEdit, showPaidAt }) {
  return 5 + (showPaidAt ? 1 : 0) + (canEdit ? 1 : 0)
}
