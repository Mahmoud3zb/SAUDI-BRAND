import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Award,
  Boxes,
  CheckCircle2,
  Clock,
  Eye,
  FolderTree,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Settings,
  ShoppingBag,
  TrendingUp,
  Wallet,
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

function getPaymentMethodInfo(method?: string) {
  switch (method) {
    case 'cod':
      return { label: 'دفع عند الاستلام', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'vodafone_cash':
      return { label: 'فودافون كاش', color: 'bg-rose-50 text-rose-700 border-rose-200' }
    case 'instapay':
      return { label: 'إنستاباي', color: 'bg-purple-50 text-purple-700 border-purple-200' }
    case 'card':
      return { label: 'بطاقة بنكية', color: 'bg-blue-50 text-blue-700 border-blue-200' }
    default:
      return { label: method || 'عند الاستلام', color: 'bg-gray-50 text-gray-700 border-gray-200' }
  }
}

// Tooltip for Daily Sales & Orders Chart
function CustomSalesTrendTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: { dateLabel: string; revenue: number; ordersCount: number } }>
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div
        className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-gray-100 shadow-xl text-right text-xs space-y-1.5"
        dir="rtl"
      >
        <p className="font-bold text-gray-900 border-b border-gray-100 pb-1">{data.dateLabel}</p>
        <p className="text-brand-primary font-black">المبيعات: {formatEGP(data.revenue)}</p>
        <p className="text-gray-500 font-medium">عدد الطلبات: {formatOrderCount(data.ordersCount)}</p>
      </div>
    )
  }
  return null
}

