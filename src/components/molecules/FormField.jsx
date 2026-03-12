import { Input } from '../atoms/Input'

export function FormField({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  helpText,
}) {
  const fieldId = id || name

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={fieldId} className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      <Input
        id={fieldId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        error={!!error}
        disabled={disabled}
      />
      {error && <span className="form-error">{error}</span>}
      {helpText && !error && <span className="form-help">{helpText}</span>}
    </div>
  )
}
