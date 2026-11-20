import { Home, LayoutGrid, ShoppingBag } from 'lucide-react'
import { NavLink } from 'react-router'
import { useCartStore, useCartTotalQuantity } from '../../features/cart/cart.store.ts'

export function MobileBottomNav() {
  const totalQuantity = useCartTotalQuantity()
  const openCart = useCartStore((state) => state.openCart)

  return (
    <nav
      aria-label="شريط التنقل السفلي للجوال"
      className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/70 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] py-2 px-6 font-sans"
      dir="rtl"
    >
      <div className="grid grid-cols-3 items-center justify-around text-center">
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
          <span className="text-[11px] mt-1">الرئيسية</span>
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
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[11px] mt-1">المنتجات</span>
        </NavLink>

        {/* 3. Cart Trigger */}
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
          <span className="text-[11px] mt-1 font-bold">السلة</span>
        </button>
      </div>
    </nav>
  )
}


