import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  ShoppingBag,
  Search,
  Truck,
  XCircle,
} from 'lucide-react'
import { adminApi } from '../api/admin.api.ts'

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

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: adminApi.getOrders,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const orders = data?.orders || []
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const user = typeof order.userID === 'object' && order.userID !== null ? order.userID : null
    const searchLower = search.toLowerCase()
    return (
      matchesStatus &&
      (order._id.toLowerCase().includes(searchLower) ||
        (user?.name && user.name.toLowerCase().includes(searchLower)) ||
        (user?.email && user.email.toLowerCase().includes(searchLower)))
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          متابعة طلبات العملاء وتحديث حالات الشحن والتسليم
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-2 shadow-2xs">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم الطلب أو اسم العميل أو بريده..."
            className="w-full text-xs sm:text-sm bg-transparent outline-hidden text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
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
              onClick={() => setStatusFilter(st)}
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
      <div className="space-y-3">
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
          filteredOrders.map((order) => {
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
                        <span>العميل: {user?.name || 'غير معروف'}</span>
                        {user?.email && <span>{user.email}</span>}
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
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
