import { useRef, useState } from 'react'
import { Check, Package, ShoppingBag, Star } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useCartStore } from '../../features/cart/cart.store.ts'
import { formatEGP } from '../../lib/formatters.ts'
import type { Product } from '../../types/index.ts'
import { Badge } from '../ui/Badge.tsx'
import { Button } from '../ui/Button.tsx'

export interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const isProcessingRef = useRef(false)

  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)

  const hasDiscount =
    typeof product.originalPrice === 'number' && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const isOutOfStock = product.stockStatus === 'out_of_stock'
  const isLowStock = product.stockStatus === 'low_stock'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()

    // Prevent duplicate triggers from rapid consecutive clicks
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    setTimeout(() => {
      isProcessingRef.current = false
    }, 400)

    if (isOutOfStock) {
      toast.error(`عذراً، المنتج "${product.name}" غير متوفر حالياً`)
      return
    }

    const success = addItem(product)
    if (success) {
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 1200)

      toast.success(`تمت إضافة "${product.name}" إلى السلة`, {
        action: {
          label: 'عرض السلة',
          onClick: () => openCart(),
        },
      })

      onAddToCart?.(product)
    } else {
      toast.error(`تعذر إضافة "${product.name}" إلى السلة`)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button')) return
    navigate(`/products/${product.id}`)
  }

  return (
    <article
      onClick={handleCardClick}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-200 hover:border-brand-soft-pink hover:shadow-md"
    >
      {/* Product Image / Visual Placeholder */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-brand-soft-pink/40 to-white">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-6 text-brand-primary/30">
            <Package className="h-16 w-16 stroke-[1.2]" aria-hidden="true" />
          </div>
        )}

        {/* Top Badges: Discount & Stock */}
        <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          {hasDiscount ? (
            <Badge variant="primary" size="sm">
              خصم {discountPercent}%
            </Badge>
          ) : (
            <span />
          )}

          {isOutOfStock && (
            <Badge variant="neutral" size="sm">
              نفدت الكمية
            </Badge>
          )}

          {isLowStock && (
            <Badge variant="gold" size="sm">
              كمية محدودة
            </Badge>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4 text-start">
        {/* Rating Display */}
        {product.rating && (
          <div className="mb-1.5 flex items-center gap-1 text-xs text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-semibold">{product.rating.score.toFixed(1)}</span>
            <span className="text-[11px] text-gray-400">({product.rating.count})</span>
          </div>
        )}

        {/* Product Title */}
        <Link
          to={`/products/${product.id}`}
          className="focus-visible:outline-none focus-visible:underline"
        >
          <h3 className="line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-brand-primary">
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Price & Action Container */}
        <div className="mt-auto pt-3">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-base font-extrabold text-brand-primary">
              {formatEGP(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatEGP(product.originalPrice!)}
              </span>
            )}
          </div>

          <Button
            variant={isAdded ? 'secondary' : 'primary'}
            size="sm"
            className="w-full transition-all"
            disabled={isOutOfStock}
            leftIcon={
              isAdded ? (
                <Check className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
              ) : (
                <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
              )
            }
            onClick={handleAddToCart}
            aria-live="polite"
            aria-label={
              isOutOfStock
                ? `${product.name} غير متوفر`
                : isAdded
                  ? `تمت إضافة ${product.name} إلى السلة`
                  : `أضف ${product.name} إلى السلة`
            }
          >
            {isOutOfStock ? 'غير متوفر' : isAdded ? 'تمت الإضافة ✓' : 'أضف إلى السلة'}
          </Button>
        </div>
      </div>
    </article>
  )
}
