import { useMemo } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { useProducts } from '../../features/products/hooks/useProducts.ts'
import { ProductCard } from '../product/ProductCard.tsx'
import { Button } from '../ui/Button.tsx'

export function CuratedProductsSection() {
  const { data: products, isLoading, isError } = useProducts({ limit: 40 })

  // Select a curated secondary set of products distinct from the initial bestsellers
  const curatedProducts = useMemo(() => {
    if (!products || products.length === 0) return []
    // If we have enough products, show from index 8 onwards up to 8 items, or fallback gracefully
    if (products.length > 8) {
      return products.slice(8, 16)
    }
    // If <= 8 products, show up to 4 items or all products
    return products.slice(0, 8)
  }, [products])

  if (isError || (!isLoading && curatedProducts.length === 0)) {
    return null
  }

  return (
    <section aria-labelledby="curated-products-title" className="space-y-6 font-sans" dir="rtl">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>تشكيلة حصرية</span>
          </div>
          <h2 id="curated-products-title" className="text-xl sm:text-2xl font-black text-gray-900">
            منتجات مميزة اخترناها لكِ
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            أرقى منتجات العناية والعطور لتكملة إطلالتك اليومية
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors"
        >
          <span>تصفح جميع المنتجات</span>
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square w-full rounded-2xl bg-gray-100 animate-pulse border border-gray-100"
            />
          ))}
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && curatedProducts.length > 0 && (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {curatedProducts.map((product) => (
            <ProductCard key={`curated-${product.id}`} product={product} />
          ))}
        </div>
      )}

      {/* Bottom CTA Button */}
      <div className="pt-4 flex justify-center">
        <Link to="/products">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 py-3 text-xs sm:text-sm font-bold shadow-xs hover:border-brand-primary hover:bg-brand-soft-pink/30 cursor-pointer"
          >
            <span>استعراض كافة منتجات المتجر</span>
            <ArrowLeft className="ms-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}

