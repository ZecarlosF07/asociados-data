import { useState, useEffect, useCallback } from 'react'
import { categoriesService } from '../services/categories.service'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await categoriesService.getAll()
      setCategories(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const getLabelById = useCallback(
    (id) => {
      const cat = categories.find((c) => c.id === id)
      return cat?.name || ''
    },
    [categories]
  )

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    getLabelById,
  }
}
