import { todayDateOnly } from './dateOnly'

export function getOffboardingImpact(associate, memberships = [], schedules = [], today = todayDateOnly()) {
  const operational = memberships.filter((item) =>
    ['VIGENTE', 'PROGRAMADA'].includes(item.membership_status?.code)
  )
  const dueDebt = schedules.reduce((total, schedule) => {
    if (!schedule.is_collectible || schedule.due_date > today) return total
    return total + Number(schedule.outstanding_amount || 0)
  }, 0)
  return {
    currentCount: operational.filter((item) => item.membership_status?.code === 'VIGENTE').length,
    scheduledCount: operational.filter((item) => item.membership_status?.code === 'PROGRAMADA').length,
    committeeCount: (associate.committee_assignments || []).filter(
      (item) => item.is_active && !item.is_deleted
    ).length,
    dueDebt,
    requiresMembershipPermission: operational.length > 0,
  }
}