// Custom tooltip for Overview sparkline chart
function CustomOverviewTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: { monthName: string; netProfit: number; grossRevenue: number } }>
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div
        className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-gray-100 shadow-lg text-right text-xs"
        dir="rtl"
      >
        <p className="font-bold text-gray-900 mb-1">{data.monthName}</p>
        <p className="text-emerald-600 font-bold">صافي المكسب: {formatEGP(data.netProfit)}</p>
        <p className="text-gray-500 text-[10px]">المبيعات: {formatEGP(data.grossRevenue)}</p>
      </div>
    )
  }
  return null
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

  const [financePeriod, setFinancePeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily')
  const { data: financeData, refetch: refetchFinance } = useQuery({
    queryKey: ['admin', 'finance', 'summary', financePeriod],
    queryFn: () => adminApi.getFinanceSummary(financePeriod),
  })

  const [trendRange, setTrendRange] = useState<'7' | '30'>('7')

  const isLoading = pLoading || cLoading || oLoading

  const products = productsData?.data || []
  const categories = categoriesData?.data || []
  const orders = ordersData?.data || []

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

  // Order status distribution
  const totalOrdersCount = orders.length || 1
  const completedCount = orders.filter((o: AdminOrder) => o.status === 'completed').length
  const confirmedCount = orders.filter((o: AdminOrder) => o.status === 'confirmed').length
  const pendingCount = orders.filter((o: AdminOrder) => o.status === 'pending').length
  const cancelledCount = orders.filter((o: AdminOrder) => o.status === 'cancelled').length
  const fulfillmentRate = Math.round(((completedCount + confirmedCount) / totalOrdersCount) * 100)

  const orderStats = {
    total: orders.length,
    completed: completedCount,
    confirmed: confirmedCount,
    pending: pendingCount,
    cancelled: cancelledCount,
    fulfillmentRate,
    chartData: [
      { name: 'مكتمل', value: completedCount, color: '#10b981' },
      { name: 'مؤكد', value: confirmedCount, color: '#3b82f6' },
      { name: 'قيد الانتظار', value: pendingCount, color: '#f59e0b' },
      { name: 'ملغي', value: cancelledCount, color: '#ef4444' },
    ].filter((it) => it.value > 0),
  }

  // Daily Sales & Orders Velocity Chart Data (Last 7 or 30 days)
  const trendDays = trendRange === '7' ? 7 : 30
  const trendChartData: Array<{ dateKey: string; dateLabel: string; revenue: number; ordersCount: number }> = []
  const now = new Date()

  for (let i = trendDays - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(now.getDate() - i)
    const dateKey = d.toISOString().split('T')[0]
    const dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' })
    const dayMonth = `${d.getDate()}/${d.getMonth() + 1}`
    const dateLabel = `${dayName} ${dayMonth}`

    trendChartData.push({
      dateKey,
      dateLabel,
      revenue: 0,
      ordersCount: 0,
    })
  }

  for (const o of completedOrConfirmed) {
    if (!o.createdAt) continue
    const oDate = o.createdAt.split('T')[0]
    const bucket = trendChartData.find((item) => item.dateKey === oDate)
    if (bucket) {
      bucket.revenue += o.totalPrice || 0
      bucket.ordersCount += 1
    }
  }

  // Top 5 Best Selling Products calculation with product images and stock
  const salesMap = new Map<string, { id: string; name: string; quantity: number; revenue: number }>()
  for (const o of completedOrConfirmed) {
    for (const it of o.items || []) {
      const p = typeof it.productID === 'object' && it.productID !== null ? it.productID : null
      const pId = p?._id || String(it.productID)
      const pName = p?.name || 'منتج'
      const existing = salesMap.get(pId) || { id: pId, name: pName, quantity: 0, revenue: 0 }
      existing.quantity += it.quantity
      existing.revenue += it.price * it.quantity
      salesMap.set(pId, existing)
    }
  }
  const bestSellers = Array.from(salesMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((item) => {
      const prod = products.find((p: AdminProduct) => p._id === item.id)
      return {
        ...item,
        imageUrl: prod?.imageUrl || '',
        stockQuantity: prod?.stockQuantity,
      }
    })

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
            إحصائيات مباشرة وشاملة للمبيعات والمخزون وحركة الطلبات في مصر
          </p>
        </div>
        <button
          onClick={() => {
            refetchProducts()
            refetchCategories()
            refetchOrders()
            refetchFinance()
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Link
          to="/admin/products"
          className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-gray-100 hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all text-xs font-bold text-gray-800 shadow-2xs group"
        >
          <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary group-hover:scale-105 transition-transform">
            <Plus className="h-4 w-4" />
          </div>
          <span>إضافة منتج جديد</span>
        </Link>

        <Link
          to="/admin/finance"
          className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-gray-100 hover:border-emerald-500/40 hover:bg-emerald-50/50 transition-all text-xs font-bold text-gray-800 shadow-2xs group"
        >
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
            <Wallet className="h-4 w-4" />
          </div>
          <span>كشف حساب الأرباح</span>
        </Link>

        <Link
          to="/admin/orders"
          className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-100 hover:border-amber-500/40 hover:bg-amber-50/50 transition-all text-xs font-bold text-gray-800 shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
            <span>الطلبات المعلقة</span>
          </div>
          {pendingOrders > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {pendingOrders}
            </span>
          )}
        </Link>

        <Link
          to="/admin/settings"
          className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-gray-100 hover:border-purple-500/40 hover:bg-purple-50/50 transition-all text-xs font-bold text-gray-800 shadow-2xs group"
        >
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
            <Settings className="h-4 w-4" />
          </div>
          <span>إعدادات المتجر</span>
        </Link>
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

      {/* Sales Velocity & Daily Orders Trend Chart */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">وتيرة المبيعات والطلبات اليومية</h2>
              <p className="text-[11px] text-gray-400">
                منحنى المبيعات الفعلية وعدد الطلبات المحققة في المتجر
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTrendRange('7')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                trendRange === '7'
                  ? 'bg-white text-brand-primary shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              آخر 7 أيام
            </button>
            <button
              onClick={() => setTrendRange('30')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                trendRange === '30'
                  ? 'bg-white text-brand-primary shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              آخر 30 يوماً
            </button>
          </div>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendChartData}>
              <defs>
                <linearGradient id="salesVelocityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9a7b4f" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#9a7b4f" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v / 1000}k`}
                orientation="right"
              />
              <RechartsTooltip content={<CustomSalesTrendTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="المبيعات"
                stroke="#9a7b4f"
                strokeWidth={2.5}
                fill="url(#salesVelocityGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Net Profit & Financial Performance Teaser */}
      {financeData && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  صافي المكسب الحقيقي وتفكيك الأرباح
                </h2>
                <p className="text-[11px] text-gray-400">
                  {financeData.label} (المبيعات - التكاليف - المصاريف - الهالك)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setFinancePeriod('daily')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    financePeriod === 'daily'
                      ? 'bg-white text-brand-primary shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  اليوم
                </button>
                <button
                  onClick={() => setFinancePeriod('monthly')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    financePeriod === 'monthly'
                      ? 'bg-white text-brand-primary shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  هذا الشهر
                </button>
                <button
                  onClick={() => setFinancePeriod('yearly')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    financePeriod === 'yearly'
                      ? 'bg-white text-brand-primary shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  هذا العام
                </button>
              </div>

              <Link
                to="/admin/finance"
                className="px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shrink-0"
              >
                <span>كشف الحساب الكامل</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Net Profit */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800 block">صافي المكسب</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-1 font-sans">
                {formatEGP(financeData.current.netProfit)}
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">
                هامش الربح: {financeData.current.profitMargin}%
              </span>
            </div>

            {/* 2. Gross Revenue */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 block">المبيعات الإجمالية</span>
              <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1 font-sans">
                {formatEGP(financeData.current.grossRevenue)}
              </p>
              <span className="text-[10px] text-gray-400 font-medium">
                {financeData.current.ordersCount} طلب مكتمل
              </span>
            </div>

            {/* 3. Operational Expenses */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
              <span className="text-[11px] font-bold text-purple-800 block">المصاريف التشغيلية</span>
              <p className="text-xl sm:text-2xl font-black text-purple-900 mt-1 font-sans">
                {formatEGP(financeData.current.totalExpenses)}
              </p>
              <span className="text-[10px] text-purple-700 font-medium">إعلانات ورواتب وتغليف</span>
            </div>

            {/* 4. Waste & Losses */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
              <span className="text-[11px] font-bold text-rose-800 block">الهالك والتوالف</span>
              <p className="text-xl sm:text-2xl font-black text-rose-900 mt-1 font-sans">
                {formatEGP(financeData.current.totalWaste)}
              </p>
              <span className="text-[10px] text-rose-700 font-medium">
                {financeData.current.totalWasteQuantity} قطع تالفة
              </span>
            </div>
          </div>

          {/* Sparkline chart when yearly is selected */}
          {financePeriod === 'yearly' && financeData.monthlyChart && financeData.monthlyChart.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700">تطور صافي الأرباح على مدار الـ 12 شهراً</span>
                <span className="text-[10px] text-gray-400">مخطط تفاعلي</span>
              </div>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financeData.monthlyChart}>
                    <defs>
                      <linearGradient id="overviewProfitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="monthName"
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip content={<CustomOverviewTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="netProfit"
                      name="صافي المكسب"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#overviewProfitGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Order Status Distribution & Fulfillment Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order Status Donut Chart & Cards (12 cols) */}
        <div className="lg:col-span-12 bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">حالات الطلبات ونسبة نجاح التوصيل</h2>
                <p className="text-[11px] text-gray-400">
                  معدل استيفاء وتسليم الأوردرات لعملاء المتجر في مصر
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">معدل التسليم والنجاح:</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full font-mono">
                {orderStats.fulfillmentRate}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Donut Chart (4 cols) */}
            <div className="md:col-span-4 h-44 w-full flex items-center justify-center">
              {orderStats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStats.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {orderStats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-gray-400">لا توجد طلبات بعد</span>
              )}
            </div>

            {/* Status breakdown grid (8 cols) */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                <span className="text-[11px] font-bold text-emerald-800 block">مكتمل</span>
                <span className="text-xl font-black text-emerald-900 block mt-1">
                  {orderStats.completed}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">
                  {Math.round((orderStats.completed / (orderStats.total || 1)) * 100)}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                <span className="text-[11px] font-bold text-blue-800 block">مؤكد</span>
                <span className="text-xl font-black text-blue-900 block mt-1">
                  {orderStats.confirmed}
                </span>
                <span className="text-[10px] text-blue-600 font-medium">
                  {Math.round((orderStats.confirmed / (orderStats.total || 1)) * 100)}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                <span className="text-[11px] font-bold text-amber-800 block">قيد الانتظار</span>
                <span className="text-xl font-black text-amber-900 block mt-1">
                  {orderStats.pending}
                </span>
                <span className="text-[10px] text-amber-600 font-medium">
                  {Math.round((orderStats.pending / (orderStats.total || 1)) * 100)}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
                <span className="text-[11px] font-bold text-rose-800 block">ملغي</span>
                <span className="text-xl font-black text-rose-900 block mt-1">
                  {orderStats.cancelled}
                </span>
                <span className="text-[10px] text-rose-600 font-medium">
                  {Math.round((orderStats.cancelled / (orderStats.total || 1)) * 100)}%
                </span>
              </div>
            </div>
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
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/70 border border-gray-100/80 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black font-mono shrink-0 ${
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

                    {/* Product Thumbnail Image */}
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-10 w-10 rounded-xl object-cover border border-gray-200 shrink-0 bg-white"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
                        <Package className="h-5 w-5" />
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-gray-400">
                          تم بيع: <strong className="text-gray-700 font-bold">{formatPieceCount(item.quantity)}</strong>
                        </span>
                        {item.stockQuantity !== undefined && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                              item.stockQuantity <= 5
                                ? 'bg-rose-50 text-rose-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            متبقي {item.stockQuantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-brand-primary font-sans shrink-0">
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
            className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
          >
            <span>عرض كافة الطلبات ({orders.length})</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
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
                  <th className="pb-2.5 font-semibold text-start">طريقة الدفع</th>
                  <th className="pb-2.5 font-semibold text-start">المنتجات</th>
                  <th className="pb-2.5 font-semibold text-start">الإجمالي</th>
                  <th className="pb-2.5 font-semibold text-start">الحالة</th>
                  <th className="pb-2.5 font-semibold text-start">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((o: AdminOrder) => {
                  const payInfo = getPaymentMethodInfo(o.paymentMethod)
                  return (
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
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${payInfo.color}`}
                        >
                          {payInfo.label}
                        </span>
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
                      <td className="py-3">
                        <Link
                          to="/admin/orders"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-brand-primary hover:text-white text-gray-700 text-[11px] font-bold transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span>عرض</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
