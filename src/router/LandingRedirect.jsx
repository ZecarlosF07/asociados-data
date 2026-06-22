import { Navigate } from 'react-router-dom'
import { useUserProfile } from '../hooks/useUserProfile'
import { getRoleLandingRoute } from '../utils/roleLandingRoutes'

export function LandingRedirect() {
  const { roleCode } = useUserProfile()
  return <Navigate to={getRoleLandingRoute(roleCode)} replace />
}
