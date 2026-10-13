import { NavLink, useSearchParams } from 'react-router'
import { useCategories } from '../../features/products/hooks/useCategories.ts'

export function Navbar() {
  const { data: categories } = useCategories()
  const [searchParams] = useSearchParams()

  const buildNavHref = (path: string) => {
    const params = new URLSearchParams()
    const q = searchParams.get('q')
    const sort = searchParams.get('sort')
    if (q) params.set('q', q)
    if (sort && ['price_asc', 'price_desc', 'name_asc'].includes(sort)) {
      params.set('sort', sort)
    }
    const qs = params.toString()
    return qs ? `${path}?${qs}` : path
  }

  return (
    <nav aria-label="أقسام المتجر الرئيسية" className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-1 overflow-x-auto py-2 sm:justify-center sm:gap-2">
          {/* Home Link */}
          <li className="shrink-0">
            <NavLink
              to="/"
              end
              className={({ isActive }) => {
                const baseClass =
                  'block rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
                return isActive
                  ? `${baseClass} text-brand-primary font-bold bg-brand-soft-pink/40`
                  : `${baseClass} text-gray-700 hover:text-brand-primary hover:bg-gray-50`
              }}
            >
              الرئيسية
            </NavLink>
          </li>

          {/* All Products Link */}
          <li className="shrink-0">
            <NavLink
              to={buildNavHref('/products')}
              end
              className={({ isActive }) => {
                const baseClass =
                  'block rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
                return isActive
                  ? `${baseClass} text-brand-primary font-bold bg-brand-soft-pink/40`
                  : `${baseClass} text-gray-700 hover:text-brand-primary hover:bg-gray-50`
              }}
            >
              جميع المنتجات
            </NavLink>
          </li>

          {/* Dynamic Category Links */}
          {categories?.map((category) => {
            const isSpecial = category.slug === 'offers'
            return (
              <li key={category.id} className="shrink-0">
                <NavLink
                  to={buildNavHref(`/category/${category.slug}`)}
                  className={({ isActive }) => {
                    const baseClass =
                      'block rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
                    if (isSpecial) {
                      return isActive
                        ? `${baseClass} text-white bg-brand-primary font-bold shadow-xs`
                        : `${baseClass} text-brand-primary bg-brand-soft-pink/70 hover:bg-brand-soft-pink`
                    }
                    return isActive
                      ? `${baseClass} text-brand-primary font-bold bg-brand-soft-pink/40`
                      : `${baseClass} text-gray-700 hover:text-brand-primary hover:bg-gray-50`
                  }}
                >
                  {category.name}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
