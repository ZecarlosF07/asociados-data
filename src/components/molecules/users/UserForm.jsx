import { useEffect, useState } from 'react'
import { Button } from '../../atoms/Button'
import { Input } from '../../atoms/Input'
import { Textarea } from '../../atoms/Textarea'
import { FormField } from '../FormField'

const INITIAL_FORM = {
  first_name: '',
  last_name: '',
  institutional_email: '',
  dni: '',
  role_id: '',
  password: '',
  is_active: true,
  notes: '',
}

export function UserForm({ initialData, roles, mode = 'create', loading, onSubmit, onCancel }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const isCreate = mode === 'create'

  useEffect(() => {
    if (!initialData) {
      setForm(INITIAL_FORM)
      return
    }

    setForm({
      first_name: initialData.first_name || '',
      last_name: initialData.last_name || '',
      institutional_email: initialData.institutional_email || '',
      dni: initialData.dni || '',
      role_id: initialData.role_id || '',
      password: '',
      is_active: initialData.is_active !== false,
      notes: initialData.notes || '',
    })
  }, [initialData])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      ...form,
      institutional_email: form.institutional_email.trim().toLowerCase(),
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput label="Nombres" name="first_name" value={form.first_name} onChange={handleChange} />
        <TextInput label="Apellidos" name="last_name" value={form.last_name} onChange={handleChange} />
        <FormField label="Correo institucional" name="institutional_email" required>
          <Input type="email" name="institutional_email" value={form.institutional_email} onChange={handleChange} required />
        </FormField>
        <TextInput label="DNI" name="dni" value={form.dni} onChange={handleChange} />
        <FormField label="Rol" name="role_id" required>
          <select
            name="role_id"
            value={form.role_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">Seleccionar rol</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </FormField>
        {isCreate && (
          <FormField label="Clave temporal" name="password" required>
            <Input type="password" name="password" value={form.password} onChange={handleChange} minLength={8} required />
          </FormField>
        )}
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="is_active"
          checked={form.is_active}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300"
        />
        Usuario activo
      </label>

      <FormField label="Notas" name="notes">
        <Textarea name="notes" value={form.notes} onChange={handleChange} rows={3} />
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {isCreate ? 'Crear usuario' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

function TextInput({ label, name, value, onChange }) {
  return (
    <FormField label={label} name={name} required>
      <Input name={name} value={value} onChange={onChange} required />
    </FormField>
  )
}
