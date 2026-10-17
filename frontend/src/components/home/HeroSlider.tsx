import { useState } from 'react'
import { Award, CheckCircle2, ChevronLeft, ChevronRight, ShoppingCart, Truck } from 'lucide-react'
import { Link } from 'react-router'
import { useBanners } from '../../features/products/hooks/useBanners.ts'
import { Button } from '../ui/Button.tsx'

export function HeroSlider() {
  const { data: banners } = useBanners()
  const [currentIndex, setCurrentIndex] = useState(0)

  const bannerList = banners && banners.length > 0 ? banners : []
  const currentBanner = bannerList[currentIndex] ?? {
    id: 'banner-hero',
    title: 'سعودي براند',
    subtitle: 'اختاري لمستك .. واكتشفي منتجاتك المفضلة',
    imageUrl: '/newHero.png',
    linkUrl: '/#offers',
    textPosition: 'right',
  }

  const totalBanners = bannerList.length > 0 ? bannerList.length : 3
  const isTextOnLeft = currentBanner.textPosition === 'left'
  const isNewHeroImage = currentBanner.imageUrl?.includes('newHero')

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalBanners - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalBanners - 1 ? 0 : prev + 1))
  }

  return (
    <section
      aria-label="بانر العروض الرئيسي"
      className="relative w-full overflow-hidden bg-[#F6EFE6] min-h-[500px] sm:min-h-[520px] lg:min-h-[580px] flex items-end md:items-center"
    >
      {/* Background Hero Image */}
      <div className="absolute inset-0 h-full w-full">
        <img
          src={currentBanner.imageUrl || '/newHero.png'}
          alt={`${currentBanner.title} - العطور والعناية`}
          className="h-full w-full object-cover object-[22%_15%] sm:object-[28%_center] md:object-center"
          loading="eager"
        />
        {/* Mobile: Atmospheric soft warm ivory gradient from bottom so model at top is crystal clear and text at bottom has perfect legibility */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#F6EFE6] from-15% via-[#F6EFE6]/85 via-45% to-transparent to-80% md:hidden"
          aria-hidden="true"
        />
        {/* Desktop: Soft side ambient gradient on the right (start) side behind the text */}
        <div
          className="hidden md:block absolute inset-0 bg-gradient-to-l from-[#F6EFE6]/60 via-[#F6EFE6]/20 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Floating Edge Navigation Arrows (Desktop/Tablet) */}
      {/* <button
        type="button"
        onClick={handleNext}
        aria-label="الشريحة السابقة"
        className="hidden sm:flex absolute top-1/2 start-3 sm:start-5 -translate-y-1/2 z-20 h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-xs transition hover:bg-brand-soft-pink hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary cursor-pointer"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={handlePrev}
        aria-label="الشريحة التالية"
        className="hidden sm:flex absolute top-1/2 end-3 sm:end-5 -translate-y-1/2 z-20 h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-xs transition hover:bg-brand-soft-pink hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary cursor-pointer"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button> */}

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-10 lg:px-16 pt-6 pb-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-start md:items-center min-h-0 md:min-h-[420px]">
          {/* Main Text Block */}
          <div
            className={`flex flex-col items-center md:items-start text-center md:text-start ${
              isTextOnLeft ? 'md:order-2' : 'md:order-1'
            }`}
          >
            {/* Brand Logo in Hero (Desktop only; on mobile, header already prominently displays the logo) */}
            <img
              src="/newLogo2.png"
              alt="سعودي براند | SAUDI BRAND"
              className="hidden md:block h-24 lg:h-28 w-auto object-contain drop-shadow-xs mb-2 mx-auto md:mx-0"
            />

            {/* Subtitle */}
            {currentBanner.subtitle && (
              <p className="text-sm sm:text-lg lg:text-xl text-[#3d2e2e] font-bold leading-relaxed max-w-xs sm:max-w-md drop-shadow-xs">
                {currentBanner.subtitle}
              </p>
            )}

            {/* CTA Button */}
            <div className="mt-3 sm:mt-6">
              <Link to={currentBanner.linkUrl || '/#offers'}>
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-full px-7 py-2.5 sm:px-9 sm:py-3.5 text-xs sm:text-base font-bold shadow-md hover:shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4 sm:h-4.5 sm:w-4.5" aria-hidden="true" />
                  <span>تسوقي الآن</span>
                </Button>
              </Link>
            </div>

            {/* Trust Highlights Bar (Desktop only in hero to preserve clean portrait space on mobile) */}
            <div className="hidden md:flex mt-8 flex-wrap items-center justify-start gap-4 text-xs font-semibold text-[#4a3b32] pt-3">
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
                <span>منتجات أصلية</span>
              </div>
              <span className="h-3.5 w-px bg-gray-400/40" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
                <span>توصيل سريع لجميع مناطق مصر</span>
              </div>
              <span className="h-3.5 w-px bg-gray-400/40" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
                <span>دفع آمن</span>
              </div>
            </div>
          </div>

          {/* Complementary Space on desktop */}
          <div
            className={`hidden md:flex flex-col items-center justify-center ${
              isTextOnLeft ? 'md:order-1' : 'md:order-2'
            }`}
          >
            {!isNewHeroImage && currentBanner.calloutText && (
              <div className="select-none text-center transform -rotate-1 pe-12">
                <span className="block text-xl lg:text-2xl font-black text-brand-secondary/90 tracking-wide drop-shadow-xs">
                  جمالك ..
                </span>
                <span className="block text-xl lg:text-2xl font-black text-brand-secondary/90 mt-1 drop-shadow-xs">
                  بكل تفاصيله
                </span>
                <span className="block text-2xl text-brand-primary mt-1 font-bold">♥</span>
              </div>
            )}
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
                ? 'w-6 bg-brand-primary'
                : 'w-2 bg-white/70 border border-white hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
