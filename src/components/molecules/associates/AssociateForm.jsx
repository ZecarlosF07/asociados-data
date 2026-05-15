import { useState } from 'react'
import { FormField } from '../FormField'
import { Textarea } from '../../atoms/Textarea'
import { CatalogSelect } from '../CatalogSelect'
import { CategorySelect } from '../CategorySelect'
import { CaptadorSelect } from '../CaptadorSelect'
import { UserProfileSelect } from '../UserProfileSelect'
import { Button } from '../../atoms/Button'
import { ASSOCIATE_CATALOG_GROUPS } from '../../../utils/associateConstants'
import { validateAssociateForm } from '../../../utils/associateValidation'

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

    onSubmit(cleaned)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Información interna">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Libro / Padrón" name="book_registry"
            value={form.book_registry} onChange={handleChange}
          />
          <FormField
            label="Estado"
            name="associate_status_id"
            required
            error={errors.associate_status_id}
          >
            <CatalogSelect
              groupCode={ASSOCIATE_CATALOG_GROUPS.STATUS}
              value={form.associate_status_id}
              onChange={handleChange}
              name="associate_status_id"
            />
          </FormField>
          <FormField label="Categoría" name="category_id">
            <CategorySelect
              value={form.category_id}
              onChange={handleChange}
              name="category_id"
            />
          </FormField>
          <FormField label="Responsable afiliación" name="affiliation_responsible_user_id">
            <UserProfileSelect
              value={form.affiliation_responsible_user_id}
              onChange={handleChange}
              name="affiliation_responsible_user_id"
            />
          </FormField>
          <FormField label="Captador" name="captador_id">
            <CaptadorSelect
              value={form.captador_id}
              onChange={handleChange}
              name="captador_id"
              placeholder="Seleccionar captador..."
            />
          </FormField>
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="welcome_status"
              name="welcome_status"
              checked={form.welcome_status}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300"
            />
            <label htmlFor="welcome_status" className="text-xs font-semibold text-slate-800">
              Bienvenida confirmada
            </label>
          </div>
        </div>
      </Section>

      <Section title="Datos de la empresa">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Razón social" name="company_name" required
            value={form.company_name} onChange={handleChange} error={errors.company_name}
          />
          <FormField label="Nombre comercial" name="trade_name"
            value={form.trade_name} onChange={handleChange}
          />
          <FormField label="RUC" name="ruc" required maxLength={11}
            value={form.ruc} onChange={handleChange} error={errors.ruc}
          />
          <FormField label="Actividad económica" name="economic_activity"
            value={form.economic_activity} onChange={handleChange}
          />
          <FormField label="Tipo de actividad" name="activity_type_id">
            <CatalogSelect
              groupCode={ASSOCIATE_CATALOG_GROUPS.ACTIVITY_TYPE}
              value={form.activity_type_id}
              onChange={handleChange}
              name="activity_type_id"
            />
          </FormField>
          <FormField label="Tamaño de empresa" name="company_size_id">
            <CatalogSelect
              groupCode={ASSOCIATE_CATALOG_GROUPS.COMPANY_SIZE}
              value={form.company_size_id}
              onChange={handleChange}
              name="company_size_id"
            />
          </FormField>
          <FormField label="Página web" name="website"
            value={form.website} onChange={handleChange}
          />
        </div>
      </Section>

      <Section title="Datos institucionales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Dirección" name="address"
            value={form.address} onChange={handleChange}
          />
          <FormField label="Correo corporativo" name="corporate_email" type="email"
            value={form.corporate_email} onChange={handleChange}
            error={errors.corporate_email}
          />
          <FormField label="Teléfono fijo" name="landline_phone"
            value={form.landline_phone} onChange={handleChange}
          />
          <FormField label="Celular 1" name="mobile_phone_1"
            value={form.mobile_phone_1} onChange={handleChange}
          />
          <FormField label="Celular 2" name="mobile_phone_2"
            value={form.mobile_phone_2} onChange={handleChange}
          />
          <FormField label="Fecha de asociación" name="association_date" type="date" required
            value={form.association_date} onChange={handleChange}
            error={errors.association_date}
          />
          <FormField label="Fecha de aniversario" name="anniversary_date" type="date"
            value={form.anniversary_date} onChange={handleChange}
          />
        </div>
      </Section>

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
