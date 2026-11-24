import { apiClient } from '../../../lib/api-client.ts'

export interface AdminProduct {
  _id: string
  name: string
  price: number
  originalPrice?: number
  costPrice?: number
  stockQuantity?: number
  isFeatured?: boolean
  imageUrl: string
  description?: string
  categoryID: string | { _id: string; name: string }
  isActive: boolean
  createdAt: string
}

export interface AdminCategory {
  _id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
}

export interface AdminUser {
  _id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'user' | string
  permissions?: string[]
  createdAt?: string
}

export interface OrderItem {
  productID: { _id: string; name: string; price: number; imageUrl?: string } | string
  quantity: number
  price: number
}

export interface AdminOrder {
  _id: string
  userID?: { _id: string; name: string; email: string } | string
  customerName?: string
  customerPhone?: string
  shippingAddress?: {
    city: string
    district?: string
    street: string
    notes?: string
  }
  items: OrderItem[]
  totalPrice: number
  shippingFee?: number
  paymentMethod?: 'cod' | 'vodafone_cash' | 'instapay' | 'card' | 'tabby' | 'tamara' | string
  paymentStatus?: 'unpaid' | 'paid'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface ExpenseItem {
  _id: string
  title: string
  amount: number
  category: 'ads' | 'packaging' | 'salaries' | 'shipping' | 'rent' | 'utilities' | 'other'
  date: string
  notes?: string
  createdBy?: { _id: string; name: string; email: string }
  createdAt: string
}

export interface WasteItem {
  _id: string
  productID?: { _id: string; name: string; price: number; imageUrl?: string; costPrice?: number }
  productName: string
  quantity: number
  costPerUnit: number
  totalCost: number
  reason: 'shipping_damage' | 'manufacturing_defect' | 'tester_sample' | 'storage_loss' | 'other'
  date: string
  notes?: string
  createdBy?: { _id: string; name: string; email: string }
  createdAt: string
}

export interface FinanceSummary {
  period: 'daily' | 'monthly' | 'yearly' | 'custom'
  label: string
  dateRange: { start: string; end: string }
  current: {
    grossRevenue: number
    shippingRevenue: number
    netProductRevenue: number
    totalCOGS: number
    grossProfit: number
    ordersCount: number
    totalItemsSold: number
    totalExpenses: number
    expensesByCategory: Record<string, number>
    expensesList: ExpenseItem[]
    totalWaste: number
    totalWasteQuantity: number
    wasteByReason: Record<string, number>
    wasteList: WasteItem[]
    netProfit: number
    profitMargin: number
  }
  previous: {
    grossRevenue: number
    netProfit: number
    totalExpenses: number
    totalWaste: number
  }
  trends: {
    revenueGrowth: number
    netProfitGrowth: number
  }
  monthlyChart?: Array<{
    monthIndex: number
    monthName: string
    revenue: number
    cogs: number
    expenses: number
    waste: number
    netProfit: number
  }>
}

export const adminApi = {
  // Products
  getProducts: () => apiClient<{ data: AdminProduct[]; total: number }>('/product?limit=100'),
  addProduct: (formData: FormData) =>
    apiClient<{ message: string; data: AdminProduct }>('/product', {
      method: 'POST',
      data: formData,
    }),
  updateProduct: (id: string, formData: FormData) =>
    apiClient<{ message: string; data: AdminProduct }>(`/product/${id}`, {
      method: 'PUT',
      data: formData,
    }),
  toggleProductStatus: (id: string) =>
    apiClient<{ message: string }>(`/product/${id}/status`, { method: 'PATCH' }),
  deleteProduct: (id: string) =>
    apiClient<{ message: string }>(`/product/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => apiClient<{ data: AdminCategory[] }>('/category'),
  addCategory: (data: { name: string; description?: string }) =>
    apiClient<{ message: string; data: AdminCategory }>('/category', { method: 'POST', data }),
  updateCategory: (id: string, data: { name: string; description?: string }) =>
    apiClient<{ message: string; data: AdminCategory }>(`/category/${id}`, { method: 'PUT', data }),
  toggleCategoryStatus: (id: string) =>
    apiClient<{ message: string }>(`/category/${id}/deactivate`, { method: 'PATCH' }),

  // Orders
  getOrders: () =>
    apiClient<{ message: string; data: AdminOrder[]; total: number }>('/order/orders'),
  updateOrderStatus: (id: string, status: string) =>
    apiClient<{ message: string }>(`/order/${id}`, { method: 'PUT', data: { status } }),

  // Admins & Team Management
  getAdmins: () =>
    apiClient<{ message: string; data: AdminUser[]; total: number }>('/user?limit=100'),
  addAdmin: (data: {
    name: string
    email: string
    password: string
    role?: string
    permissions?: string[]
  }) => apiClient<{ message: string; data: AdminUser }>('/user', { method: 'POST', data }),
  deleteAdmin: (id: string) =>
    apiClient<{ message: string }>(`/user/${id}`, { method: 'DELETE' }),

  // Finance & Profit Breakdown
  getFinanceSummary: (period: string = 'daily', from?: string, to?: string) => {
    let url = `/finance/summary?period=${encodeURIComponent(period)}`
    if (from) url += `&from=${encodeURIComponent(from)}`
    if (to) url += `&to=${encodeURIComponent(to)}`
    return apiClient<FinanceSummary>(url)
  },
  getExpenses: (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.category) q.set('category', params.category)
    if (params?.search) q.set('search', params.search)
    return apiClient<{
      data: ExpenseItem[]
      pagination: { total: number; page: number; limit: number; pages: number }
    }>(`/finance/expenses?${q.toString()}`)
  },
  createExpense: (data: {
    title: string
    amount: number
    category: string
    date?: string
    notes?: string
  }) => apiClient<{ message: string; data: ExpenseItem }>('/finance/expenses', { method: 'POST', data }),
  deleteExpense: (id: string) =>
    apiClient<{ message: string }>(`/finance/expenses/${id}`, { method: 'DELETE' }),

  getWaste: (params?: { page?: number; limit?: number; reason?: string; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.reason) q.set('reason', params.reason)
    if (params?.search) q.set('search', params.search)
    return apiClient<{
      data: WasteItem[]
      pagination: { total: number; page: number; limit: number; pages: number }
    }>(`/finance/waste?${q.toString()}`)
  },
  createWaste: (data: {
    productID?: string
    productName: string
    quantity: number
    costPerUnit: number
    reason: string
    date?: string
    notes?: string
    deductFromStock?: boolean
  }) => apiClient<{ message: string; data: WasteItem }>('/finance/waste', { method: 'POST', data }),
  deleteWaste: (id: string) =>
    apiClient<{ message: string }>(`/finance/waste/${id}`, { method: 'DELETE' }),
}
