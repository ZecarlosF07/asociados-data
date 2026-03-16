import { useState } from 'react'
import { AssociateInfoSection } from '../../../components/molecules/associates/AssociateInfoSection'
import { PersonList } from '../../../components/molecules/associates/PersonList'
import { PersonForm } from '../../../components/molecules/associates/PersonForm'
import { AreaContactList } from '../../../components/molecules/associates/AreaContactList'
import { AreaContactForm } from '../../../components/molecules/associates/AreaContactForm'
import { Button } from '../../../components/atoms/Button'

const TABS = [
  { key: 'info', label: 'Información' },
  { key: 'people', label: 'Personas vinculadas' },
  { key: 'contacts', label: 'Contactos por área' },
]

export function AssociateDetailTabs({
  associate,
  people,
  areaContacts,
  canEdit,
  actionLoading,
  onPersonSubmit,
  onPersonUpdate,
  onPersonDelete,
  onContactSubmit,
  onContactUpdate,
  onContactDelete,
}) {
  const [activeTab, setActiveTab] = useState('info')
  const [showPersonForm, setShowPersonForm] = useState(false)
  const [editingPerson, setEditingPerson] = useState(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  const handlePersonAdd = async (data) => {
    await onPersonSubmit(data)
    setShowPersonForm(false)
  }

  const handlePersonEdit = (person) => {
    setEditingPerson(person)
    setShowPersonForm(true)
  }

  const handlePersonSave = async (data) => {
    await onPersonUpdate(editingPerson.id, data)
    setEditingPerson(null)
    setShowPersonForm(false)
  }

  const handleContactAdd = async (data) => {
    await onContactSubmit(data)
    setShowContactForm(false)
  }

  const handleContactEdit = (contact) => {
    setEditingContact(contact)
    setShowContactForm(true)
  }

  const handleContactSave = async (data) => {
    await onContactUpdate(editingContact.id, data)
    setEditingContact(null)
    setShowContactForm(false)
  }

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <AssociateInfoSection associate={associate} />
      )}

      {activeTab === 'people' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">
              Personas vinculadas ({people.length})
            </h3>
            {canEdit && !showPersonForm && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingPerson(null)
                  setShowPersonForm(true)
                }}
              >
                + Agregar persona
              </Button>
            )}
          </div>

          {showPersonForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <PersonForm
                initialData={editingPerson}
                onSubmit={editingPerson ? handlePersonSave : handlePersonAdd}
                onCancel={() => {
                  setShowPersonForm(false)
                  setEditingPerson(null)
                }}
                loading={actionLoading}
              />
            </div>
          )}

          <PersonList
            people={people}
            canEdit={canEdit}
            onEdit={handlePersonEdit}
            onDelete={onPersonDelete}
          />
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">
              Contactos por área ({areaContacts.length})
            </h3>
            {canEdit && !showContactForm && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingContact(null)
                  setShowContactForm(true)
                }}
              >
                + Agregar contacto
              </Button>
            )}
          </div>

          {showContactForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <AreaContactForm
                initialData={editingContact}
                onSubmit={
                  editingContact ? handleContactSave : handleContactAdd
                }
                onCancel={() => {
                  setShowContactForm(false)
                  setEditingContact(null)
                }}
                loading={actionLoading}
              />
            </div>
          )}

          <AreaContactList
            contacts={areaContacts}
            canEdit={canEdit}
            onEdit={handleContactEdit}
            onDelete={onContactDelete}
          />
        </div>
      )}
    </div>
  )
}
