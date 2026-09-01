import { useState } from 'react'
import { FormField } from '../FormField'
import { Textarea } from '../../atoms/Textarea'
import { CatalogSelect } from '../CatalogSelect'
import { Button } from '../../atoms/Button'
import { MembershipCategoryField } from './MembershipCategoryField'
import { FINANCIAL_CATALOG_GROUPS, requiresMembershipBillingDay } from '../../../utils/financialConstants'
import { validateMembershipForm } from '../../../utils/financialValidation'
import { useCatalog } from '../../../hooks/useCatalog'
import { addDaysToDateOnly, addYearsToDateOnly, formatDateOnly } from '../../../utils/dateOnly'

export function MembershipForm(props) {
  const { initialData, associateCategory, mode = 'create', onSubmit, onCancel, loading } = props
  const { items: membershipTypes } = useCatalog(FINANCIAL_CATALOG_GROUPS.MEMBERSHIP_TYPE)
  const [form, setForm] = useState({
    membership_type_id: initialData?.membership_type_id || '',
    fee_amount: initialData?.fee_amount ?? associateCategory?.base_fee ?? '',
    start_date: initialData?.start_date || '',
    monthly_billing_day: initialData?.monthly_billing_day || '',
    negotiation_notes: initialData?.negotiation_notes || '',
  })
  const [errors, setErrors] = useState({})
  const selectedType = membershipTypes.find((item) => item.id === form.membership_type_id)
  const requiresBillingDay = requiresMembershipBillingDay(selectedType?.code)

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: null }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      monthly_billing_day: requiresBillingDay ? form.monthly_billing_day : null,
    }
    const validationErrors = validateMembershipForm(payload, {
      membershipTypeCode: selectedType?.code,
    })
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    onSubmit(Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [key, value === '' ? null : value])
    ))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <MembershipCategoryField category={associateCategory} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Modalidad de pago" name="membership_type_id" required error={errors.membership_type_id}>
          <CatalogSelect groupCode={FINANCIAL_CATALOG_GROUPS.MEMBERSHIP_TYPE}
            value={form.membership_type_id} onChange={handleChange}
            name="membership_type_id" placeholder="Selecciona una modalidad" />
        </FormField>
        <FormField label="Tarifa de membresía (S/)" name="fee_amount" required
          type="number" min="0.01" step="0.01" value={form.fee_amount}
          onChange={handleChange} error={errors.fee_amount}
          helpText="Este monto pertenece a este periodo de membresía." />
        <FormField label="Fecha de inicio" name="start_date" required type="date"
          value={form.start_date} onChange={handleChange} error={errors.start_date} />
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs font-semibold text-slate-500">Fin de cobertura</p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {form.start_date ? formatDateOnly(getAnnualEndDate(form.start_date)) : 'Se calculará al elegir el inicio'}
          </p>
          <p className="mt-1 text-xs text-slate-500">Todas las membresías cubren un año.</p>
        </div>
        {requiresBillingDay && (
          <FormField label="Día de cobro" name="monthly_billing_day" required
            type="number" min={1} max={28} value={form.monthly_billing_day}
            onChange={handleChange} error={errors.monthly_billing_day}
            helpText="Elige un día entre el 1 y el 28." />
        )}
      </div>
      <FormField label="Notas de negociación" name="negotiation_notes"
        helpText="Opcional. Registra acuerdos particulares de este periodo.">
        <Textarea name="negotiation_notes" value={form.negotiation_notes}
          onChange={handleChange} placeholder="Ejemplo: descuento aprobado o condiciones especiales" />
      </FormField>
      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" type="button" onClick={onCancel}>Volver</Button>
        <Button type="submit" loading={loading}>
          {mode === 'renew' ? 'Confirmar renovación' : 'Crear membresía'}
        </Button>
      </div>
    </form>
  )
}

function getAnnualEndDate(startDate) {
  return addDaysToDateOnly(addYearsToDateOnly(startDate, 1), -1)
}
