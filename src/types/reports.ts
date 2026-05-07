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

