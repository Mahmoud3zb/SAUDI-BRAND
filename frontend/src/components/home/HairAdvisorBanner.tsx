import { HeartHandshake } from 'lucide-react'
import { Link } from 'react-router'
import { useBanners } from '../../features/products/hooks/useBanners.ts'
import { Badge } from '../ui/Badge.tsx'
import { Button } from '../ui/Button.tsx'

export function HairAdvisorBanner() {
  const { data: banners } = useBanners()

  const advisorBanner = banners?.find((b) => b.id === 'banner-advisor')

  if (!advisorBanner) {
    return null
  }

  return (
    <section
      id="advisor"
      aria-label="استشارة العناية المخصصة"
      className="relative overflow-hidden rounded-3xl border border-brand-soft-pink bg-gradient-to-l from-brand-soft-pink/80 via-white to-brand-soft-pink/40 p-6 sm:p-10 text-center shadow-xs"
    >
      <div className="mx-auto max-w-xl space-y-3">
        {advisorBanner.badge && (
          <Badge variant="soft" size="md">
            <HeartHandshake className="me-1 h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
            {advisorBanner.badge}
          </Badge>
        )}

        <h3 className="text-xl font-bold text-brand-primary sm:text-2xl">{advisorBanner.title}</h3>

        {advisorBanner.subtitle && (
          <p className="text-xs text-gray-600 sm:text-sm leading-relaxed">
            {advisorBanner.subtitle}
          </p>
        )}

        {advisorBanner.linkUrl && (
          <div className="pt-2">
            <Link to={advisorBanner.linkUrl}>
              <Button variant="primary" size="md">
                ابدئي الاستشارة
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
