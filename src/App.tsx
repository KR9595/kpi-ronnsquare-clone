import Header from '@/components/layout/Header/Header'

function App() {
  return (
    <>
      <Header />
      {/* The header is fixed, so content starts below it. */}
      <main id="main-content" className="relative w-full pt-(--header-height)">
        {/* Sections are added incrementally, one at a time. */}
      </main>
    </>
  )
}

export default App
