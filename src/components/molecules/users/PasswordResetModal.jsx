import { useState } from 'react'
import { Button } from '../../atoms/Button'
import { Input } from '../../atoms/Input'
import { Modal } from '../../organisms/Modal'
import { FormField } from '../FormField'

export function PasswordResetModal({
  isOpen,
  user,
  loading,
  onClose,
  onSubmit,
}) {
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(password)
  }

  const handleClose = () => {
    setPassword('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Restablecer contraseña"
      size="sm"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-sm text-slate-500">
          Usuario: <span className="font-semibold text-slate-800">{user?.institutional_email}</span>
        </p>
        <FormField label="Nueva clave temporal" name="password" required>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Cambiar contraseña
          </Button>
        </div>
      </form>
    </Modal>
  )
}
