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
    <aside className="fixed top-0 left-0 w-60 h-screen bg-sidebar flex flex-col z-50">
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <h2 className="text-base font-bold text-sidebar-text-active tracking-tight">
          {APP_NAME}
        </h2>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto flex flex-col gap-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-active text-sidebar-text-active'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'
              }`
            }
          >
            <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex flex-col gap-0.5 mb-2.5">
          {displayName && (
            <span className="text-xs font-semibold text-sidebar-text-active break-all">
              {displayName}
            </span>
          )}
          {displayRole && (
            <span className="text-[0.7rem] text-sidebar-text">{displayRole}</span>
          )}
        </div>
        <button
          className="w-full py-2 border border-white/10 rounded-md bg-transparent text-sidebar-text text-xs cursor-pointer transition-colors hover:bg-sidebar-hover hover:text-sidebar-text-active"
          onClick={signOut}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
