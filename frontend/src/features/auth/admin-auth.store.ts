import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '../../lib/api-client.ts'

export interface AdminUser {
  id?: string
  _id?: string
  name: string
  email: string
  role?: string
  permissions?: string[]
}

interface AdminAuthState {
  admin: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => boolean
  isSuperAdmin: () => boolean
  hasPermission: (permission: string) => boolean
}

function isTokenExpired(token: string | null): boolean {
  if (!token) return true
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1]))
    if (typeof payload.exp === 'number') {
      return payload.exp * 1000 <= Date.now()
    }
  } catch {
    return true
  }
  return false
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })

        try {
          const res = await apiClient<{ message: string; token: string; user: AdminUser }>(
            '/auth/login',
            {
              method: 'POST',
              data: { email, password },
            },
          )

          const user = res.user
          const token = res.token

          const isAdminRole = user?.role === 'admin' || user?.role === 'super_admin'
          if (!isAdminRole) {
            throw new Error('غير مصرح لك بالدخول: هذا الحساب ليس حساب مدير.')
          }

          if (!token) {
            throw new Error('فشل الحصول على رمز التوثيق من الخادم.')
          }

          set({ admin: user, token, isAuthenticated: true, isLoading: false })
          return true
        } catch (error) {
          set({ isLoading: false, admin: null, token: null, isAuthenticated: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await apiClient('/auth/logout', { method: 'POST' })
        } catch {
          // ignore network logout errors
        } finally {
          set({ admin: null, token: null, isAuthenticated: false })
        }
      },

      checkAuth: () => {
        const state = get()
        const role = state.admin?.role
        const isAdminRole = role === 'admin' || role === 'super_admin'
        if (!state.isAuthenticated || !state.token || !isAdminRole) {
          return false
        }
        if (isTokenExpired(state.token)) {
          set({ admin: null, token: null, isAuthenticated: false })
          return false
        }
        return true
      },

      isSuperAdmin: () => {
        const state = get()
        return (
          state.admin?.role === 'super_admin' ||
          state.admin?.email === 'admin@saudibrand.com'
        )
      },

      hasPermission: (permission: string) => {
        const state = get()
        if (!state.admin) return false
        if (
          state.admin.role === 'super_admin' ||
          state.admin.email === 'admin@saudibrand.com'
        ) {
          return true
        }
        return state.admin.permissions?.includes(permission) || false
      },
    }),
    {
      name: 'saudi_brand_admin_auth',
    },
  ),
)
