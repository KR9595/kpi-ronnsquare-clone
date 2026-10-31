import Lenis from 'lenis'

import { ScrollTrigger, gsap } from './gsap'

/**
 * Lenis smooth scrolling, set up like the source site: only from 1024px up (touch and
 * small screens keep native scrolling), driven by GSAP's ticker so ScrollTrigger and
 * Lenis share one clock.
 */
const SMOOTH_SCROLL_QUERY = '(min-width: 1024px)'

let lenis: Lenis | null = null
let isInitialised = false

function createLenis() {
  if (lenis) return
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.8,
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.lagSmoothing(0)
}

function destroyLenis() {
  if (!lenis) return
  lenis.destroy()
  lenis = null
  ScrollTrigger.refresh()
}

/** Call once at startup. Creates/destroys Lenis as the viewport crosses 1024px. */
export function initSmoothScroll() {
  if (isInitialised) return
  isInitialised = true

  ScrollTrigger.config({ ignoreMobileResize: true })
  // GSAP's ticker time is in seconds; Lenis expects milliseconds.
  gsap.ticker.add((time) => lenis?.raf(time * 1000))

  const mql = window.matchMedia(SMOOTH_SCROLL_QUERY)
  if (mql.matches) createLenis()
  mql.addEventListener('change', (event) => (event.matches ? createLenis() : destroyLenis()))
}

/** The active Lenis instance, or null below 1024px. */
export function getLenis() {
  return lenis
}
