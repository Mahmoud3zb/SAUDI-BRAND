import { Home, MessageCircle, ShoppingBag, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router'
import { useCartStore, useCartTotalQuantity } from '../../features/cart/cart.store.ts'
import { STORE_WHATSAPP_INTL } from '../../features/checkout/constants/egypt-regions.ts'

export function MobileBottomNav() {
  const totalQuantity = useCartTotalQuantity()
  const openCart = useCartStore((state) => state.openCart)

  const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_INTL}?text=${encodeURIComponent(
    'مرحباً، أود التواصل مع خدمة العملاء والطلب من سعودي براند ✨'
  )}`

  return (
    <nav
      aria-label="شريط التنقل السفلي للجوال"
      className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/70 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] py-1.5 px-4 font-sans"
      dir="rtl"
    >
      <div className="grid grid-cols-4 items-center justify-around text-center">
        {/* 1. Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-brand-primary font-bold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">الرئيسية</span>
        </NavLink>

        {/* 2. Products / Catalog */}
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-brand-primary font-bold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">المنتجات</span>
        </NavLink>

        {/* 3. WhatsApp Direct Chat */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <div className="relative">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -top-1 -end-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <span className="text-[10px] mt-0.5 font-bold">الواتساب</span>
        </a>

        {/* 4. Cart Trigger */}
        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center justify-center py-1 text-gray-700 hover:text-brand-primary transition-colors cursor-pointer"
          aria-label={`سلة المشتريات (${totalQuantity} منتجات)`}
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1.5 -end-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-black text-white shadow-xs animate-in zoom-in-75">
                {totalQuantity}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-bold">السلة</span>
        </button>
      </div>
    </nav>
  )
}

