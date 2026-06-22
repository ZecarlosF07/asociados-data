import { useState } from 'react'
import { getCurrentMonthFilter } from '../utils/paymentScheduleUtils'

export function usePendingPaymentFilters() {
  const currentMonth = getCurrentMonthFilter()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('pending')
  const [paymentTypeId, setPaymentTypeId] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.month)
  const [selectedYear, setSelectedYear] = useState(currentMonth.year)
  const [showAllMonths, setShowAllMonths] = useState(false)

  const handlePrevMonth = () => {
    setSelectedMonth((month) => {
      if (month !== 1) return month - 1
      setSelectedYear((year) => year - 1)
      return 12
    })
    setShowAllMonths(false)
  }

  const handleNextMonth = () => {
    setSelectedMonth((month) => {
      if (month !== 12) return month + 1
      setSelectedYear((year) => year + 1)
      return 1
    })
    setShowAllMonths(false)
  }

  const handleCurrentMonth = () => {
    setSelectedMonth(currentMonth.month)
    setSelectedYear(currentMonth.year)
    setShowAllMonths(false)
  }

  const handleViewModeToggle = () => {
    setViewMode((current) => current === 'paid' ? 'pending' : 'paid')
  }

  return {
    handleCurrentMonth,
    handleNextMonth,
    handlePrevMonth,
    handleViewModeToggle,
    paymentTypeId,
    search,
    selectedMonth,
    selectedYear,
    setSearch,
    setPaymentTypeId,
    setShowAllMonths,
    showAllMonths,
    viewMode,
  }
}
