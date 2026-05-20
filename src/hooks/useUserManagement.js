import { useCallback, useEffect, useState } from 'react'
import { rolesService } from '../services/roles.service'
import { userProfilesService } from '../services/userProfiles.service'
import { useNotification } from './useNotification'
import { useUserProfile } from './useUserProfile'

export function useUserManagement() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [modalMode, setModalMode] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [passwordUser, setPasswordUser] = useState(null)
  const { notify } = useNotification()
  const { profile } = useUserProfile()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersData, rolesData] = await Promise.all([
        userProfilesService.getAll(),
        rolesService.getAll(),
      ])
      setUsers(usersData)
      setRoles(rolesData)
    } catch (error) {
      notify.error('Error al cargar usuarios: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openCreateModal = () => setModalMode('create')

  const openEditModal = (user) => {
    setSelectedUser(user)
    setModalMode('edit')
  }

  const closeUserModal = () => {
    setModalMode(null)
    setSelectedUser(null)
  }

  const createUser = async (payload) => {
    setActionLoading(true)
    try {
      await userProfilesService.createInternalUser(payload)
      notify.success('Usuario creado')
      closeUserModal()
      loadData()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const updateUser = async (payload) => {
    setActionLoading(true)
    try {
      await userProfilesService.update(selectedUser.id, {
        first_name: payload.first_name,
        last_name: payload.last_name,
        institutional_email: payload.institutional_email,
        dni: payload.dni,
        role_id: payload.role_id,
        is_active: payload.is_active,
        notes: payload.notes,
        updated_by: profile?.id,
      })

      notify.success('Usuario actualizado')
      closeUserModal()
      loadData()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const resetPassword = async (password) => {
    setActionLoading(true)
    try {
      await userProfilesService.resetInternalUserPassword({
        user_profile_id: passwordUser.id,
        password,
      })
      notify.success('Contraseña actualizada')
      setPasswordUser(null)
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  return {
    users,
    roles,
    loading,
    actionLoading,
    modalMode,
    selectedUser,
    passwordUser,
    openCreateModal,
    openEditModal,
    closeUserModal,
    createUser,
    updateUser,
    setPasswordUser,
    resetPassword,
  }
}
