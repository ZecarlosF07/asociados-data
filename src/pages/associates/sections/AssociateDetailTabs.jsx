import { useState } from 'react'
import { AssociateInfoSection } from '../../../components/molecules/associates/AssociateInfoSection'
import { PersonList } from '../../../components/molecules/associates/PersonList'
import { PersonForm } from '../../../components/molecules/associates/PersonForm'
import { AreaContactList } from '../../../components/molecules/associates/AreaContactList'
import { AreaContactForm } from '../../../components/molecules/associates/AreaContactForm'
import { MembershipList } from '../../../components/molecules/financial/MembershipList'
import { MembershipForm } from '../../../components/molecules/financial/MembershipForm'
import { ScheduleTable } from '../../../components/molecules/financial/ScheduleTable'
import { Button } from '../../../components/atoms/Button'
import { formatCurrency } from '../../../utils/helpers'

const TABS = [
  { key: 'info', label: 'Información' },
  { key: 'people', label: 'Personas' },
  { key: 'contacts', label: 'Contactos' },
  { key: 'memberships', label: 'Membresías' },
]

export function AssociateDetailTabs({
  associate,
  people,
  areaContacts,
  memberships,
  schedules,
  canEdit,
  actionLoading,
  onPersonSubmit,
  onPersonUpdate,
  onPersonDelete,
  onContactSubmit,
  onContactUpdate,
  onContactDelete,
  onMembershipSubmit,
  onMembershipDelete,
}) {
  const [activeTab, setActiveTab] = useState('info')
  const [showPersonForm, setShowPersonForm] = useState(false)
  const [editingPerson, setEditingPerson] = useState(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [showMembershipForm, setShowMembershipForm] = useState(false)

  // Person handlers
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

  // Contact handlers
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

  // Membership handlers
  const handleMembershipAdd = async (data) => {
    await onMembershipSubmit(data)
    setShowMembershipForm(false)
  }

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
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

      {/* Info */}
      {activeTab === 'info' && (
        <AssociateInfoSection associate={associate} />
      )}

      {/* Personas vinculadas */}
      {activeTab === 'people' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">
              Personas vinculadas ({people.length})
            </h3>
            {canEdit && !showPersonForm && (
              <Button size="sm" onClick={() => { setEditingPerson(null); setShowPersonForm(true) }}>
                + Agregar persona
              </Button>
            )}
          </div>

          {showPersonForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <PersonForm
                initialData={editingPerson}
                onSubmit={editingPerson ? handlePersonSave : handlePersonAdd}
                onCancel={() => { setShowPersonForm(false); setEditingPerson(null) }}
                loading={actionLoading}
              />
            </div>
          )}

          <PersonList people={people} canEdit={canEdit} onEdit={handlePersonEdit} onDelete={onPersonDelete} />
        </div>
      )}

      {/* Contactos por área */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">
              Contactos por área ({areaContacts.length})
            </h3>
            {canEdit && !showContactForm && (
              <Button size="sm" onClick={() => { setEditingContact(null); setShowContactForm(true) }}>
                + Agregar contacto
              </Button>
            )}
          </div>

          {showContactForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <AreaContactForm
                initialData={editingContact}
                onSubmit={editingContact ? handleContactSave : handleContactAdd}
                onCancel={() => { setShowContactForm(false); setEditingContact(null) }}
                loading={actionLoading}
              />
            </div>
          )}

          <AreaContactList contacts={areaContacts} canEdit={canEdit} onEdit={handleContactEdit} onDelete={onContactDelete} />
        </div>
      )}

      {/* Membresías */}
      {activeTab === 'memberships' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">
              Membresías ({memberships.length})
            </h3>
            {canEdit && !showMembershipForm && (
              <Button size="sm" onClick={() => setShowMembershipForm(true)}>
                + Nueva membresía
              </Button>
            )}
          </div>

          {/* Referencia del prospecto */}
          {associate.prospect_origin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-wrap gap-x-8 gap-y-2">
              <div>
                <span className="text-xs font-semibold text-blue-700">Tarifa sugerida (calculadora)</span>
                <p className="text-lg font-bold text-blue-900">
                  {associate.prospect_origin.suggested_fee
                    ? formatCurrency(associate.prospect_origin.suggested_fee)
                    : '—'}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-blue-700">Categoría sugerida</span>
                <p className="text-lg font-bold text-blue-900">
                  {associate.prospect_origin.current_category?.name || '—'}
                  {associate.prospect_origin.current_category?.base_fee && (
                    <span className="text-sm font-normal text-blue-600 ml-2">
                      (Base: {formatCurrency(associate.prospect_origin.current_category.base_fee)})
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {showMembershipForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <MembershipForm
                onSubmit={handleMembershipAdd}
                onCancel={() => setShowMembershipForm(false)}
                loading={actionLoading}
              />
            </div>
          )}

          <MembershipList
            memberships={memberships}
            canEdit={canEdit}
            onDelete={onMembershipDelete}
          />

          {schedules.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">
                Cronograma de pagos
              </h3>
              <ScheduleTable schedules={schedules} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
