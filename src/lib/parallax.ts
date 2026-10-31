import { gsap } from './gsap'
import { getScrub } from './scrub'

/*
 * The source's global image parallax (main.js): every `[data-parallax="trigger"]` moves its
 * `[data-parallax="target"]` (or itself) from `data-parallax-start` to `data-parallax-end`
 * percent (defaults 20 → -20, `yPercent`, or `xPercent` with
 * `data-parallax-direction="horizontal"`) while it crosses the viewport, scrubbed.
 * `data-parallax-disable="mobile|mobileLandscape|tablet"` turns it off below 480/768/992px.
 */

const CONDITIONS = {
  isMobile: '(max-width:479px)',
  isMobileLandscape: '(max-width:767px)',
  isTablet: '(max-width:991px)',
  isDesktop: '(min-width:992px)',
}

const numberAttribute = (element: Element, name: string, fallback: number) => {
  const value = element.getAttribute(name)
  return value !== null ? parseFloat(value) : fallback
}

/** Wires the parallax of every trigger inside `scope`. Returns a cleanup function. */
export function initParallax(scope: Element) {
  const triggers = scope.querySelectorAll('[data-parallax="trigger"]')
  if (!triggers.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {}
  }

  const mm = gsap.matchMedia()
  mm.add(CONDITIONS, (context) => {
    const { isMobile, isMobileLandscape, isTablet } = context.conditions as Record<string, boolean>
    triggers.forEach((trigger) => {
      const disable = trigger.getAttribute('data-parallax-disable')
      if (
        (disable === 'mobile' && isMobile) ||
        (disable === 'mobileLandscape' && isMobileLandscape) ||
        (disable === 'tablet' && isTablet)
      ) {
        return
      }
      const target = trigger.querySelector('[data-parallax="target"]') ?? trigger
      const property =
        trigger.getAttribute('data-parallax-direction') === 'horizontal' ? 'xPercent' : 'yPercent'
      const scrubAttribute = trigger.getAttribute('data-parallax-scrub')
      const start = trigger.getAttribute('data-parallax-scroll-start') ?? 'top bottom'
      const end = trigger.getAttribute('data-parallax-scroll-end') ?? 'bottom top'
      gsap.fromTo(
        target,
        { [property]: numberAttribute(trigger, 'data-parallax-start', 20) },
        {
          [property]: numberAttribute(trigger, 'data-parallax-end', -20),
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: `clamp(${start})`,
            end: `clamp(${end})`,
            scrub: scrubAttribute ? parseFloat(scrubAttribute) : getScrub(),
            invalidateOnRefresh: true,
          },
        },
      )
    })
  })
  return () => mm.revert()
}
