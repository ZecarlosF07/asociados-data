import { useState } from 'react'
import { Modal } from '../../organisms/Modal'
import { CatalogSelect } from '../CatalogSelect'
import { Textarea } from '../../atoms/Textarea'
import { Button } from '../../atoms/Button'
import { FormField } from '../FormField'
import { PROSPECT_CATALOG_GROUPS } from '../../../utils/prospectConstants'

export function StatusChangeModal({
  isOpen,
  onClose,
  currentStatusId,
  onSubmit,
  loading,
}) {
  const [newStatusId, setNewStatusId] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = () => {
    if (!newStatusId) {
      setError('Selecciona un estado')
      return
    }

    if (newStatusId === currentStatusId) {
      setError('El nuevo estado debe ser diferente al actual')
      return
    }

    onSubmit({ newStatusId, reason })
    setNewStatusId('')
    setReason('')
    setError(null)
  }

  const handleClose = () => {
    setNewStatusId('')
    setReason('')
    setError(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cambiar estado del prospecto"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Cambiar estado
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Nuevo estado" name="newStatusId" required error={error}>
          <CatalogSelect
            groupCode={PROSPECT_CATALOG_GROUPS.STATUS}
            value={newStatusId}
            onChange={(e) => {
              setNewStatusId(e.target.value)
              setError(null)
            }}
            name="newStatusId"
            hasError={!!error}
          />
        </FormField>

        <FormField label="Motivo del cambio" name="reason">
          <Textarea
            name="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo o comentario opcional..."
            rows={2}
          />
        </FormField>
      </div>
    </Modal>
  )
}
