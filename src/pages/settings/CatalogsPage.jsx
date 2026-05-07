import { useCallback, useEffect, useState } from 'react'
import { catalogsService } from '../../services/catalogs.service'
import { useNotification } from '../../hooks/useNotification'
import { DataTable } from '../../components/organisms/DataTable'
import { Badge } from '../../components/atoms/Badge'
import { Button } from '../../components/atoms/Button'

const GROUP_COLUMNS = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'description', label: 'Descripción' },
  {
    key: 'is_active',
    label: 'Estado',
    render: (value) => (
      <Badge variant={value ? 'success' : 'danger'}>
        {value ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
]

const ITEM_COLUMNS = [
  { key: 'code', label: 'Código' },
  { key: 'label', label: 'Etiqueta' },
  { key: 'sort_order', label: 'Orden' },
  {
    key: 'is_active',
    label: 'Estado',
    render: (value) => (
      <Badge variant={value ? 'success' : 'danger'}>
        {value ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
]

export function CatalogsPage() {
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [items, setItems] = useState([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)
  const { notify } = useNotification()

  const loadGroups = useCallback(async () => {
    setLoadingGroups(true)
    try {
      const data = await catalogsService.getAllGroups()
      setGroups(data)
    } catch (error) {
      notify.error('Error al cargar grupos: ' + error.message)
    } finally {
      setLoadingGroups(false)
    }
  }, [notify])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const handleGroupClick = async (group) => {
    setSelectedGroup(group)
    setLoadingItems(true)
    try {
      const data = await catalogsService.getItemsByGroup(group.code)
      setItems(data)
    } catch (error) {
      notify.error('Error al cargar ítems: ' + error.message)
    } finally {
      setLoadingItems(false)
    }
  }

  const handleBack = () => {
    setSelectedGroup(null)
    setItems([])
  }

  if (selectedGroup) {
    return (
      <div className="max-w-5xl">
        <div className="mb-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {selectedGroup.name}
              </h1>
              <p className="text-sm text-slate-400">
                Código:{' '}
                <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                  {selectedGroup.code}
                </code>
                {selectedGroup.description && ` — ${selectedGroup.description}`}
              </p>
            </div>
            <Button variant="secondary" onClick={handleBack}>
              ← Volver a grupos
            </Button>
          </div>
        </div>

        <DataTable
          columns={ITEM_COLUMNS}
          data={items}
          loading={loadingItems}
          emptyMessage="Este catálogo no tiene ítems registrados"
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Catálogos</h1>
        <p className="text-sm text-slate-400">
          Grupos de catálogos del sistema. Haz clic en un grupo para ver sus ítems.
        </p>
      </div>

      <DataTable
        columns={GROUP_COLUMNS}
        data={groups}
        loading={loadingGroups}
        emptyMessage="No hay catálogos registrados"
        onRowClick={handleGroupClick}
      />
    </div>
  )
}
