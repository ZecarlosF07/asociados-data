import { useState } from 'react'
import { Button } from '../../atoms/Button'
import { CollectionActionForm } from './CollectionActionForm'
import { CollectionActionList } from './CollectionActionList'

export function AssociateCollectionsTab({
  schedules = [],
  collectionActions = [],
  canEdit,
  actionLoading,
  onCollectionSubmit,
}) {
  const [showCollectionForm, setShowCollectionForm] = useState(false)
  const manageableSchedules = schedules.filter((schedule) => !schedule.is_paid)

  const handleSubmit = async (data) => {
    await onCollectionSubmit(data)
    setShowCollectionForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-700">
          Gestiones de cobranza ({collectionActions.length})
        </h3>
        {canEdit && !showCollectionForm && (
          <Button size="sm" onClick={() => setShowCollectionForm(true)}>
            + Registrar gestión
          </Button>
        )}
      </div>

      {canEdit && showCollectionForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <CollectionActionForm
            schedules={manageableSchedules}
            onSubmit={handleSubmit}
            onCancel={() => setShowCollectionForm(false)}
            loading={actionLoading}
          />
        </div>
      )}

      <CollectionActionList actions={collectionActions} />
    </div>
  )
}
