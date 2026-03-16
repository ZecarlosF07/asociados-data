import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { prospectsService } from '../../services/prospects.service'
import { useNotification } from '../../hooks/useNotification'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useCatalog } from '../../hooks/useCatalog'
import { ProspectForm } from '../../components/molecules/prospects/ProspectForm'
import { ROUTES } from '../../router/routes'
import { PROSPECT_CATALOG_GROUPS } from '../../utils/prospectConstants'

export function ProspectCreatePage() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { profile } = useUserProfile()
  const { items: statuses } = useCatalog(PROSPECT_CATALOG_GROUPS.STATUS)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (formData) => {
    setSaving(true)

    try {
      // Buscar estado "NUEVO" por defecto
      const defaultStatus = statuses.find((s) => s.code === 'NUEVO')

      const prospect = {
        ...formData,
        prospect_status_id: defaultStatus?.id || statuses[0]?.id,
        captured_by_user_id: profile?.id || null,
        created_by: profile?.id || null,
      }

      const created = await prospectsService.create(prospect)

      // Registrar estado inicial en historial
      await prospectsService.updateStatus(created.id, {
        newStatusId: prospect.prospect_status_id,
        previousStatusId: null,
        reason: 'Registro inicial del prospecto',
        changedBy: profile?.id,
      })

      notify.success('Prospecto registrado exitosamente')
      navigate(`${ROUTES.PROSPECTOS}/${created.id}`)
    } catch (error) {
      notify.error('Error al registrar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate(ROUTES.PROSPECTOS)
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Nuevo prospecto
        </h1>
        <p className="text-sm text-slate-400">
          Registra un nuevo prospecto para seguimiento.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <ProspectForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={saving}
        />
      </div>
    </div>
  )
}
