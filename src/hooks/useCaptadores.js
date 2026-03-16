import { useState, useEffect, useCallback } from 'react'
import { captadoresService } from '../services/captadores.service'

export function useCaptadores() {
  const [captadores, setCaptadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCaptadores = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await captadoresService.getAll()
      setCaptadores(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCaptadores()
  }, [fetchCaptadores])

  const getNameById = useCallback(
    (id) => {
      const cap = captadores.find((c) => c.id === id)
      return cap?.full_name || ''
    },
    [captadores]
  )

  return {
    captadores,
    loading,
    error,
    refetch: fetchCaptadores,
    getNameById,
  }
}
