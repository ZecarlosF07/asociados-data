import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import { FormField } from '../../components/molecules/FormField'
import { Button } from '../../components/atoms/Button'
import { ROUTES } from '../../router/routes'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const { notify } = useNotification()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      notify.warning('Completa todos los campos')
      return
    }

    setLoading(true)
    try {
      await signIn({ email, password })
      notify.success('Bienvenido al sistema')
      navigate(ROUTES.DASHBOARD)
    } catch (error) {
      notify.error(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="auth-header">
        <h1 className="auth-title">Sistema de Asociados</h1>
        <p className="auth-subtitle">Ingresa tus credenciales para acceder</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <FormField
          label="Contraseña"
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="auth-submit"
        >
          Iniciar sesión
        </Button>
      </form>
    </>
  )
}
