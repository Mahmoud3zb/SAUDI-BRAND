import { apiClient } from '../../../lib/api-client.ts'
import type { Banner, Category, Product } from '../../../types/index.ts'
import { MOCK_BANNERS } from '../data/banners.mock.ts'
import { MOCK_CATEGORIES } from '../data/categories.mock.ts'
import { MOCK_PRODUCTS } from '../data/products.mock.ts'

// Raw shape returned by MongoDB backend
interface BackendProduct {
  _id: string
  name: string
  slug?: string
  price: number
  originalPrice?: number
  stockQuantity?: number
  rating?: { score: number; count: number }
  imageUrl: string
  description?: string
  categoryID: string | { _id: string; name: string; slug?: string }
  isFeatured?: boolean
  isActive?: boolean
  createdAt?: string
}

interface BackendCategory {
  _id: string
  name: string
  slug?: string
  description?: string
  isActive?: boolean
}

// Convert Backend Product to Storefront Product format
function mapBackendProduct(p: BackendProduct): Product {
  const catId =
    typeof p.categoryID === 'object' && p.categoryID !== null
      ? p.categoryID.slug || p.categoryID._id
      : String(p.categoryID || '')

  let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock'
  if (p.isActive === false || (p.stockQuantity !== undefined && p.stockQuantity <= 0)) {
    stockStatus = 'out_of_stock'
  } else if (p.stockQuantity !== undefined && p.stockQuantity < 5) {
    stockStatus = 'low_stock'
  }

  return {
    id: p._id,
    name: p.name,
    slug: p.slug || p._id,
    price: p.price,
    originalPrice: p.originalPrice,
    imageUrl: p.imageUrl,
    description: p.description,
    categoryId: catId,
    stockStatus,
    stockQuantity: p.stockQuantity,
    isFeatured: p.isFeatured,
    rating: p.rating || { score: 4.8, count: 12 },
  }
}

// Convert Backend Category to Storefront Category format
function mapBackendCategory(c: BackendCategory): Category {
  return {
    id: c._id,
    name: c.name,
    slug: c.slug || c._id,
    description: c.description,
  }
}

export interface GetProductsParams {
  categoryId?: string
  q?: string
  sort?: string
  featured?: boolean
  limit?: number
  page?: number
}

export async function getProducts(params?: GetProductsParams): Promise<Product[]> {
  try {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', String(params.limit))
    else query.set('limit', '100')
    if (params?.page) query.set('page', String(params.page))
    if (params?.categoryId) query.set('categoryId', params.categoryId)
    if (params?.q) query.set('q', params.q)
    if (params?.sort) query.set('sort', params.sort)
    if (params?.featured) query.set('featured', 'true')

    const qs = query.toString()
    const res = await apiClient<{ data: BackendProduct[] }>(`/product${qs ? `?${qs}` : ''}`)
    if (res && Array.isArray(res.data)) {
      return res.data.map(mapBackendProduct)
    }
  } catch {
    // If backend is offline or network fails, fallback gracefully to mock products
  }
  return MOCK_PRODUCTS
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await apiClient<{ data: BackendProduct }>(`/product/${id}`)
    if (res?.data) {
      return mapBackendProduct(res.data)
    }
  } catch {
    // Fallback to local data
  }
  return MOCK_PRODUCTS.find((p) => p.id === id || p.slug === id) ?? null
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await apiClient<{ data: BackendProduct[] }>('/product?featured=true&limit=8')
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(mapBackendProduct)
    }
  } catch {
    // Fallback to local filter
  }
  const all = await getProducts()
  return all.filter((p) => p.isFeatured || p.stockStatus === 'in_stock').slice(0, 8)
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const res = await apiClient<{ data: BackendProduct[] }>(
      `/product?categoryId=${encodeURIComponent(categoryId)}&limit=100`,
    )
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(mapBackendProduct)
    }
  } catch {
    // Fallback to local filter
  }
  const all = await getProducts()
  const target = categoryId === 'accessories' ? 'handmade' : categoryId
  return all.filter((p) => p.categoryId === target || p.categoryId === categoryId)
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await apiClient<{ data: BackendCategory[] }>('/category')
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(mapBackendCategory)
    }
  } catch {
    // Fallback to local categories
  }
  return MOCK_CATEGORIES
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const all = await getCategories()
  return (
    all.find(
      (c) => c.id === id || c.slug === id || (id === 'accessories' && c.id === 'handmade'),
    ) ?? null
  )
}

export async function getBanners(): Promise<Banner[]> {
  return MOCK_BANNERS
}
