import { useState } from 'react'
import { Button } from '../../atoms/Button'
import { FormField } from '../FormField'
import { Textarea } from '../../atoms/Textarea'

export function CommitteeForm({ initialData, loading, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    code: initialData?.code || '',
    description: initialData?.description || '',
    name: initialData?.name || '',
  })
  const [nameError, setNameError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (name === 'name') setNameError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setNameError('El nombre es obligatorio.')
      return
    }
    onSubmit(form)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormField label="Código" name="code" value={form.code} onChange={handleChange} />
      <FormField
        label="Nombre"
        name="name"
        required
        value={form.name}
        onChange={handleChange}
        error={nameError}
      />
      <FormField label="Descripción" name="description">
        <Textarea name="description" value={form.description} onChange={handleChange} />
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Guardar</Button>
      </div>
    </form>
  )
}
