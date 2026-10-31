import { gsap } from '@/lib/animation/gsap'

/*
 * The header's own entrance, ported from the source's main.js: the bars either appear at
 * once or drop in from above. It runs once per page load; after that both are no-ops.
 */

let isHeaderRevealed = false

function getHeaderBars() {
  const header = document.querySelector('[data-header-ronn]')
  if (!header) return null
  return {
    ctaBar: header.querySelector('.header-ronn__cta-bar'),
    main: header.querySelector('.header-ronn__main'),
  }
}

/** Shows the header bars immediately. */
export function revealHeader() {
  if (isHeaderRevealed) return
  const bars = getHeaderBars()
  if (!bars) return
  gsap.set([bars.ctaBar, bars.main].filter(Boolean), { autoAlpha: 1 })
  isHeaderRevealed = true
}

/**
 * Hides the header bars now, then drops them in at `position` on `timeline`: the
 * announcement bar from -20px, the main bar 0.15s later from -15px (0.9s, expo.out).
 */
export function animateHeaderIn(timeline: gsap.core.Timeline, position: string) {
  if (isHeaderRevealed) return
  const bars = getHeaderBars()
  if (!bars) return
  const { ctaBar, main } = bars
  gsap.set([ctaBar, main].filter(Boolean), { autoAlpha: 0 })
  if (ctaBar) {
    timeline.fromTo(
      ctaBar,
      { autoAlpha: 0, y: -20 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' },
      position,
    )
  }
  if (main) {
    timeline.fromTo(
      main,
      { autoAlpha: 0, y: -15 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' },
      `${position}+=0.15`,
    )
  }
  timeline.call(() => {
    isHeaderRevealed = true
  })
}
