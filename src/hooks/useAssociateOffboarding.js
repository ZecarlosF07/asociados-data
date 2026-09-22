import { useState } from 'react'
import { associatesService } from '../services/associates.service'

export function useAssociateOffboarding({ associateId, notify, refetch }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const confirm = async (isOffboarded, reason, expectedStatusCode) => {
    setLoading(true)
    try {
      if (isOffboarded) await associatesService.reinstate(associateId)
      else await associatesService.offboard(associateId, reason, expectedStatusCode)
      notify.success(isOffboarded ? 'Empresa reincorporada' : 'Baja registrada')
      setModalOpen(false)
      await refetch()
    } catch (error) {
      notify.error(error.message)
      if (error.code === '40001') {
        setModalOpen(false)
        await refetch()
      }
    } finally {
      setLoading(false)
    }
  }

  return { modalOpen, loading, open: () => setModalOpen(true), close: () => setModalOpen(false), confirm }
}
