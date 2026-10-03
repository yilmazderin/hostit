import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../lib/theme'
import { useApp } from '../store/AppContext'
import { dashboardPath } from './RequireRole'

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `shrink-0 text-sm lowercase transition-colors border-b pb-0.5 ${
    isActive ? 'border-current' : 'border-transparent hover:border-current/50'
  }`

export function Nav({ dark = true }: { dark?: boolean }) {
  const { user } = useApp()
  const { theme, toggle } = useTheme()
  const tone = dark ? 'keep-dark bg-ink text-paper' : 'bg-paper text-ink'

  // signed out, the nav explains host it before it asks for anything; signed in, it's the account's own pages
  const links = !user
    ? [
        { to: '/', label: 'home' },
        { to: '/about', label: 'about' },
        { to: '/network', label: 'network' },
        { to: '/services', label: 'services' },
      ]
    : user.role === 'customer'
      ? [
          { to: '/dashboard', label: 'dashboard' },
          { to: '/network', label: 'network' },
          { to: '/events', label: 'your events' },
        ]
      : user.role === 'vendor'
        ? [
            { to: '/vendor', label: 'dashboard' },
            { to: '/vendor/profile', label: 'profile' },
            { to: '/vendor/availability', label: 'availability' },
          ]
        : [
            { to: '/admin', label: 'applications' },
            { to: '/network', label: 'network' },
          ]

  return (
    <header className={`${tone} relative z-20`}>
      {/* phones: logo + account on one row, page links on the next; md and up: one row */}
      <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4 md:h-20 md:flex-nowrap md:py-0">
        <Link to={user ? dashboardPath(user) : '/'} className="text-xl font-bold uppercase tracking-tight">
          host it
        </Link>
        <nav className="order-last flex w-full items-center gap-5 overflow-x-auto md:order-none md:ml-auto md:w-auto md:gap-8 md:overflow-visible">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkCls} end={l.to === '/' || l.to === '/vendor'}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-4 md:gap-5">
          <button
            onClick={toggle}
            className="rounded-full p-1.5 opacity-70 transition-opacity hover:opacity-100"
            aria-label={theme === 'dark' ? 'switch to light mode' : 'switch to dark mode'}
            title={theme === 'dark' ? 'light mode' : 'dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="8" cy="8" r="3" />
                <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" />
              </svg>
            )}
          </button>
          {user ? (
            <AccountMenu />
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm lowercase opacity-80 hover:opacity-100">log in</Link>
              <Link to="/signup" className="rounded-full border border-current/40 px-4 py-1.5 text-sm lowercase transition-colors hover:border-current">
                sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// The signed-in account's name: settings and log out live behind it.
function AccountMenu() {
  const { user, logout, notifications } = useApp()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])
  if (!user) return null
  const unread = notifications.some((n) => !n.read)
  const first = user.name.split(/[\s—]/)[0].toLowerCase()
  const item = 'block w-full rounded-xl px-3 py-2 text-left text-sm text-ink hover:bg-mist'
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} className="flex items-center gap-2 text-sm lowercase">
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-current/30 text-xs font-semibold uppercase">
          {first[0]}
          {unread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-honey" aria-label="unread notifications" />}
        </span>
        <span className="hidden opacity-80 sm:inline">{first}</span>
      </button>
      {open && (
        <div role="menu" className="follow-theme absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-mist bg-surface p-1.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)]">
          <div className="px-3 pb-2 pt-1.5">
            <div className="truncate text-sm font-semibold text-ink">{user.name}</div>
            <div className="truncate text-xs text-stone">{user.email}</div>
          </div>
          <Link role="menuitem" to={dashboardPath(user)} className={item} onClick={() => setOpen(false)}>dashboard</Link>
          <Link role="menuitem" to="/account" className={item} onClick={() => setOpen(false)}>account settings</Link>
          <button
            role="menuitem"
            className={item}
            onClick={() => {
              logout()
              nav('/')
            }}
          >
            log out
          </button>
        </div>
      )}
    </div>
  )
}

export function Footer() {
  const { resetDemo } = useApp()
  const col = 'space-y-2 text-sm'
  const a = 'text-stone transition-colors hover:text-ink'
  return (
    <footer className="mt-24 border-t border-mist">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="text-lg font-bold uppercase tracking-tight">host it</div>
          <p className="mt-2 max-w-xs text-xs text-stone">a curated network of vendors and experiences for modern events in windsor-essex.</p>
        </div>
        <div className={col}>
          <div className="label-caps text-ink">explore</div>
          <Link to="/network" className={`block ${a}`}>the network</Link>
          <Link to="/plan" className={`block ${a}`}>plan an event</Link>
          <Link to="/services" className={`block ${a}`}>services</Link>
        </div>
        <div className={col}>
          <div className="label-caps text-ink">host it</div>
          <Link to="/about" className={`block ${a}`}>about</Link>
          <Link to="/contact" className={`block ${a}`}>contact</Link>
          <Link to="/join" className={`block ${a}`}>join the network</Link>
        </div>
        <div className={col}>
          <div className="label-caps text-ink">legal</div>
          <Link to="/terms" className={`block ${a}`}>terms of use</Link>
          <Link to="/privacy" className={`block ${a}`}>privacy policy</Link>
        </div>
      </div>
      <div className="container-x flex flex-wrap items-center justify-between gap-3 border-t border-mist py-6 text-xs text-stone">
        <span>proof of concept · mock data · @host.itevents</span>
        <button
          className="hover:text-ink"
          onClick={() => {
            if (confirm('reset all demo data to the seeded state?')) resetDemo()
          }}
        >
          reset demo data
        </button>
      </div>
    </footer>
  )
}
