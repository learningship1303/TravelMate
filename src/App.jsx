import { HeroSection } from './components/home/HeroSection'
import { TrendingDestinations } from './components/home/TrendingDestinations'
import { FeatureHighlights } from './components/home/FeatureHighlights'
import { Stats } from './components/home/Stats'
import { FAQSection } from './components/home/FAQSection'
import { Footer } from './components/custom/Footer'

function App() {
  return (
    <>
      <HeroSection />
      <TrendingDestinations />
      <FeatureHighlights />
      <Stats />
      <FAQSection />
      <Footer />
    </>
  )
}

export default App
