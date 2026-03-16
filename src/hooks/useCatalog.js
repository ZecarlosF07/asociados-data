import { useState, useEffect, useCallback, useRef } from 'react'
import { catalogsService } from '../services/catalogs.service'

const cache = new Map()

export function useCatalog(groupCode) {
  const [items, setItems] = useState(() => cache.get(groupCode) || [])
  const [loading, setLoading] = useState(!cache.has(groupCode))
  const [error, setError] = useState(null)
  const isMounted = useRef(true)

  const fetchItems = useCallback(async () => {
    if (cache.has(groupCode)) {
      setItems(cache.get(groupCode))
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await catalogsService.getItemsByGroup(groupCode)
      cache.set(groupCode, data)

      if (isMounted.current) {
        setItems(data)
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.message)
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [groupCode])

  useEffect(() => {
    isMounted.current = true
    fetchItems()

    return () => {
      isMounted.current = false
    }
  }, [fetchItems])

  const getLabelByCode = useCallback(
    (code) => {
      const item = items.find((i) => i.code === code)
      return item?.label || code
    },
    [items]
  )

  const getLabelById = useCallback(
    (id) => {
      const item = items.find((i) => i.id === id)
      return item?.label || ''
    },
    [items]
  )

  const invalidateCache = useCallback(() => {
    cache.delete(groupCode)
    fetchItems()
  }, [groupCode, fetchItems])

  return {
    items,
    loading,
    error,
    getLabelByCode,
    getLabelById,
    invalidateCache,
  }
}
