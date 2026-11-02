import { useQuery } from '@tanstack/react-query'
import { Boxes, Clock, FolderTree, RefreshCw, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router'
import { formatEGP } from '../../../lib/formatters.ts'
import { adminApi, type AdminOrder } from '../api/admin.api.ts'

export function AdminOverviewPage() {
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

  const isLoading = pLoading || cLoading || oLoading

  const products = productsData?.data || []
  const categories = categoriesData?.data || []
  const orders = ordersData?.orders || []

  const totalSales = orders
    .filter((o: AdminOrder) => o.status === 'completed' || o.status === 'confirmed')
    .reduce((sum: number, o: AdminOrder) => sum + (o.totalPrice || 0), 0)

  const pendingOrders = orders.filter((o: AdminOrder) => o.status === 'pending').length

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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">نظرة عامة على المتجر</h1>
          <p className="text-xs text-gray-500 mt-1">
            إحصائيات مباشرة لمنتجات وطلبات وأقسام سعودي براند
          </p>
        </div>
        <button
          onClick={() => {
            refetchProducts()
            refetchCategories()
            refetchOrders()
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon
          return (
            <Link
              key={idx}
              to={s.link}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">{s.title}</span>
                <div className={`p-2 rounded-xl ${s.color}`}>
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

      {/* Sales Summary Banner */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-white/80">المبيعات المؤكدة والمكتملة</span>
          <p className="text-2xl sm:text-3xl font-black mt-1">{formatEGP(totalSales)}</p>
          <p className="text-[11px] text-white/70 mt-1">يتم التحديث تلقائياً مع كل طلب مكتمل</p>
        </div>
        <Link
          to="/admin/orders"
          className="px-5 py-2.5 bg-white text-brand-primary text-xs font-bold rounded-xl shadow-xs hover:bg-white/90 text-center transition-colors"
        >
          عرض كافة الطلبات
        </Link>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">أحدث الطلبات</h2>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-brand-primary hover:underline"
          >
            عرض الكل
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">لا توجد طلبات مسجلة بعد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400">
                  <th className="pb-2 font-semibold text-start">رقم الطلب</th>
                  <th className="pb-2 font-semibold text-start">العميل</th>
                  <th className="pb-2 font-semibold text-start">عدد المنتجات</th>
                  <th className="pb-2 font-semibold text-start">الإجمالي</th>
                  <th className="pb-2 font-semibold text-start">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((o: AdminOrder) => (
                  <tr key={o._id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-mono font-bold text-gray-700">{o._id.slice(-6)}</td>
                    <td className="py-3 text-gray-900 font-medium">
                      {typeof o.userID === 'object' && o.userID?.name ? o.userID.name : 'عميل'}
                    </td>
                    <td className="py-3 text-gray-500">{o.items?.length || 0} قطع</td>
                    <td className="py-3 font-bold text-brand-primary">{formatEGP(o.totalPrice)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : o.status === 'confirmed'
                              ? 'bg-blue-50 text-blue-700'
                              : o.status === 'cancelled'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700'
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
