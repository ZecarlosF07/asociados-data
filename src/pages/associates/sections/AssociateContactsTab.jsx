import { useState } from 'react'
import { Button } from '../../../components/atoms/Button'
import { AreaContactForm } from '../../../components/molecules/associates/AreaContactForm'
import { AreaContactList } from '../../../components/molecules/associates/AreaContactList'

export function AssociateContactsTab({ actionLoading, canEdit, contacts, onDelete, onSubmit, onUpdate }) {
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
        <h3 className="text-sm font-bold text-slate-700">Contactos por área ({contacts.length})</h3>
        {canEdit && !formOpen && <Button size="sm" onClick={() => setFormOpen(true)}>+ Agregar contacto</Button>}
      </div>
      {formOpen && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <AreaContactForm initialData={editing} onSubmit={save} onCancel={close} loading={actionLoading} />
        </div>
      )}
      <AreaContactList
        contacts={contacts}
        canEdit={canEdit}
        onEdit={(contact) => { setEditing(contact); setFormOpen(true) }}
        onDelete={onDelete}
      />
    </div>
  )
}
