import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportsExportAllButton } from '../../components/molecules/reports/ReportsExportAllButton'
import { formatDate } from '../../utils/helpers'
import { REPORT_TABS } from '../../utils/reportConfigs'
import { AssociatesReportTab } from './sections/AssociatesReportTab'
import { CommitteesReportTab } from './sections/CommitteesReportTab'
import { DocumentsReportTab } from './sections/DocumentsReportTab'
import { MembershipsReportTab } from './sections/MembershipsReportTab'
import { PaymentsCollectionsReportTab } from './sections/PaymentsCollectionsReportTab'
import { ProspectsReportTab } from './sections/ProspectsReportTab'
import { ReportsSummaryTab } from './sections/ReportsSummaryTab'

export function ReportsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Reportes</h1>
          <p className="text-sm text-slate-400">
            Consulta, análisis y exportación de información del sistema ·{' '}
            {formatDate(new Date())}
          </p>
        </div>
        <ReportsExportAllButton />
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {REPORT_TABS.map((tab) => (
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

      {activeTab === 'overview' && <ReportsSummaryTab navigate={navigate} />}
      {activeTab === 'prospects' && <ProspectsReportTab navigate={navigate} />}
      {activeTab === 'associates' && <AssociatesReportTab navigate={navigate} />}
      {activeTab === 'committees' && <CommitteesReportTab navigate={navigate} />}
      {activeTab === 'memberships' && <MembershipsReportTab navigate={navigate} />}
      {activeTab === 'financial' && <PaymentsCollectionsReportTab />}
      {activeTab === 'documents' && <DocumentsReportTab />}
    </div>
  )
}
