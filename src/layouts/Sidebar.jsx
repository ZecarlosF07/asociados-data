import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { hasPermission } from '../utils/permissions'
import { NAVIGATION_ITEMS, APP_NAME } from '../utils/constants'

export function Sidebar() {
  const { signOut } = useAuth()
  const { profile, roleCode } = useUserProfile()

  const visibleItems = NAVIGATION_ITEMS.filter((item) => {
    const moduleKey = item.path.replace('/', '')
    return hasPermission(roleCode, moduleKey)
  })

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : ''

  const displayRole = profile?.roles?.name || ''

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">{APP_NAME}</h2>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          {displayName && (
            <span className="sidebar-user-name">{displayName}</span>
          )}
          {displayRole && (
            <span className="sidebar-user-role">{displayRole}</span>
          )}
        </div>
        <button className="sidebar-signout" onClick={signOut}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
