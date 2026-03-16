import { useState } from 'react'
import { Modal } from '../../organisms/Modal'
import { FormField } from '../FormField'
import { Button } from '../../atoms/Button'

export function NewCaptadorModal({ isOpen, onClose, onCreated, loading }) {
  const [form, setForm] = useState({
    full_name: '',
    is_internal: false,
    email: '',
    phone: '',
    notes: '',
  })
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = () => {
    if (!form.full_name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setError(null)
    onCreated(form)
  }

  const handleClose = () => {
    setForm({ full_name: '', is_internal: false, email: '', phone: '', notes: '' })
    setError(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo captador"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Guardar captador
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField
          label="Nombre completo"
          name="full_name"
          required
          value={form.full_name}
          onChange={handleChange}
          error={error}
        />

        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            name="is_internal"
            checked={form.is_internal}
            onChange={handleChange}
            className="rounded border-slate-300"
          />
          Es personal interno de la Cámara
        </label>

        <FormField
          label="Correo"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />

        <FormField
          label="Teléfono"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />

        <FormField
          label="Notas"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Observaciones sobre el captador..."
        />
      </div>
    </Modal>
  )
}
