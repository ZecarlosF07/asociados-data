import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAssociateDetail } from '../../hooks/useAssociateDetail'
import { useNotification } from '../../hooks/useNotification'
import { useUserProfile } from '../../hooks/useUserProfile'
import { usePermissions } from '../../hooks/usePermissions'
import { associatesService } from '../../services/associates.service'
import { membershipsService } from '../../services/memberships.service'
import { paymentSchedulesService } from '../../services/paymentSchedules.service'
import { documentsService } from '../../services/documents.service'
import { supabase } from '../../lib/supabaseClient'
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

  // ---- Personas vinculadas ----
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

  // ---- Contactos por área ----
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

  // ---- Membresías ----
  const handleMembershipSubmit = async (data) => {
    setActionLoading(true)
    try {
      const membership = await membershipsService.create({
        ...data,
        associate_id: id,
        created_by: profile?.id,
      })

      // Generar cronograma automáticamente
      // Buscar el estado PENDIENTE del grupo COLLECTION_STATUS
      const { data: pendingStatus } = await supabase
        .from('catalog_items')
        .select('id, group:group_id(code)')
        .eq('code', 'PENDIENTE')

      const collectionPending = pendingStatus?.find(
        (item) => item.group?.code === 'COLLECTION_STATUS'
      )

      if (collectionPending) {
        await membershipsService.generateSchedule({
          membership,
          defaultStatusId: collectionPending.id,
          userId: profile?.id,
        })
      }

      notify.success('Membresía creada y cronograma generado')
      detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleMembershipDelete = async (membership) => {
    if (!confirm('¿Eliminar esta membresía?')) return
    try {
      await paymentSchedulesService.softDeleteByMembership(membership.id, profile?.id)
      await membershipsService.softDelete(membership.id, profile?.id)
      notify.success('Membresía eliminada')
      detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    }
  }

  const handleMembershipCancel = async (membership) => {
    if (!confirm(`¿Cancelar la membresía ${membership.membership_type?.label}? Las cuotas no pagadas serán eliminadas.`)) return
    setActionLoading(true)
    try {
      await membershipsService.cancel(membership.id, profile?.id)
      notify.success('Membresía cancelada')
      detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleMembershipRenew = async (oldMembershipId, newData) => {
    setActionLoading(true)
    try {
      const membership = await membershipsService.renew(oldMembershipId, {
        ...newData,
        associate_id: id,
      }, profile?.id)

      // Generar cronograma para la nueva membresía
      const { data: pendingStatus } = await supabase
        .from('catalog_items')
        .select('id, group:group_id(code)')
        .eq('code', 'PENDIENTE')

      const collectionPending = pendingStatus?.find(
        (item) => item.group?.code === 'COLLECTION_STATUS'
      )

      if (collectionPending) {
        await membershipsService.generateSchedule({
          membership,
          defaultStatusId: collectionPending.id,
          userId: profile?.id,
        })
      }

      notify.success('Membresía renovada y cronograma generado')
      detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  // ---- Documentos ----
  const handleDocumentUpload = async ({ file, metadata }) => {
    setActionLoading(true)
    try {
      await documentsService.upload({
        file,
        metadata: { ...metadata, associate_id: id },
        userId: profile?.id,
      })
      notify.success('Documento subido correctamente')
      detail.refetch()
    } catch (error) {
      notify.error('Error al subir: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDocumentDownload = async (document) => {
    try {
      const url = await documentsService.getSignedUrl(document.storage_path)
      if (url) window.open(url, '_blank')
    } catch (error) {
      notify.error('Error al descargar: ' + error.message)
    }
  }

  const handleDocumentDelete = async (document) => {
    if (!confirm(`¿Eliminar "${document.title}"?`)) return
    try {
      await documentsService.softDelete(document.id, profile?.id)
      notify.success('Documento eliminado')
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
        memberships={detail.memberships}
        schedules={detail.schedules}
        documents={detail.documents}
        canEdit={canEdit}
        actionLoading={actionLoading}
        onPersonSubmit={handlePersonSubmit}
        onPersonUpdate={handlePersonUpdate}
        onPersonDelete={handlePersonDelete}
        onContactSubmit={handleContactSubmit}
        onContactUpdate={handleContactUpdate}
        onContactDelete={handleContactDelete}
        onMembershipSubmit={handleMembershipSubmit}
        onMembershipDelete={handleMembershipDelete}
        onMembershipCancel={handleMembershipCancel}
        onMembershipRenew={handleMembershipRenew}
        onDocumentUpload={handleDocumentUpload}
        onDocumentDownload={handleDocumentDownload}
        onDocumentDelete={handleDocumentDelete}
      />
    </div>
  )
}
