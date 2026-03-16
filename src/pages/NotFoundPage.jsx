import { Link } from 'react-router-dom'
import { ROUTES } from '../router/routes'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center gap-3">
      <h1 className="text-7xl font-extrabold text-slate-200 leading-none">404</h1>
      <p className="text-base text-slate-400 mb-3">
        La página que buscas no existe
      </p>
      <Link
        to={ROUTES.DASHBOARD}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Volver al dashboard
      </Link>
    </div>
  )
}
