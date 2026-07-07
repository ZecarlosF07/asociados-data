import { ReportKpiCard } from './ReportKpiCard'

export function CommitteeReportKpis({ indicators }) {
  const largest = indicators.largestCommittee

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ReportKpiCard
          icon="🏢"
          title="Asociados evaluados"
          value={indicators.totalAssociates}
        />
        <ReportKpiCard
          icon="⚠️"
          title="Sin comité"
          value={indicators.unassignedAssociates}
        />
        <ReportKpiCard
          icon="▦"
          title="Comités representados"
          value={indicators.representedCommittees}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportKpiCard
          icon="%"
          title="Cobertura"
          value={`${indicators.assignmentCoveragePercentage}%`}
        />
        <ReportKpiCard
          icon="○"
          title="Comités activos vacíos"
          value={indicators.emptyActiveCommittees}
        />
        <ReportKpiCard
          icon="★"
          title="Comité con más asociados"
          value={largest.total || '—'}
          subtitle={largest.name || 'Sin comité representado'}
        />
        <ReportKpiCard
          icon="÷"
          title="Promedio por comité"
          value={indicators.averageAssociatesPerCommittee}
        />
      </div>
    </div>
  )
}
