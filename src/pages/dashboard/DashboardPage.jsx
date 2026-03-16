export function DashboardPage() {
  const modules = [
    { title: 'Prospectos', value: '—', label: 'Empresas en evaluación' },
    { title: 'Asociados', value: '—', label: 'Empresas activas' },
    { title: 'Membresías', value: '—', label: 'Membresías vigentes' },
    { title: 'Cobranza', value: '—', label: 'Pendientes de cobro' },
    { title: 'Documentos', value: '—', label: 'Archivos almacenados' },
  ]

  return (
    <div className="max-w-5xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-sm text-slate-400">
          Resumen general del sistema
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        {modules.map((mod) => (
          <div
            key={mod.title}
            className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm"
          >
            <h3 className="text-xs font-semibold text-slate-400 mb-2">
              {mod.title}
            </h3>
            <p className="text-3xl font-bold text-slate-900 mb-1">
              {mod.value}
            </p>
            <p className="text-xs text-slate-400">{mod.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
