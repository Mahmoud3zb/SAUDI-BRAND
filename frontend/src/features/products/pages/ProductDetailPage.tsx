import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronLeft,
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Star,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { ProductCard } from '../../../components/product/ProductCard.tsx'
import { Badge } from '../../../components/ui/Badge.tsx'
import { Button } from '../../../components/ui/Button.tsx'
import { useCartStore } from '../../cart/cart.store.ts'
import { useCategories } from '../hooks/useCategories.ts'
import { useProduct, useProductsByCategory } from '../hooks/useProducts.ts'
import { formatEGP } from '../../../lib/formatters.ts'

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const isProcessingRef = useRef(false)

  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)

  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
    refetch: refetchProduct,
  } = useProduct(productId ?? '')

  const { data: categories } = useCategories()

  const [prevProductId, setPrevProductId] = useState(productId)

  if (productId !== prevProductId) {
    setPrevProductId(productId)
    setQuantity(1)
    setImageError(false)
    setIsAdded(false)
  }

  // Scroll to top on navigation to new product
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [productId])

  // Update document title for SEO & accessibility
  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} | سعودي براند`
    } else {
      document.title = 'تفاصيل المنتج | سعودي براند'
    }
  }, [product?.name])

  // Related products from the same category
  const { data: categoryProducts, isLoading: isRelatedLoading } = useProductsByCategory(
    product?.categoryId ?? '',
  )

  const relatedProducts = useMemo(() => {
    if (!categoryProducts || !product) return []
    return categoryProducts.filter((p) => p.id !== product.id).slice(0, 4)
  }, [categoryProducts, product])

  // Find category details for breadcrumb
  const currentCategory = useMemo(() => {
    if (!product || !categories) return null
    return (
      categories.find((c) => c.id === product.categoryId || c.slug === product.categoryId) ?? null
    )
  }, [product, categories])

  const isOutOfStock = product?.stockStatus === 'out_of_stock'
  const isLowStock = product?.stockStatus === 'low_stock'

  const hasDiscount =
    Boolean(product?.originalPrice) &&
    typeof product?.originalPrice === 'number' &&
    product.originalPrice > (product?.price ?? 0)

  const discountPercent =
    hasDiscount && product?.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1)
  }

  const handleAddToCart = () => {
    if (!product) return

    if (isProcessingRef.current) return
    isProcessingRef.current = true
    setTimeout(() => {
      isProcessingRef.current = false
    }, 400)

    if (isOutOfStock) {
      toast.error(`عذراً، المنتج "${product.name}" غير متوفر حالياً`)
      return
    }

    if (quantity < 1) {
      toast.error('يجب اختيار كمية صالحة (1 على الأقل)')
      return
    }

    const success = addItem(product, quantity)
    if (success) {
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 1200)

      const quantityText = quantity > 1 ? `(${quantity}) من ` : ''
      toast.success(`تمت إضافة ${quantityText}"${product.name}" إلى السلة`, {
        action: {
          label: 'عرض السلة',
          onClick: () => openCart(),
        },
      })
    } else {
      toast.error(`تعذر إضافة "${product.name}" إلى السلة`)
    }
  }

  // 1. Loading State
  if (isProductLoading) {
    return (
      <main className="min-h-[60vh] bg-brand-background py-8 sm:py-12" aria-busy="true">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Skeleton */}
          <div className="mb-8 flex items-center gap-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-4 text-gray-300">/</div>
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-4 text-gray-300">/</div>
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="aspect-square w-full animate-pulse rounded-3xl bg-gray-200" />
            <div className="flex flex-col space-y-4">
              <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
              <div className="h-10 w-3/4 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-20 w-full animate-pulse rounded-xl bg-gray-200" />
              <div className="h-12 w-48 animate-pulse rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 2. Query Error State
  if (isProductError) {
    return (
      <main className="min-h-[60vh] bg-brand-background py-16">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">حدث خطأ أثناء تحميل بيانات المنتج</h1>
          <p className="mt-2 text-sm text-gray-500">
            يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
              onClick={() => refetchProduct()}
            >
              إعادة المحاولة
            </Button>
            <Button variant="secondary" size="md" onClick={() => navigate('/products')}>
              العودة للمتجر
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // 3. Not Found State (Invalid or Missing Product ID)
  if (!product) {
    return (
      <main className="min-h-[60vh] bg-brand-background py-16">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-soft-pink text-brand-primary">
            <Package className="h-10 w-10" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">المنتج غير موجود</h1>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            عذراً، لم نتمكن من العثور على المنتج المطلوب. ربما تم حذفه أو أن الرابط غير صحيح.
          </p>
          <div className="mt-8">
            <Link to="/products">
              <Button
                variant="primary"
                size="md"
                leftIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                تصفح جميع المنتجات
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // 4. Successful Product Details Render
  return (
    <main className="bg-brand-background py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="مسار التنقل" className="mb-6 sm:mb-8 text-sm">
          <ol className="flex flex-wrap items-center gap-2 text-gray-500">
            <li>
              <Link
                to="/"
                className="transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:underline"
              >
                الرئيسية
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-300">
              <ChevronLeft className="h-4 w-4" />
            </li>
            {currentCategory ? (
              <li>
                <Link
                  to={`/category/${currentCategory.slug}`}
                  className="transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:underline"
                >
                  {currentCategory.name}
                </Link>
              </li>
            ) : (
              <li>
                <Link
                  to="/products"
                  className="transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:underline"
                >
                  المنتجات
                </Link>
              </li>
            )}
            <li aria-hidden="true" className="text-gray-300">
              <ChevronLeft className="h-4 w-4" />
            </li>
            <li className="font-semibold text-gray-900" aria-current="page">
              <span className="line-clamp-1">{product.name}</span>
            </li>
          </ol>
        </nav>

        {/* Main Product Section: Two Columns (Gallery / Info) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery Column */}
          <div className="relative">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-brand-soft-pink bg-white shadow-sm">
              {product.imageUrl && !imageError ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  priority-level="high"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-soft-pink/30 text-brand-primary/40">
                  <Package className="h-24 w-24 stroke-[1.2]" aria-hidden="true" />
                </div>
              )}

              {/* Floating Status Badges */}
              <div className="absolute top-4 start-4 flex flex-col gap-2 pointer-events-none">
                {hasDiscount && (
                  <Badge variant="primary" size="md">
                    خصم {discountPercent}%
                  </Badge>
                )}
                {isOutOfStock && (
                  <Badge variant="neutral" size="md">
                    نفدت الكمية
                  </Badge>
                )}
                {isLowStock && (
                  <Badge variant="gold" size="md">
                    كمية محدودة
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Product Information Column */}
          <div className="flex flex-col text-start">
            {/* Category Tag */}
            {currentCategory && (
              <div className="mb-2">
                <Link
                  to={`/category/${currentCategory.slug}`}
                  className="inline-block text-xs font-bold tracking-wide text-brand-primary transition-opacity hover:opacity-80"
                >
                  {currentCategory.name}
                </Link>
              </div>
            )}

            {/* Product Title */}
            <h1 className="text-2xl font-black text-gray-900 sm:text-3xl leading-snug">
              {product.name}
            </h1>

            {/* Rating Display */}
            {product.rating && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-amber-500">
                <div className="flex items-center gap-0.5" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating!.score)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-100 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-800">{product.rating.score.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({product.rating.count} تقييم)</span>
              </div>
            )}

            {/* Pricing Section */}
            <div className="mt-5 flex items-baseline gap-3 rounded-2xl bg-white p-4 border border-gray-100 shadow-xs">
              <span className="text-2xl font-black text-brand-primary sm:text-3xl">
                {formatEGP(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm font-semibold text-gray-400 line-through sm:text-base">
                  {formatEGP(product.originalPrice!)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  تفاصيل المنتج
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-700 sm:text-base">
                  {product.description}
                </p>
              </div>
            )}

            {/* Stock Availability */}
            <div className="mt-6 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">حالة التوفر:</span>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  غير متوفر حالياً
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  كمية محدودة متبقية
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  متوفر في المخزون
                </span>
              )}
            </div>

            {/* Purchase Controls: Quantity Selector + Add to Cart Button */}
            <div className="mt-8 border-t border-gray-200/60 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Quantity Control */}
                <div className="flex items-center">
                  <span className="me-3 text-xs font-bold text-gray-500">الكمية:</span>
                  <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={isOutOfStock || quantity <= 1}
                      aria-label="تقليل الكمية"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-brand-soft-pink hover:text-brand-primary disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span
                      aria-live="polite"
                      className="w-12 text-center text-sm font-bold text-gray-900"
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={isOutOfStock}
                      aria-label="زيادة الكمية"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-brand-soft-pink hover:text-brand-primary disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Primary Add to Cart Button */}
                <div className="flex-1">
                  <Button
                    type="button"
                    variant={isAdded ? 'secondary' : 'primary'}
                    size="lg"
                    className="w-full text-base font-bold shadow-md transition-all active:scale-[0.99]"
                    disabled={isOutOfStock}
                    leftIcon={
                      isAdded ? (
                        <Check className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                      ) : (
                        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                      )
                    }
                    onClick={handleAddToCart}
                    aria-live="polite"
                    aria-label={
                      isOutOfStock
                        ? `${product.name} غير متوفر`
                        : isAdded
                          ? `تمت إضافة ${quantity} من ${product.name} إلى السلة`
                          : `أضف ${product.name} إلى السلة`
                    }
                  >
                    {isOutOfStock ? 'نفدت الكمية' : isAdded ? 'تمت الإضافة بنجاح ✓' : 'أضف للسلة'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {!isRelatedLoading && relatedProducts.length > 0 && (
          <section
            aria-labelledby="related-products-heading"
            className="mt-16 sm:mt-24 border-t border-gray-200/70 pt-10 sm:pt-14"
          >
            <div className="mb-6 sm:mb-8 flex items-center justify-between">
              <div>
                <h2
                  id="related-products-heading"
                  className="text-xl sm:text-2xl font-bold text-gray-900"
                >
                  منتجات ذات صلة
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  قد تنال إعجابك أيضاً من قسم {currentCategory?.name || ''}
                </p>
              </div>

              {currentCategory && (
                <Link
                  to={`/category/${currentCategory.slug}`}
                  className="text-xs sm:text-sm font-bold text-brand-primary transition-opacity hover:opacity-80"
                >
                  عرض المزيد
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
