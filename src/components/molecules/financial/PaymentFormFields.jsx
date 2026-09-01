import { todayDateOnly } from '../../../utils/dateOnly'
import { FINANCIAL_CATALOG_GROUPS } from '../../../utils/financialConstants'
import { CatalogSelect } from '../CatalogSelect'
import { FormField } from '../FormField'

export function PaymentFormFields({ errors, form, onChange, requireSchedule, schedules }) {
  const selectedSchedule = schedules.find(
    (schedule) => schedule.id === form.payment_schedule_id
  )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {schedules.length > 0 && (
        <FormField label="Cuota a pagar" name="payment_schedule_id"
          helpText="Selecciona la cuota correspondiente." error={errors.payment_schedule_id}>
          <select name="payment_schedule_id" value={form.payment_schedule_id}
            onChange={onChange}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10">
            <option value="">
              {requireSchedule ? 'Seleccionar cuota...' : 'Sin cuota específica'}
            </option>
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {getScheduleLabel(schedule)} — saldo S/ {schedule.outstanding_amount}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <FormField label="Fecha de pago" name="payment_date" required type="date"
        min={selectedSchedule?.membership_start_date} max={todayDateOnly()}
        value={form.payment_date} onChange={onChange} error={errors.payment_date} />
      <FormField label="Monto pagado (S/)" name="amount_paid" required
        type="number" min="0.01" step="0.01" max={selectedSchedule?.outstanding_amount}
        value={form.amount_paid} onChange={onChange} error={errors.amount_paid} />
      <FormField label="N° de Factura" name="operation_code" required
        value={form.operation_code} onChange={onChange} error={errors.operation_code} />
      <FormField label="Método de pago" name="payment_method_id">
        <CatalogSelect groupCode={FINANCIAL_CATALOG_GROUPS.PAYMENT_METHOD}
          value={form.payment_method_id} onChange={onChange}
          name="payment_method_id" placeholder="Seleccionar método..." />
      </FormField>
      <FormField label="Observaciones" name="reference_notes"
        value={form.reference_notes} onChange={onChange} />
    </div>
  )
}

function getScheduleLabel(schedule) {
  return schedule.period_month
    ? `${String(schedule.period_month).padStart(2, '0')}/${schedule.period_year}`
    : String(schedule.period_year)
}
