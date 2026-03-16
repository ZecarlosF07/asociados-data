import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAssociateDetail } from '../../hooks/useAssociateDetail'
import { useNotification } from '../../hooks/useNotification'
import { useUserProfile } from '../../hooks/useUserProfile'
import { associatesService } from '../../services/associates.service'
import { AssociateForm } from '../../components/molecules/associates/AssociateForm'
import { Loader } from '../../components/atoms/Loader'
import { ROUTES } from '../../router/routes'

export function AssociateEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { profile } = useUserProfile()
  const { associate, loading, error } = useAssociateDetail(id)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (formData) => {
    setSaving(true)
    try {
      await associatesService.update(id, {
        ...formData,
        updated_by: profile?.id,
      })
      notify.success('Asociado actualizado')
      navigate(`${ROUTES.ASOCIADOS}/${id}`)
    } catch (err) {
      notify.error('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader />
      </div>
    )
  }

  if (error || !associate) {
    return (
      <div className="max-w-3xl text-center py-24">
        <p className="text-slate-400 mb-4">
          {error || 'Asociado no encontrado'}
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
    <div className="max-w-3xl">
      <button
        className="text-xs text-slate-400 hover:text-slate-600 mb-3 inline-flex items-center gap-1"
        onClick={() => navigate(`${ROUTES.ASOCIADOS}/${id}`)}
      >
        ← Volver al detalle
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        Editar asociado
      </h1>
      <p className="text-sm text-slate-400 mb-6">
        {associate.company_name} · {associate.internal_code}
      </p>

      <AssociateForm
        initialData={associate}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`${ROUTES.ASOCIADOS}/${id}`)}
        loading={saving}
      />
    </div>
  )
}
