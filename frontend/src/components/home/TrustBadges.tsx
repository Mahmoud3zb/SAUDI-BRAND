import { Gift, Headphones, ShieldCheck, Truck } from 'lucide-react'

const TRUST_ITEMS = [
  {
    icon: <Truck className="h-6 w-6 text-brand-primary" aria-hidden="true" />,
    title: 'توصيل سريع',
    description: 'شحن لجميع المحافظات بأعلى سرعة',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-brand-primary" aria-hidden="true" />,
    title: 'منتجات أصلية ومضمونة',
    description: 'جودة موثوقة ومختارة بعناية',
  },
  {
    icon: <Headphones className="h-6 w-6 text-brand-primary" aria-hidden="true" />,
    title: 'خدمة عملاء مستمرة',
    description: 'دعم دائم للإجابة على استفساراتكِ',
  },
  {
    icon: <Gift className="h-6 w-6 text-brand-primary" aria-hidden="true" />,
    title: 'تغليف هدايا فاخر',
    description: 'لمسات خاصة وتغليف أنيق لمناسباتكِ',
  },
]

export function TrustBadges() {
  return (
    <section aria-label="مميزات المتجر" className="py-2">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {TRUST_ITEMS.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-xs transition hover:border-brand-soft-pink"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft-pink/60">
              {item.icon}
            </div>
            <h3 className="text-xs font-bold text-gray-900 sm:text-sm">{item.title}</h3>
            <p className="mt-1 text-[11px] text-gray-500 sm:text-xs leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
