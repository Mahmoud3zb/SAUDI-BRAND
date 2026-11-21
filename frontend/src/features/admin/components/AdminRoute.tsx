import { Navigate, Outlet } from 'react-router'
import { useAdminAuthStore } from '../../auth/admin-auth.store.ts'

export function AdminRoute() {
  const checkAuth = useAdminAuthStore((state) => state.checkAuth)
  const isAuth = checkAuth()

  if (!isAuth) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
