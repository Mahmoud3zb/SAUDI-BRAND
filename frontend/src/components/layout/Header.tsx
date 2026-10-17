import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Package, Search, SearchX, ShoppingBag, User, X } from 'lucide-react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { useCartStore, useCartTotalQuantity } from '../../features/cart/cart.store.ts'
import { useCategories } from '../../features/products/hooks/useCategories.ts'
import { useProducts } from '../../features/products/hooks/useProducts.ts'
import { filterProductsByQuery } from '../../features/products/utils/search.ts'
import { formatEGP } from '../../lib/formatters.ts'
import type { Product } from '../../types/index.ts'
import { Button } from '../ui/Button.tsx'
import { Input } from '../ui/Input.tsx'

interface SuggestionItemProps {
  product: Product
  categoryName?: string
  isHighlighted: boolean
  onClick: () => void
  onMouseEnter: () => void
}

function SuggestionItem({
  product,
  categoryName,
  isHighlighted,
  onClick,
  onMouseEnter,
}: SuggestionItemProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <li
      id={`suggestion-${product.id}`}
      role="option"
      aria-selected={isHighlighted}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors cursor-pointer border-b border-gray-50 last:border-b-0 ${
        isHighlighted ? 'bg-brand-soft-pink/60' : 'hover:bg-brand-soft-pink/30'
      }`}
    >
      {/* Product Image Thumbnail */}
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-brand-soft-pink/40">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-primary/40">
            <Package className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Info: Name & Category */}
      <div className="flex-1 min-w-0 text-start">
        <p className="truncate text-xs font-bold text-gray-900">{product.name}</p>
        {categoryName && (
          <p className="mt-0.5 truncate text-[11px] font-medium text-gray-400">{categoryName}</p>
        )}
      </div>

      {/* Price */}
      <div className="shrink-0 text-end">
        <span className="text-xs font-black text-brand-primary">{formatEGP(product.price)}</span>
      </div>
    </li>
  )
}

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') || ''

  const [searchQuery, setSearchQuery] = useState(urlQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery)
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Synchronize input with URL upon Back/Forward navigation
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery)
    setSearchQuery(urlQuery)
    setDebouncedQuery(urlQuery)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  // Debounce search query changes (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Click outside listener to close autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { data: allProducts, isLoading: isProductsLoading } = useProducts()
  const { data: categories } = useCategories()

  // Fast category lookup map
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>()
    categories?.forEach((cat) => {
      map.set(cat.id, cat.name)
      map.set(cat.slug, cat.name)
    })
    return map
  }, [categories])

  // Filter matching products using tolerant Arabic search utility
  const allMatches = useMemo(() => {
    const trimmed = debouncedQuery.trim()
    if (!trimmed || !allProducts) return []
    return filterProductsByQuery(allProducts, trimmed)
  }, [allProducts, debouncedQuery])

  // Maximum 5 suggestions for the dropdown
  const suggestions = useMemo(() => allMatches.slice(0, 5), [allMatches])
  const totalMatches = allMatches.length

  const totalQuantity = useCartTotalQuantity()
  const openCart = useCartStore((state) => state.openCart)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(false)
    setHighlightedIndex(-1)
    const trimmed = searchQuery.trim()
    const next = new URLSearchParams(searchParams)
    if (trimmed) {
      next.set('q', trimmed)
    } else {
      next.delete('q')
    }
    const qs = next.toString()
    navigate(`/products${qs ? `?${qs}` : ''}`)
  }

  const handleSelectProduct = (product: Product) => {
    setIsOpen(false)
    setHighlightedIndex(-1)
    setSearchQuery('')
    setDebouncedQuery('')
    navigate(`/products/${product.id}`)
  }

  const handleViewAllResults = () => {
    setIsOpen(false)
    setHighlightedIndex(-1)
    const trimmed = searchQuery.trim()
    const next = new URLSearchParams(searchParams)
    if (trimmed) {
      next.set('q', trimmed)
    } else {
      next.delete('q')
    }
    const qs = next.toString()
    navigate(`/products${qs ? `?${qs}` : ''}`)
  }

  const handleClear = () => {
    setSearchQuery('')
    setDebouncedQuery('')
    setIsOpen(false)
    setHighlightedIndex(-1)
    if (location.pathname.startsWith('/products') || location.pathname.startsWith('/category')) {
      const next = new URLSearchParams(searchParams)
      next.delete('q')
      const qs = next.toString()
      navigate(`${location.pathname}${qs ? `?${qs}` : ''}`)
    }
  }

  // Keyboard navigation inside combobox / dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(-1)
      return
    }

    if (!isOpen || suggestions.length === 0) return

    const maxIndex = suggestions.length // index `suggestions.length` is "View all results"

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < maxIndex ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex))
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault()
        handleSelectProduct(suggestions[highlightedIndex])
      } else if (highlightedIndex === suggestions.length) {
        e.preventDefault()
        handleViewAllResults()
      }
    }
  }

  const isDropdownVisible = isOpen && Boolean(searchQuery.trim())

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
              src="/newLogo2.png"
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
              onClick={openCart}
              aria-label={`سلة المشتريات (${totalQuantity} منتجات)`}
              className="relative p-2 text-gray-700 hover:text-brand-primary cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white">
                {totalQuantity}
              </span>
            </Button>
          </div>
        </div>

        {/* Search bar & Live Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="relative w-full sm:max-w-md md:max-w-lg">
          <form onSubmit={handleSearchSubmit}>
            <Input
              type="search"
              role="combobox"
              aria-expanded={isDropdownVisible}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              aria-controls="header-live-search-dropdown"
              aria-activedescendant={
                highlightedIndex >= 0 && highlightedIndex < suggestions.length
                  ? `suggestion-${suggestions[highlightedIndex].id}`
                  : undefined
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setHighlightedIndex(-1)
                if (e.target.value.trim()) {
                  setIsOpen(true)
                } else {
                  setIsOpen(false)
                }
              }}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setIsOpen(true)
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="ابحث عن منتجك المفضل..."
              startIcon={<Search className="h-4 w-4" aria-hidden="true" />}
              endIcon={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer p-1"
                    aria-label="مسح البحث"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null
              }
              aria-label="بحث في المنتجات"
            />
          </form>

          {/* Autocomplete Dropdown Menu */}
          {isDropdownVisible && (
            <div
              id="header-live-search-dropdown"
              role="listbox"
              aria-label="نتائج البحث المباشر"
              className="absolute start-0 end-0 top-full mt-1.5 z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
            >
              {isProductsLoading ? (
                <div className="p-4 text-center text-xs text-gray-500">
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent mb-1"
                    aria-hidden="true"
                  />
                  <p className="text-[11px]">جاري البحث...</p>
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div className="bg-gray-50/70 px-3.5 py-1.5 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                    <span>المنتجات المقترحة</span>
                    <span>
                      {suggestions.length} من {totalMatches}
                    </span>
                  </div>

                  <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {suggestions.map((product, index) => (
                      <SuggestionItem
                        key={product.id}
                        product={product}
                        categoryName={categoryMap.get(product.categoryId)}
                        isHighlighted={highlightedIndex === index}
                        onClick={() => handleSelectProduct(product)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      />
                    ))}
                  </ul>

                  {/* View All Results Action */}
                  <button
                    type="button"
                    onClick={handleViewAllResults}
                    onMouseEnter={() => setHighlightedIndex(suggestions.length)}
                    className={`flex w-full items-center justify-between border-t border-gray-100 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                      highlightedIndex === suggestions.length
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-50/80 text-brand-primary hover:bg-brand-soft-pink/50'
                    }`}
                  >
                    <span>عرض كل نتائج البحث ({totalMatches})</span>
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <div className="p-5 text-center text-xs text-gray-500">
                  <SearchX
                    className="mx-auto mb-2 h-7 w-7 text-gray-300 stroke-[1.4]"
                    aria-hidden="true"
                  />
                  <p className="font-bold text-gray-700">لا توجد منتجات مطابقة</p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    لم نجد أي منتج يطابق «{debouncedQuery.trim()}»
                  </p>
                </div>
              )}
            </div>
          )}
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
            onClick={openCart}
            aria-label={`سلة المشتريات: ${totalQuantity} منتجات`}
            className="relative cursor-pointer"
            leftIcon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />}
          >
            <span>السلة</span>
            <span className="ms-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1 text-[11px] font-bold text-white">
              {totalQuantity}
            </span>
          </Button>
        </div>
      </div>
    </header>
  )
}
