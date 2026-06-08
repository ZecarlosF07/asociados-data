import { PendingPaymentScheduleRow } from './PendingPaymentScheduleRow'
import { COLLECTION_STATUS_VARIANT } from '../../../utils/financialConstants'
import {
  getScheduleDisplayStatus,
  getSchedulePeriodLabel,
} from '../../../utils/paymentScheduleUtils'

export function PendingPaymentScheduleSection({
  title,
  items,
  variant,
  canEdit,
  activePaymentRow,
  activeCollectionRow,
  actionLoading,
  showPaidAt = false,
  onNavigate,
  onPayClick,
  onCollectionClick,
  onPaymentSubmit,
  onCollectionSubmit,
}) {
  const colors = SECTION_STYLES[variant] || SECTION_STYLES.warning

  return (
    <div className={`border ${colors.borderColor} ${colors.bgColor} rounded-lg overflow-hidden`}>
      <div className="px-4 py-3">
        <h2 className={`text-sm font-bold ${colors.titleColor}`}>{title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm bg-white">
          <ScheduleHeader canEdit={canEdit} showPaidAt={showPaidAt} />
          <tbody>
            {items.map((schedule) => {
              const status = getScheduleDisplayStatus(schedule)

              return (
                <PendingPaymentScheduleRow
                  key={schedule.id}
                  schedule={schedule}
                  periodLabel={getSchedulePeriodLabel(schedule)}
                  badgeVariant={COLLECTION_STATUS_VARIANT[status.code] || 'default'}
                  statusLabel={status.label}
                  canEdit={canEdit}
                  showPaidAt={showPaidAt}
                  isPayOpen={activePaymentRow === schedule.id}
                  isCollectionOpen={activeCollectionRow === schedule.id}
                  actionLoading={actionLoading}
                  onNavigate={onNavigate}
                  onPayClick={onPayClick}
                  onCollectionClick={onCollectionClick}
                  onPaymentSubmit={onPaymentSubmit}
                  onCollectionSubmit={onCollectionSubmit}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ScheduleHeader({ canEdit, showPaidAt }) {
  return (
    <thead>
      <tr className="border-b border-slate-200 bg-slate-50">
        <HeaderCell>Asociado</HeaderCell>
        <HeaderCell>Período</HeaderCell>
        <HeaderCell>Vencimiento</HeaderCell>
        <HeaderCell align="right">Monto</HeaderCell>
        <HeaderCell align="center">Estado</HeaderCell>
        {showPaidAt && <HeaderCell>Pagado el</HeaderCell>}
        {canEdit && <HeaderCell align="center">Acciones</HeaderCell>}
      </tr>
    </thead>
  )
}

function HeaderCell({ align = 'left', children }) {
  const alignClass = {
    center: 'text-center',
    left: 'text-left',
    right: 'text-right',
  }[align]

  return (
    <th className={`${alignClass} py-2 px-4 text-xs font-semibold text-slate-500`}>
      {children}
    </th>
  )
}

const SECTION_STYLES = {
  danger: {
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50/40',
    titleColor: 'text-red-700',
  },
  success: {
    borderColor: 'border-emerald-200',
    bgColor: 'bg-emerald-50/40',
    titleColor: 'text-emerald-700',
  },
  warning: {
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50/40',
    titleColor: 'text-amber-700',
  },
}
