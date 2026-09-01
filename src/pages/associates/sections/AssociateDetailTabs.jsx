import { useSearchParams } from 'react-router-dom'
import { AssociateInfoSection } from '../../../components/molecules/associates/AssociateInfoSection'
import { AssociateFinancialSummary } from '../../../components/molecules/financial/AssociateFinancialSummary'
import { AssociateDocumentsTab } from './AssociateDocumentsTab'
import { AssociateMembershipsTab } from './AssociateMembershipsTab'
import { AssociatePaymentsCollectionsSection } from './AssociatePaymentsCollectionsSection'
import { AssociateRelationshipsSection } from './AssociateRelationshipsSection'

const SECTIONS = [
  { key: 'summary', label: 'Resumen' },
  { key: 'relationships', label: 'Personas y contactos' },
  { key: 'membership', label: 'Membresía' },
  { key: 'finance', label: 'Pagos y cobranza' },
  { key: 'documents', label: 'Documentos' },
]

export function AssociateDetailTabs(props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedSection = searchParams.get('section')
  const activeSection = SECTIONS.some(({ key }) => key === requestedSection)
    ? requestedSection
    : 'summary'
  const common = { actionLoading: props.actionLoading, canEdit: props.canEdit }
  const selectSection = (section) => {
    const next = new URLSearchParams(searchParams)
    next.set('section', section)
    setSearchParams(next)
  }

  return (
    <div>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium ${activeSection === section.key ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => selectSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </nav>
      {activeSection === 'summary' && <Summary {...props} />}
      {activeSection === 'relationships' && <AssociateRelationshipsSection {...props} />}
      {activeSection === 'membership' && (
        <AssociateMembershipsTab
          actionLoading={props.actionLoading}
          associate={props.associate}
          memberships={props.memberships}
          canCreate={props.canCreateMembership}
          canUpdate={props.canUpdateMembership}
          canEditAssociate={props.canEditAssociate}
          onEditAssociate={props.onEditAssociate}
          onSubmit={props.onMembershipSubmit}
          onCancel={props.onMembershipCancel}
          onCancelScheduled={props.onScheduledMembershipCancel}
          onRenew={props.onMembershipRenew}
        />
      )}
      {activeSection === 'finance' && <AssociatePaymentsCollectionsSection {...props} />}
      {activeSection === 'documents' && (
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

function Summary({ associate, schedules, payments, collectionActions }) {
  return (
    <div className="space-y-6">
      <AssociateFinancialSummary associate={associate} schedules={schedules} payments={payments} collectionActions={collectionActions} />
      <AssociateInfoSection associate={associate} />
    </div>
  )
}
