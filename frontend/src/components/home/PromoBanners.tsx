import { Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { useBanners } from '../../features/products/hooks/useBanners.ts'
import { Badge } from '../ui/Badge.tsx'
import { Button } from '../ui/Button.tsx'

export function PromoBanners() {
  const { data: banners, isLoading } = useBanners()

  if (isLoading || !banners) {
    return null
  }

  // Pick secondary promotional banners (excluding the primary hero banner)
  const promoBanners = banners.filter((b) => b.id !== 'banner-hero' && b.id !== 'banner-advisor')

  if (promoBanners.length === 0) {
    return null
  }

  return (
    <section aria-label="عروض وبانرات ترويجية" className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {promoBanners.map((banner) => (
        <article
          key={banner.id}
          className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-brand-soft-pink bg-gradient-to-br from-white via-[#fdf7f4] to-brand-soft-pink/40 p-6 sm:p-8 shadow-xs"
        >
          <div className="space-y-3">
            {banner.badge && (
              <Badge variant="soft" size="sm">
                <Sparkles className="me-1 h-3 w-3 text-brand-primary" aria-hidden="true" />
                {banner.badge}
              </Badge>
            )}

            <h3 className="text-lg font-bold text-gray-900 sm:text-xl leading-snug">
              {banner.title}
            </h3>

            {banner.subtitle && (
              <p className="text-xs text-gray-600 sm:text-sm leading-relaxed">{banner.subtitle}</p>
            )}
          </div>

          {banner.linkUrl && (
            <div className="pt-6">
              <Link to={banner.linkUrl}>
                <Button variant="outline" size="sm" className="shadow-xs">
                  استكشفي التشكيلة
                </Button>
              </Link>
            </div>
          )}
        </article>
      ))}
    </section>
  )
}
