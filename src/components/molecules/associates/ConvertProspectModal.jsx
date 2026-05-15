import { useState } from 'react'
import { FormField } from '../FormField'
import { CatalogSelect } from '../CatalogSelect'
import { UserProfileSelect } from '../UserProfileSelect'
import { Button } from '../../atoms/Button'
import { ASSOCIATE_CATALOG_GROUPS } from '../../../utils/associateConstants'
import { validateConversionForm } from '../../../utils/associateValidation'
import { todayDateOnly } from '../../../utils/dateOnly'

export function ConvertProspectModal({
  isOpen,
  prospect,
  onClose,
  onSubmit,
  loading,
  submitError,
}) {
  const [form, setForm] = useState({
    ruc: prospect?.ruc || '',
    statusId: '',
    associationDate: todayDateOnly(),
    responsibleUserId: '',
    notes: '',
  })

  const [errors, setErrors] = useState({})

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateConversionForm(form)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSubmit(form)
  }

  const isConverted = !!prospect?.converted_to_associate_id

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Convertir a asociado
        </h2>
        <p className="text-sm text-slate-400 mb-5">
          El prospecto <strong>{prospect?.company_name}</strong> será
          convertido en asociado formal.
        </p>

        {isConverted ? (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            Este prospecto ya fue convertido a asociado.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
                {submitError}
              </div>
            )}

            <FormField
              label="RUC"
              name="ruc"
              required
              value={form.ruc}
              onChange={handleChange}
              error={errors.ruc}
              maxLength={11}
              helpText="Es obligatorio para completar la conversión."
            />

            <FormField
              label="Estado inicial del asociado"
              name="statusId"
              required
              error={errors.statusId}
            >
              <CatalogSelect
                groupCode={ASSOCIATE_CATALOG_GROUPS.STATUS}
                value={form.statusId}
                onChange={handleChange}
                name="statusId"
                placeholder="Seleccionar estado..."
              />
            </FormField>

            <FormField
              label="Fecha de asociación"
              name="associationDate"
              type="date"
              required
              value={form.associationDate}
              onChange={handleChange}
              error={errors.associationDate}
            />

            <FormField
              label="Responsable de afiliación"
              name="responsibleUserId"
            >
              <UserProfileSelect
                value={form.responsibleUserId}
                onChange={handleChange}
                name="responsibleUserId"
                placeholder="Seleccionar responsable..."
              />
            </FormField>

            <FormField
              label="Observaciones"
              name="notes"
              value={form.notes}
              onChange={handleChange}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                type="button"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={loading}>
                Convertir a asociado
              </Button>
            </div>
          </form>
        )}

        {isConverted && (
          <div className="flex justify-end pt-3">
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
