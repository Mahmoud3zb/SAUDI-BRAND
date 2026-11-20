import { BestSellersSection } from './components/home/BestSellersSection.tsx'
import { CuratedProductsSection } from './components/home/CuratedProductsSection.tsx'
import { HeroSlider } from './components/home/HeroSlider.tsx'
import { TestimonialsSection } from './components/home/TestimonialsSection.tsx'
import { TrustBadges } from './components/home/TrustBadges.tsx'

function App() {
  return (
    <div className="w-full font-sans">
      {/* 1. Luxury Hero Section */}
      <HeroSlider />

      {/* Main Content Flow */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-14 sm:space-y-20">
        {/* 2. Best Sellers & Collection with Quick Tabs */}
        <BestSellersSection />

        {/* 3. Curated Showcase Products */}
        <CuratedProductsSection />

        {/* 4. Customer Testimonials & Reviews in Egypt */}
        <TestimonialsSection />

        {/* 5. Modern Glassmorphism Trust Badges */}
        <TrustBadges />
      </div>
    </div>
  )
}

export default App
