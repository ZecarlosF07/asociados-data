import { createContext, useState, useCallback } from 'react'
import { NOTIFICATION_DURATION } from '../utils/constants'

export const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const addNotification = useCallback(
    ({ type = 'info', message, duration = NOTIFICATION_DURATION }) => {
      const id = Date.now()
      setNotifications((prev) => [...prev, { id, type, message }])

      if (duration > 0) {
        setTimeout(() => removeNotification(id), duration)
      }

      return id
    },
    [removeNotification]
  )

  const notify = {
    success: (message) => addNotification({ type: 'success', message }),
    error: (message) => addNotification({ type: 'error', message }),
    warning: (message) => addNotification({ type: 'warning', message }),
    info: (message) => addNotification({ type: 'info', message }),
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, notify, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
