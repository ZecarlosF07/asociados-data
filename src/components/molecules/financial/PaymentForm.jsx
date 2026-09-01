import { useState } from 'react'
import { Button } from '../../atoms/Button'
import { validatePaymentForm } from '../../../utils/financialValidation'
import { todayDateOnly } from '../../../utils/dateOnly'
import { PaymentFormFields } from './PaymentFormFields'

export function PaymentForm({
  schedules = [],
  onSubmit,
  onCancel,
  loading,
  requireSchedule = false,
}) {
  const initialSchedule = schedules.length === 1 ? schedules[0] : null
  const [form, setForm] = useState({
    payment_schedule_id: initialSchedule?.id || '',
    payment_date: todayDateOnly(),
    amount_paid: initialSchedule?.outstanding_amount
      ? String(initialSchedule.outstanding_amount)
      : '',
    operation_code: '',
    payment_method_id: '',
    reference_notes: '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))

    // Auto-llenar monto al seleccionar cuota
    if (name === 'payment_schedule_id' && value) {
      const schedule = schedules.find((s) => s.id === value)
      if (schedule) {
        setForm((prev) => ({
          ...prev,
          [name]: value,
          amount_paid: String(schedule.outstanding_amount),
        }))
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const selectedSchedule = pendingSchedules.find(
      (schedule) => schedule.id === form.payment_schedule_id
    )
    const validationErrors = validatePaymentForm(form, {
      requireSchedule,
      maxAmount: selectedSchedule?.outstanding_amount,
      maxDate: todayDateOnly(),
      minDate: selectedSchedule?.membership_start_date,
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const cleaned = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    )

    onSubmit(cleaned)
  }

  const pendingSchedules = schedules.filter((schedule) => schedule.is_collectible)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentFormFields
        errors={errors}
        form={form}
        onChange={handleChange}
        requireSchedule={requireSchedule}
        schedules={pendingSchedules}
      />

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="secondary" type="button" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={loading}>
          Registrar pago
        </Button>
      </div>
    </form>
  )
}
