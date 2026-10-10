import { NavLink } from 'react-router'

interface CategoryItem {
  id: string
  label: string
  href: string
}

const CATEGORIES: CategoryItem[] = [
  { id: 'home', label: 'الرئيسية', href: '/' },
  { id: 'perfumes', label: 'العطور', href: '/#perfumes' },
  { id: 'skincare', label: 'البشرة', href: '/#skincare' },
  { id: 'haircare', label: 'الشعر', href: '/#haircare' },
  { id: 'accessories', label: 'الإكسسوارات', href: '/#accessories' },
  { id: 'gifts', label: 'الهدايا', href: '/#gifts' },
  { id: 'offers', label: 'العروض', href: '/#offers' },
]

export function Navbar() {
  return (
    <nav aria-label="أقسام المتجر الرئيسية" className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-1 overflow-x-auto py-2 sm:justify-center sm:gap-2">
          {CATEGORIES.map((category) => {
            const isSpecial = category.id === 'offers'
            return (
              <li key={category.id} className="shrink-0">
                <NavLink
                  to={category.href}
                  className={({ isActive }) => {
                    const baseClass =
                      'block rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
                    if (isSpecial) {
                      return `${baseClass} text-brand-primary bg-brand-soft-pink/70 hover:bg-brand-soft-pink`
                    }
                    return isActive && category.href === '/'
                      ? `${baseClass} text-brand-primary font-bold`
                      : `${baseClass} text-gray-700 hover:text-brand-primary hover:bg-gray-50`
                  }}
                >
                  {category.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
