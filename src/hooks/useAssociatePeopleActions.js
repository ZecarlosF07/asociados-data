import { useState } from 'react'
import { associatesService } from '../services/associates.service'

export function useAssociatePeopleActions({ associateId, notify, profile, refetch }) {
  const [loading, setLoading] = useState(false)

  const create = async (data) => run(async () => {
    await associatesService.createPerson({ ...data, associate_id: associateId, created_by: profile?.id })
    notify.success('Persona registrada')
    refetch()
  })

  const update = async (personId, data) => run(async () => {
    await associatesService.updatePerson(personId, { ...data, updated_by: profile?.id })
    notify.success('Persona actualizada')
    refetch()
  })

  const remove = async (person) => {
    if (!confirm(`¿Eliminar a ${person.full_name}?`)) return
    await run(async () => {
      await associatesService.softDeletePerson(person.id, profile?.id)
      notify.success('Persona eliminada')
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
