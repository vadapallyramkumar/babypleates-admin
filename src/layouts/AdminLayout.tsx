import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from '../lib/auth'

const navItems = [
  { to: '/', label: 'Overview', end: true },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/media', label: 'Media' },
  { to: '/settings', label: 'Settings' },
] as const

export function AdminLayout() {
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-dvh bg-admin-bg">
      <aside className="sticky top-0 flex h-dvh w-[220px] shrink-0 flex-col bg-sidebar px-4 py-6 text-white">
        <div className="px-2">
          <p className="font-display text-[1.15rem] font-semibold tracking-[0.06em]">
            BABY PLEATES
          </p>
          <p className="mt-0.5 text-[0.65rem] tracking-[0.22em] text-sidebar-muted uppercase">
            Admin Studio
          </p>
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-2.5 text-[0.92rem] transition',
                  isActive
                    ? 'bg-sidebar-active font-medium text-white'
                    : 'text-white/80 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 px-2 pt-5">
          <p className="text-[0.65rem] tracking-[0.18em] text-sidebar-muted uppercase">
            Store status
          </p>
          <p className="mt-2 flex items-center gap-2 text-[0.85rem] text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-live-dot" />
            Live &amp; synced
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-4 text-left text-[0.78rem] text-sidebar-muted transition hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
