import HomeEntrance from '@/components/intro/HomeEntrance'
import Footer from '@/components/layout/Footer/Footer'
import LegalModal from '@/components/layout/Footer/LegalModal'
import NewsletterToast from '@/components/layout/Footer/NewsletterToast'
import Header from '@/components/layout/Header/Header'
import Advantages from '@/components/sections/Advantages/Advantages'
import CardReviews from '@/components/sections/CardReviews/CardReviews'
import Cta from '@/components/sections/Cta/Cta'
import Faq from '@/components/sections/Faq/Faq'
import Hero from '@/components/sections/Hero/Hero'
import Preoccupations from '@/components/sections/Preoccupations/Preoccupations'
import Projects from '@/components/sections/Projects/Projects'
import Quote from '@/components/sections/Quote/Quote'
import RunningLine from '@/components/sections/RunningLine/RunningLine'
import Services from '@/components/sections/Services/Services'
import Theses from '@/components/sections/Theses/Theses'

function App() {
  return (
    <>
      <Header />
      {/* The source's `[data-barba=wrapper]`: clips shapes that hang off screen (e.g. the
          mobile Advantages totem) so the page never scrolls sideways. */}
      <div className="relative z-1 overflow-clip">
        {/* The header is fixed, so content starts below it. */}
        <main id="main-content" className="relative w-full pt-(--header-height)">
          <Hero />
          <RunningLine />
          <Quote />
          <Preoccupations />
          <Advantages />
          <Theses />
          <Services />
          <Projects />
          <CardReviews />
          <Cta />
          <Faq />
        </main>
      </div>
      {/* As on the source, the footer and its popups sit after the page wrapper. */}
      <Footer />
      <LegalModal doc="legal" />
      <LegalModal doc="privacy" />
      <NewsletterToast />
      {/* After the content, so the blocks have registered their entrance timelines. */}
      <HomeEntrance />
    </>
  )
}

export default App
