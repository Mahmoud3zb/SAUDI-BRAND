import { apiClient } from '../../../lib/api-client.ts'

export interface AdminProduct {
  _id: string
  name: string
  price: number
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

export interface OrderItem {
  productID: { _id: string; name: string; price: number; imageUrl?: string } | string
  quantity: number
  price: number
}

export interface AdminOrder {
  _id: string
  userID: { _id: string; name: string; email: string } | string
  items: OrderItem[]
  totalPrice: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
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

  // Categories
  getCategories: () => apiClient<{ data: AdminCategory[] }>('/category'),
  addCategory: (data: { name: string; description?: string }) =>
    apiClient<{ message: string; data: AdminCategory }>('/category', { method: 'POST', data }),
  updateCategory: (id: string, data: { name: string; description?: string }) =>
    apiClient<{ message: string; data: AdminCategory }>(`/category/${id}`, { method: 'PUT', data }),
  toggleCategoryStatus: (id: string) =>
    apiClient<{ message: string }>(`/category/${id}/deactivate`, { method: 'PATCH' }),

  // Orders
  getOrders: () => apiClient<{ message: string; orders: AdminOrder[] }>('/order/orders'),
  updateOrderStatus: (id: string, status: string) =>
    apiClient<{ message: string }>(`/order/${id}`, { method: 'PUT', data: { status } }),
}
