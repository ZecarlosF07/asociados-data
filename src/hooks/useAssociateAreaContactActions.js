import { useState } from 'react'
import { associatesService } from '../services/associates.service'

export function useAssociateAreaContactActions({ associateId, notify, profile, refetch }) {
  const [loading, setLoading] = useState(false)

  const create = async (data) => run(async () => {
    await associatesService.createAreaContact({ ...data, associate_id: associateId, created_by: profile?.id })
    notify.success('Contacto registrado')
    refetch()
  })

  const update = async (contactId, data) => run(async () => {
    await associatesService.updateAreaContact(contactId, { ...data, updated_by: profile?.id })
    notify.success('Contacto actualizado')
    refetch()
  })

  const remove = async (contact) => {
    if (!confirm(`¿Eliminar a ${contact.full_name}?`)) return
    await run(async () => {
      await associatesService.softDeleteAreaContact(contact.id, profile?.id)
      notify.success('Contacto eliminado')
      refetch()
    })
  }

  const run = async (callback) => {
    setLoading(true)
    try {
      await callback()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return { create, loading, remove, update }
}
