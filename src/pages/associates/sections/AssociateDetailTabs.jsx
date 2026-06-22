import { useState } from 'react'
import { AssociateInfoSection } from '../../../components/molecules/associates/AssociateInfoSection'
import { AssociateCollectionsTab } from '../../../components/molecules/financial/AssociateCollectionsTab'
import { AssociateFinancialSummary } from '../../../components/molecules/financial/AssociateFinancialSummary'
import { AssociatePaymentsTab } from '../../../components/molecules/financial/AssociatePaymentsTab'
import { AssociateContactsTab } from './AssociateContactsTab'
import { AssociateDocumentsTab } from './AssociateDocumentsTab'
import { AssociateMembershipsTab } from './AssociateMembershipsTab'
import { AssociatePeopleTab } from './AssociatePeopleTab'

const TABS = [
  { key: 'info', label: 'Información' },
  { key: 'people', label: 'Personas' },
  { key: 'contacts', label: 'Contactos' },
  { key: 'memberships', label: 'Membresías' },
  { key: 'payments', label: 'Pagos' },
  { key: 'collections', label: 'Cobranza' },
  { key: 'documents', label: 'Documentos' },
]

export function AssociateDetailTabs(props) {
  const [activeTab, setActiveTab] = useState('info')
  const common = { actionLoading: props.actionLoading, canEdit: props.canEdit }

  return (
    <div>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${activeTab === tab.key ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-400'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <AssociateFinancialSummary associate={props.associate} schedules={props.schedules} payments={props.payments} collectionActions={props.collectionActions} />
      {activeTab === 'info' && <AssociateInfoSection associate={props.associate} />}
      {activeTab === 'people' && <AssociatePeopleTab {...common} people={props.people} onSubmit={props.onPersonSubmit} onUpdate={props.onPersonUpdate} onDelete={props.onPersonDelete} />}
      {activeTab === 'contacts' && <AssociateContactsTab {...common} contacts={props.areaContacts} onSubmit={props.onContactSubmit} onUpdate={props.onContactUpdate} onDelete={props.onContactDelete} />}
      {activeTab === 'memberships' && (
        <AssociateMembershipsTab
          {...common}
          associate={props.associate}
          memberships={props.memberships}
          schedules={props.schedules}
          onSubmit={props.onMembershipSubmit}
          onDelete={props.onMembershipDelete}
          onCancel={props.onMembershipCancel}
          onRenew={props.onMembershipRenew}
        />
      )}
      {activeTab === 'payments' && <AssociatePaymentsTab {...common} schedules={props.schedules} payments={props.payments} onPaymentSubmit={props.onPaymentSubmit} />}
      {activeTab === 'collections' && <AssociateCollectionsTab {...common} schedules={props.schedules} collectionActions={props.collectionActions} onCollectionSubmit={props.onCollectionSubmit} />}
      {activeTab === 'documents' && (
        <AssociateDocumentsTab
          {...common}
          associateId={props.associate.id}
          documents={props.documents || []}
          onUpload={props.onDocumentUpload}
          onView={props.onDocumentView}
          onDownload={props.onDocumentDownload}
          onDelete={props.onDocumentDelete}
        />
      )}
    </div>
  )
}
