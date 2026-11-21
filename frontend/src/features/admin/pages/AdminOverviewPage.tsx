import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Award,
  Boxes,
  Clock,
  FolderTree,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react'
import { Link, Navigate } from 'react-router'
import { formatEGP } from '../../../lib/formatters.ts'
import { adminApi, type AdminOrder, type AdminProduct } from '../api/admin.api.ts'
import { useAdminAuthStore } from '../../auth/admin-auth.store.ts'

function formatOrderCount(count: number): string {
  if (count === 1) return 'طلب واحد'
  if (count === 2) return 'طلبان'
  if (count >= 3 && count <= 10) return `${count} طلبات`
  return `${count} طلب`
}

function formatPieceCount(quantity: number): string {
  if (quantity === 1) return 'قطعة واحدة'
  if (quantity === 2) return 'قطعتان'
  if (quantity >= 3 && quantity <= 10) return `${quantity} قطع`
  return `${quantity} قطعة`
}

export function AdminOverviewPage() {
  const isSuperAdmin = useAdminAuthStore((state) => state.isSuperAdmin)
  const hasPermission = useAdminAuthStore((state) => state.hasPermission)

  const {
    data: productsData,
    isLoading: pLoading,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: adminApi.getProducts,
  })

  const {
    data: categoriesData,
    isLoading: cLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminApi.getCategories,
  })

  const {
    data: ordersData,
    isLoading: oLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: adminApi.getOrders,
  })

  // If sub-admin does not have view_overview permission, redirect to their assigned section
  if (!isSuperAdmin() && !hasPermission('view_overview')) {
    if (hasPermission('manage_orders')) {
      return <Navigate to="/admin/orders" replace />
    }
    if (hasPermission('manage_products')) {
      return <Navigate to="/admin/products" replace />
    }
    if (hasPermission('manage_categories')) {
      return <Navigate to="/admin/categories" replace />
    }
  }

  const isLoading = pLoading || cLoading || oLoading

  const products = productsData?.data || []
  const categories = categoriesData?.data || []
  const orders = ordersData?.data || []

  // Sales and orders stats
  const completedOrConfirmed = orders.filter(
    (o: AdminOrder) => o.status === 'completed' || o.status === 'confirmed'
  )
  const totalSales = completedOrConfirmed.reduce(
    (sum: number, o: AdminOrder) => sum + (o.totalPrice || 0),
    0
  )
  const averageOrderValue =
    completedOrConfirmed.length > 0 ? Math.round(totalSales / completedOrConfirmed.length) : 0

  const pendingOrders = orders.filter((o: AdminOrder) => o.status === 'pending').length

  // Low stock products alert (<= 5 pieces)
  const lowStockProducts = products.filter(
    (p: AdminProduct) => p.stockQuantity !== undefined && p.stockQuantity <= 5
  )

  // Top 5 Best Selling Products calculation
  const salesMap = new Map<string, { name: string; quantity: number; revenue: number }>()
  for (const o of completedOrConfirmed) {
    for (const it of o.items || []) {
      const p = typeof it.productID === 'object' && it.productID !== null ? it.productID : null
      const pId = p?._id || String(it.productID)
      const pName = p?.name || 'منتج'
      const existing = salesMap.get(pId) || { name: pName, quantity: 0, revenue: 0 }
      existing.quantity += it.quantity
      existing.revenue += it.price * it.quantity
      salesMap.set(pId, existing)
    }
  }
  const bestSellers = Array.from(salesMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // Regional Breakdown
  const regionMap = new Map<string, number>()
  for (const o of orders) {
    const city = (o.shippingAddress?.city || 'القاهرة').trim()
    regionMap.set(city, (regionMap.get(city) || 0) + 1)
  }
  const topRegions = Array.from(regionMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const stats = [
    {
      title: 'إجمالي المنتجات',
      value: products.length,
      icon: Boxes,
      color: 'bg-blue-50 text-blue-600',
      link: '/admin/products',
    },
    {
      title: 'الأقسام المتاحة',
      value: categories.length,
      icon: FolderTree,
      color: 'bg-emerald-50 text-emerald-600',
      link: '/admin/categories',
    },
    {
      title: 'إجمالي الطلبات',
      value: orders.length,
      icon: ShoppingBag,
      color: 'bg-amber-50 text-amber-600',
      link: '/admin/orders',
    },
    {
      title: 'طلبات قيد الانتظار',
      value: pendingOrders,
      icon: Clock,
      color: 'bg-rose-50 text-rose-600',
      link: '/admin/orders',
    },
  ]

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">نظرة عامة على المتجر</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            إحصائيات مباشرة وشاملة للمبيعات والمخزون والطلبات في مصر
          </p>
        </div>
        <button
          onClick={() => {
            refetchProducts()
            refetchCategories()
            refetchOrders()
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* Critical Stock Alert Widget (If any item has <= 5 pieces) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-5 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  تنبيه المخزون الحرج ({lowStockProducts.length} منتجات أوشكت على النفاد)
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  المنتجات التالية متبقي منها 5 قطع أو أقل، يرجى تجهيز شحنة جديدة لتفادي توقف الطلب
                  عليها.
                </p>
              </div>
            </div>
            <Link
              to="/admin/products"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0"
            >
              إدارة المخزون
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-200/60">
            {lowStockProducts.slice(0, 8).map((p: AdminProduct) => (
              <span
                key={p._id}
                className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-800 border border-amber-200 shadow-2xs"
              >
                <span>{p.name}</span>
                <span className="text-red-600 font-mono">
                  ({p.stockQuantity !== undefined ? p.stockQuantity : 0} قطع)
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon
          return (
            <Link
              key={idx}
              to={s.link}
              className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">{s.title}</span>
                <div className={`p-2.5 rounded-2xl ${s.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-gray-900">{s.value}</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Sales & AOV Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-white/80">
              إجمالي المبيعات المؤكدة والمكتملة
            </span>
            <p className="text-2xl sm:text-3xl font-black mt-1 font-sans">
              {formatEGP(totalSales)}
            </p>
            <p className="text-[11px] text-white/70 mt-1">
              عدد الطلبات المحصلة:{' '}
              <strong className="text-white font-bold">
                {formatOrderCount(completedOrConfirmed.length)}
              </strong>
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="px-5 py-2.5 bg-white text-brand-primary text-xs font-bold rounded-2xl shadow-xs hover:bg-white/90 text-center transition-colors shrink-0"
          >
            عرض كافة الطلبات
          </Link>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">متوسط قيمة الأوردر (AOV)</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2">
            <p className="text-2xl font-black text-gray-900 font-sans">
              {formatEGP(averageOrderValue)}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">معدل ما ينفقه العميل في كل سلة شراء</p>
          </div>
        </div>
      </div>

      {/* Analytics: Best Sellers & Regional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Best Sellers (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <h2 className="text-sm font-bold text-gray-900">المنتجات الأكثر مبيعاً</h2>
            </div>
            <span className="text-xs text-gray-400">حسب عدد القطع المطلوبة</span>
          </div>

          {bestSellers.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              لا توجد مبيعات مكتملة كافية بعد لحساب الترتيب.
            </div>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/70 border border-gray-100/80"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black font-mono ${
                        idx === 0
                          ? 'bg-amber-400 text-white shadow-xs'
                          : idx === 1
                            ? 'bg-gray-300 text-gray-800'
                            : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        تم بيع: <strong className="text-gray-700 font-bold">{formatPieceCount(item.quantity)}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-brand-primary font-sans">
                    {formatEGP(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Regional Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-900">أكثر المحافظات طلباً</h2>
            </div>
            <span className="text-xs text-gray-400">توزيع الطلبات</span>
          </div>

          {topRegions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">لا توجد طلبات مسجلة بعد.</div>
          ) : (
            <div className="space-y-3.5">
              {topRegions.map(([cityName, count], idx) => {
                const percent = Math.round((count / (orders.length || 1)) * 100)
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800">{cityName}</span>
                      <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                        <span>{formatOrderCount(count)}</span>
                        <span dir="ltr" className="text-gray-400 font-mono text-[11px]">
                          ({percent}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-brand-primary" />
            <h2 className="text-sm font-bold text-gray-900">أحدث الطلبات الواردة</h2>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-brand-primary hover:underline"
          >
            عرض الكل ({orders.length})
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">لا توجد طلبات مسجلة بعد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[11px]">
                  <th className="pb-2.5 font-semibold text-start">رقم الطلب</th>
                  <th className="pb-2.5 font-semibold text-start">العميل</th>
                  <th className="pb-2.5 font-semibold text-start">المحافظة</th>
                  <th className="pb-2.5 font-semibold text-start">المنتجات</th>
                  <th className="pb-2.5 font-semibold text-start">الإجمالي</th>
                  <th className="pb-2.5 font-semibold text-start">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((o: AdminOrder) => (
                  <tr key={o._id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-mono font-bold text-gray-800">
                      #{o._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 text-gray-900 font-medium">
                      {o.customerName ||
                        (typeof o.userID === 'object' && o.userID?.name ? o.userID.name : 'عميل')}
                    </td>
                    <td className="py-3 text-gray-600">
                      {o.shippingAddress?.city || 'القاهرة'}
                    </td>
                    <td className="py-3 text-gray-500">{o.items?.length || 0} قطع</td>
                    <td className="py-3 font-bold text-brand-primary font-sans">
                      {formatEGP(o.totalPrice)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.status === 'confirmed'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : o.status === 'cancelled'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {o.status === 'completed'
                          ? 'مكتمل'
                          : o.status === 'confirmed'
                            ? 'مؤكد'
                            : o.status === 'cancelled'
                              ? 'ملغي'
                              : 'قيد الانتظار'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
