import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role, User } from '../types'
import { useApp } from '../store/AppContext'

// Where each kind of account lands after signing in.
export const dashboardPath = (user: Pick<User, 'role'>) =>
  user.role === 'vendor' ? '/vendor' : user.role === 'admin' ? '/admin' : '/dashboard'

// No role: any signed-in account. Signed-out visitors go to log in and come back after.
export function RequireRole({ role }: { role?: Role }) {
  const { user } = useApp()
  const loc = useLocation()
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  if (role && user.role !== role) return <Navigate to={dashboardPath(user)} replace />
  return <Outlet />
}
