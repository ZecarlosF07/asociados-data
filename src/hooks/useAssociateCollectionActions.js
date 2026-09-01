import { useState } from 'react'
import { collectionActionsService } from '../services/collectionActions.service'

export function useAssociateCollectionActions({
  associateId,
  profile,
  notify,
  refetch,
}) {
  const [collectionLoading, setCollectionLoading] = useState(false)

  const handleCollectionSubmit = async (data) => {
    setCollectionLoading(true)
    try {
      await collectionActionsService.create({
        ...data,
        associate_id: associateId,
        managed_by_user_id: profile?.id,
      })

      notify.success('Gestión de cobranza registrada')
      refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setCollectionLoading(false)
    }
  }

  return {
    collectionLoading,
    handleCollectionSubmit,
  }
}
