import { useState } from 'react'
import { FormField } from '../FormField'
import { Textarea } from '../../atoms/Textarea'
import { CatalogSelect } from '../CatalogSelect'
import { CategorySelect } from '../CategorySelect'
import { Button } from '../../atoms/Button'
import { PROSPECT_CATALOG_GROUPS } from '../../../utils/prospectConstants'
import { validateProspectForm } from '../../../utils/prospectValidation'

export function ProspectForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    company_name: initialData?.company_name || '',
    trade_name: initialData?.trade_name || '',
    ruc: initialData?.ruc || '',
    economic_activity: initialData?.economic_activity || '',
    activity_type_id: initialData?.activity_type_id || '',
    company_size_id: initialData?.company_size_id || '',
    primary_email: initialData?.primary_email || '',
    contact_name: initialData?.contact_name || '',
    contact_position: initialData?.contact_position || '',
    contact_phone: initialData?.contact_phone || '',
    source: initialData?.source || '',
    notes: initialData?.notes || '',
    current_category_id: initialData?.current_category_id || '',
    suggested_fee: initialData?.suggested_fee || '',
    negotiated_fee: initialData?.negotiated_fee || '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateProspectForm(form)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Limpiar valores vacíos para evitar errores en Supabase
    const cleaned = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    )

    onSubmit(cleaned)
  }

  const isEdit = !!initialData?.id

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Información de la empresa">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Razón social" name="company_name" required
            value={form.company_name} onChange={handleChange} error={errors.company_name}
          />
          <FormField label="Nombre comercial" name="trade_name"
            value={form.trade_name} onChange={handleChange}
          />
          <FormField label="RUC" name="ruc" maxLength={20}
            value={form.ruc} onChange={handleChange} error={errors.ruc}
          />
          <FormField label="Actividad económica" name="economic_activity"
            value={form.economic_activity} onChange={handleChange}
          />
          <FormField label="Tipo de actividad" name="activity_type_id">
            <CatalogSelect groupCode={PROSPECT_CATALOG_GROUPS.ACTIVITY_TYPE}
              value={form.activity_type_id} onChange={handleChange} name="activity_type_id"
            />
          </FormField>
          <FormField label="Tamaño de empresa" name="company_size_id">
            <CatalogSelect groupCode={PROSPECT_CATALOG_GROUPS.COMPANY_SIZE}
              value={form.company_size_id} onChange={handleChange} name="company_size_id"
            />
          </FormField>
        </div>
      </Section>

      <Section title="Contacto principal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nombre de contacto" name="contact_name"
            value={form.contact_name} onChange={handleChange}
          />
          <FormField label="Cargo" name="contact_position"
            value={form.contact_position} onChange={handleChange}
          />
          <FormField label="Correo" name="primary_email" type="email"
            value={form.primary_email} onChange={handleChange} error={errors.primary_email}
          />
          <FormField label="Teléfono" name="contact_phone"
            value={form.contact_phone} onChange={handleChange}
          />
        </div>
      </Section>

      <Section title="Clasificación y tarifas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Categoría" name="current_category_id">
            <CategorySelect value={form.current_category_id}
              onChange={handleChange} name="current_category_id"
            />
          </FormField>
          <FormField label="Procedencia" name="source"
            value={form.source} onChange={handleChange}
          />
          <FormField label="Tarifa sugerida" name="suggested_fee" type="number" step="0.01"
            value={form.suggested_fee} onChange={handleChange}
          />
          <FormField label="Tarifa negociada" name="negotiated_fee" type="number" step="0.01"
            value={form.negotiated_fee} onChange={handleChange}
          />
        </div>
      </Section>

      <FormField label="Observaciones" name="notes">
        <Textarea name="notes" value={form.notes} onChange={handleChange}
          placeholder="Notas adicionales sobre el prospecto..."
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? 'Guardar cambios' : 'Registrar prospecto'}
        </Button>
      </div>
    </form>
  )
}

function Section({ title, children }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-bold text-slate-700 pb-1 border-b border-slate-100 w-full">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}
