export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface ProductRating {
  score: number
  count: number
}

export interface Product {
  id: string
  name: string
  slug?: string
  description?: string
  categoryId: string
  price: number
  originalPrice?: number
  imageUrl?: string
  stockStatus: StockStatus
  isFeatured?: boolean
  rating?: ProductRating
}
