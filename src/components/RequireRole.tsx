import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role, User } from '../types'
import { useApp } from '../store/AppContext'

// Where an account lands: host it staff at the review queue; everyone else back to the dashboard they used last.
// Accounts that never recorded one start where they signed up: vendors in the portal, planners at planning.
export const dashboardPath = (user: Pick<User, 'role' | 'vendorId' | 'lastDashboard'>) => {
  if (user.role === 'admin') return '/admin'
  const where = user.lastDashboard ?? (user.role === 'vendor' ? 'vendor' : 'planning')
  return where === 'vendor' && user.vendorId ? '/vendor' : '/dashboard'
}

// No role: any signed-in account. Signed-out visitors go to log in and come back after.
export function RequireRole({ role }: { role?: Role }) {
  const { user } = useApp()
  const loc = useLocation()
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  if (role && user.role !== role) return <Navigate to={dashboardPath(user)} replace />
  return <Outlet />
}

// The vendor portal: any account that has started a vendor application. Others are invited to apply.
export function RequireVendor() {
  const { user } = useApp()
  const loc = useLocation()
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  if (!user.vendorId) return <Navigate to="/join" replace />
  return <Outlet />
}
