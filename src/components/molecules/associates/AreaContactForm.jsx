import { useState } from 'react'
import { FormField } from '../FormField'
import { CatalogSelect } from '../CatalogSelect'
import { Button } from '../../atoms/Button'
import { ASSOCIATE_CATALOG_GROUPS } from '../../../utils/associateConstants'
import { validateAreaContactForm } from '../../../utils/associateValidation'

export function AreaContactForm({ initialData, onSubmit, onCancel, loading }) {
  const isEdit = !!initialData?.id

  const [form, setForm] = useState({
    full_name: initialData?.full_name || '',
    area_id: initialData?.area_id || '',
    position: initialData?.position || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    is_primary: initialData?.is_primary || false,
    notes: initialData?.notes || '',
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
    const validationErrors = validateAreaContactForm(form)

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
        <FormField label="Nombre completo" name="full_name" required
          value={form.full_name} onChange={handleChange} error={errors.full_name}
        />
        <FormField label="Área" name="area_id" required error={errors.area_id}>
          <CatalogSelect
            groupCode={ASSOCIATE_CATALOG_GROUPS.AREA}
            value={form.area_id}
            onChange={handleChange}
            name="area_id"
            placeholder="Seleccionar área..."
          />
        </FormField>
        <FormField label="Cargo" name="position"
          value={form.position} onChange={handleChange}
        />
        <FormField label="Correo" name="email" type="email"
          value={form.email} onChange={handleChange} error={errors.email}
        />
        <FormField label="Teléfono" name="phone"
          value={form.phone} onChange={handleChange}
        />
        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id="contact_is_primary"
            name="is_primary"
            checked={form.is_primary}
            onChange={handleChange}
            className="w-4 h-4 rounded border-slate-300"
          />
          <label htmlFor="contact_is_primary" className="text-xs font-semibold text-slate-800">
            Contacto principal del área
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="secondary" type="button" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={loading}>
          {isEdit ? 'Guardar' : 'Agregar contacto'}
        </Button>
      </div>
    </form>
  )
}
