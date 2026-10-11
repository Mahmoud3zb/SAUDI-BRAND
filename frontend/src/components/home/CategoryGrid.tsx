import { Flame, Gem, Gift, Heart, Sparkles, Tag } from 'lucide-react'
import { Link } from 'react-router'
import { useCategories } from '../../features/products/hooks/useCategories.ts'

// Icon mapping based on category slug
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  perfumes: <Sparkles className="h-6 w-6 text-brand-primary" aria-hidden="true" />,
  skincare: <Heart className="h-6 w-6 text-rose-500" aria-hidden="true" />,
  haircare: <Flame className="h-6 w-6 text-amber-500" aria-hidden="true" />,
  accessories: <Gem className="h-6 w-6 text-purple-500" aria-hidden="true" />,
  gifts: <Gift className="h-6 w-6 text-emerald-500" aria-hidden="true" />,
  offers: <Tag className="h-6 w-6 text-brand-primary" aria-hidden="true" />,
}

export function CategoryGrid() {
  const { data: categories, isLoading, isError } = useCategories()

  if (isLoading) {
    return (
      <section aria-label="أقسام المتجر" className="space-y-4">
        <div className="h-6 w-36 rounded-md bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (isError || !categories || categories.length === 0) {
    return null
  }

  return (
    <section aria-label="أقسام المتجر" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl">تسوقي حسب القسم</h2>
        <span className="text-xs text-gray-500">اكتشفي تشكيلتنا المتنوعة</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/#${category.slug}`}
            className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-4 text-center transition-all duration-200 hover:border-brand-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft-pink/60 transition-transform duration-200 group-hover:scale-110">
              {CATEGORY_ICONS[category.slug] ?? (
                <Sparkles className="h-6 w-6 text-brand-primary" aria-hidden="true" />
              )}
            </div>

            <span className="text-xs font-bold text-gray-900 transition-colors group-hover:text-brand-primary">
              {category.name}
            </span>

            {category.description && (
              <span className="mt-1 line-clamp-1 text-[11px] text-gray-400">
                {category.description}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
