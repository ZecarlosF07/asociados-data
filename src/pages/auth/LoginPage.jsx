import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import { FormField } from '../../components/molecules/FormField'
import { Button } from '../../components/atoms/Button'
import { APP_NAME } from '../../utils/constants'
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
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (error) {
      notify.error(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg px-8 py-9 shadow-md">
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{APP_NAME}</h1>
        <p className="text-sm text-slate-400">Ingresa con tu cuenta</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@ejemplo.com"
        />

        <FormField
          label="Contraseña"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full mt-1"
        >
          Iniciar sesión
        </Button>
      </form>
    </div>
  )
}
