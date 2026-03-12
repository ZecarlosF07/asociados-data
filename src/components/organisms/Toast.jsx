import { useNotification } from '../../hooks/useNotification'

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

export function ToastContainer() {
  const { notifications, removeNotification } = useNotification()

  if (notifications.length === 0) return null

  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`toast toast-${notification.type}`}
        >
          <span className="toast-icon">{ICONS[notification.type]}</span>
          <span className="toast-message">{notification.message}</span>
          <button
            className="toast-close"
            onClick={() => removeNotification(notification.id)}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
