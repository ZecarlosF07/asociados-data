import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAssociateDetail } from '../../hooks/useAssociateDetail'
import { useNotification } from '../../hooks/useNotification'
import { useUserProfile } from '../../hooks/useUserProfile'
import { usePermissions } from '../../hooks/usePermissions'
import { associatesService } from '../../services/associates.service'
import { AssociateDetailHeader } from './sections/AssociateDetailHeader'
import { AssociateDetailTabs } from './sections/AssociateDetailTabs'
import { Loader } from '../../components/atoms/Loader'
import { ROUTES } from '../../router/routes'

export function AssociateDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { profile } = useUserProfile()
  const { canEdit } = usePermissions()
  const detail = useAssociateDetail(id)
  const [actionLoading, setActionLoading] = useState(false)

  const handlePersonSubmit = async (data) => {
    setActionLoading(true)
    try {
      await associatesService.createPerson({
        ...data,
        associate_id: id,
        created_by: profile?.id,
      })
      notify.success('Persona registrada')
      detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePersonUpdate = async (personId, data) => {
    setActionLoading(true)
    try {
      await associatesService.updatePerson(personId, {
        ...data,
        updated_by: profile?.id,
      })
      notify.success('Persona actualizada')
      detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePersonDelete = async (person) => {
    if (!confirm(`¿Eliminar a ${person.full_name}?`)) return
    try {
      await associatesService.softDeletePerson(person.id, profile?.id)
      notify.success('Persona eliminada')
      detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    }
  }

  const handleContactSubmit = async (data) => {
    setActionLoading(true)
    try {
      await associatesService.createAreaContact({
        ...data,
        associate_id: id,
        created_by: profile?.id,
      })
      notify.success('Contacto registrado')
      detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleContactUpdate = async (contactId, data) => {
    setActionLoading(true)
    try {
      await associatesService.updateAreaContact(contactId, {
        ...data,
        updated_by: profile?.id,
      })
      notify.success('Contacto actualizado')
      detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleContactDelete = async (contact) => {
    if (!confirm(`¿Eliminar a ${contact.full_name}?`)) return
    try {
      await associatesService.softDeleteAreaContact(contact.id, profile?.id)
      notify.success('Contacto eliminado')
      detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    }
  }

  if (detail.loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader />
      </div>
    )
  }

  if (detail.error || !detail.associate) {
    return (
      <div className="max-w-3xl text-center py-24">
        <p className="text-slate-400 mb-4">
          {detail.error || 'Asociado no encontrado'}
        </p>
        <button
          className="text-blue-500 text-sm underline"
          onClick={() => navigate(ROUTES.ASOCIADOS)}
        >
          Volver al listado
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <AssociateDetailHeader
        associate={detail.associate}
        canEdit={canEdit}
        onEdit={() => navigate(`${ROUTES.ASOCIADOS}/${id}/editar`)}
        onBack={() => navigate(ROUTES.ASOCIADOS)}
      />

      <AssociateDetailTabs
        associate={detail.associate}
        people={detail.people}
        areaContacts={detail.areaContacts}
        canEdit={canEdit}
        actionLoading={actionLoading}
        onPersonSubmit={handlePersonSubmit}
        onPersonUpdate={handlePersonUpdate}
        onPersonDelete={handlePersonDelete}
        onContactSubmit={handleContactSubmit}
        onContactUpdate={handleContactUpdate}
        onContactDelete={handleContactDelete}
      />
    </div>
  )
}
