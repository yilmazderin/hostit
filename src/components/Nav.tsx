import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `text-sm lowercase transition-colors border-b pb-0.5 ${
    isActive ? 'border-current' : 'border-transparent hover:border-current/50'
  }`

export function Nav({ dark = true }: { dark?: boolean }) {
  const { user, logout, resetDemo } = useApp()
  const nav = useNavigate()
  const tone = dark ? 'bg-ink text-paper' : 'bg-paper text-ink'

  const links =
    user?.role === 'customer'
      ? [
          { to: '/home', label: 'home' },
          { to: '/explore', label: 'vendor network' },
          { to: '/plan', label: 'plan' },
          { to: '/events', label: 'my events' },
        ]
      : user?.role === 'vendor'
        ? [
            { to: '/vendor', label: 'dashboard' },
            { to: '/vendor/profile', label: 'my profile' },
            { to: '/vendor/availability', label: 'availability' },
          ]
        : [
            { to: '/', label: 'home' },
            { to: '/login', label: 'sign in' },
          ]

  return (
    <header className={`${tone} relative z-20`}>
      <div className="container-x flex h-20 items-center justify-between">
        <Link to={user ? (user.role === 'vendor' ? '/vendor' : '/home') : '/'} className="text-xl font-bold uppercase tracking-tight">
          host it
        </Link>
        <nav className="flex items-center gap-6 md:gap-8">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkCls} end={l.to === '/vendor'}>
              {l.label}
            </NavLink>
          ))}
          {user && (
            <div className="flex items-center gap-4 border-l border-current/20 pl-6">
              <span className="hidden text-xs opacity-70 md:inline">{user.name.split(' ')[0].toLowerCase()}</span>
              <button
                onClick={() => {
                  if (confirm('reset all demo data to the seeded state?')) resetDemo()
                }}
                className="text-xs opacity-60 hover:opacity-100"
                title="reset demo data"
              >
                reset
              </button>
              <button
                onClick={() => {
                  logout()
                  nav('/')
                }}
                className="text-xs opacity-60 hover:opacity-100"
              >
                sign out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-mist">
      <div className="container-x flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
        <div>
          <div className="text-lg font-bold uppercase tracking-tight">host it</div>
          <p className="mt-1 text-xs text-stone">a curated network of vendors and experiences for modern events in windsor-essex.</p>
        </div>
        <p className="text-xs text-stone">proof of concept · mock data · @host.itevents</p>
      </div>
    </footer>
  )
}
