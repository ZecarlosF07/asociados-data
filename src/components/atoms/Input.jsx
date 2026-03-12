import { forwardRef } from 'react'

export const Input = forwardRef(function Input(
  {
    type = 'text',
    placeholder,
    value,
    onChange,
    disabled = false,
    error = false,
    className = '',
    id,
    name,
    ...props
  },
  ref
) {
  const classes = ['input', error && 'input-error', className]
    .filter(Boolean)
    .join(' ')

  return (
    <input
      ref={ref}
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={classes}
      {...props}
    />
  )
})
