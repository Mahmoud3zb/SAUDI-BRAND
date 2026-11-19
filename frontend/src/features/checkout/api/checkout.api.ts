import { apiClient } from '../../../lib/api-client.ts'

export interface CheckoutPayload {
  customerName: string
  customerPhone: string
  shippingAddress: {
    city: string
    district?: string
    street: string
    notes?: string
  }
  paymentMethod: 'cod' | 'vodafone_cash' | 'instapay' | 'card'
  items: Array<{
    productID: string
    quantity: number
  }>
}

export interface PlacedOrder {
  _id: string
  customerName: string
  customerPhone: string
  shippingAddress: {
    city: string
    district?: string
    street: string
    notes?: string
  }
  items: Array<{
    productID: {
      _id: string
      name: string
      price: number
      imageUrl?: string
    }
    quantity: number
    price: number
  }>
  totalPrice: number
  shippingFee: number
  paymentMethod: string
  paymentStatus: string
  status: string
  createdAt: string
}

export const checkoutApi = {
  createOrder: (data: CheckoutPayload) =>
    apiClient<{ message: string; order: PlacedOrder }>('/order', {
      method: 'POST',
      data,
    }),
}

