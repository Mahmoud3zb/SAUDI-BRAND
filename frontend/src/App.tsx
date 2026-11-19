import { BestSellersSection } from './components/home/BestSellersSection.tsx'
import { CategoryGrid } from './components/home/CategoryGrid.tsx'
import { HairAdvisorBanner } from './components/home/HairAdvisorBanner.tsx'
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
        {/* 2. Luxury Category Grid Showcase */}
        <CategoryGrid />

        {/* 3. Best Sellers & Collection with Quick Tabs */}
        <BestSellersSection />

        {/* 5. Personal Scent & Beauty Advisor on WhatsApp */}
        <HairAdvisorBanner />

        {/* 6. Customer Testimonials & Reviews in Egypt */}
        <TestimonialsSection />

        {/* 7. Modern Glassmorphism Trust Badges */}
        <TrustBadges />
      </div>
    </div>
  )
}

export default App
