import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PageLoader } from '../components/atoms/Loader'
import { ROUTES } from './routes'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />

  return children
}
