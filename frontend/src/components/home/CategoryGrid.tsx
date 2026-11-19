import { ArrowLeft, Flame, Gem, Gift, Heart, Sparkles, Tag } from 'lucide-react'
import { Link } from 'react-router'
import { useCategories } from '../../features/products/hooks/useCategories.ts'

interface CategoryStyle {
  icon: React.ReactNode
  gradient: string
  hoverBorder: string
  badge?: string
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  perfumes: {
    icon: <Sparkles className="h-7 w-7 text-amber-600" aria-hidden="true" />,
    gradient: 'from-amber-50/80 via-white to-amber-50/40',
    hoverBorder: 'hover:border-amber-300',
    badge: 'الأكثر طلباً',
  },
  skincare: {
    icon: <Heart className="h-7 w-7 text-rose-500" aria-hidden="true" />,
    gradient: 'from-rose-50/80 via-white to-rose-50/40',
    hoverBorder: 'hover:border-rose-300',
    badge: 'نضارة طبيعية',
  },
  haircare: {
    icon: <Flame className="h-7 w-7 text-amber-500" aria-hidden="true" />,
    gradient: 'from-orange-50/80 via-white to-orange-50/40',
    hoverBorder: 'hover:border-orange-300',
    badge: 'كثافة وقوة',
  },
  handmade: {
    icon: <Gem className="h-7 w-7 text-purple-500" aria-hidden="true" />,
    gradient: 'from-purple-50/80 via-white to-purple-50/40',
    hoverBorder: 'hover:border-purple-300',
    badge: 'تصاميم فريدة',
  },
  gifts: {
    icon: <Gift className="h-7 w-7 text-emerald-600" aria-hidden="true" />,
    gradient: 'from-emerald-50/80 via-white to-emerald-50/40',
    hoverBorder: 'hover:border-emerald-300',
    badge: 'تغليف فاخر',
  },
  offers: {
    icon: <Tag className="h-7 w-7 text-rose-600" aria-hidden="true" />,
    gradient: 'from-red-50/80 via-white to-red-50/40',
    hoverBorder: 'hover:border-red-300',
    badge: 'خصومات حصرية',
  },
}

export function CategoryGrid() {
  const { data: categories, isLoading, isError } = useCategories()

  if (isLoading) {
    return (
      <section aria-label="أقسام المتجر" className="space-y-5 font-sans" dir="rtl">
        <div className="h-7 w-48 rounded-lg bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-3xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (isError || !categories || categories.length === 0) {
    return null
  }

  return (
    <section aria-label="أقسام المتجر" className="space-y-6 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <span className="text-xs font-bold text-brand-primary uppercase tracking-wider block mb-1">
            تسوقي حسب اهتمامك
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">أقسام المتجر الفاخرة</h2>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors"
        >
          <span>تصفح جميع الأقسام</span>
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Grid of Luxury Category Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
        {categories.map((category) => {
          const style = CATEGORY_STYLES[category.slug] ?? {
            icon: <Sparkles className="h-7 w-7 text-brand-primary" aria-hidden="true" />,
            gradient: 'from-brand-soft-pink/40 via-white to-brand-soft-pink/20',
            hoverBorder: 'hover:border-brand-primary/40',
            badge: undefined,
          }

          return (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className={`group relative flex flex-col items-center justify-between rounded-3xl border border-gray-100 bg-gradient-to-b ${style.gradient} p-5 text-center shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg ${style.hoverBorder} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary`}
            >
              {/* Optional Mini Badge */}
              {style.badge && (
                <span className="absolute -top-2.5 inset-x-auto px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-gray-700 shadow-2xs border border-gray-100">
                  {style.badge}
                </span>
              )}

              {/* Icon Container with subtle float on hover */}
              <div className="my-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xs border border-gray-100/80 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                {style.icon}
              </div>

              {/* Category Name & Microcopy */}
              <div className="w-full">
                <span className="block text-xs sm:text-sm font-black text-gray-900 transition-colors group-hover:text-brand-primary">
                  {category.name}
                </span>
                <span className="mt-1 block text-[10px] text-gray-400 group-hover:text-brand-primary/70 transition-colors font-medium">
                  اكتشفي الآن &larr;
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
