import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '../types'
import { useApp } from '../store/AppContext'

export function RequireRole({ role }: { role: Role }) {
  const { user } = useApp()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />
  if (user.role !== role) return <Navigate to={user.role === 'vendor' ? '/vendor' : '/home'} replace />
  return <Outlet />
}
