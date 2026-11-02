import { Navigate, Outlet } from 'react-router'
import { useAdminAuthStore } from '../../auth/admin-auth.store.ts'

export function AdminRoute() {
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated)
  const admin = useAdminAuthStore((state) => state.admin)

  if (!isAuthenticated || admin?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
