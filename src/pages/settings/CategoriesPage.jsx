import { useCallback, useEffect, useState } from 'react'
import { categoriesService } from '../../services/categories.service'
import { useNotification } from '../../hooks/useNotification'
import { DataTable } from '../../components/organisms/DataTable'
import { Badge } from '../../components/atoms/Badge'
import { Button } from '../../components/atoms/Button'
import { formatCurrency } from '../../utils/helpers'

const COLUMNS = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'description', label: 'Descripción' },
  {
    key: 'min_score',
    label: 'Puntaje mín.',
    render: (value) => value?.toFixed(2) ?? '—',
  },
  {
    key: 'max_score',
    label: 'Puntaje máx.',
    render: (value) => value?.toFixed(2) ?? '—',
  },
  {
    key: 'base_fee',
    label: 'Tarifa base',
    render: (value) => (value ? formatCurrency(value) : '—'),
  },
  {
    key: 'is_active',
    label: 'Estado',
    render: (value) => (
      <Badge variant={value ? 'success' : 'danger'}>
        {value ? 'Activa' : 'Inactiva'}
      </Badge>
    ),
  },
]

export function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotification()

  const loadCategories = useCallback(async () => {
    setLoading(true)
    try {
      const data = await categoriesService.getAll()
      setCategories(data)
    } catch (error) {
      notify.error('Error al cargar categorías: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return (
    <div className="max-w-5xl">
      <div className="mb-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Categorías</h1>
            <p className="text-sm text-slate-400">
              Clasificación de asociados y prospectos con puntajes y tarifas
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => notify.info('Crear categoría: funcionalidad pendiente')}
          >
            Nueva categoría
          </Button>
        </div>
      </div>

      <DataTable
        columns={COLUMNS}
        data={categories}
        loading={loading}
        emptyMessage="No hay categorías registradas"
      />
    </div>
  )
}
