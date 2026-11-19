import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '../../lib/api-client.ts'

export interface AdminUser {
  id: string
  name: string
  email: string
  role?: string
}

interface AdminAuthState {
  admin: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => boolean
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

          if (user?.role !== 'admin') {
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
        return state.isAuthenticated && Boolean(state.token) && state.admin?.role === 'admin'
      },
    }),
    {
      name: 'saudi_brand_admin_auth',
    },
  ),
)
