import { useQuery } from '@tanstack/react-query'
import { getBanners } from '../api/products.api.ts'
import { bannerKeys } from '../queries/product-keys.ts'

export function useBanners() {
  return useQuery({
    queryKey: bannerKeys.all,
    queryFn: getBanners,
  })
}
