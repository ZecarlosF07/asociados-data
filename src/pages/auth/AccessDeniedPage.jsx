import { usePermissions } from '../../hooks/usePermissions'

export function AccessDeniedPage() {
  const { roleCode } = usePermissions()

  return (
    <div className="not-found">
      <h1 className="not-found-code">403</h1>
      <p className="not-found-message">
        No tienes permisos para acceder a esta sección
      </p>
      <p className="form-help">
        Tu rol actual: <strong>{roleCode || 'Sin asignar'}</strong>
      </p>
    </div>
  )
}
