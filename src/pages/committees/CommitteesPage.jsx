import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/atoms/Button'
import { EmptyState } from '../../components/atoms/EmptyState'
import { Input } from '../../components/atoms/Input'
import { CommitteeForm } from '../../components/molecules/committees/CommitteeForm'
import { CommitteeListItem } from '../../components/molecules/committees/CommitteeListItem'
import { Modal } from '../../components/organisms/Modal'
import { useCommittees } from '../../hooks/useCommittees'
import { useNotification } from '../../hooks/useNotification'
import { usePermissions } from '../../hooks/usePermissions'
import { committeesService } from '../../services/committees.service'
import { ROUTES } from '../../router/routes'

export function CommitteesPage() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { canCreate, canEdit } = usePermissions()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { committees, error, loading, refetch } = useCommittees({ search })

  const closeForm = () => {
    setEditing(null)
    setFormOpen(false)
  }

  const handleSave = async (values) => {
    setSaving(true)
    try {
      if (editing) await committeesService.update(editing.id, values)
      else await committeesService.create(values)
      notify.success(editing ? 'Comité actualizado' : 'Comité creado')
      closeForm()
      refetch()
    } catch (requestError) {
      notify.error('Error: ' + requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (committee) => {
    try {
      await committeesService.setActiveStatus(committee.id, !committee.is_active)
      notify.success(committee.is_active ? 'Comité inactivado' : 'Comité activado')
      refetch()
    } catch (requestError) {
      notify.error('Error: ' + requestError.message)
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Comités</h1>
          <p className="mt-1 text-sm text-slate-400">Gestión de comités institucionales.</p>
        </div>
        {canCreate('comites') && <Button onClick={() => setFormOpen(true)}>+ Nuevo comité</Button>}
      </div>

      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4">
        <Input placeholder="Buscar por código o nombre..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error ? (
        <EmptyState icon="!" title="No se pudo cargar" description={error} />
      ) : !loading && committees.length === 0 ? (
        <EmptyState title="Sin comités" description="No se encontraron comités registrados." />
      ) : (
        <div className="space-y-3">
          {committees.map((committee) => (
            <CommitteeListItem
              key={committee.id}
              committee={committee}
              canEdit={canEdit('comites')}
              onEdit={(item) => { setEditing(item); setFormOpen(true) }}
              onOpen={(item) => navigate(ROUTES.COMITES_DETALLE.replace(':id', item.id))}
              onToggle={handleToggle}
            />
          ))}
          {loading && <p className="py-8 text-center text-sm text-slate-400">Cargando...</p>}
        </div>
      )}

      <Modal isOpen={formOpen} onClose={closeForm} title={editing ? 'Editar comité' : 'Nuevo comité'}>
        <CommitteeForm key={editing?.id || 'new'} initialData={editing} loading={saving} onCancel={closeForm} onSubmit={handleSave} />
      </Modal>
    </div>
  )
}
