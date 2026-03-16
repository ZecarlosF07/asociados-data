import { useState } from 'react'
import { FormField } from '../FormField'
import { CatalogSelect } from '../CatalogSelect'
import { Button } from '../../atoms/Button'
import { FINANCIAL_CATALOG_GROUPS } from '../../../utils/financialConstants'
import { validateCollectionActionForm } from '../../../utils/financialValidation'

export function CollectionActionForm({ onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    contact_type_id: '',
    subject: '',
    short_observation: '',
    mail_to: '',
    action_result_id: '',
    next_follow_up_at: '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateCollectionActionForm(form)

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
        <FormField label="Tipo de contacto" name="contact_type_id" required
          error={errors.contact_type_id}
        >
          <CatalogSelect
            groupCode={FINANCIAL_CATALOG_GROUPS.CONTACT_TYPE}
            value={form.contact_type_id}
            onChange={handleChange}
            name="contact_type_id"
            placeholder="Seleccionar tipo..."
          />
        </FormField>

        <FormField label="Resultado" name="action_result_id">
          <CatalogSelect
            groupCode={FINANCIAL_CATALOG_GROUPS.COLLECTION_RESULT}
            value={form.action_result_id}
            onChange={handleChange}
            name="action_result_id"
            placeholder="Seleccionar resultado..."
          />
        </FormField>

        <FormField label="Asunto" name="subject" required
          value={form.subject} onChange={handleChange}
          error={errors.subject}
        />

        <FormField label="Correo destino" name="mail_to" type="email"
          value={form.mail_to} onChange={handleChange}
          helpText="Si la acción es tipo correo."
        />

        <FormField label="Observación" name="short_observation"
          value={form.short_observation} onChange={handleChange}
        />

        <FormField label="Próximo seguimiento" name="next_follow_up_at"
          type="datetime-local"
          value={form.next_follow_up_at} onChange={handleChange}
        />
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="secondary" type="button" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={loading}>
          Registrar gestión
        </Button>
      </div>
    </form>
  )
}
