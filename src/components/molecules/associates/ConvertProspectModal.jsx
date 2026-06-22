import { useState } from 'react'
import { Button } from '../../atoms/Button'
import { validateConversionForm } from '../../../utils/associateValidation'
import { todayDateOnly } from '../../../utils/dateOnly'
import { ConversionAssociateFields } from './ConversionAssociateFields'

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
    committeeId: '',
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

            <ConversionAssociateFields
              errors={errors}
              form={form}
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
