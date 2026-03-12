import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-card">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
