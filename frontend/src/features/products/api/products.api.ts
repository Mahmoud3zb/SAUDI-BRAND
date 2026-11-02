import { apiClient } from '../../../lib/api-client.ts'
import type { Banner, Category, Product } from '../../../types/index.ts'
import { MOCK_BANNERS } from '../data/banners.mock.ts'
import { MOCK_CATEGORIES } from '../data/categories.mock.ts'
import { MOCK_PRODUCTS } from '../data/products.mock.ts'

// Raw shape returned by MongoDB backend
interface BackendProduct {
  _id: string
  name: string
  price: number
  imageUrl: string
  description?: string
  categoryID: string | { _id: string; name: string }
  isActive?: boolean
  createdAt?: string
}

interface BackendCategory {
  _id: string
  name: string
  description?: string
  isActive?: boolean
}

// Convert Backend Product to Storefront Product format
function mapBackendProduct(p: BackendProduct): Product {
  const catId =
    typeof p.categoryID === 'object' && p.categoryID !== null
      ? p.categoryID._id
      : String(p.categoryID || '')

  return {
    id: p._id,
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl,
    description: p.description,
    categoryId: catId,
    stockStatus: p.isActive === false ? 'out_of_stock' : 'in_stock',
  }
}

// Convert Backend Category to Storefront Category format
function mapBackendCategory(c: BackendCategory): Category {
  return {
    id: c._id,
    name: c.name,
    slug: c._id,
    description: c.description,
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await apiClient<{ data: BackendProduct[] }>('/product?limit=100')
    if (res?.data && res.data.length > 0) {
      return res.data.map(mapBackendProduct)
    }
  } catch {
    // If backend is offline or empty, fallback gracefully to mock products
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
  const all = await getProducts()
  return all.filter((p) => p.isFeatured || p.stockStatus === 'in_stock').slice(0, 8)
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const all = await getProducts()
  const target = categoryId === 'accessories' ? 'handmade' : categoryId
  return all.filter((p) => p.categoryId === target || p.categoryId === categoryId)
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await apiClient<{ data: BackendCategory[] }>('/category')
    if (res?.data && res.data.length > 0) {
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
