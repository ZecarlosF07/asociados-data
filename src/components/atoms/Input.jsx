import { forwardRef } from 'react'

export const Input = forwardRef(function Input(
  { hasError = false, className = '', ...rest },
  ref
) {
  const base = 'w-full px-3 py-2 border rounded-md font-sans text-sm text-slate-900 bg-white outline-none transition-colors placeholder:text-slate-400/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70'
  const errorClass = hasError
    ? 'border-red-500 focus:ring-red-500/10'
    : 'border-slate-300'

  return (
    <input
      ref={ref}
      className={`${base} ${errorClass} ${className}`}
      {...rest}
    />
  )
})
