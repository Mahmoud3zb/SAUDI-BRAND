import { useQuery } from '@tanstack/react-query'
import { getCategories, getCategoryById } from '../api/products.api.ts'
import { categoryKeys } from '../queries/product-keys.ts'

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: getCategories,
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => getCategoryById(id),
    enabled: Boolean(id),
  })
}
