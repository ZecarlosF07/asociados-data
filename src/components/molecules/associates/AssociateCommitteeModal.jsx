import { useEffect, useState } from 'react'
import { Button } from '../../atoms/Button'
import { Textarea } from '../../atoms/Textarea'
import { Modal } from '../../organisms/Modal'
import { compareDateOnly, todayDateOnly } from '../../../utils/dateOnly'
import { CommitteeSelect } from '../CommitteeSelect'
import { FormField } from '../FormField'

export function AssociateCommitteeModal({ isOpen, loading, mode, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm())
  const [error, setError] = useState('')
  const isRemove = mode === 'remove'

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm())
      setError('')
    }
  }, [isOpen])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!isRemove && !form.committeeId) {
      setError('Selecciona un comité.')
      return
    }
    if (!form.effectiveDate || compareDateOnly(form.effectiveDate, todayDateOnly()) > 0) {
      setError('Ingresa una fecha efectiva válida y no futura.')
      return
    }
    onSubmit(form)
  }

  const title = isRemove ? 'Retirar comité' : mode === 'change' ? 'Cambiar comité' : 'Asignar comité'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isRemove && (
          <FormField label="Comité" name="committeeId" required error={!form.committeeId ? error : ''}>
            <CommitteeSelect name="committeeId" value={form.committeeId} onChange={handleChange} placeholder="Seleccionar comité..." />
          </FormField>
        )}
        <FormField label="Fecha efectiva" name="effectiveDate" type="date" required value={form.effectiveDate} onChange={handleChange} />
        <FormField label="Observación" name="notes">
          <Textarea name="notes" value={form.notes} onChange={handleChange} />
        </FormField>
        {error && !(!isRemove && !form.committeeId) && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>{isRemove ? 'Retirar' : 'Confirmar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function initialForm() {
  return { committeeId: '', effectiveDate: todayDateOnly(), notes: '' }
}
