import { useState } from 'react'
import { FormField } from '../FormField'
import { CatalogSelect } from '../CatalogSelect'
import { Button } from '../../atoms/Button'
import { ASSOCIATE_CATALOG_GROUPS } from '../../../utils/associateConstants'
import { validatePersonForm } from '../../../utils/associateValidation'

export function PersonForm({ initialData, onSubmit, onCancel, loading }) {
  const isEdit = !!initialData?.id

  const [form, setForm] = useState({
    full_name: initialData?.full_name || '',
    person_role_id: initialData?.person_role_id || '',
    position: initialData?.position || '',
    email: initialData?.email || '',
    dni: initialData?.dni || '',
    phone: initialData?.phone || '',
    birthday: initialData?.birthday || '',
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
    const validationErrors = validatePersonForm(form)

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
        <FormField label="Tipo de persona" name="person_role_id" required
          error={errors.person_role_id}
        >
          <CatalogSelect
            groupCode={ASSOCIATE_CATALOG_GROUPS.PERSON_ROLE}
            value={form.person_role_id}
            onChange={handleChange}
            name="person_role_id"
            placeholder="Seleccionar tipo..."
          />
        </FormField>
        <FormField label="Cargo" name="position"
          value={form.position} onChange={handleChange}
        />
        <FormField label="DNI" name="dni" maxLength={20}
          value={form.dni} onChange={handleChange}
        />
        <FormField label="Correo" name="email" type="email"
          value={form.email} onChange={handleChange} error={errors.email}
        />
        <FormField label="Teléfono" name="phone"
          value={form.phone} onChange={handleChange}
        />
        <FormField label="Onomástico" name="birthday" type="date"
          value={form.birthday} onChange={handleChange}
        />
        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id="person_is_primary"
            name="is_primary"
            checked={form.is_primary}
            onChange={handleChange}
            className="w-4 h-4 rounded border-slate-300"
          />
          <label htmlFor="person_is_primary" className="text-xs font-semibold text-slate-800">
            Contacto principal del tipo
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="secondary" type="button" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={loading}>
          {isEdit ? 'Guardar' : 'Agregar persona'}
        </Button>
      </div>
    </form>
  )
}
