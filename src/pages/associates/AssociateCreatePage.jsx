import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../hooks/useNotification'
import { usePermissions } from '../../hooks/usePermissions'
import { associatesService } from '../../services/associates.service'
import { AssociateForm } from '../../components/molecules/associates/AssociateForm'
import { AccessDeniedPage } from '../auth/AccessDeniedPage'
import { ROUTES } from '../../router/routes'

export function AssociateCreatePage() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { canCreate } = usePermissions()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (formData) => {
    setSaving(true)
    try {
      const associate = await associatesService.createDirectAssociate(formData)
      notify.success('Asociado creado')
      navigate(`${ROUTES.ASOCIADOS}/${associate.id}`)
    } catch (err) {
      notify.error('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!canCreate) return <AccessDeniedPage />

  return (
    <div className="max-w-3xl">
      <button
        className="text-xs text-slate-400 hover:text-slate-600 mb-3 inline-flex items-center gap-1"
        onClick={() => navigate(ROUTES.ASOCIADOS)}
      >
        ← Volver al listado
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        Nuevo asociado
      </h1>
      <p className="text-sm text-slate-400 mb-6">
        Alta directa para asociados históricos sin crear un prospecto previo.
      </p>

      <AssociateForm
        initialData={null}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTES.ASOCIADOS)}
        loading={saving}
      />
    </div>
  )
}
