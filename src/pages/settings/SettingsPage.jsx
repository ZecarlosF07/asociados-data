import { useState, useEffect } from 'react'
import { settingsService } from '../../services/settings.service'
import { useNotification } from '../../hooks/useNotification'
import { DataTable } from '../../components/organisms/DataTable'
import { Badge } from '../../components/atoms/Badge'

const COLUMNS = [
  { key: 'setting_key', label: 'Clave' },
  {
    key: 'setting_value',
    label: 'Valor',
    render: (value) => (
      <code className="setting-value">{JSON.stringify(value)}</code>
    ),
  },
  { key: 'description', label: 'Descripción' },
  {
    key: 'is_public',
    label: 'Visible',
    render: (value) => (
      <Badge variant={value ? 'info' : 'default'}>
        {value ? 'Público' : 'Privado'}
      </Badge>
    ),
  },
]

export function SettingsPage() {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotification()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await settingsService.getAll()
      setSettings(data)
    } catch (error) {
      notify.error('Error al cargar configuraciones: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Configuración</h1>
        <p className="page-subtitle">
          Parámetros generales del sistema
        </p>
      </div>

      <DataTable
        columns={COLUMNS}
        data={settings}
        loading={loading}
        emptyMessage="No hay configuraciones registradas"
      />
    </div>
  )
}
