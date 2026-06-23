import { Badge } from '../../atoms/Badge'
import { ASSOCIATE_STATUS_VARIANT } from '../../../utils/associateConstants'

export function CompanyContactListItem({ contact, onAssociateClick }) {
  const associate = contact.associate

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-900">{contact.full_name}</h3>
            {contact.is_primary && <Badge variant="info">Principal</Badge>}
            {contact.area?.label && <Badge>{contact.area.label}</Badge>}
          </div>
          <p className="text-xs text-slate-500">
            {contact.position || 'Sin cargo registrado'}
          </p>
          <ContactData contact={contact} />
        </div>

        <div className="lg:w-80 lg:text-right">
          <button
            type="button"
            className="text-sm font-semibold text-slate-900 hover:text-blue-600"
            onClick={() => onAssociateClick(associate)}
          >
            {associate?.company_name || 'Asociado sin nombre'}
          </button>
          <p className="mt-1 text-xs text-slate-400">
            {associate?.internal_code || 'Sin código'} · RUC {associate?.ruc || '—'}
          </p>
          <div className="mt-2 flex flex-wrap justify-start gap-2 lg:justify-end">
            {associate?.associate_status?.label && (
              <Badge variant={getStatusVariant(associate.associate_status.code)}>
                {associate.associate_status.label}
              </Badge>
            )}
            {associate?.category?.name && <Badge>{associate.category.name}</Badge>}
          </div>
          {associate?.primary_committee?.name && (
            <p className="mt-2 text-xs text-slate-500">
              Comité: {associate.primary_committee.name}
            </p>
          )}
        </div>
      </div>

      {contact.notes && (
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          {contact.notes}
        </p>
      )}
    </div>
  )
}

function ContactData({ contact }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
      <span>
        <span className="font-medium text-slate-700">Email:</span>{' '}
        {contact.email || '—'}
      </span>
      <span>
        <span className="font-medium text-slate-700">Tel:</span>{' '}
        {contact.phone || '—'}
      </span>
    </div>
  )
}

function getStatusVariant(code) {
  return ASSOCIATE_STATUS_VARIANT[code] || 'default'
}
