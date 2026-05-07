import { useContext } from 'react'
import { UserProfileContext } from '../context/user-profile-context-value'

export function useUserProfile() {
  const context = useContext(UserProfileContext)

  if (!context) {
    throw new Error(
      'useUserProfile debe usarse dentro de un UserProfileProvider'
    )
  }

  return context
}
