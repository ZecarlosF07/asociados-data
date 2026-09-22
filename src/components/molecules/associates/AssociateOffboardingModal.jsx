import { useEffect, useState } from 'react'
import { Button } from '../../atoms/Button'
import { Modal } from '../../organisms/Modal'
import { formatCurrency } from '../../../utils/helpers'

export function AssociateOffboardingModal({ isOpen, associate, impact, loading, canManageMembership, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const isReinstating = !!associate?.is_offboarded
  const title = isReinstating
    ? 'Reincorporar empresa'
    : associate?.associate_status?.code === 'INACTIVO' ? 'Formalizar baja' : 'Dar de baja empresa'

  useEffect(() => {
    if (isOpen) { setReason(''); setError('') }
  }, [isOpen])

  const submit = (event) => {
    event.preventDefault()
    if (!isReinstating && !reason.trim()) {
      setError('Indica el motivo de la baja.')
      return
    }
    onConfirm(isReinstating ? null : reason.trim())
  }

  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} title={title}>
      <form className="space-y-4" onSubmit={submit}>
        {isReinstating ? (
          <p className="text-sm text-slate-600">
            La empresa volverá al estado calculado por sus membresías. No se restaurarán membresías ni comités;
            podrás registrar un nuevo periodo y asignar un comité después.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-600">La baja será efectiva hoy y conservará todo el historial y los pagos.</p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 space-y-1">
              <p>Membresías vigentes a cancelar: <strong>{impact.currentCount}</strong></p>
              <p>Renovaciones programadas a cancelar: <strong>{impact.scheduledCount}</strong></p>
              <p>Asignaciones activas a comités a cerrar: <strong>{impact.committeeCount}</strong></p>
              <p>Deuda ya devengada que seguirá cobrable: <strong>{formatCurrency(impact.dueDebt)}</strong></p>
            </div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="offboard-reason">Motivo de baja *</label>
            <textarea id="offboard-reason" value={reason} onChange={(event) => { setReason(event.target.value); setError('') }}
              rows={3} maxLength={1000} className="w-full rounded-md border border-slate-300 p-2 text-sm"
              placeholder="Explica el motivo de la baja" disabled={loading} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!canManageMembership && impact.requiresMembershipPermission && (
              <p className="text-sm text-red-600">Necesitas permiso de edición de Membresías para completar esta baja.</p>
            )}
          </>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" disabled={loading} onClick={onClose}>Volver</Button>
          <Button type="submit" variant={isReinstating ? 'primary' : 'danger'} loading={loading}
            disabled={!isReinstating && impact.requiresMembershipPermission && !canManageMembership}>
            {isReinstating ? 'Reincorporar' : 'Confirmar baja'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
