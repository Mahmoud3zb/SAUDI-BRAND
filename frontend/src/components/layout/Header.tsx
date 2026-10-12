import { useState } from 'react'
import { Search, ShoppingBag, User } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '../ui/Button.tsx'
import { Input } from '../ui/Input.tsx'

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="border-b border-gray-100 bg-white py-2.5 sm:py-3.5">
      <div className="mx-auto flex max-w-7xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            aria-label="سعودي براند - الصفحة الرئيسية"
          >
            <img
              src="/new logo.png"
              alt="سعودي براند | SAUDI BRAND"
              className="h-12 sm:h-16 w-auto object-contain transition-transform hover:scale-105"
            />
          </Link>

          {/* Mobile action buttons */}
          <div className="flex items-center gap-2 sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              aria-label="حسابي"
              className="p-2 text-gray-700 hover:text-brand-primary"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="سلة المشتريات (فارغة)"
              className="relative p-2 text-gray-700 hover:text-brand-primary"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white">
                0
              </span>
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="w-full sm:max-w-md md:max-w-lg">
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن منتجك المفضل..."
            startIcon={<Search className="h-4 w-4" aria-hidden="true" />}
            aria-label="بحث في المنتجات"
          />
        </div>

        {/* Desktop action buttons */}
        <div className="hidden items-center gap-3 sm:flex">
          <Button
            variant="ghost"
            size="md"
            leftIcon={<User className="h-4 w-4" aria-hidden="true" />}
            aria-label="تسجيل الدخول إلى حسابي"
          >
            حسابي
          </Button>

          <Button
            variant="secondary"
            size="md"
            aria-label="سلة المشتريات: 0 منتجات"
            className="relative"
            leftIcon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />}
          >
            <span>السلة</span>
            <span className="ms-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1 text-[11px] font-bold text-white">
              0
            </span>
          </Button>
        </div>
      </div>
    </header>
  )
}
