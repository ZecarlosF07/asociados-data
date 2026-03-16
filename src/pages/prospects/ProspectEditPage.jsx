import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { prospectsService } from '../../services/prospects.service'
import { useNotification } from '../../hooks/useNotification'
import { useUserProfile } from '../../hooks/useUserProfile'
import { ProspectForm } from '../../components/molecules/prospects/ProspectForm'
import { Loader } from '../../components/atoms/Loader'
import { useProspectDetail } from '../../hooks/useProspectDetail'
import { ROUTES } from '../../router/routes'

export function ProspectEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { profile } = useUserProfile()
  const { prospect, loading } = useProspectDetail(id)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (formData) => {
    setSaving(true)

    try {
      await prospectsService.update(id, {
        ...formData,
        updated_by: profile?.id || null,
      })

      notify.success('Prospecto actualizado')
      navigate(`${ROUTES.PROSPECTOS}/${id}`)
    } catch (error) {
      notify.error('Error al actualizar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate(`${ROUTES.PROSPECTOS}/${id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Editar prospecto
        </h1>
        <p className="text-sm text-slate-400">
          {prospect?.company_name}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <ProspectForm
          initialData={prospect}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={saving}
        />
      </div>
    </div>
  )
}
