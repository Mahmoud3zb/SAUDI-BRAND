import { AlertCircle, RefreshCw } from 'lucide-react'
import { useFeaturedProducts } from '../../features/products/hooks/useProducts.ts'
import { ProductCard } from '../product/ProductCard.tsx'
import { Button } from '../ui/Button.tsx'

export function BestSellersSection() {
  const { data: products, isLoading, isError, refetch } = useFeaturedProducts()

  return (
    <section aria-labelledby="featured-products-title" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="featured-products-title" className="text-xl font-bold text-gray-900 sm:text-2xl">
            مختاراتنا الأكثر طلباً
          </h2>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            تشكيلة مختارة بعناية من أفضل منتجات العناية والعطور
          </p>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square w-full rounded-2xl bg-gray-100 animate-pulse border border-gray-100"
            />
          ))}
        </div>
      )}

      {/* Error State with Recovery Action */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 p-8 text-center">
          <AlertCircle className="mb-2 h-8 w-8 text-red-500" aria-hidden="true" />
          <p className="text-sm font-semibold text-gray-800">تعذر تحميل المنتجات المميزة</p>
          <p className="mt-1 text-xs text-gray-500">يرجى المحاولة مرة أخرى لاحقاً</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
            className="mt-4"
          >
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && products && products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          لا توجد منتجات معروضة حالياً في هذا القسم.
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !isError && products && products.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
