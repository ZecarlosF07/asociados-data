import { useState } from 'react'
import { Textarea } from '../../atoms/Textarea'
import { Button } from '../../atoms/Button'
import { validateAssociateForm } from '../../../utils/associateValidation'
import { FormField } from '../FormField'
import { AssociateCompanyFields } from './AssociateCompanyFields'
import { AssociateInstitutionalFields } from './AssociateInstitutionalFields'
import { AssociateInternalFields } from './AssociateInternalFields'

export function AssociateForm({ initialData, onSubmit, onCancel, loading }) {
  const isEdit = !!initialData?.id
  const [form, setForm] = useState({
    company_name: initialData?.company_name || '',
    trade_name: initialData?.trade_name || '',
    ruc: initialData?.ruc || '',
    economic_activity: initialData?.economic_activity || '',
    activity_type_id: initialData?.activity_type_id || '',
    company_size_id: initialData?.company_size_id || '',
    address: initialData?.address || '',
    corporate_email: initialData?.corporate_email || '',
    landline_phone: initialData?.landline_phone || '',
    mobile_phone_1: initialData?.mobile_phone_1 || '',
    mobile_phone_2: initialData?.mobile_phone_2 || '',
    website: initialData?.website || '',
    association_date: initialData?.association_date || '',
    anniversary_date: initialData?.anniversary_date || '',
    category_id: initialData?.category_id || '',
    associate_status_id: initialData?.associate_status_id || '',
    affiliation_responsible_user_id:
      initialData?.affiliation_responsible_user_id || '',
    captador_id: initialData?.captador_id || '',
    book_registry: initialData?.book_registry || '',
    welcome_status: initialData?.welcome_status || false,
    notes: initialData?.notes || '',
    committee_id: '',
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
    const validationErrors = validateAssociateForm(form)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const cleaned = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    )

    if (isEdit) {
      const associateFields = Object.fromEntries(
        Object.entries(cleaned).filter(([key]) => key !== 'committee_id')
      )
      onSubmit(associateFields)
      return
    }

    onSubmit(cleaned)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AssociateInternalFields errors={errors} form={form} onChange={handleChange} />
      <AssociateCompanyFields errors={errors} form={form} isEdit={isEdit} onChange={handleChange} />
      <AssociateInstitutionalFields errors={errors} form={form} onChange={handleChange} />

      <FormField label="Observaciones" name="notes">
        <Textarea name="notes" value={form.notes} onChange={handleChange}
          placeholder="Observaciones generales..."
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? 'Guardar cambios' : 'Crear asociado'}
        </Button>
      </div>
    </form>
  )
}
