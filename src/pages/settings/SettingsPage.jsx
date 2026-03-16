import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { settingsService } from '../../services/settings.service'
import { useNotification } from '../../hooks/useNotification'
import { DataTable } from '../../components/organisms/DataTable'
import { Badge } from '../../components/atoms/Badge'
import { ROUTES } from '../../router/routes'

const SETTINGS_COLUMNS = [
  { key: 'setting_key', label: 'Clave' },
  {
    key: 'setting_value',
    label: 'Valor',
    render: (value) => (
      <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
        {JSON.stringify(value)}
      </code>
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

const CONFIG_SECTIONS = [
  {
    title: 'Catálogos',
    description: 'Grupos e ítems de catálogos del sistema',
    path: ROUTES.CATALOGOS,
    icon: '📋',
  },
  {
    title: 'Categorías',
    description: 'Clasificación de asociados con puntajes y tarifas',
    path: ROUTES.CATEGORIAS,
    icon: '🏷️',
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
    <div className="max-w-5xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Configuración</h1>
        <p className="text-sm text-slate-400">
          Parámetros generales, catálogos y reglas maestras del sistema
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mb-8">
        {CONFIG_SECTIONS.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
          >
            <h3 className="text-xs font-semibold text-slate-400 mb-2">
              <span className="mr-2">{section.icon}</span>
              {section.title}
            </h3>
            <p className="text-xs text-slate-400">{section.description}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-base font-bold text-slate-900 mb-4">
        Parámetros del sistema
      </h2>

      <DataTable
        columns={SETTINGS_COLUMNS}
        data={settings}
        loading={loading}
        emptyMessage="No hay configuraciones registradas"
      />
    </div>
  )
}
