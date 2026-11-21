import { HeartHandshake, MessageCircle } from 'lucide-react'
import { useSettingsStore } from '../../features/settings/settings.store.ts'

const ADVISOR_PROMPTS = [
  {
    title: 'رشحي لي عطر مميز وثابت',
    icon: '🌸',
    text: 'مرحباً، أود استشارة بخصوص أفضل العطور الثابتة والفواحة للمناسبات اليومية أو الخاصة.',
  },
  {
    title: 'روتين عناية للبشرة والشعر',
    icon: '🧴',
    text: 'مرحباً، أود استشارة لاختيار روتين عناية متكامل ومناسب لنوع بشرتي وشعري.',
  },
  {
    title: 'تنسيق بوكس هدية فاخر',
    icon: '🎁',
    text: 'مرحباً، أود تنسيق بوكس هدية مميز وفاخر مع تغليف أنيق لمناسبة قريبة.',
  },
]

export function HairAdvisorBanner() {
  const defaultIntl = useSettingsStore((state) => state.whatsappNumberIntl)
  const contactChannels = useSettingsStore((state) => state.contactChannels)
  const whatsappNumberIntl = contactChannels?.advisor?.intl || defaultIntl

  const mainAdvisorUrl = `https://wa.me/${whatsappNumberIntl}?text=${encodeURIComponent(
    'مرحباً، أود استشارة خبيرة سعودي براند لاختيار أفضل المنتجات المناسبة لي ✨'
  )}`

  return (
    <section
      id="advisor"
      aria-label="استشارة العناية والعطور المخصصة"
      className="relative overflow-hidden rounded-3xl border border-brand-soft-pink bg-gradient-to-br from-brand-soft-pink/90 via-white to-brand-soft-pink/40 p-6 sm:p-10 text-center shadow-xs font-sans"
      dir="rtl"
    >
      {/* Decorative ambient background accents */}
      <div className="absolute -top-12 -start-12 h-40 w-40 rounded-full bg-brand-primary/5 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -end-12 h-40 w-40 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-2xl space-y-4">
        {/* Quality Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-brand-primary border border-brand-primary/20 text-xs font-bold shadow-2xs">
          <HeartHandshake className="h-4 w-4" />
          <span>خدمة استشارية مجانية 100%</span>
        </div>

        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 leading-snug">
          محتارة في اختيار العطر المناسب أو روتين العناية؟
        </h3>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-lg mx-auto">
          خبيرة سعودي براند متاحة الآن لمساعدتكِ فورياً في اختيار المنتج الأنسب لذوقكِ أو تنسيق أرقى بوكس هدية عبر الواتساب مباشرة 💬
        </p>

        {/* Interactive Quick Prompts */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
          {ADVISOR_PROMPTS.map((prompt, idx) => (
            <a
              key={idx}
              href={`https://wa.me/${whatsappNumberIntl}?text=${encodeURIComponent(prompt.text)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-emerald-50 text-gray-800 hover:text-emerald-900 text-xs font-bold border border-gray-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
            >
              <span>{prompt.icon}</span>
              <span>{prompt.title}</span>
            </a>
          ))}
        </div>

        {/* Primary CTA Button */}
        <div className="pt-3">
          <a
            href={mainAdvisorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>ابدأي الاستشارة المباشرة عبر الواتساب</span>
          </a>
        </div>
      </div>
    </section>
  )
}
