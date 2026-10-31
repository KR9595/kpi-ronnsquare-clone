import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ScrollTrigger, gsap } from '@/lib/animation/gsap'
import { getLenis, initSmoothScroll } from '@/lib/animation/smoothScroll'
import { isDebug } from '@/lib/utils/debug'
import { initReloadOnResize } from '@/lib/utils/reloadOnResize'

import App from './App.tsx'
import './index.css'

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
