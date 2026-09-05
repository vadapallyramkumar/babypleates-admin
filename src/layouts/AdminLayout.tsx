import { useEffect, useId, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout as logoutRequest } from '../api/auth'
import { IconClose, IconMenu } from '../components/icons'
import { signOut } from '../lib/auth'

const navItems = [
  { to: '/', label: 'Overview', end: true },
  { to: '/home', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
  // { to: '/inventory', label: 'Inventory' },
  { to: '/media', label: 'Media' },
  // { to: '/settings', label: 'Settings' },
] as const

function BrandBlock({ id }: { id?: string }) {
  return (
    <div className="px-2">
      <p id={id} className="font-display text-[1.15rem] font-semibold tracking-[0.06em]">
        BABY PLEATES
      </p>
      <p className="mt-0.5 text-[0.65rem] tracking-[0.22em] text-sidebar-muted uppercase">
        Admin Studio
      </p>
    </div>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="mt-10 flex flex-1 flex-col gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={'end' in item ? item.end : false}
          onClick={onNavigate}
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
  )
}

function SidebarFooter({ onSignOut }: { onSignOut: () => void }) {
  return (
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
        onClick={onSignOut}
        className="mt-4 text-left text-[0.78rem] text-sidebar-muted transition hover:text-white"
      >
        Sign out
      </button>
    </div>
  )
}

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const titleId = useId()

  async function handleSignOut() {
    setMobileOpen(false)
    try {
      await logoutRequest()
    } catch {
      // Best-effort: clear local session even if the API call fails.
    }
    signOut()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  return (
    <div className="flex min-h-dvh bg-admin-bg">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[220px] shrink-0 flex-col bg-sidebar px-4 py-6 text-white lg:flex">
        <BrandBlock />
        <NavLinks />
        <SidebarFooter onSignOut={handleSignOut} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-auto">
        {/* Mobile top bar with menu caret */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-admin-bg/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-admin-nav"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/70 bg-card text-admin-ink transition hover:bg-accent-pink hover:text-burgundy"
          >
            <IconMenu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </button>
          <div className="min-w-0">
            <p className="truncate font-display text-[1.05rem] font-semibold tracking-[0.04em] text-admin-ink">
              BABY PLEATES
            </p>
            <p className="text-[0.62rem] tracking-[0.18em] text-muted uppercase">Admin Studio</p>
          </div>
        </header>

        <Outlet />
      </div>

      {/* Mobile slide-out panel */}
      <div
        className={[
          'fixed inset-0 z-40 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        ].join(' ')}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={[
            'absolute inset-0 bg-admin-ink/40 transition-opacity duration-200',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          aria-label="Close menu"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={() => setMobileOpen(false)}
        />

        <aside
          id="mobile-admin-nav"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={[
            'absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col bg-sidebar px-4 py-5 text-white shadow-xl transition-transform duration-200 ease-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <div className="flex items-start justify-between gap-3">
            <BrandBlock id={titleId} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <IconClose className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <NavLinks onNavigate={() => setMobileOpen(false)} />
          <SidebarFooter onSignOut={handleSignOut} />
        </aside>
      </div>
    </div>
  )
}
