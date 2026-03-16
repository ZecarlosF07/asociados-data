import { useState } from 'react'
import { FormField } from '../FormField'
import { CatalogSelect } from '../CatalogSelect'
import { Button } from '../../atoms/Button'
import { FINANCIAL_CATALOG_GROUPS } from '../../../utils/financialConstants'
import { validatePaymentForm } from '../../../utils/financialValidation'

export function PaymentForm({
  schedules = [],
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({
    payment_schedule_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount_paid: '',
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
          amount_paid: String(schedule.expected_amount),
        }))
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validatePaymentForm(form)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const cleaned = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    )

    onSubmit(cleaned)
  }

  const pendingSchedules = schedules.filter((s) => !s.is_paid)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingSchedules.length > 0 && (
          <FormField label="Cuota a pagar" name="payment_schedule_id"
            helpText="Selecciona la cuota correspondiente."
          >
            <select
              name="payment_schedule_id"
              value={form.payment_schedule_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md text-sm text-slate-900 bg-white border-slate-300 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="">Sin cuota específica</option>
              {pendingSchedules.map((s) => {
                const label = s.period_month
                  ? `${String(s.period_month).padStart(2, '0')}/${s.period_year}`
                  : String(s.period_year)
                return (
                  <option key={s.id} value={s.id}>
                    {label} — S/ {s.expected_amount}
                  </option>
                )
              })}
            </select>
          </FormField>
        )}

        <FormField label="Fecha de pago" name="payment_date" required type="date"
          value={form.payment_date} onChange={handleChange}
          error={errors.payment_date}
        />

        <FormField label="Monto pagado (S/)" name="amount_paid" required
          type="number" step="0.01"
          value={form.amount_paid} onChange={handleChange}
          error={errors.amount_paid}
        />

        <FormField label="Código de operación" name="operation_code" required
          value={form.operation_code} onChange={handleChange}
          error={errors.operation_code}
        />

        <FormField label="Método de pago" name="payment_method_id">
          <CatalogSelect
            groupCode={FINANCIAL_CATALOG_GROUPS.PAYMENT_METHOD}
            value={form.payment_method_id}
            onChange={handleChange}
            name="payment_method_id"
            placeholder="Seleccionar método..."
          />
        </FormField>

        <FormField label="Observaciones" name="reference_notes"
          value={form.reference_notes} onChange={handleChange}
        />
      </div>

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
