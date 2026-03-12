import { Link } from 'react-router-dom'
import { Button } from '../components/atoms/Button'
import { ROUTES } from '../router/routes'

export function NotFoundPage() {
  return (
    <div className="not-found">
      <h1 className="not-found-code">404</h1>
      <p className="not-found-message">La página que buscas no existe</p>
      <Link to={ROUTES.DASHBOARD}>
        <Button variant="primary">Volver al inicio</Button>
      </Link>
    </div>
  )
}
