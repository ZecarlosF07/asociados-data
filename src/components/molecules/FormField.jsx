import { Input } from '../atoms/Input'

export function FormField({
  label,
  name,
  required = false,
  error,
  helpText,
  children,
  ...inputProps
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-slate-800">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {children || (
        <Input id={name} name={name} hasError={!!error} {...inputProps} />
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      {helpText && !error && (
        <p className="text-xs text-slate-400">{helpText}</p>
      )}
    </div>
  )
}
