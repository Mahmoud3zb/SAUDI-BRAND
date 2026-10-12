import { useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '../../components/ui/Badge.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { formatEGP } from '../../lib/formatters.ts'
import { useCartStore, useCartSubtotal, useCartTotalQuantity } from './cart.store.ts'

const FREE_SHIPPING_THRESHOLD = 500

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen)
  const items = useCartStore((state) => state.items)
  const closeCart = useCartStore((state) => state.closeCart)
  const clearCart = useCartStore((state) => state.clearCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  const totalQuantity = useCartTotalQuantity()
  const subtotal = useCartSubtotal()

  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeCart])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      closeButtonRef.current?.focus()
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-heading"
      className={`fixed inset-0 z-50 transition-visibility duration-300 ${
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
    >
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Panel (slides from left side in RTL / left edge) */}
      <div
        className={`fixed inset-y-0 left-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:border-e border-gray-100 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-brand-primary" aria-hidden="true" />
            <h2 id="cart-drawer-heading" className="text-base font-bold text-gray-900">
              سلة المشتريات
            </h2>
            <Badge variant="primary" size="sm" className="font-bold">
              {totalQuantity}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors cursor-pointer"
                title="تفريغ سلة المشتريات"
                aria-label="تفريغ جميع منتجات السلة"
              >
                مسح الكل
              </button>
            )}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeCart}
              aria-label="إغلاق سلة المشتريات"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Indicator (when items exist) */}
        {items.length > 0 && (
          <div className="bg-brand-soft-pink/60 px-5 py-3 border-b border-brand-soft-pink">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-secondary">
              <Truck className="h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
              {remainingForFreeShipping === 0 ? (
                <span className="flex items-center gap-1">
                  <span>تهانينا! لقد حصلتِ على شحن مجاني لكافة المحافظات</span>
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                </span>
              ) : (
                <span>
                  أضيفي منتجات بقيمة{' '}
                  <span className="text-brand-primary font-black">
                    {formatEGP(remainingForFreeShipping)}
                  </span>{' '}
                  للحصول على شحن مجاني
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/80">
              <div
                className="h-full rounded-full bg-brand-primary transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Body / Items list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-gray-100">
          {items.length === 0 ? (
            /* Empty State */
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft-pink text-brand-primary mb-4">
                <ShoppingBag className="h-10 w-10 stroke-[1.4]" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">سلتكِ فارغة حالياً</h3>
              <p className="max-w-xs text-xs text-gray-500 leading-relaxed mb-6">
                لم تقومي بإضافة أي منتجات إلى سلتكِ بعد. استكشفي تشكيلتنا الفاخرة واختاري ما
                يناسبكِ.
              </p>
              <Button variant="primary" size="md" onClick={closeCart} className="rounded-full px-6">
                ابدأي التسوق الآن
              </Button>
            </div>
          ) : (
            /* Populated Items */
            items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
                {/* Product Thumbnail */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-brand-soft-pink/30">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-brand-primary/40">
                      <Package className="h-8 w-8 stroke-[1.2]" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Info & Quantity controls */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="line-clamp-1 text-sm font-bold text-gray-900">
                        {product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="إزالة المنتج"
                        aria-label={`إزالة ${product.name} من السلة`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    {product.stockStatus === 'low_stock' && (
                      <span className="mt-0.5 inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        كمية محدودة
                      </span>
                    )}

                    <p className="mt-1 text-xs font-extrabold text-brand-primary">
                      {formatEGP(product.price)}
                    </p>
                  </div>

                  {/* Quantity Modifier */}
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50/70 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-gray-600 shadow-xs hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label={`تقليل كمية ${product.name}`}
                      >
                        <Minus className="h-3 w-3" aria-hidden="true" />
                      </button>
                      <span className="min-w-7 text-center text-xs font-bold text-gray-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-gray-600 shadow-xs hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label={`زيادة كمية ${product.name}`}
                      >
                        <Plus className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <span className="text-xs font-bold text-gray-700">
                      {formatEGP(product.price * quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer (when items exist) */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 bg-white p-5 shadow-inner space-y-3">
            {/* Subtotal row */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-600">المجموع الفرعي:</span>
              <span className="text-lg font-black text-brand-primary">{formatEGP(subtotal)}</span>
            </div>

            <p className="text-[11px] text-gray-400">
              * الأسعار تشمل ضريبة القيمة المضافة. مصاريف الشحن يتم تحديدها عند إتمام الطلب.
            </p>

            {/* Checkout Action */}
            <div className="pt-1 flex flex-col gap-2">
              <Link to="/#checkout" onClick={closeCart} className="w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>متابعة الشراء (إتمام الطلب)</span>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={closeCart}
                className="w-full text-xs text-gray-500 hover:text-brand-primary"
              >
                متابعة التسوق
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
