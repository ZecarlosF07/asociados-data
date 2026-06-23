import { CompanyContactListItem } from './CompanyContactListItem'

export function CompanyContactList({ contacts, onAssociateClick }) {
  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <CompanyContactListItem
          key={contact.id}
          contact={contact}
          onAssociateClick={onAssociateClick}
        />
      ))}
    </div>
  )
}
