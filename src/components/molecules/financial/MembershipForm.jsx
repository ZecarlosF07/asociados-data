import { useState } from 'react'
import { FormField } from '../FormField'
import { Textarea } from '../../atoms/Textarea'
import { CatalogSelect } from '../CatalogSelect'
import { CategorySelect } from '../CategorySelect'
import { Button } from '../../atoms/Button'
import { FINANCIAL_CATALOG_GROUPS } from '../../../utils/financialConstants'
import { validateMembershipForm } from '../../../utils/financialValidation'

export function MembershipForm({ initialData, onSubmit, onCancel, loading }) {
  const isEdit = !!initialData?.id

  const [form, setForm] = useState({
    membership_type_id: initialData?.membership_type_id || '',
    category_id: initialData?.category_id || '',
    fee_amount: initialData?.fee_amount || '',
    currency_code: initialData?.currency_code || 'PEN',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    monthly_billing_day: initialData?.monthly_billing_day || '',
    membership_status_id: initialData?.membership_status_id || '',
    negotiation_notes: initialData?.negotiation_notes || '',
    is_current: initialData?.is_current ?? true,
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setForm((prev) => ({ ...prev, [name]: newValue }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateMembershipForm(form)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const cleaned = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    )

    onSubmit(cleaned)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Tipo de membresía" name="membership_type_id" required
          error={errors.membership_type_id}
        >
          <CatalogSelect
            groupCode={FINANCIAL_CATALOG_GROUPS.MEMBERSHIP_TYPE}
            value={form.membership_type_id}
            onChange={handleChange}
            name="membership_type_id"
            placeholder="Seleccionar tipo..."
          />
        </FormField>

        <FormField label="Estado" name="membership_status_id" required
          error={errors.membership_status_id}
        >
          <CatalogSelect
            groupCode={FINANCIAL_CATALOG_GROUPS.MEMBERSHIP_STATUS}
            value={form.membership_status_id}
            onChange={handleChange}
            name="membership_status_id"
            placeholder="Seleccionar estado..."
          />
        </FormField>

        <FormField label="Categoría" name="category_id">
          <CategorySelect
            value={form.category_id}
            onChange={handleChange}
            name="category_id"
          />
        </FormField>

        <FormField label="Tarifa (S/)" name="fee_amount" required type="number"
          step="0.01" value={form.fee_amount} onChange={handleChange}
          error={errors.fee_amount}
        />

        <FormField label="Fecha de inicio" name="start_date" required type="date"
          value={form.start_date} onChange={handleChange}
          error={errors.start_date}
        />

        <FormField label="Fecha de fin" name="end_date" type="date"
          value={form.end_date} onChange={handleChange}
          helpText="Opcional. Se calcula automáticamente para anuales."
        />

        <FormField label="Día de cobro mensual" name="monthly_billing_day"
          type="number" min={1} max={28}
          value={form.monthly_billing_day} onChange={handleChange}
          helpText="Día del mes para cobro (1-28). Solo membresías mensuales."
        />

        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id="is_current"
            name="is_current"
            checked={form.is_current}
            onChange={handleChange}
            className="w-4 h-4 rounded border-slate-300"
          />
          <label htmlFor="is_current" className="text-xs font-semibold text-slate-800">
            Membresía vigente
          </label>
        </div>
      </div>

      <FormField label="Notas de negociación" name="negotiation_notes">
        <Textarea name="negotiation_notes" value={form.negotiation_notes}
          onChange={handleChange} placeholder="Detalles de la negociación..."
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="secondary" type="button" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={loading}>
          {isEdit ? 'Guardar cambios' : 'Crear membresía'}
        </Button>
      </div>
    </form>
  )
}
