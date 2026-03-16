import { useEffect } from 'react'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4 animate-in fade-in"
      onClick={handleBackdrop}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-h-[85vh] flex flex-col ${SIZES[size]}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button
            className="text-xl text-slate-400 hover:text-slate-800 cursor-pointer leading-none transition-colors"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="px-5 py-5 overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2.5 px-5 py-3 border-t border-slate-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
