import { useQuery } from '@tanstack/react-query'
import {
  getFeaturedProducts,
  getProductById,
  getProducts,
  getProductsByCategory,
} from '../api/products.api.ts'
import { productKeys } from '../queries/product-keys.ts'

export function useProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: getProducts,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: getFeaturedProducts,
  })
}

export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: productKeys.byCategory(categoryId),
    queryFn: () => getProductsByCategory(categoryId),
    enabled: Boolean(categoryId),
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: Boolean(id),
  })
}
