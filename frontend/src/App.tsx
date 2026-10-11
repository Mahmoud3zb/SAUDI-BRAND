import { BestSellersSection } from './components/home/BestSellersSection.tsx'
import { CategoryGrid } from './components/home/CategoryGrid.tsx'
import { HairAdvisorBanner } from './components/home/HairAdvisorBanner.tsx'
import { HeroSlider } from './components/home/HeroSlider.tsx'
import { PromoBanners } from './components/home/PromoBanners.tsx'
import { TrustBadges } from './components/home/TrustBadges.tsx'

function App() {
  return (
    <div className="w-full">
      {/* 100% Width Hero Section */}
      <HeroSlider />

      {/* Centered Content Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 sm:space-y-16">
        <CategoryGrid />
        <BestSellersSection />
        <PromoBanners />
        <HairAdvisorBanner />
        <TrustBadges />
      </div>
    </div>
  )
}

export default App
