import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import './index.css'
import { ScrollTrigger, gsap } from './lib/gsap'
import { isDebug } from './lib/intro/debug'
import { initReloadOnResize } from './lib/reloadOnResize'
import { getLenis, initSmoothScroll } from './lib/smoothScroll'

initSmoothScroll()
initReloadOnResize()

// `?debug`, as on the source: expose GSAP and Lenis for poking at the timelines.
if (isDebug) {
  Object.assign(window, { gsap, ScrollTrigger, lenis: getLenis() })
  console.log('[RS debug] ready -> window.gsap, window.ScrollTrigger, window.lenis')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
