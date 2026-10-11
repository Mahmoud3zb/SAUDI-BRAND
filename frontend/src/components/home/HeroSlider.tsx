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
    textPosition: 'left',
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
      className="relative w-full overflow-hidden bg-[#faebe3] min-h-[440px] sm:min-h-[500px] lg:min-h-[560px] flex items-center"
    >
      {/* Background Hero Image */}
      <div className="absolute inset-0 h-full w-full">
        <img
          src={currentBanner.imageUrl || '/newHero.png'}
          alt={`${currentBanner.title} - العطور والعناية`}
          className="h-full w-full object-cover object-right md:object-center"
          loading="eager"
        />
        {/* Soft atmospheric overlay for mobile text legibility */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#faebe3]/90 via-[#faebe3]/50 to-transparent md:hidden"
          aria-hidden="true"
        />
      </div>

      {/* Floating Edge Navigation Arrows */}
      <button
        type="button"
        onClick={handleNext}
        aria-label="الشريحة السابقة"
        className="absolute top-1/2 start-3 sm:start-5 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition hover:bg-brand-soft-pink hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary cursor-pointer"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={handlePrev}
        aria-label="الشريحة التالية"
        className="absolute top-1/2 end-3 sm:end-5 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition hover:bg-brand-soft-pink hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary cursor-pointer"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Main Content Container (Aligned with max-w-7xl) */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-10 lg:px-16 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[380px] sm:min-h-[420px]">
          {/* Main Text Block (Supports rendering on Left or Right) */}
          <div
            className={`flex flex-col items-center md:items-start text-center md:text-start rounded-3xl bg-white/85 sm:bg-white/90 md:bg-transparent p-6 sm:p-8 md:p-0 backdrop-blur-xs md:backdrop-blur-none border border-white/60 md:border-none shadow-xs md:shadow-none ${
              isTextOnLeft ? 'md:order-2' : 'md:order-1'
            }`}
          >
            {/* Lotus/Flower Emblem */}
            <svg
              viewBox="0 0 44 32"
              className="h-8 sm:h-9 w-auto fill-none stroke-brand-primary stroke-[1.8] mb-1.5"
              aria-hidden="true"
            >
              <path d="M22 3 C19 11 19 21 22 27 C25 21 25 11 22 3 Z" />
              <path d="M22 27 C15 25 9 17 12 9 C16 13 19 21 22 27 Z" />
              <path d="M22 27 C29 25 35 17 32 9 C28 13 25 21 22 27 Z" />
              <path d="M22 27 C13 27 3 21 5 15 C10 17 17 23 22 27 Z" />
              <path d="M22 27 C31 27 41 21 39 15 C34 17 27 23 22 27 Z" />
            </svg>

            {/* Brand Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-brand-primary tracking-tight">
              {currentBanner.title}
            </h1>

            {/* Subtitle */}
            {currentBanner.subtitle && (
              <p className="mt-3 text-base sm:text-xl text-[#3d2e2e] font-semibold leading-relaxed">
                {currentBanner.subtitle}
              </p>
            )}

            {/* CTA Button */}
            <div className="mt-6">
              <Link to={currentBanner.linkUrl || '/#offers'}>
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-full px-8 py-3.5 text-base font-bold shadow-md hover:shadow-lg transition-transform active:scale-95 flex items-center gap-2.5"
                >
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                  <span>تسوقي الآن</span>
                </Button>
              </Link>
            </div>

            {/* Trust Highlights Bar */}
            <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-xs font-semibold text-[#4a3b32] pt-3">
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                <span>منتجات أصلية</span>
              </div>
              <span className="h-3.5 w-px bg-gray-400/40" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                <span>توصيل سريع لجميع مناطق مصر</span>
              </div>
              <span className="h-3.5 w-px bg-gray-400/40" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                <span>دفع آمن</span>
              </div>
            </div>
          </div>

          {/* Complementary Space / Callout (when calligraphy is not already in the image) */}
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
        className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 z-20"
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
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex
                ? 'w-6 bg-brand-primary'
                : 'w-2.5 bg-white/70 border border-white hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
