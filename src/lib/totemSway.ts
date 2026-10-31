import { ScrollTrigger, gsap } from './gsap'

/*
 * The "équilibre" totem's idle sway, ported from the source's totem-sway.js: the diamond +
 * circle stack rocks on the triangle's tip (±8°) while the diamond rocks on the circle (±5°),
 * a 6s loop that plays while the trigger is on screen and eases back upright when it leaves.
 */

/** Pivot points in the totem's viewBox: the triangle's tip and the circle's top. */
const SWAY_ORIGIN = '142 545'
const DIAMOND_ORIGIN = '142 283'

/** The paused, endless sway loop for a totem's `[data-shape]` groups (null if missing). */
export function buildTotemSway(scope: Element) {
  const sway = scope.querySelector('[data-shape="sway"]')
  const diamond = scope.querySelector('[data-shape="diamond"]')
  if (!sway || !diamond) return null
  const timeline = gsap.timeline({ repeat: -1, paused: true })
  timeline.to(
    sway,
    {
      svgOrigin: SWAY_ORIGIN,
      keyframes: { rotation: [0, 8, 0, -8, 0], easeEach: 'sine.inOut' },
      duration: 6,
      ease: 'none',
    },
    0,
  )
  timeline.to(
    diamond,
    {
      svgOrigin: DIAMOND_ORIGIN,
      keyframes: { rotation: [0, 5, 0, -5, 0], easeEach: 'sine.inOut' },
      duration: 6,
      ease: 'none',
    },
    0,
  )
  return timeline
}

interface TotemSwayOptions {
  /** Also sway below 992px (the source's `mobile` flag). */
  mobile?: boolean
  start?: string
}

/**
 * Plays the totem in `scope` swaying while `trigger` is between `start` and `bottom top`.
 * Without `mobile`, only from 992px up. Returns a cleanup function.
 */
export function initTotemSway(
  scope: Element,
  trigger: Element,
  { mobile = true, start = 'top bottom' }: TotemSwayOptions = {},
) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const setup = () => {
    const sway = scope.querySelector('[data-shape="sway"]')
    const diamond = scope.querySelector('[data-shape="diamond"]')
    if (!sway || !diamond) return
    const loop = buildTotemSway(scope)
    if (!loop) return

    let isActive = false
    let settle: gsap.core.Tween[] = []
    const killSettle = () => {
      settle.forEach((tween) => tween.kill())
      settle = []
    }
    const play = () => {
      killSettle()
      loop.play(0)
    }
    const stop = () => {
      loop.pause()
      killSettle()
      settle = [
        gsap.to(sway, { rotation: 0, svgOrigin: SWAY_ORIGIN, duration: 0.6, ease: 'power2.out' }),
        gsap.to(diamond, {
          rotation: 0,
          svgOrigin: DIAMOND_ORIGIN,
          duration: 0.6,
          ease: 'power2.out',
        }),
      ]
    }
    const toggle = (next: boolean) => {
      if (next === isActive) return
      isActive = next
      if (next) play()
      else stop()
    }

    const scrollTrigger = ScrollTrigger.create({
      trigger,
      start,
      end: 'bottom top',
      onToggle: (self) => toggle(self.isActive),
      onRefresh: (self) => toggle(self.isActive),
    })
    return () => {
      scrollTrigger.kill()
      loop.kill()
      killSettle()
    }
  }

  if (mobile) return setup() ?? (() => {})

  const mm = gsap.matchMedia()
  mm.add('(min-width: 992px)', () => setup())
  return () => mm.revert()
}
