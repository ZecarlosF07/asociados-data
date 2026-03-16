import { useState } from 'react'
import { FormField } from '../FormField'
import { Textarea } from '../../atoms/Textarea'
import { CatalogSelect } from '../CatalogSelect'
import { CategorySelect } from '../CategorySelect'
import { Button } from '../../atoms/Button'
import { PROSPECT_CATALOG_GROUPS } from '../../../utils/prospectConstants'
import { validateQuoteForm } from '../../../utils/prospectValidation'

export function QuoteForm({ prospect, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    quoted_amount: prospect?.negotiated_fee || prospect?.suggested_fee || '',
    currency_code: 'PEN',
    category_id: prospect?.current_category_id || '',
    quote_status_id: '',
    expiration_date: '',
    sent_to_email: prospect?.primary_email || '',
    notes: '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateQuoteForm(form)

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
        <FormField label="Monto cotizado" name="quoted_amount" required
          type="number" step="0.01" value={form.quoted_amount}
          onChange={handleChange} error={errors.quoted_amount}
        />
        <FormField label="Moneda" name="currency_code">
          <select name="currency_code" value={form.currency_code}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-blue-500"
          >
            <option value="PEN">PEN (Soles)</option>
            <option value="USD">USD (Dólares)</option>
          </select>
        </FormField>
        <FormField label="Categoría" name="category_id">
          <CategorySelect value={form.category_id} onChange={handleChange}
            name="category_id"
          />
        </FormField>
        <FormField label="Estado" name="quote_status_id" required
          error={errors.quote_status_id}
        >
          <CatalogSelect groupCode={PROSPECT_CATALOG_GROUPS.QUOTE_STATUS}
            value={form.quote_status_id} onChange={handleChange}
            name="quote_status_id" hasError={!!errors.quote_status_id}
          />
        </FormField>
        <FormField label="Fecha de vencimiento" name="expiration_date"
          type="date" value={form.expiration_date} onChange={handleChange}
        />
        <FormField label="Correo destino" name="sent_to_email" type="email"
          value={form.sent_to_email} onChange={handleChange}
        />
      </div>

      <FormField label="Notas" name="notes">
        <Textarea name="notes" value={form.notes} onChange={handleChange}
          placeholder="Notas de la cotización..."
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={loading}>
          Registrar cotización
        </Button>
      </div>
    </form>
  )
}
