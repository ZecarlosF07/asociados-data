import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/atoms/Button'
import { EmptyState } from '../../components/atoms/EmptyState'
import { Loader } from '../../components/atoms/Loader'
import { CompanyContactFilters } from '../../components/molecules/contacts/CompanyContactFilters'
import { CompanyContactList } from '../../components/molecules/contacts/CompanyContactList'
import { useCompanyContacts } from '../../hooks/useCompanyContacts'
import { useNotification } from '../../hooks/useNotification'
import { ROUTES } from '../../router/routes'
import { todayDateOnly } from '../../utils/dateOnly'
import { EXPORT_COLUMNS, exportToExcel } from '../../utils/exportUtils'
import { toCompanyContactExportRow } from '../../utils/companyContactUtils'

export function CompanyContactsPage() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const contacts = useCompanyContacts()

  const handleAssociateClick = (associate) => {
    if (!associate?.id) return
    navigate(`${ROUTES.ASOCIADOS}/${associate.id}`)
  }

  const handleExport = async () => {
    try {
      await exportToExcel({
        filename: `contactos_empresas_filtrado_${todayDateOnly()}`,
        sheetName: 'Contactos',
        data: contacts.filteredContacts.map(toCompanyContactExportRow),
        columns: EXPORT_COLUMNS.companyContacts,
      })
      notify.success('Excel exportado correctamente')
    } catch (error) {
      notify.error(`No se pudo exportar: ${error.message}`)
    }
  }

  return (
    <div className="max-w-6xl">
      <PageHeader
        exportDisabled={contacts.loading || contacts.filteredContacts.length === 0}
        filteredCount={contacts.filteredContacts.length}
        totalCount={contacts.contacts.length}
        onExport={handleExport}
      />

      <CompanyContactFilters
        filters={contacts.filters}
        onClear={contacts.clearFilters}
        onFilterChange={contacts.updateFilters}
      />

      <CompanyContactContent
        contacts={contacts}
        onAssociateClick={handleAssociateClick}
      />
    </div>
  )
}

function PageHeader({ exportDisabled, filteredCount, onExport, totalCount }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Contactos de empresas
        </h1>
        <p className="text-sm text-slate-400">
          {filteredCount} de {totalCount} contactos registrados.
        </p>
      </div>
      <Button size="sm" variant="secondary" disabled={exportDisabled} onClick={onExport}>
        📥 Exportar Excel
      </Button>
    </div>
  )
}

function CompanyContactContent({ contacts, onAssociateClick }) {
  if (contacts.loading) {
    return <div className="flex items-center justify-center py-16"><Loader /></div>
  }

  if (contacts.error) {
    return <EmptyState icon="!" title="No se pudo cargar" description={contacts.error} />
  }

  if (contacts.filteredContacts.length === 0) {
    return (
      <EmptyState
        icon="📇"
        title={contacts.hasFilters ? 'Sin resultados' : 'Sin contactos'}
        description={getEmptyDescription(contacts.hasFilters)}
      />
    )
  }

  return (
    <CompanyContactList
      contacts={contacts.filteredContacts}
      onAssociateClick={onAssociateClick}
    />
  )
}

function getEmptyDescription(hasFilters) {
  if (hasFilters) return 'No se encontraron contactos con los filtros aplicados.'
  return 'Todavía no hay contactos por área registrados en los asociados.'
}
