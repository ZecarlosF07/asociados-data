import { usePermissions } from '../../hooks/usePermissions'

export function AccessDeniedPage() {
  const { roleCode } = usePermissions()

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center gap-3">
      <h1 className="text-7xl font-extrabold text-slate-200 leading-none">403</h1>
      <p className="text-base text-slate-400 mb-3">
        No tienes permisos para acceder a esta sección
      </p>
      <p className="text-xs text-slate-400">
        Tu rol actual: <strong className="text-slate-600">{roleCode || 'Sin asignar'}</strong>
      </p>
    </div>
  )
}
