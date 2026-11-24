import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertOctagon,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Download,
  LineChart,
  PackageX,
  PieChart,
  Plus,
  Receipt,
  RefreshCw,
  ShoppingBag,
  Table,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { adminApi, type ExpenseItem, type WasteItem } from '../api/admin.api.ts'
import { formatEGP } from '../../../lib/formatters.ts'
import { Button } from '../../../components/ui/Button.tsx'
import { Input } from '../../../components/ui/Input.tsx'

const EXPENSE_CATEGORIES: Record<string, { label: string; color: string }> = {
  ads: { label: 'إعلانات وتسويق', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  packaging: { label: 'كراتين وتغليف', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  salaries: { label: 'رواتب وبونص', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  shipping: { label: 'شحن إضافي / مرتجعات', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  rent: { label: 'إيجار ومخازن', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  utilities: { label: 'مرافق وفواتير', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  other: { label: 'مصاريف أخرى', color: 'bg-gray-100 text-gray-800 border-gray-200' },
}

const EXPENSE_COLORS: Record<string, string> = {
  ads: '#8b5cf6',
  packaging: '#f59e0b',
  salaries: '#3b82f6',
  shipping: '#06b6d4',
  rent: '#f43f5e',
  utilities: '#6366f1',
  other: '#9ca3af',
}

const WASTE_REASONS: Record<string, { label: string; color: string }> = {
  shipping_damage: { label: 'كسر أثناء الشحن', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  manufacturing_defect: { label: 'عيب تصنيع / بخاخ معطوب', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  tester_sample: { label: 'تيسترات وعينات تجارب', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  storage_loss: { label: 'تلف تخزين / تسريب', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  other: { label: 'أسباب أخرى', color: 'bg-gray-100 text-gray-800 border-gray-200' },
}

const WASTE_COLORS: Record<string, string> = {
  shipping_damage: '#ef4444',
  manufacturing_defect: '#f59e0b',
  tester_sample: '#3b82f6',
  storage_loss: '#f97316',
  other: '#9ca3af',
}

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
}

function CustomChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div
        className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-gray-100 shadow-xl text-xs font-sans text-right min-w-[170px]"
        dir="rtl"
      >
        <p className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">{label}</p>
        <div className="space-y-1.5">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}:</span>
              </span>
              <span className="font-bold font-sans" style={{ color: item.color }}>
                {formatEGP(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div
        className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-gray-100 shadow-xl text-xs font-sans text-right"
        dir="rtl"
      >
        <p className="font-bold text-gray-800">{data.name}</p>
        <p className="text-brand-primary font-bold mt-1 text-sm">{formatEGP(data.value)}</p>
      </div>
    )
  }
  return null
}

export function AdminFinancePage() {
  const queryClient = useQueryClient()

  // Period State: daily | monthly | yearly | custom
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly' | 'custom'>('daily')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  // Chart view mode: area | bar | table
  const [chartViewMode, setChartViewMode] = useState<'area' | 'bar' | 'table'>('area')

  // Active Bottom Tab: expenses | waste
  const [activeTab, setActiveTab] = useState<'expenses' | 'waste'>('expenses')

  // Modals State
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [wasteModalOpen, setWasteModalOpen] = useState(false)

  // Expense Form State
  const [expTitle, setExpTitle] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expCategory, setExpCategory] = useState('ads')
  const [expDate, setExpDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [expNotes, setExpNotes] = useState('')

  // Waste Form State
  const [wasteProductID, setWasteProductID] = useState('')
  const [wasteProductName, setWasteProductName] = useState('')
  const [wasteQuantity, setWasteQuantity] = useState('1')
  const [wasteCostPerUnit, setWasteCostPerUnit] = useState('')
  const [wasteReason, setWasteReason] = useState('shipping_damage')
  const [wasteDate, setWasteDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [wasteNotes, setWasteNotes] = useState('')
  const [wasteDeductStock, setWasteDeductStock] = useState(true)

  // Fetch Finance Summary
  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['admin', 'finance', 'summary', period, customFrom, customTo],
    queryFn: () => adminApi.getFinanceSummary(period, customFrom || undefined, customTo || undefined),
  })

  // Fetch Products for Waste Dropdown
  const { data: productsData } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: adminApi.getProducts,
  })
  const products = productsData?.data || []

  // Expense Mutations
  const createExpenseMutation = useMutation({
    mutationFn: adminApi.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance'] })
      toast.success('تم تسجيل المصروف بنجاح')
      handleCloseExpenseModal()
    },
    onError: (err: Error) => toast.error(err.message || 'فشل تسجيل المصروف'),
  })

  const deleteExpenseMutation = useMutation({
    mutationFn: adminApi.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance'] })
      toast.success('تم حذف المصروف بنجاح')
    },
    onError: (err: Error) => toast.error(err.message || 'فشل حذف المصروف'),
  })

  // Waste Mutations
  const createWasteMutation = useMutation({
    mutationFn: adminApi.createWaste,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success('تم تسجيل الهالك والتوالف بنجاح')
      handleCloseWasteModal()
    },
    onError: (err: Error) => toast.error(err.message || 'فشل تسجيل الهالك'),
  })

  const deleteWasteMutation = useMutation({
    mutationFn: adminApi.deleteWaste,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance'] })
      toast.success('تم حذف سجل الهالك بنجاح')
    },
    onError: (err: Error) => toast.error(err.message || 'فشل حذف سجل الهالك'),
  })

  const handleCloseExpenseModal = () => {
    setExpenseModalOpen(false)
    setExpTitle('')
    setExpAmount('')
    setExpCategory('ads')
    setExpNotes('')
  }

  const handleCloseWasteModal = () => {
    setWasteModalOpen(false)
    setWasteProductID('')
    setWasteProductName('')
    setWasteQuantity('1')
    setWasteCostPerUnit('')
    setWasteReason('shipping_damage')
    setWasteNotes('')
  }

  const handleProductSelectForWaste = (prodId: string) => {
    setWasteProductID(prodId)
    const found = products.find((p) => p._id === prodId)
    if (found) {
      setWasteProductName(found.name)
      if (found.costPrice) {
        setWasteCostPerUnit(String(found.costPrice))
      }
    }
  }

  const current = summary?.current || {
    grossRevenue: 0,
    shippingRevenue: 0,
    netProductRevenue: 0,
    totalCOGS: 0,
    grossProfit: 0,
    ordersCount: 0,
    totalItemsSold: 0,
    totalExpenses: 0,
    expensesByCategory: {},
    expensesList: [],
    totalWaste: 0,
    totalWasteQuantity: 0,
    wasteByReason: {},
    wasteList: [],
    netProfit: 0,
    profitMargin: 0,
  }

  const trends = summary?.trends || { revenueGrowth: 0, netProfitGrowth: 0 }

  const handleExportCSV = () => {
    if (!summary) return
    const rows = [
      ['التقرير المالي لمتجر سعودي براند', summary.label],
      ['تاريخ الاستخراج', new Date().toLocaleDateString('ar-EG')],
      [],
      ['البند', 'القيمة بالجنيه'],
      ['إجمالي المبيعات (Gross Revenue)', current.grossRevenue],
      ['إيرادات الشحن', current.shippingRevenue],
      ['تكلفة البضاعة المباعة (COGS)', current.totalCOGS],
      ['مجمل الربح (Gross Profit)', current.grossProfit],
      ['إجمالي المصاريف التشغيلية', current.totalExpenses],
      ['إجمالي الهالك والتوالف', current.totalWaste],
      ['صافي المكسب الحقيقي (Net Profit)', current.netProfit],
      ['نسبة هامش الربح', `${current.profitMargin}%`],
      ['عدد الطلبات المكتملة', current.ordersCount],
      ['عدد القطع المباعة', current.totalItemsSold],
    ]
    const csvContent = '\uFEFF' + rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `saudi_brand_finance_${period}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('تم تصدير التقرير المالي بنجاح')
  }

  // Chart data for Donut Charts
  const expenseChartData = Object.entries(current.expensesByCategory)
    .filter(([, amount]) => amount > 0)
    .map(([cat, amount]) => ({
      name: EXPENSE_CATEGORIES[cat]?.label || cat,
      value: amount,
      color: EXPENSE_COLORS[cat] || '#8b5cf6',
    }))

  const wasteChartData = Object.entries(current.wasteByReason)
    .filter(([, amount]) => amount > 0)
    .map(([reason, amount]) => ({
      name: WASTE_REASONS[reason]?.label || reason,
      value: amount,
      color: WASTE_COLORS[reason] || '#ef4444',
    }))

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-2xl">
              <Wallet className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              المالية والأرباح والمصاريف
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            كشف حساب تفكيكي للمبيعات، تكاليف البضاعة، المصاريف، الهالك، وصافي المكسب الحقيقي
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="h-4 w-4" />}
            className="text-xs font-bold"
          >
            تصدير كشف الحساب
          </Button>

          <button
            onClick={() => refetchSummary()}
            disabled={isSummaryLoading}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer shadow-2xs"
            title="تحديث البيانات المالية"
          >
            <RefreshCw className={`h-4 w-4 ${isSummaryLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Timeframe Tabs (يومي / شهري / سنوي / مخصص) */}
      <div className="bg-white p-3 rounded-3xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl w-fit">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === 'daily'
                ? 'bg-white text-brand-primary shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            يومي (اليوم)
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === 'monthly'
                ? 'bg-white text-brand-primary shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            شهري (الشهر الحالي)
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === 'yearly'
                ? 'bg-white text-brand-primary shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            سنوي (السنة الحالية)
          </button>
          <button
            onClick={() => setPeriod('custom')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === 'custom'
                ? 'bg-white text-brand-primary shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            مخصص (تاريخ محدد)
          </button>
        </div>

        {/* Date Filter details */}
        {period === 'custom' ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">من:</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 font-bold outline-none focus:border-brand-primary"
            />
            <span className="text-gray-500 font-medium">إلى:</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 font-bold outline-none focus:border-brand-primary"
            />
          </div>
        ) : (
          <div className="text-xs text-gray-500 font-bold flex items-center gap-1.5 px-3">
            <Calendar className="h-4 w-4 text-brand-primary" />
            <span>{summary?.label || 'الفترة المحددة'}</span>
          </div>
        )}
      </div>

      {/* Primary Net Profit Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-secondary to-[#4A2612] rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white">
                صافي المكسب الحقيقي (Net Profit)
              </span>
              <span className="text-xs text-white/80">({summary?.label})</span>
            </div>

            <div className="flex items-baseline gap-3">
              <p className="text-3xl sm:text-5xl font-black font-sans tracking-tight">
                {formatEGP(current.netProfit)}
              </p>
              {trends.netProfitGrowth !== 0 && (
                <span
                  className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-black ${
                    trends.netProfitGrowth > 0
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                      : 'bg-rose-500/30 text-rose-200 border border-rose-400/30'
                  }`}
                >
                  {trends.netProfitGrowth > 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  <span dir="ltr">{Math.abs(trends.netProfitGrowth)}%</span>
                  <span className="text-[10px] mr-1">مقارنة بالفترة السابقة</span>
                </span>
              )}
            </div>

            <p className="text-xs text-white/70">
              الناتج الحقيقي بعد خصم تكلفة البضاعة المباعة والمصاريف الإعلانية والتشغيلية والهالك.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 text-center">
              <span className="text-[10px] text-white/70 block">هامش الربح الصافي (Margin)</span>
              <span className="text-xl font-black text-amber-300 font-mono">
                {current.profitMargin}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpenseModalOpen(true)}
                className="px-3.5 py-2 bg-white text-brand-primary text-xs font-bold rounded-xl shadow-xs hover:bg-white/90 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>تسجيل مصروف</span>
              </button>
              <button
                onClick={() => setWasteModalOpen(true)}
                className="px-3.5 py-2 bg-rose-500/80 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PackageX className="h-3.5 w-3.5" />
                <span>تسجيل هالك</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Financial Components Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Gross Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">إجمالي المبيعات (Revenue)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900 mt-2 font-sans">
            {formatEGP(current.grossRevenue)}
          </p>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center justify-between">
            <span>{current.ordersCount} طلب مكتمل</span>
            <span>{current.totalItemsSold} قطعة مباعة</span>
          </div>
        </div>

        {/* 2. COGS (Cost of Goods Sold) */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">تكلفة البضاعة (COGS)</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-950 mt-2 font-sans">
            {formatEGP(current.totalCOGS)}
          </p>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center justify-between">
            <span>مجمل الربح:</span>
            <strong className="text-emerald-600 font-bold">{formatEGP(current.grossProfit)}</strong>
          </div>
        </div>

        {/* 3. Operational Expenses */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">المصاريف التشغيلية</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-950 mt-2 font-sans">
            {formatEGP(current.totalExpenses)}
          </p>
          <div className="text-[11px] text-purple-700 mt-1 flex items-center justify-between">
            <span>إعلانات، رواتب، تغليف</span>
            <button
              onClick={() => setExpenseModalOpen(true)}
              className="text-brand-primary font-bold hover:underline cursor-pointer"
            >
              + إضافة
            </button>
          </div>
        </div>

        {/* 4. Waste & Damaged */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">الهالك والتوالف</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <PackageX className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-950 mt-2 font-sans">
            {formatEGP(current.totalWaste)}
          </p>
          <div className="text-[11px] text-rose-600 mt-1 flex items-center justify-between">
            <span>{current.totalWasteQuantity} قطعة تالفة</span>
            <button
              onClick={() => setWasteModalOpen(true)}
              className="text-brand-primary font-bold hover:underline cursor-pointer"
            >
              + إضافة
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown Details & Yearly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expenses Distribution (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-bold text-gray-900">توزيع المصاريف التشغيلية</h3>
            </div>
            <span className="text-xs text-gray-400 font-bold">
              {formatEGP(current.totalExpenses)}
            </span>
          </div>

          {current.totalExpenses === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              لم تسجل أي مصاريف في هذه الفترة.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Donut Chart */}
              {expenseChartData.length > 0 && (
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <RechartsTooltip content={<DonutTooltip />} />
                      <Pie
                        data={expenseChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={68}
                        paddingAngle={3}
                      >
                        {expenseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Progress Bars */}
              <div className="space-y-3 pt-2 border-t border-gray-100/80">
                {Object.entries(current.expensesByCategory).map(([cat, amount]) => {
                  if (amount <= 0) return null
                  const pct = Math.round((amount / (current.totalExpenses || 1)) * 100)
                  const meta = EXPENSE_CATEGORIES[cat] || EXPENSE_CATEGORIES.other
                  const color = EXPENSE_COLORS[cat] || '#8b5cf6'
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-700 flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span>{meta.label}</span>
                        </span>
                        <span className="text-gray-500 font-sans font-semibold">
                          {formatEGP(amount)}{' '}
                          <span dir="ltr" className="text-gray-400 font-mono text-[11px]">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Waste Distribution (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-600" />
              <h3 className="text-sm font-bold text-gray-900">توزيع خسائر الهالك والتوالف</h3>
            </div>
            <span className="text-xs text-gray-400 font-bold">{formatEGP(current.totalWaste)}</span>
          </div>

          {current.totalWaste === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              لا يوجد أي هالك مسجل في هذه الفترة (ممتاز!).
            </div>
          ) : (
            <div className="space-y-4">
              {/* Donut Chart */}
              {wasteChartData.length > 0 && (
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <RechartsTooltip content={<DonutTooltip />} />
                      <Pie
                        data={wasteChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={68}
                        paddingAngle={3}
                      >
                        {wasteChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Progress Bars */}
              <div className="space-y-3 pt-2 border-t border-gray-100/80">
                {Object.entries(current.wasteByReason).map(([reason, amount]) => {
                  if (amount <= 0) return null
                  const pct = Math.round((amount / (current.totalWaste || 1)) * 100)
                  const meta = WASTE_REASONS[reason] || WASTE_REASONS.other
                  const color = WASTE_COLORS[reason] || '#ef4444'
                  return (
                    <div key={reason} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-700 flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span>{meta.label}</span>
                        </span>
                        <span className="text-gray-500 font-sans font-semibold">
                          {formatEGP(amount)}{' '}
                          <span dir="ltr" className="text-gray-400 font-mono text-[11px]">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Yearly Monthly Performance Interactive Chart / Table (when period === 'yearly') */}
      {period === 'yearly' && summary?.monthlyChart && summary.monthlyChart.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-brand-primary" />
              <h3 className="text-sm font-bold text-gray-900">
                الأداء المالي والربحي الشهري (12 شهراً)
              </h3>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => setChartViewMode('area')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartViewMode === 'area'
                    ? 'bg-white text-brand-primary shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <LineChart className="h-3.5 w-3.5" />
                <span>منحنى بياني</span>
              </button>
              <button
                onClick={() => setChartViewMode('bar')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartViewMode === 'bar'
                    ? 'bg-white text-brand-primary shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>أعمدة مقارنة</span>
              </button>
              <button
                onClick={() => setChartViewMode('table')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartViewMode === 'table'
                    ? 'bg-white text-brand-primary shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Table className="h-3.5 w-3.5" />
                <span>جدول الأرقام</span>
              </button>
            </div>
          </div>

          {/* Area Chart View */}
          {chartViewMode === 'area' && (
            <div className="h-72 sm:h-80 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={summary.monthlyChart}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b48348" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#b48348" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="monthName"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val.toLocaleString('en-US')} ج.م`}
                  />
                  <RechartsTooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="المبيعات"
                    stroke="#b48348"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="netProfit"
                    name="صافي المكسب"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="المصاريف"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bar Chart View */}
          {chartViewMode === 'bar' && (
            <div className="h-72 sm:h-80 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.monthlyChart}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="monthName"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val.toLocaleString('en-US')} ج.م`}
                  />
                  <RechartsTooltip content={<CustomChartTooltip />} />
                  <Bar
                    dataKey="revenue"
                    name="المبيعات"
                    fill="#b48348"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="netProfit"
                    name="صافي المكسب"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="المصاريف"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table View */}
          {chartViewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-[11px]">
                    <th className="pb-2.5 font-semibold text-start">الشهر</th>
                    <th className="pb-2.5 font-semibold text-start">المبيعات</th>
                    <th className="pb-2.5 font-semibold text-start">تكلفة البضاعة</th>
                    <th className="pb-2.5 font-semibold text-start">المصاريف</th>
                    <th className="pb-2.5 font-semibold text-start">الهالك</th>
                    <th className="pb-2.5 font-semibold text-start">صافي المكسب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {summary.monthlyChart.map((m) => (
                    <tr key={m.monthIndex} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-bold text-gray-900">{m.monthName}</td>
                      <td className="py-2.5 font-sans font-semibold text-gray-800">
                        {formatEGP(m.revenue)}
                      </td>
                      <td className="py-2.5 font-sans text-gray-500">{formatEGP(m.cogs)}</td>
                      <td className="py-2.5 font-sans text-purple-700">{formatEGP(m.expenses)}</td>
                      <td className="py-2.5 font-sans text-rose-600">{formatEGP(m.waste)}</td>
                      <td className="py-2.5 font-sans font-bold">
                        <span
                          className={
                            m.netProfit > 0
                              ? 'text-emerald-600'
                              : m.netProfit < 0
                                ? 'text-rose-600'
                                : 'text-gray-400'
                          }
                        >
                          {formatEGP(m.netProfit)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detailed Logs Tabs: Expenses vs Waste */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        {/* Tab Switcher */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'expenses'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              سجل المصاريف التشغيلية ({current.expensesList.length})
            </button>
            <button
              onClick={() => setActiveTab('waste')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'waste'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              سجل الهالك والتوالف ({current.wasteList.length})
            </button>
          </div>

          <div>
            {activeTab === 'expenses' ? (
              <Button
                size="sm"
                onClick={() => setExpenseModalOpen(true)}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                className="text-xs font-bold"
              >
                مصروف جديد
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setWasteModalOpen(true)}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                className="text-xs font-bold"
              >
                تسجيل هالك
              </Button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'expenses' ? (
            current.expensesList.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                لا توجد مصاريف مسجلة في هذه الفترة.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-[11px]">
                      <th className="pb-2.5 font-semibold text-start">التاريخ</th>
                      <th className="pb-2.5 font-semibold text-start">بيان المصروف</th>
                      <th className="pb-2.5 font-semibold text-start">القسم</th>
                      <th className="pb-2.5 font-semibold text-start">المبلغ</th>
                      <th className="pb-2.5 font-semibold text-start">ملاحظات</th>
                      <th className="pb-2.5 font-semibold text-end">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {current.expensesList.map((exp: ExpenseItem) => {
                      const meta = EXPENSE_CATEGORIES[exp.category] || EXPENSE_CATEGORIES.other
                      return (
                        <tr key={exp._id} className="hover:bg-gray-50/50">
                          <td className="py-3 text-gray-500 font-mono">
                            {new Date(exp.date).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="py-3 font-bold text-gray-900">{exp.title}</td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.color}`}
                            >
                              {meta.label}
                            </span>
                          </td>
                          <td className="py-3 font-bold text-purple-700 font-sans">
                            {formatEGP(exp.amount)}
                          </td>
                          <td className="py-3 text-gray-400 text-[11px] truncate max-w-xs">
                            {exp.notes || '-'}
                          </td>
                          <td className="py-3 text-end">
                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
                                  deleteExpenseMutation.mutate(exp._id)
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="حذف المصروف"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : current.wasteList.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              لا يوجد أي هالك مسجل في هذه الفترة.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-[11px]">
                    <th className="pb-2.5 font-semibold text-start">التاريخ</th>
                    <th className="pb-2.5 font-semibold text-start">المنتج التالف</th>
                    <th className="pb-2.5 font-semibold text-start">الكمية</th>
                    <th className="pb-2.5 font-semibold text-start">تكلفة القطعة</th>
                    <th className="pb-2.5 font-semibold text-start">إجمالي الخسارة</th>
                    <th className="pb-2.5 font-semibold text-start">السبب</th>
                    <th className="pb-2.5 font-semibold text-end">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {current.wasteList.map((w: WasteItem) => {
                    const meta = WASTE_REASONS[w.reason] || WASTE_REASONS.other
                    return (
                      <tr key={w._id} className="hover:bg-gray-50/50">
                        <td className="py-3 text-gray-500 font-mono">
                          {new Date(w.date).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="py-3 font-bold text-gray-900">{w.productName}</td>
                        <td className="py-3 text-gray-700 font-bold">{w.quantity} قطع</td>
                        <td className="py-3 text-gray-500 font-sans">
                          {formatEGP(w.costPerUnit)}
                        </td>
                        <td className="py-3 font-bold text-rose-600 font-sans">
                          {formatEGP(w.totalCost)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 text-end">
                          <button
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
                                deleteWasteMutation.mutate(w._id)
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="حذف سجل الهالك"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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

      {/* Modal 1: Add Expense */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">تسجيل مصروف تشغيلي جديد</h2>
              <button
                onClick={handleCloseExpenseModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                createExpenseMutation.mutate({
                  title: expTitle,
                  amount: Number(expAmount),
                  category: expCategory,
                  date: expDate,
                  notes: expNotes,
                })
              }}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  بيان المصروف (العنوان) *
                </label>
                <Input
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="مثال: حملة إعلانية على تيك توك لعطر مسك"
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">المبلغ (ج.م) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="1500"
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">القسم / التصنيف *</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 font-bold text-gray-700 text-xs outline-none focus:border-brand-primary cursor-pointer"
                  >
                    {Object.entries(EXPENSE_CATEGORIES).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">تاريخ الصرف</label>
                <Input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ملاحظات إضافية (اختياري)</label>
                <textarea
                  rows={2}
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="رقم الفاتورة، تفاصيل الحساب، إلخ..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button type="button" variant="secondary" size="sm" onClick={handleCloseExpenseModal}>
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createExpenseMutation.isPending}
                  className="font-bold"
                >
                  {createExpenseMutation.isPending ? 'جاري الحفظ...' : 'حفظ المصروف'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Waste */}
      {wasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">تسجيل هالك وتوالف جديد</h2>
              <button
                onClick={handleCloseWasteModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                createWasteMutation.mutate({
                  productID: wasteProductID || undefined,
                  productName: wasteProductName,
                  quantity: Number(wasteQuantity),
                  costPerUnit: Number(wasteCostPerUnit),
                  reason: wasteReason,
                  date: wasteDate,
                  notes: wasteNotes,
                  deductFromStock: wasteDeductStock,
                })
              }}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">اختر من المنتجات المسجلة</label>
                <select
                  value={wasteProductID}
                  onChange={(e) => handleProductSelectForWaste(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 font-bold text-gray-700 text-xs outline-none focus:border-brand-primary cursor-pointer mb-2"
                >
                  <option value="">-- اختر منتج (أو اكتب اسمه بالأسفل) --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.costPrice ? `(تكلفة: ${p.costPrice} ج.م)` : ''}
                    </option>
                  ))}
                </select>

                <Input
                  required
                  value={wasteProductName}
                  onChange={(e) => setWasteProductName(e.target.value)}
                  placeholder="اسم المنتج التالف"
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">الكمية التالفة *</label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={wasteQuantity}
                    onChange={(e) => setWasteQuantity(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">تكلفة القطعة (ج.م) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={wasteCostPerUnit}
                    onChange={(e) => setWasteCostPerUnit(e.target.value)}
                    placeholder="150"
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">سبب الهالك والتلف *</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 font-bold text-gray-700 text-xs outline-none focus:border-brand-primary cursor-pointer"
                >
                  {Object.entries(WASTE_REASONS).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">تاريخ حدوث الهالك</label>
                <Input
                  type="date"
                  value={wasteDate}
                  onChange={(e) => setWasteDate(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="deductStock"
                  checked={wasteDeductStock}
                  onChange={(e) => setWasteDeductStock(e.target.checked)}
                  className="h-4 w-4 rounded accent-brand-primary cursor-pointer"
                />
                <label htmlFor="deductStock" className="text-xs font-bold text-amber-900 cursor-pointer">
                  خصم الكمية التالفة تلقائياً من مخزون المنتج في المتجر
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button type="button" variant="secondary" size="sm" onClick={handleCloseWasteModal}>
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createWasteMutation.isPending}
                  className="font-bold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {createWasteMutation.isPending ? 'جاري الحفظ...' : 'تسجيل الهالك'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

