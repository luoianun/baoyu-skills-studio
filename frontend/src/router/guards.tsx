import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export function RequireAuth() {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export function RequireAdmin() {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/studio/cover-image" replace />
  return <Outlet />
}
