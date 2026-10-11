import type { Banner, Category, Product } from '../../../types/index.ts'
import { MOCK_BANNERS } from '../data/banners.mock.ts'
import { MOCK_CATEGORIES } from '../data/categories.mock.ts'
import { MOCK_PRODUCTS } from '../data/products.mock.ts'

export async function getProducts(): Promise<Product[]> {
  return MOCK_PRODUCTS
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = MOCK_PRODUCTS.find((p) => p.id === id)
  return product ?? null
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return MOCK_PRODUCTS.filter((p) => p.isFeatured)
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  return MOCK_PRODUCTS.filter((p) => p.categoryId === categoryId)
}

export async function getCategories(): Promise<Category[]> {
  return MOCK_CATEGORIES
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const category = MOCK_CATEGORIES.find((c) => c.id === id)
  return category ?? null
}

export async function getBanners(): Promise<Banner[]> {
  return MOCK_BANNERS
}
