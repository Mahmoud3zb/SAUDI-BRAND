import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  PackageOpen,
  RefreshCw,
  Search,
  SearchX,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { ProductCard } from '../../../components/product/ProductCard.tsx'
import { Button } from '../../../components/ui/Button.tsx'
import { Input } from '../../../components/ui/Input.tsx'
import { useCategories } from '../hooks/useCategories.ts'
import { useProducts } from '../hooks/useProducts.ts'
import { filterProductsByQuery } from '../utils/search.ts'

export type SortOption = 'default' | 'price_asc' | 'price_desc' | 'name_asc'
const VALID_SORTS: readonly SortOption[] = ['default', 'price_asc', 'price_desc', 'name_asc']

export function CatalogPage() {
  const { categorySlug } = useParams<{ categorySlug?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const urlQuery = searchParams.get('q') || ''
  const rawSort = searchParams.get('sort')
  const sortBy: SortOption = VALID_SORTS.includes(rawSort as SortOption)
    ? (rawSort as SortOption)
    : 'default'

  // Local state for the in-page search input with back/forward sync
  const [localSearchInput, setLocalSearchInput] = useState(urlQuery)
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery)

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery)
    setLocalSearchInput(urlQuery)
  }

  // Scroll to top smoothly whenever category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [categorySlug])

  const {
    data: products,
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useProducts()

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useCategories()

  const isLoading = isProductsLoading || isCategoriesLoading
  const isError = isProductsError || isCategoriesError

  // Identify current category if a categorySlug is present in the route
  const currentCategory = useMemo(() => {
    if (!categorySlug || !categories) return null
    return categories.find((c) => c.slug === categorySlug || c.id === categorySlug) || null
  }, [categorySlug, categories])

  // Check if an unknown category slug was passed (never trigger on loading or error)
  const isInvalidCategory = Boolean(
    categorySlug && !isCategoriesLoading && !isCategoriesError && categories && !currentCategory,
  )

  // Filter products by category, then by search query, then sort
  const processedProducts = useMemo(() => {
    if (!products) return []

    // 1. Category filter
    let list = products
    if (currentCategory) {
      list = list.filter(
        (p) => p.categoryId === currentCategory.id || p.categoryId === currentCategory.slug,
      )
    }

    // 2. Search query filter
    if (urlQuery.trim()) {
      list = filterProductsByQuery(list, urlQuery)
    }

    // 3. Stable sorting (does not mutate original array, with deterministic price tie-breaker)
    const sorted = [...list]
    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => {
          if (a.price !== b.price) return a.price - b.price
          return a.name.localeCompare(b.name, 'ar')
        })
      case 'price_desc':
        return sorted.sort((a, b) => {
          if (a.price !== b.price) return b.price - a.price
          return a.name.localeCompare(b.name, 'ar')
        })
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ar'))
      case 'default':
      default:
        return sorted
    }
  }, [products, currentCategory, urlQuery, sortBy])

  // Update URL search parameter
  const handleApplySearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const next = new URLSearchParams(searchParams)
    const trimmed = localSearchInput.trim()
    if (trimmed) {
      next.set('q', trimmed)
    } else {
      next.delete('q')
    }
    setSearchParams(next)
  }

  // Clear search parameter from URL
  const handleClearSearch = () => {
    setLocalSearchInput('')
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    setSearchParams(next)
  }

  // Handle sort selection
  const handleSortChange = (newSort: string) => {
    const next = new URLSearchParams(searchParams)
    if (newSort === 'default') {
      next.delete('sort')
    } else {
      next.set('sort', newSort)
    }
    setSearchParams(next)
  }

  // Build target link preserving query and sort
  const buildCategoryLink = (slug?: string) => {
    const base = slug ? `/category/${slug}` : '/products'
    const params = new URLSearchParams()
    if (urlQuery) params.set('q', urlQuery)
    if (sortBy !== 'default') params.set('sort', sortBy)
    const qs = params.toString()
    return qs ? `${base}?${qs}` : base
  }

  const pageTitle = currentCategory
    ? currentCategory.name
    : urlQuery
      ? `نتائج البحث عن "${urlQuery}"`
      : 'جميع المنتجات'

  return (
    <div className="w-full bg-brand-background min-h-[calc(100vh-160px)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb Navigation & Back Link */}
        <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-brand-primary transition-colors">
            الرئيسية
          </Link>
          <span className="text-gray-300">/</span>
          {currentCategory ? (
            <>
              <Link to="/products" className="hover:text-brand-primary transition-colors">
                المنتجات
              </Link>
              <span className="text-gray-300">/</span>
              <span className="font-semibold text-gray-800">{currentCategory.name}</span>
            </>
          ) : (
            <span className="font-semibold text-gray-800">المنتجات</span>
          )}
        </nav>

        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-gray-200/60 pb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 sm:text-3xl tracking-tight">
              {pageTitle}
            </h1>
            {currentCategory?.description && !urlQuery && (
              <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
                {currentCategory.description}
              </p>
            )}
            {urlQuery && (
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                تم العثور على{' '}
                <span className="font-bold text-brand-primary">{processedProducts.length}</span>{' '}
                منتج
              </p>
            )}
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors"
          >
            <span>العودة للمتجر</span>
            <ArrowRight className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
          </Link>
        </div>

        {/* Invalid Category State */}
        {isInvalidCategory && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-xs">
            <PackageOpen className="h-14 w-14 text-brand-primary/40 mb-4 stroke-[1.2]" />
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">القسم غير موجود</h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-md">
              عذراً، لم نتمكن من العثور على القسم المطلوب. ربما تم نقله أو أن الرابط غير صحيح.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => navigate('/products')} variant="primary" size="md">
                تصفح جميع المنتجات
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" size="md">
                العودة للرئيسية
              </Button>
            </div>
          </div>
        )}

        {!isInvalidCategory && (
          <>
            {/* Filter Bar: Category Tabs, Search Input & Sort Selector */}
            <div className="space-y-4">
              {/* Category Filter Tabs */}
              <div
                role="tablist"
                aria-label="أقسام المنتجات"
                className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
              >
                <Link
                  to={buildCategoryLink(undefined)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all duration-150 ${
                    !categorySlug
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-brand-soft-pink/50 hover:text-brand-primary border border-gray-200'
                  }`}
                >
                  الكل ({products?.length ?? 0})
                </Link>

                {categories?.map((cat) => {
                  const isActive = categorySlug === cat.slug || categorySlug === cat.id
                  return (
                    <Link
                      key={cat.id}
                      to={buildCategoryLink(cat.slug)}
                      className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-primary text-white shadow-sm'
                          : 'bg-white text-gray-700 hover:bg-brand-soft-pink/50 hover:text-brand-primary border border-gray-200'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  )
                })}
              </div>

              {/* Controls Bar: In-page Search & Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white p-3 sm:p-4 border border-gray-100 shadow-xs">
                {/* Search in Catalog */}
                <form
                  onSubmit={handleApplySearch}
                  className="flex items-center gap-2 w-full sm:max-w-md"
                >
                  <div className="relative flex-1">
                    <Input
                      type="search"
                      value={localSearchInput}
                      onChange={(e) => setLocalSearchInput(e.target.value)}
                      placeholder="ابحث في هذه المنتجات..."
                      startIcon={<Search className="h-4 w-4 text-gray-400" aria-hidden="true" />}
                      endIcon={
                        localSearchInput ? (
                          <button
                            type="button"
                            onClick={handleClearSearch}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer p-1"
                            aria-label="مسح البحث"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        ) : null
                      }
                      className="text-xs py-2 bg-gray-50/60 border-gray-200"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    className="shrink-0 px-3 py-2"
                  >
                    بحث
                  </Button>
                </form>

                {/* Sort Selector */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                    <span>الترتيب:</span>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    aria-label="ترتيب المنتجات"
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
                  >
                    <option value="default">الافتراضي (المميزة)</option>
                    <option value="price_asc">السعر: من الأقل للأعلى</option>
                    <option value="price_desc">السعر: من الأعلى للأقل</option>
                    <option value="name_asc">الاسم: أبجدياً</option>
                  </select>
                </div>
              </div>

              {/* Active Search Pill / Filter indicator */}
              {urlQuery && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-gray-500">تصفية نشطة:</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft-pink px-3 py-1 text-xs font-semibold text-brand-primary">
                    بحث: «{urlQuery}»
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="hover:text-brand-secondary cursor-pointer focus:outline-none"
                      aria-label="إزالة تصفية البحث"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </span>
                </div>
              )}
            </div>

            {/* Loading Skeleton Grid */}
            {isLoading && (
              <div
                aria-busy="true"
                aria-label="جاري تحميل المنتجات"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-2"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 space-y-3 animate-pulse"
                  >
                    <div className="aspect-square w-full rounded-xl bg-gray-100" />
                    <div className="h-4 w-3/4 rounded-md bg-gray-100" />
                    <div className="h-3 w-1/2 rounded-md bg-gray-100" />
                    <div className="mt-4 flex items-center justify-between pt-2">
                      <div className="h-5 w-16 rounded-md bg-gray-100" />
                      <div className="h-8 w-20 rounded-xl bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Query Error State */}
            {isError && (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50/50 p-10 text-center">
                <AlertCircle className="mb-3 h-10 w-10 text-red-500" aria-hidden="true" />
                <h2 className="text-base font-bold text-gray-900">تعذر تحميل بيانات المنتجات</h2>
                <p className="mt-1 text-xs text-gray-500">
                  حدث خطأ أثناء جلب المنتجات. يرجى المحاولة مرة أخرى.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetchProducts()
                    refetchCategories()
                  }}
                  leftIcon={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
                  className="mt-4"
                >
                  إعادة المحاولة
                </Button>
              </div>
            )}

            {/* Empty State: No search matches */}
            {!isLoading && !isError && urlQuery && processedProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-white p-12 text-center shadow-xs">
                <SearchX className="h-12 w-12 text-gray-300 mb-3 stroke-[1.4]" />
                <h2 className="text-base font-bold text-gray-900">
                  لم يتم العثور على نتائج تطابق «{urlQuery}»
                </h2>
                <p className="mt-1.5 text-xs text-gray-500 max-w-sm">
                  تأكدي من كتابة الكلمات بشكل صحيح، أو جربي البحث بكلمات أخرى أو تصفح الأقسام
                  مباشرة.
                </p>
                <div className="mt-5 flex gap-2">
                  <Button onClick={handleClearSearch} variant="secondary" size="sm">
                    مسح البحث وعرض المنتجات
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State: Category has no products */}
            {!isLoading && !isError && !urlQuery && processedProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-white p-12 text-center shadow-xs">
                <PackageOpen className="h-12 w-12 text-gray-300 mb-3 stroke-[1.4]" />
                <h2 className="text-base font-bold text-gray-900">
                  {currentCategory
                    ? `لا توجد منتجات معروضة حالياً في قسم "${currentCategory.name}"`
                    : 'لا توجد منتجات معروضة حالياً'}
                </h2>
                <p className="mt-1.5 text-xs text-gray-500 max-w-sm">
                  سيتم توفير تشكيلة جديدة قريباً في هذا القسم.
                </p>
                <div className="mt-5">
                  <Button onClick={() => navigate('/products')} variant="outline" size="sm">
                    عرض جميع المنتجات
                  </Button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !isError && processedProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
                {processedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
