import { useState } from 'react'
import { Button } from '../../atoms/Button'
import { PaymentForm } from './PaymentForm'
import { PaymentList } from './PaymentList'
import { ScheduleTable } from './ScheduleTable'

export function AssociatePaymentsTab({
  schedules = [],
  payments = [],
  canEdit,
  actionLoading,
  onPaymentSubmit,
}) {
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const pendingSchedules = schedules.filter((schedule) => !schedule.is_paid)

  const handleSubmit = async (data) => {
    await onPaymentSubmit(data)
    setShowPaymentForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-700">
          Pagos registrados ({payments.length})
        </h3>
        {canEdit && !showPaymentForm && (
          <Button
            size="sm"
            onClick={() => setShowPaymentForm(true)}
            disabled={pendingSchedules.length === 0}
          >
            + Registrar pago
          </Button>
        )}
      </div>

      {canEdit && showPaymentForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <PaymentForm
            schedules={pendingSchedules}
            onSubmit={handleSubmit}
            onCancel={() => setShowPaymentForm(false)}
            loading={actionLoading}
            requireSchedule
          />
        </div>
      )}

      <PaymentList payments={payments} />

      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3">
          Cronograma
        </h3>
        <ScheduleTable schedules={schedules} />
      </div>
    </div>
  )
}
