import { useState } from 'react'
import { Button } from '../../../components/atoms/Button'
import { PersonForm } from '../../../components/molecules/associates/PersonForm'
import { PersonList } from '../../../components/molecules/associates/PersonList'

export function AssociatePeopleTab({ actionLoading, canEdit, onDelete, onSubmit, onUpdate, people }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const close = () => { setEditing(null); setFormOpen(false) }
  const save = async (data) => {
    if (editing) await onUpdate(editing.id, data)
    else await onSubmit(data)
    close()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Personas vinculadas ({people.length})</h3>
        {canEdit && !formOpen && <Button size="sm" onClick={() => setFormOpen(true)}>+ Agregar persona</Button>}
      </div>
      {formOpen && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <PersonForm initialData={editing} onSubmit={save} onCancel={close} loading={actionLoading} />
        </div>
      )}
      <PersonList
        people={people}
        canEdit={canEdit}
        onEdit={(person) => { setEditing(person); setFormOpen(true) }}
        onDelete={onDelete}
      />
    </div>
  )
}
