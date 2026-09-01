export const DEFAULT_MEMBERSHIP_LIST_FILTERS = Object.freeze({
  search: '',
  typeId: '',
  categoryId: '',
})

export function selectEffectiveMemberships(memberships) {
  return memberships.filter(
    (membership) => membership.effective_status_code === 'VIGENTE'
  )
}

export function filterMemberships(memberships, filters) {
  const searchTerm = filters.search.trim().toLowerCase()

  return memberships.filter((membership) => {
    const matchesSearch = !searchTerm || membershipMatchesSearch(membership, searchTerm)
    const matchesType =
      !filters.typeId || membership.membership_type?.id === filters.typeId
    const matchesCategory =
      !filters.categoryId || membership.category?.id === filters.categoryId

    return matchesSearch && matchesType && matchesCategory
  })
}

export function hasMembershipFilters(filters) {
  return Boolean(filters.search.trim() || filters.typeId || filters.categoryId)
}

function membershipMatchesSearch(membership, searchTerm) {
  const searchableValues = [
    membership.associate?.company_name,
    membership.associate?.ruc,
    membership.associate?.internal_code,
  ]

  return searchableValues.some((value) => value?.toLowerCase().includes(searchTerm))
}
