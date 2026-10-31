import { createLogger } from '@/lib/utils/debug'

/*
 * The loader veil (`#site-loader`, static in index.html) and the once-per-session gate,
 * ported from the source's loader-reveal / preloader-session modules.
 */

const log = createLogger('loader-reveal', '#00cec9')

/**
 * "Grid reveal": adds label `gridReveal` at `position` and fades the lilac loader out there
 * (0.6s), removing it from the DOM once hidden.
 */
export function addGridReveal(timeline: gsap.core.Timeline, position: gsap.Position) {
  const loader = document.getElementById('site-loader')
  if (!loader) return
  timeline.addLabel('gridReveal', position)
  timeline.to(
    loader,
    {
      autoAlpha: 0,
      duration: 0.6,
      ease: 'power1.inOut',
      onComplete: () => {
        loader.remove()
        log('loader faded + removed')
      },
    },
    'gridReveal',
  )
}

/**
 * True on the first fresh load of the session (the full wordmark preloader plays). The
 * inline script in index.html adds `rs-preloader-seen` on later loads.
 */
export function isFirstSessionLoad() {
  return !document.documentElement.classList.contains('rs-preloader-seen')
}
