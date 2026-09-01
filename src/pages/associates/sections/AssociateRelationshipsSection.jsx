import { useState } from 'react'
import { DetailSubnav } from '../../../components/molecules/associates/DetailSubnav'
import { AssociateContactsTab } from './AssociateContactsTab'
import { AssociatePeopleTab } from './AssociatePeopleTab'

const OPTIONS = [
  { key: 'people', label: 'Personas vinculadas' },
  { key: 'contacts', label: 'Contactos por área' },
]

export function AssociateRelationshipsSection(props) {
  const [active, setActive] = useState('people')
  const common = { actionLoading: props.actionLoading, canEdit: props.canEdit }

  return (
    <div>
      <DetailSubnav options={OPTIONS} active={active} onChange={setActive} />
      {active === 'people' && (
        <AssociatePeopleTab
          {...common}
          people={props.people}
          onSubmit={props.onPersonSubmit}
          onUpdate={props.onPersonUpdate}
          onDelete={props.onPersonDelete}
        />
      )}
      {active === 'contacts' && (
        <AssociateContactsTab
          {...common}
          contacts={props.areaContacts}
          onSubmit={props.onContactSubmit}
          onUpdate={props.onContactUpdate}
          onDelete={props.onContactDelete}
        />
      )}
    </div>
  )
}
