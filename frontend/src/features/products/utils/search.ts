import type { Product } from '../../../types/index.ts'

/**
 * Normalizes Arabic text for tolerant search matching:
 * - Trims whitespace and lowercases
 * - Unifies alef variations (أ, إ, آ -> ا)
 * - Unifies taa marbuta (ة -> ه)
 * - Unifies alef maksura (ى -> ي)
 * - Removes Arabic diacritics (tashkeel)
 */
export function normalizeArabic(text: string): string {
  if (!text) return ''
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/\s+/g, ' ')
}

/**
 * Filters a list of products by a search query against product name and description.
 * Returns a new array without mutating the original.
 */
export function filterProductsByQuery(products: Product[], query: string): Product[] {
  const trimmed = query.trim()
  if (!trimmed) return products

  const normalizedQuery = normalizeArabic(trimmed)
  if (!normalizedQuery) return products

  return products.filter((product) => {
    const normalizedName = normalizeArabic(product.name)
    const normalizedDesc = normalizeArabic(product.description || '')
    return normalizedName.includes(normalizedQuery) || normalizedDesc.includes(normalizedQuery)
  })
}
