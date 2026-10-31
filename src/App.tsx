import HomeEntrance from '@/components/intro/HomeEntrance'
import Header from '@/components/layout/Header/Header'
import Hero from '@/components/sections/Hero/Hero'
import Preoccupations from '@/components/sections/Preoccupations/Preoccupations'
import Quote from '@/components/sections/Quote/Quote'
import RunningLine from '@/components/sections/RunningLine/RunningLine'

function App() {
  return (
    <>
      <Header />
      {/* The header is fixed, so content starts below it. */}
      <main id="main-content" className="relative w-full pt-(--header-height)">
        <Hero />
        <RunningLine />
        <Quote />
        <Preoccupations />
        {/* Further sections are added incrementally, one at a time. */}
      </main>
      {/* After the content, so the blocks have registered their entrance timelines. */}
      <HomeEntrance />
    </>
  )
}

export default App
