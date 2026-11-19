import { useMemo, useState } from 'react'
import { AlertCircle, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { useCategories } from '../../features/products/hooks/useCategories.ts'
import { useProducts } from '../../features/products/hooks/useProducts.ts'
import { ProductCard } from '../product/ProductCard.tsx'
import { Button } from '../ui/Button.tsx'

export function BestSellersSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const { data: categories } = useCategories()
  const { data: products, isLoading, isError, refetch } = useProducts({ limit: 40 })

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (!products) return []
    if (selectedCategory === 'all') {
      return products.slice(0, 8)
    }
    const targetCat = categories?.find((c) => c.slug === selectedCategory)
    return products
      .filter((p) => {
        return p.categoryId === selectedCategory || (targetCat && p.categoryId === targetCat.id)
      })
      .slice(0, 8)
  }, [products, selectedCategory, categories])

  return (
    <section aria-labelledby="featured-products-title" className="space-y-6 font-sans" dir="rtl">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>المجموعة الأكثر تميزاً</span>
          </div>
          <h2 id="featured-products-title" className="text-xl sm:text-2xl font-black text-gray-900">
            مختاراتنا الأكثر طلباً
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            تشكيلة فاخرة نالت إعجاب عملائنا في مختلف محافظات مصر
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors"
        >
          <span>عرض الكتالوج بالكامل</span>
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-brand-primary/30'
          }`}
        >
          جميع المنتجات
        </button>

        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
              selectedCategory === cat.slug
                ? 'bg-brand-primary text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-brand-primary/30'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Loading Skeleton State */}
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

      {/* Error State with Recovery Action */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50/50 p-8 text-center">
          <AlertCircle className="mb-2 h-8 w-8 text-red-500" aria-hidden="true" />
          <p className="text-sm font-semibold text-gray-800">تعذر تحميل المنتجات حالياً</p>
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
      {!isLoading && !isError && filteredProducts.length === 0 && (
        <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center text-xs text-gray-500">
          لا توجد منتجات مضافة في هذا القسم حالياً، استكشفي باقي الأقسام.
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !isError && filteredProducts.length > 0 && (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6 animate-in fade-in duration-300">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
