export interface KpiSummary {
  total: number
  byStatus?: Record<string, number>
}

export interface FinancialKpis {
  pending: number
  pendingCount: number
  overdue: number
  overdueCount: number
  collectedThisMonth: number
}

export interface DashboardKpis {
  prospects: KpiSummary
  associates: KpiSummary
  memberships: number
  financial: FinancialKpis
  documents: number
}

export interface ExportColumn {
  key: string
  label: string
  format?: 'date' | 'currency' | 'number'
}

export interface CommitteeReportCommittee {
  id: string
  code?: string | null
  name: string
  is_active: boolean
}

export interface CommitteeReportAssociate {
  id: string
  assignment_id?: string | null
  internal_code: string
  company_name: string
  ruc?: string | null
  joined_at?: string | null
  associate_status?: { code?: string | null; label?: string | null } | null
  category?: { code?: string | null; name?: string | null } | null
  committee_label: string
  committee_code: string
  committee?: CommitteeReportCommittee | null
}

export interface CommitteeReportData {
  committees: CommitteeReportCommittee[]
  associates: CommitteeReportAssociate[]
}

export interface CommitteeReportFilters {
  search: string
  committeeId: string
  statusCode: string
  categoryCode: string
}

export interface CommitteeReportIndicators {
  totalAssociates: number
  unassignedAssociates: number
  representedCommittees: number
  assignmentCoveragePercentage: number
  emptyActiveCommittees: number
  largestCommittee: { id: string | null; name: string; total: number }
  averageAssociatesPerCommittee: number
}

export interface CommitteeReportSummaryRow {
  id: string
  committee_code: string
  committee_name: string
  committee_status: string
  total_assigned: number
  active_count: number
  inactive_count: number
  suspended_count: number
  in_process_count: number
}
