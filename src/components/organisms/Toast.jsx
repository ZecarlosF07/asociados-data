import { useNotification } from '../../hooks/useNotification'

const TOAST_VARIANTS = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-amber-400 text-slate-900',
  info: 'bg-blue-500',
}

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

function Toast({ notification, onClose }) {
  const variant = TOAST_VARIANTS[notification.type] || TOAST_VARIANTS.info

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-md shadow-md text-sm text-white animate-slide-in ${variant}`}
    >
      <span className="text-sm font-bold shrink-0">
        {ICONS[notification.type]}
      </span>
      <span className="flex-1">{notification.message}</span>
      <button
        className="bg-transparent border-none text-inherit text-lg cursor-pointer opacity-70 hover:opacity-100 leading-none px-0.5"
        onClick={() => onClose(notification.id)}
      >
        ×
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { notifications, removeNotification } = useNotification()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-5 right-5 z-[2000] flex flex-col gap-2.5 max-w-sm">
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} onClose={removeNotification} />
      ))}
    </div>
  )
}
