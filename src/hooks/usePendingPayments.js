import { useState, useEffect, useCallback, useMemo } from 'react'
import { paymentSchedulesService } from '../services/paymentSchedules.service'
import { usePendingPaymentActions } from './usePendingPaymentActions'
import { usePendingPaymentFilters } from './usePendingPaymentFilters'
import {
  filterPaymentSchedules,
  splitSchedulesByDueDate,
  sumExpectedAmount,
} from '../utils/paymentScheduleUtils'

export function usePendingPayments({ profile, notify }) {
  const filters = usePendingPaymentFilters()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [activePaymentRow, setActivePaymentRow] = useState(null)
  const [activeCollectionRow, setActiveCollectionRow] = useState(null)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    try {
      const data = await paymentSchedulesService.getForCollection({
        isPaid: filters.viewMode === 'paid',
      })
      setSchedules(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters.viewMode])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  const filtered = useMemo(
    () => filterPaymentSchedules(schedules, {
      selectedMonth: filters.selectedMonth,
      selectedYear: filters.selectedYear,
      showAllMonths: filters.showAllMonths,
      search: filters.search,
      paymentTypeId: filters.paymentTypeId,
    }),
    [
      filters.search,
      filters.paymentTypeId,
      filters.selectedMonth,
      filters.selectedYear,
      filters.showAllMonths,
      schedules,
    ]
  )

  const { overdue, upcoming } = useMemo(
    () => splitSchedulesByDueDate(filtered),
    [filtered]
  )

  const handleViewModeToggle = () => {
    filters.handleViewModeToggle()
    setActivePaymentRow(null)
    setActiveCollectionRow(null)
  }

  const handlePayClick = (id) => {
    setActivePaymentRow((current) => current === id ? null : id)
    setActiveCollectionRow(null)
  }

  const handleCollectionClick = (id) => {
    setActiveCollectionRow((current) => current === id ? null : id)
    setActivePaymentRow(null)
  }

  const {
    actionLoading,
    handleCollectionSubmit,
    handlePaymentSubmit,
  } = usePendingPaymentActions({
    activeCollectionRow,
    activePaymentRow,
    fetchSchedules,
    notify,
    profile,
    schedules,
    setActiveCollectionRow,
    setActivePaymentRow,
  })

  return {
    activeCollectionRow,
    activePaymentRow,
    actionLoading,
    filtered,
    handleCollectionClick,
    handleCollectionSubmit,
    handleCurrentMonth: filters.handleCurrentMonth,
    handleNextMonth: filters.handleNextMonth,
    handlePaymentSubmit,
    handlePayClick,
    handlePrevMonth: filters.handlePrevMonth,
    handleViewModeToggle,
    loading,
    overdue,
    paid: filtered,
    paymentTypeId: filters.paymentTypeId,
    search: filters.search,
    selectedMonth: filters.selectedMonth,
    selectedYear: filters.selectedYear,
    setSearch: filters.setSearch,
    setPaymentTypeId: filters.setPaymentTypeId,
    setShowAllMonths: filters.setShowAllMonths,
    showAllMonths: filters.showAllMonths,
    totalAmount: sumExpectedAmount(filtered),
    totalOverdue: sumExpectedAmount(overdue),
    upcoming,
    viewMode: filters.viewMode,
  }
}
