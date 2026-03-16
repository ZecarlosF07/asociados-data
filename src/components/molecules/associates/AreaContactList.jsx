import { Button } from '../../atoms/Button'
import { Badge } from '../../atoms/Badge'

export function AreaContactList({ contacts, canEdit, onEdit, onDelete }) {
  if (contacts.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-6">
        No hay contactos por área registrados.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="bg-white border border-slate-200 rounded-lg p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {contact.full_name}
                </h4>
                {contact.is_primary && (
                  <Badge variant="info">Principal</Badge>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {contact.area?.label || '—'}
                {contact.position && ` · ${contact.position}`}
              </p>
            </div>
            {canEdit && (
              <div className="flex gap-1">
                <Button variant="secondary" size="sm" onClick={() => onEdit(contact)}>
                  Editar
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onDelete(contact)}>
                  Eliminar
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
            {contact.email && (
              <span className="truncate">
                <span className="font-medium text-slate-700">Email:</span>{' '}
                {contact.email}
              </span>
            )}
            {contact.phone && (
              <span>
                <span className="font-medium text-slate-700">Tel:</span>{' '}
                {contact.phone}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
