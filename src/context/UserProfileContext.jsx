import { useState, useEffect, useCallback } from 'react'
import { UserProfileContext } from './user-profile-context-value'
import { useAuth } from '../hooks/useAuth'
import { userProfilesService } from '../services/userProfiles.service'
import { retryAsync } from '../utils/retry'

export function UserProfileProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true)

    if (!user?.id) {
      setProfile(null)
      setLoadingProfile(false)
      return
    }

    try {
      const data = await retryAsync(() => userProfilesService.getMyProfile(user.id))
      setProfile(data)
      updateLastLoginSafely()
    } catch (error) {
      console.warn('No se encontró perfil para este usuario:', error.message)
      setProfile(null)
    } finally {
      setLoadingProfile(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
    } else {
      setProfile(null)
      setLoadingProfile(false)
    }
  }, [isAuthenticated, fetchProfile])

  const value = {
    profile,
    loadingProfile,
    roleCode: profile?.roles?.code ?? null,
    refreshProfile: fetchProfile,
  }

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  )
}

async function updateLastLoginSafely() {
  try {
    await retryAsync(() => userProfilesService.updateLastLogin(), {
      attempts: 2,
    })
  } catch (error) {
    console.warn('No se pudo actualizar el último acceso:', error.message)
  }
}
