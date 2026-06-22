import { useState } from 'react'
import { associatesService } from '../services/associates.service'

export function useAssociateCommitteeActions({ associateId, notify, refetch }) {
  const [mode, setMode] = useState(null)
  const [loading, setLoading] = useState(false)

  const close = () => setMode(null)

  const submit = async (values) => {
    setLoading(true)
    try {
      if (mode === 'remove') {
        await associatesService.clearPrimaryCommittee(associateId, values)
        notify.success('Comité retirado')
      } else {
        await associatesService.setPrimaryCommittee(associateId, values)
        notify.success(mode === 'change' ? 'Comité actualizado' : 'Comité asignado')
      }
      close()
      refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return { close, loading, mode, open: setMode, submit }
}
