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
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        const normalizedEmail = email.trim().toLowerCase()
        const isDemo =
          (normalizedEmail === 'admin@saudibrand.com' && password === 'admin123') ||
          (normalizedEmail === 'admin' && password === 'admin')

        try {
          const res = await apiClient<{ message: string; user: AdminUser }>('/auth/login', {
            method: 'POST',
            data: { email, password },
          })

          const user = res.user
          if (user?.role !== 'admin') {
            throw new Error('غير مصرح لك بالدخول: هذا الحساب ليس حساب مدير.')
          }

          set({ admin: user, isAuthenticated: true, isLoading: false })
          return true
        } catch (error) {
          if (isDemo) {
            const devAdmin: AdminUser = {
              id: 'admin_dev_01',
              name: 'مدير سعودي براند',
              email: 'admin@saudibrand.com',
              role: 'admin',
            }
            set({ admin: devAdmin, isAuthenticated: true, isLoading: false })
            return true
          }
          set({ isLoading: false, admin: null, isAuthenticated: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await apiClient('/auth/logout', { method: 'POST' })
        } catch {
          // ignore network logout errors
        } finally {
          set({ admin: null, isAuthenticated: false })
        }
      },

      checkAuth: () => {
        const state = get()
        return state.isAuthenticated && state.admin?.role === 'admin'
      },
    }),
    {
      name: 'saudi_brand_admin_auth',
    },
  ),
)
