import { normalizeText } from './reportFilterUtils'

export const WITHOUT_COMMITTEE = 'WITHOUT_COMMITTEE'

export const DEFAULT_COMMITTEE_REPORT_FILTERS = {
  search: '',
  committeeId: '',
  statusCode: '',
  categoryCode: '',
}

export function buildCommitteeReportModel(reportData, filters) {
  const safeData = normalizeReportData(reportData)
  const activeFilters = { ...DEFAULT_COMMITTEE_REPORT_FILTERS, ...filters }
  const filteredAssociates = filterAssociates(safeData.associates, activeFilters)
    .sort(compareAssociates)
  const summaryRows = buildSummaryRows(safeData, filteredAssociates, activeFilters)
  const indicators = buildIndicators(filteredAssociates, summaryRows)

  return {
    filteredAssociates,
    summaryRows,
    indicators,
    distributionByCommittee: groupByLabel(
      filteredAssociates,
      (row) => row.committee?.name || 'Sin comité'
    ),
    distributionByStatus: groupByLabel(
      filteredAssociates,
      (row) => row.associate_status?.label || 'Sin estado'
    ),
  }
}

export function buildCommitteeReportOptions(reportData) {
  const { associates, committees } = normalizeReportData(reportData)

  return {
    committees: [
      ...committees.map((committee) => ({ value: committee.id, label: committee.name })),
      { value: WITHOUT_COMMITTEE, label: 'Sin comité' },
    ],
    statuses: uniqueOptions(associates, 'associate_status', 'code', 'label'),
    categories: uniqueOptions(associates, 'category', 'code', 'name'),
  }
}

function filterAssociates(associates, filters) {
  return associates.filter((row) => {
    if (filters.committeeId === WITHOUT_COMMITTEE && row.committee) return false
    if (filters.committeeId && filters.committeeId !== WITHOUT_COMMITTEE) {
      if (row.committee?.id !== filters.committeeId) return false
    }
    if (filters.statusCode && row.associate_status?.code !== filters.statusCode) return false
    if (filters.categoryCode && row.category?.code !== filters.categoryCode) return false
    return matchesAssociateSearch(row, filters.search)
  })
}

function buildSummaryRows(reportData, filteredAssociates, filters) {
  const candidates = getSummaryCandidates(reportData, filteredAssociates, filters)
  const rows = candidates.map((committee) => summarizeCommittee(committee, filteredAssociates))
  const includeWithout = shouldIncludeWithoutCommittee(filteredAssociates, filters)

  if (includeWithout) rows.push(summarizeCommittee(null, filteredAssociates))
  return rows.sort(compareSummaryRows)
}

function getSummaryCandidates(reportData, filteredAssociates, filters) {
  if (filters.committeeId === WITHOUT_COMMITTEE) return []
  if (filters.committeeId) {
    return reportData.committees.filter((item) => item.id === filters.committeeId)
  }
  if (!normalizeText(filters.search)) return reportData.committees

  const referencedIds = new Set(filteredAssociates.map((row) => row.committee?.id).filter(Boolean))
  return reportData.committees.filter(
    (item) => referencedIds.has(item.id) || matchesCommitteeSearch(item, filters.search)
  )
}

function shouldIncludeWithoutCommittee(filteredAssociates, filters) {
  if (filters.committeeId === WITHOUT_COMMITTEE) return true
  if (filters.committeeId) return false
  if (!normalizeText(filters.search)) return true
  return filteredAssociates.some((row) => !row.committee) || matchesText('Sin comite', filters.search)
}

function summarizeCommittee(committee, associates) {
  const matches = associates.filter((row) =>
    committee ? row.committee?.id === committee.id : !row.committee
  )

  return {
    id: committee?.id || WITHOUT_COMMITTEE,
    committee_code: committee?.code || '',
    committee_name: committee?.name || 'Sin comité',
    committee_status: committee ? (committee.is_active ? 'Activo' : 'Inactivo') : '',
    total_assigned: matches.length,
    active_count: countStatus(matches, 'ACTIVO'),
    inactive_count: countStatus(matches, 'INACTIVO'),
    suspended_count: countStatus(matches, 'SUSPENDIDO'),
    in_process_count: countStatus(matches, 'EN_PROCESO'),
  }
}

function buildIndicators(associates, summaryRows) {
  const assignedCount = associates.filter((row) => row.committee).length
  const representedCommittees = new Set(
    associates.map((row) => row.committee?.id).filter(Boolean)
  ).size
  const realRows = summaryRows.filter((row) => row.id !== WITHOUT_COMMITTEE)
  const ranked = realRows.filter((row) => row.total_assigned > 0)
    .sort((a, b) => b.total_assigned - a.total_assigned || compareText(a.committee_name, b.committee_name))

  return {
    totalAssociates: associates.length,
    unassignedAssociates: associates.length - assignedCount,
    representedCommittees,
    assignmentCoveragePercentage: associates.length
      ? Math.round((assignedCount / associates.length) * 100)
      : 0,
    emptyActiveCommittees: realRows.filter(
      (row) => row.committee_status === 'Activo' && row.total_assigned === 0
    ).length,
    largestCommittee: ranked[0]
      ? { id: ranked[0].id, name: ranked[0].committee_name, total: ranked[0].total_assigned }
      : { id: null, name: '', total: 0 },
    averageAssociatesPerCommittee: representedCommittees
      ? Math.round((assignedCount / representedCommittees) * 10) / 10
      : 0,
  }
}

function matchesAssociateSearch(row, search) {
  return [
    row.committee?.name,
    row.committee?.code,
    row.committee ? '' : 'Sin comite',
    row.company_name,
    row.internal_code,
    row.ruc,
  ].some((value) => matchesText(value, search))
}

function matchesCommitteeSearch(committee, search) {
  return [committee.name, committee.code].some((value) => matchesText(value, search))
}

function matchesText(value, search) {
  const term = normalizeSearchText(search)
  if (!term) return true
  return normalizeSearchText(value).includes(term)
}

function normalizeSearchText(value) {
  return normalizeText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function countStatus(rows, code) {
  return rows.filter((row) => row.associate_status?.code === code).length
}

function groupByLabel(rows, getLabel) {
  return rows.reduce((counts, row) => {
    const label = getLabel(row)
    return { ...counts, [label]: (counts[label] || 0) + 1 }
  }, {})
}

function uniqueOptions(rows, key, valueKey, labelKey) {
  const options = new Map()
  rows.forEach((row) => {
    const item = row[key]
    if (item?.[valueKey] && item?.[labelKey]) options.set(item[valueKey], item[labelKey])
  })
  return [...options].map(([value, label]) => ({ value, label }))
    .sort((a, b) => compareText(a.label, b.label))
}

function normalizeReportData(reportData) {
  return {
    associates: Array.isArray(reportData?.associates) ? reportData.associates : [],
    committees: Array.isArray(reportData?.committees)
      ? [...reportData.committees].sort((a, b) => compareText(a.name, b.name))
      : [],
  }
}

function compareAssociates(first, second) {
  if (!first.committee && second.committee) return 1
  if (first.committee && !second.committee) return -1
  return compareText(first.committee?.name, second.committee?.name)
    || compareText(first.company_name, second.company_name)
}

function compareSummaryRows(first, second) {
  if (first.id === WITHOUT_COMMITTEE) return 1
  if (second.id === WITHOUT_COMMITTEE) return -1
  return compareText(first.committee_name, second.committee_name)
}

function compareText(first, second) {
  return String(first || '').localeCompare(String(second || ''), 'es', { sensitivity: 'base' })
}
