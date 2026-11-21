import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  Loader2,
  MessageCircle,
  Printer,
  ShoppingBag,
  Search,
  Truck,
  X,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button.tsx'
import { adminApi, type AdminOrder } from '../api/admin.api.ts'
import { useAdminAuthStore } from '../../auth/admin-auth.store.ts'
import { useSettingsStore } from '../../settings/settings.store.ts'

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: {
    label: 'قيد الانتظار',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  confirmed: {
    label: 'تم التأكيد',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle,
  },
  completed: {
    label: 'مكتمل',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Truck,
  },
  cancelled: { label: 'ملغي', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
}

export function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedWaybill, setSelectedWaybill] = useState<AdminOrder | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const ordersContainerRef = useRef<HTMLDivElement>(null)

  const whatsappNumber = useSettingsStore((state) => state.whatsappNumber)

  const isSuperAdmin = useAdminAuthStore((state) => state.isSuperAdmin)
  const hasPermission = useAdminAuthStore((state) => state.hasPermission)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: adminApi.getOrders,
    enabled: isSuperAdmin() || hasPermission('manage_orders'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const orders = data?.data || []
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const user = typeof order.userID === 'object' && order.userID !== null ? order.userID : null
    const searchLower = search.toLowerCase()
    return (
      matchesStatus &&
      (order._id.toLowerCase().includes(searchLower) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
        (order.customerPhone && order.customerPhone.includes(searchLower)) ||
        (user?.name && user.name.toLowerCase().includes(searchLower)) ||
        (user?.email && user.email.toLowerCase().includes(searchLower)))
    )
  })

  const totalOrders = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalOrders)
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    ordersContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Permission guard
  if (!isSuperAdmin() && !hasPermission('manage_orders')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] text-center p-8 bg-white rounded-3xl border border-gray-200 font-sans" dir="rtl">
        <ShoppingBag className="h-12 w-12 text-gray-300 mb-3" />
        <h2 className="text-lg font-bold text-gray-800">صلاحية إدارة الطلبات غير مفعلة لحسابك</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          يرجى مراجعة المدير العام للمتجر لمنحك صلاحية إدارة وتأكيد الطلبات والشحن.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            متابعة طلبات العملاء وتحديث حالات الشحن والتسليم
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            if (filteredOrders.length === 0) {
              toast.error('لا توجد طلبات لتصديرها')
              return
            }

            const headers = [
              'رقم الطلب',
              'تاريخ الطلب',
              'اسم العميل',
              'رقم الموبايل',
              'المحافظة',
              'العنوان بالتفصيل',
              'طريقة الدفع',
              'حالة الطلب',
              'المبلغ الإجمالي',
              'المنتجات',
            ]

            const rows = filteredOrders.map((o) => {
              const itemsStr = (o.items || [])
                .map((it) => {
                  const p = typeof it.productID === 'object' && it.productID !== null ? it.productID.name : ''
                  return `${p} (${it.quantity})`
                })
                .join(' + ')

              return [
                `#${o._id.slice(-6).toUpperCase()}`,
                o.createdAt ? new Date(o.createdAt).toLocaleDateString('ar-EG') : '',
                `"${(o.customerName || '').replace(/"/g, '""')}"`,
                `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
                `"${(o.shippingAddress?.city || '').replace(/"/g, '""')}"`,
                `"${(o.shippingAddress?.street || '').replace(/"/g, '""')}"`,
                `"${o.paymentMethod || 'cod'}"`,
                `"${STATUS_LABELS[o.status]?.label || o.status}"`,
                o.totalPrice || 0,
                `"${itemsStr.replace(/"/g, '""')}"`,
              ].join(',')
            })

            const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `saudi_brand_orders_${new Date().toISOString().slice(0, 10)}.csv`
            link.click()
            URL.revokeObjectURL(url)
            toast.success('تم تصدير ملف الطلبات (Excel) بنجاح')
          }}
          leftIcon={<Download className="h-4 w-4" />}
          className="text-xs font-bold"
        >
          تصدير إلى Excel ({filteredOrders.length})
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-2 shadow-2xs">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="ابحث برقم الطلب أو اسم العميل أو بريده..."
            className="w-full text-xs sm:text-sm bg-transparent outline-hidden text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => {
              setStatusFilter('all')
              setCurrentPage(1)
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'all'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            الكل ({orders.length})
          </button>
          {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st)
                setCurrentPage(1)
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {STATUS_LABELS[st]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div ref={ordersContainerRef} className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 flex flex-col items-center gap-2 border border-gray-100">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
            <span className="text-xs">جاري تحميل الطلبات...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 flex flex-col items-center gap-2 border border-gray-100">
            <ShoppingBag className="h-8 w-8 text-gray-300" />
            <span className="text-xs">لا توجد طلبات تطابق بحثك</span>
          </div>
        ) : (
          paginatedOrders.map((order) => {
            const user =
              typeof order.userID === 'object' && order.userID !== null ? order.userID : null
            const isExpanded = expandedId === order._id
            const currentStatus = STATUS_LABELS[order.status] || STATUS_LABELS.pending
            const StatusIcon = currentStatus.icon

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden transition-all"
              >
                {/* Order Summary Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 bg-brand-soft-pink/50 rounded-xl text-brand-primary shrink-0">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 font-mono">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${currentStatus.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          <span>{currentStatus.label}</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>العميل: <strong className="text-gray-800">{order.customerName || user?.name || 'زائر'}</strong></span>
                        {order.customerPhone && (
                          <span className="flex items-center gap-1.5 font-mono">
                            <span>📱 {order.customerPhone}</span>
                            <a
                              href={`https://wa.me/20${order.customerPhone.replace(/^0+/, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-bold hover:bg-emerald-100 transition-colors"
                              title="مراسلة على الواتساب"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>واتساب</span>
                            </a>
                          </span>
                        )}
                        {order.shippingAddress?.city && <span>📍 {order.shippingAddress.city}</span>}
                        <span>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('ar-EG')
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                    <div className="text-left">
                      <span className="text-sm font-bold text-brand-primary">
                        {order.totalPrice?.toFixed(2)} ج.م
                      </span>
                      <p className="text-[10px] text-gray-400">{order.items?.length || 0} منتج</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Dropdown */}
                      <select
                        value={order.status}
                        disabled={statusMutation.isPending}
                        onChange={(e) =>
                          statusMutation.mutate({ id: order._id, status: e.target.value })
                        }
                        className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-700 outline-hidden focus:border-brand-primary cursor-pointer disabled:opacity-50"
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="confirmed">تم التأكيد</option>
                        <option value="completed">مكتمل</option>
                        <option value="cancelled">ملغي</option>
                      </select>

                      {/* Print Waybill Button */}
                      <button
                        onClick={() => setSelectedWaybill(order)}
                        className="p-1.5 text-gray-400 hover:text-brand-primary rounded-lg hover:bg-brand-soft-pink/40 transition-colors cursor-pointer"
                        title="طباعة بوليصة الشحن"
                      >
                        <Printer className="h-4 w-4" />
                      </button>

                      {/* Expand Button */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order._id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer"
                        title={isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="bg-gray-50/75 p-4 sm:p-5 border-t border-gray-100 space-y-3">
                    <h4 className="text-xs font-bold text-gray-700">تفاصيل المنتجات:</h4>
                    <div className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-100 overflow-hidden">
                      {order.items?.map((item, idx) => {
                        const product =
                          typeof item.productID === 'object' && item.productID !== null
                            ? item.productID
                            : null
                        return (
                          <div key={idx} className="p-3 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              {product?.imageUrl && (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name || ''}
                                  className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                                />
                              )}
                              <div>
                                <p className="font-bold text-gray-800">
                                  {product?.name || 'منتج غير محدد'}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  الكمية: {item.quantity} × {item.price} ج.م
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-gray-900">
                              {(item.quantity * item.price).toFixed(2)} ج.م
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {order.shippingAddress && (
                      <div className="bg-white p-3.5 rounded-xl border border-gray-100 text-xs text-gray-700 space-y-1">
                        <p className="font-bold text-gray-900">بيانات الشحن والتوصيل:</p>
                        <p>📍 المدينة: {order.shippingAddress.city} {order.shippingAddress.district ? `- حي ${order.shippingAddress.district}` : ''}</p>
                        <p>🏠 العنوان: {order.shippingAddress.street}</p>
                        {order.customerPhone && <p>📞 الجوال: {order.customerPhone}</p>}
                        {order.shippingAddress.notes && <p className="text-gray-500 italic">ملاحظات: {order.shippingAddress.notes}</p>}
                        {order.paymentMethod && (
                          <p className="text-brand-primary font-bold">
                            طريقة الدفع:{' '}
                            {order.paymentMethod === 'vodafone_cash'
                              ? 'فودافون كاش'
                              : order.paymentMethod === 'instapay'
                              ? 'انستاباي InstaPay'
                              : order.paymentMethod === 'cod'
                              ? 'الدفع عند الاستلام'
                              : order.paymentMethod}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalOrders > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
          {/* Orders Count Range */}
          <div className="text-gray-500 font-medium">
            عرض <strong className="text-gray-900 font-bold">{startIndex + 1}</strong> إلى{' '}
            <strong className="text-gray-900 font-bold">{endIndex}</strong> من إجمالي{' '}
            <strong className="text-gray-900 font-bold">{totalOrders}</strong> طلب
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-gray-500">
              <span>عرض:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-700 outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value={10}>10 في الصفحة</option>
                <option value={15}>15 في الصفحة</option>
                <option value={25}>25 في الصفحة</option>
                <option value={50}>50 في الصفحة</option>
              </select>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(Math.max(1, safeCurrentPage - 1))}
                disabled={safeCurrentPage <= 1}
                className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="الصفحة السابقة"
                aria-label="الصفحة السابقة"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <span className="px-3 py-1 font-bold text-xs bg-brand-soft-pink text-brand-primary rounded-xl">
                صفحة {safeCurrentPage} من {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, safeCurrentPage + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="الصفحة التالية"
                aria-label="الصفحة التالية"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Shipping Waybill Slip Modal */}
      {selectedWaybill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-brand-primary" />
                <h3 className="text-base font-bold text-gray-900">بوليصة الشحن والفاتورة</h3>
              </div>
              <button
                onClick={() => setSelectedWaybill(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Area */}
            <div id="printable-waybill" className="py-4 space-y-4 font-sans text-xs" dir="rtl">
              {/* Slip Header */}
              <div className="flex items-center justify-between border-b-2 border-gray-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <img src="/newLogo2.png" alt="سعودي براند" className="h-10 w-auto" />
                  <div>
                    <h2 className="text-base font-black text-gray-900">سعودي براند | SAUDI BRAND</h2>
                    <p className="text-[10px] text-gray-500">بوليصة شحن وتوصيل طرد للعميل</p>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <span className="text-sm font-black text-gray-900 block">
                    #{selectedWaybill._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {selectedWaybill.createdAt
                      ? new Date(selectedWaybill.createdAt).toLocaleDateString('ar-EG')
                      : ''}
                  </span>
                </div>
              </div>

              {/* Sender & Consignee Box */}
              <div className="grid grid-cols-2 gap-3 border border-gray-200 rounded-2xl p-3 bg-gray-50/60">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block mb-1">الراسل (Sender):</span>
                  <p className="font-bold text-gray-900">متجر سعودي براند</p>
                  <p className="text-[11px] text-gray-600">خدمة العملاء: {whatsappNumber}</p>
                  <p className="text-[11px] text-gray-500">القاهرة - جمهورية مصر العربية</p>
                </div>
                <div className="border-s border-gray-200 ps-3">
                  <span className="text-[10px] font-bold text-gray-400 block mb-1">المستلم (Consignee):</span>
                  <p className="font-bold text-gray-900">{selectedWaybill.customerName}</p>
                  <p className="text-[11px] font-bold font-mono text-gray-800">📞 {selectedWaybill.customerPhone}</p>
                  <p className="text-[11px] text-gray-700">📍 {selectedWaybill.shippingAddress?.city} - {selectedWaybill.shippingAddress?.street}</p>
                  {selectedWaybill.shippingAddress?.district && (
                    <p className="text-[10px] text-gray-500">حي: {selectedWaybill.shippingAddress.district}</p>
                  )}
                  {selectedWaybill.shippingAddress?.notes && (
                    <p className="text-[10px] text-amber-800 bg-amber-50 p-1 rounded mt-1">
                      ملاحظة: {selectedWaybill.shippingAddress.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-gray-100 text-[10px] font-bold text-gray-600">
                    <tr>
                      <th className="py-1.5 px-3">المنتج</th>
                      <th className="py-1.5 px-2 text-center">الكمية</th>
                      <th className="py-1.5 px-3 text-left">السعر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {selectedWaybill.items?.map((it, idx) => {
                      const prodName =
                        typeof it.productID === 'object' && it.productID !== null
                          ? it.productID.name
                          : 'منتج'
                      return (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-medium text-gray-800">{prodName}</td>
                          <td className="py-2 px-2 text-center font-bold font-mono">{it.quantity}</td>
                          <td className="py-2 px-3 text-left font-mono">{it.price * it.quantity} ج.م</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Total & Payment Method Box */}
              <div className="p-3.5 bg-gray-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-300 block">طريقة التحصيل:</span>
                  <span className="text-xs font-bold text-amber-400">
                    {selectedWaybill.paymentMethod === 'cod'
                      ? 'دفع نقداً عند الاستلام (COD)'
                      : selectedWaybill.paymentMethod}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-gray-300 block">المبلغ المطلوب تحصيله من العميل:</span>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    {selectedWaybill.totalPrice?.toFixed(2)} ج.م
                  </span>
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-400 pt-1">
                شكراً لثقتكم في متجر سعودي براند • يحق للعميل المعاينة قبل الدفع
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5 print:hidden">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedWaybill(null)}
                className="text-xs font-semibold px-4 cursor-pointer"
              >
                إغلاق
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => window.print()}
                leftIcon={<Printer className="h-4 w-4" />}
                className="text-xs font-bold px-6 cursor-pointer"
              >
                طباعة البوليصة الآن
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
