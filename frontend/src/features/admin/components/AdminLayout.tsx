import { useEffect, useState } from 'react'
import {
  BarChart3,
  Boxes,
  ChevronRight,
  FolderTree,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Store,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useAdminAuthStore } from '../../auth/admin-auth.store.ts'
import { useOrderNotification } from '../hooks/useOrderNotification.ts'
import { useSettingsStore } from '../../settings/settings.store.ts'

const navItems = [
  { to: '/admin', label: 'نظرة عامة', icon: BarChart3, end: true, permission: 'view_overview' },
  { to: '/admin/categories', label: 'الأقسام', icon: FolderTree, permission: 'manage_categories' },
  { to: '/admin/products', label: 'المنتجات', icon: Boxes, permission: 'manage_products' },
  { to: '/admin/orders', label: 'الطلبات', icon: ShoppingBag, permission: 'manage_orders' },
  { to: '/admin/settings', label: 'إعدادات المتجر', icon: Settings, permission: 'manage_settings' },
  { to: '/admin/admins', label: 'المشرفين', icon: Users, superAdminOnly: true },
]

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const admin = useAdminAuthStore((state) => state.admin)
  const logout = useAdminAuthStore((state) => state.logout)
  const isSuperAdmin = useAdminAuthStore((state) => state.isSuperAdmin)
  const hasPermission = useAdminAuthStore((state) => state.hasPermission)
  const navigate = useNavigate()

  // Real-time live new order listener with audio chime
  const { soundEnabled, toggleSound } = useOrderNotification()
  const fetchSettings = useSettingsStore((state) => state.fetchSettings)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const isSuper = isSuperAdmin()

  // Filter navigation items strictly based on role and granular permissions
  const visibleNavItems = navItems.filter((item) => {
    if (item.superAdminOnly) {
      return isSuper
    }
    if (!item.permission) {
      return true
    }
    return isSuper || hasPermission(item.permission)
  })

  return (
    <div
      className="h-screen overflow-hidden bg-gray-50 flex flex-col md:flex-row text-gray-800 font-sans"
      dir="rtl"
    >
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="فتح القائمة"
          >
            <Menu className="h-6 w-6" />
          </button>
          <img src="/newLogo2.png" alt="سعودي براند" className="h-8 w-auto" />
          <span className="text-xs font-bold bg-brand-soft-pink text-brand-primary px-2 py-0.5 rounded-full">
            لوحة الإدارة
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
            title={soundEnabled ? 'كتم رنة الأوردرات الجديدة' : 'تفعيل رنة الأوردرات الجديدة'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4 text-gray-400" />}
          </button>
          <Link to="/" className="text-xs font-semibold text-brand-primary flex items-center gap-1">
            <span>المتجر</span>
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </header>

      {/* Sidebar Drawer for Mobile / Static for Desktop */}
      <aside
        className={`fixed inset-y-0 start-0 z-40 w-64 bg-white border-e border-gray-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:shrink-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/newLogo2.png" alt="سعودي براند" className="h-10 w-auto" />
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-none">لوحة التحكم</h1>
              <span className="text-[11px] text-brand-primary font-medium">سعودي براند</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'text-gray-600 hover:bg-brand-soft-pink/50 hover:text-brand-primary'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar Footer: Admin profile & Logout */}
        <div className="p-3 border-t border-gray-100 space-y-2 shrink-0">
          <div className="px-3 py-2 bg-gray-50 rounded-xl">
            <p className="text-xs font-bold text-gray-900 truncate">
              {admin?.name || 'مدير النظام'}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              {isSuper ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  <span>👑 المدير العام (Super Admin)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-primary bg-brand-soft-pink px-2 py-0.5 rounded-full">
                  <span>مشرف محدد الصلاحيات</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 truncate mt-1 font-mono">{admin?.email}</p>
          </div>

          {/* Sound Alert Toggle */}
          <div className="mb-3 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-600">رنة الطلبات الجديدة</span>
            <button
              onClick={toggleSound}
              type="button"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                soundEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
              }`}
              title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-600 hover:text-brand-primary rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Store className="h-3.5 w-3.5" />
              <span>المتجر</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-2xs"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
