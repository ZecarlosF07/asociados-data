import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { PageLoader } from '../components/atoms/Loader'
import { AccessDeniedPage } from '../pages/auth/AccessDeniedPage'
import { ROUTES } from './routes'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const { profile, loadingProfile } = useUserProfile()

  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />
  if (loadingProfile) return <PageLoader />
  if (!profile) return <AccessDeniedPage />

  return children
}
