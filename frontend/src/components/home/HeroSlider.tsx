import { useState } from 'react'
import { Eye, MessageCircle, ShieldCheck, ShoppingCart, Sparkles, Truck } from 'lucide-react'
import { Link } from 'react-router'
import { useBanners } from '../../features/products/hooks/useBanners.ts'
import { Button } from '../ui/Button.tsx'
import { STORE_WHATSAPP_INTL } from '../../features/checkout/constants/egypt-regions.ts'

export function HeroSlider() {
  const { data: banners } = useBanners()
  const [currentIndex, setCurrentIndex] = useState(0)

  const bannerList = banners && banners.length > 0 ? banners : []
  const currentBanner = bannerList[currentIndex] ?? {
    id: 'banner-hero',
    title: 'سعودي براند',
    subtitle: 'فخامة العطور وأسرار العناية الملكية بين يديكِ',
    imageUrl: '/newHero.png',
    linkUrl: '/products',
    textPosition: 'right',
  }

  const totalBanners = bannerList.length > 0 ? bannerList.length : 3
  const isTextOnLeft = currentBanner.textPosition === 'left'

  const whatsappHeroUrl = `https://wa.me/${STORE_WHATSAPP_INTL}?text=${encodeURIComponent(
    'مرحباً، أود الاستفسار وطلب منتجات من سعودي براند ✨'
  )}`

  return (
    <section
      aria-label="بانر العروض الرئيسي"
      className="relative w-full overflow-hidden bg-[#F6EFE6] min-h-[520px] sm:min-h-[560px] lg:min-h-[600px] flex items-end md:items-center font-sans"
      dir="rtl"
    >
      {/* Background Hero Image */}
      <div className="absolute inset-0 h-full w-full">
        <img
          src={currentBanner.imageUrl || '/newHero.png'}
          alt={`${currentBanner.title} - فخامة العطور والعناية`}
          className="h-full w-full object-cover object-[24%_15%] sm:object-[28%_center] md:object-center"
          loading="eager"
        />
        {/* Mobile atmospheric gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#F6EFE6] from-20% via-[#F6EFE6]/85 via-50% to-transparent to-85% md:hidden"
          aria-hidden="true"
        />
        {/* Desktop ambient soft gradient */}
        <div
          className="hidden md:block absolute inset-0 bg-gradient-to-l from-[#F6EFE6]/70 via-[#F6EFE6]/30 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-10 lg:px-16 pt-6 pb-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-start md:items-center">
          {/* Main Text Block */}
          <div
            className={`flex flex-col items-center md:items-start text-center md:text-start ${
              isTextOnLeft ? 'md:order-2' : 'md:order-1'
            }`}
          >
            {/* Top Quality Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-soft-pink/90 border border-brand-primary/20 text-brand-primary text-xs font-bold mb-3 shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>الأصالة والفخامة في السوق المصري</span>
            </div>

            {/* Brand Logo in Hero (Desktop) */}
            <img
              src="/newLogo2.png"
              alt="سعودي براند | SAUDI BRAND"
              className="hidden md:block h-20 lg:h-24 w-auto object-contain drop-shadow-xs mb-2 mx-auto md:mx-0"
            />

            {/* Main Headline & Subtitle */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2e1d15] leading-tight max-w-md">
              فخامة العطور وأسرار العناية الملكية
            </h1>
            <p className="mt-2 text-xs sm:text-base text-[#4a3b32] font-semibold leading-relaxed max-w-xs sm:max-w-md">
              تشكيلة مختارة بعناية لأرقى الماركات • حق المعاينة الكاملة لشحنتك قبل الدفع
            </p>

            {/* Dual CTA Actions */}
            <div className="mt-5 sm:mt-7 flex flex-wrap items-center justify-center md:justify-start gap-3 w-full sm:w-auto">
              <Link to="/products" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-8 py-3 text-xs sm:text-sm font-bold shadow-md hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  <span>تسوقي التشكيلة الآن</span>
                </Button>
              </Link>

              <a
                href={whatsappHeroUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>طلب واستشارة عبر الواتساب</span>
              </a>
            </div>

            {/* Trust Highlights Bar (Desktop) */}
            <div className="hidden md:flex mt-8 flex-wrap items-center justify-start gap-3 text-xs font-semibold text-[#4a3b32] pt-4 border-t border-brand-primary/10">
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-brand-soft-pink shadow-2xs">
                <Eye className="h-3.5 w-3.5 text-brand-primary shrink-0" aria-hidden="true" />
                <span>معاينة قبل الاستلام</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-brand-soft-pink shadow-2xs">
                <Truck className="h-3.5 w-3.5 text-brand-primary shrink-0" aria-hidden="true" />
                <span>شحن سريع لمحافظات مصر</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-brand-soft-pink shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-primary shrink-0" aria-hidden="true" />
                <span>استرجاع واستبدال 14 يوم</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Slider Dots */}
      <div
        className="absolute bottom-2.5 sm:bottom-4 inset-x-0 flex items-center justify-center gap-2 z-20"
        role="tablist"
        aria-label="مؤشرات الشرائح"
      >
        {Array.from({ length: totalBanners }).map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`الانتقال إلى الشريحة ${index + 1}`}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex
                ? 'w-7 bg-brand-primary'
                : 'w-2 bg-white/70 border border-white hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
