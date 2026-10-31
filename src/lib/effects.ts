import SplitType from 'split-type'

import { gsap } from './gsap'

/*
 * The source site's shared GSAP effects (registered in its main.js), ported with the same
 * defaults. They extend timelines, so a block builds its entrance like the source does:
 * `tl.splitReveal(title, { duration: 1.2 }, 0).revealImage(image, {}, '<0.2')`.
 * Import this module once for its side effect before calling them.
 */

interface SplitRevealConfig {
  duration?: number
  stagger?: number
  ease?: gsap.EaseString
}

interface FadeSlideUpConfig {
  /** Kept for parity with the source; the start offset is set by the caller beforehand. */
  y?: number
  duration?: number
  stagger?: number
  ease?: gsap.EaseString
}

interface ClipRevealConfig {
  /** Kept for parity with the source; the start clip is set by the caller beforehand. */
  from?: string
  duration?: number
  ease?: gsap.EaseString
}

interface RevealImageConfig {
  duration?: number
  scale?: number
  ease?: gsap.EaseString
}

declare global {
  namespace gsap.core {
    interface Timeline {
      splitReveal(
        targets: gsap.TweenTarget,
        config?: SplitRevealConfig,
        position?: gsap.Position,
      ): this
      fadeSlideUp(
        targets: gsap.TweenTarget,
        config?: FadeSlideUpConfig,
        position?: gsap.Position,
      ): this
      clipReveal(
        targets: gsap.TweenTarget,
        config?: ClipRevealConfig,
        position?: gsap.Position,
      ): this
      revealImage(
        targets: gsap.TweenTarget,
        config?: RevealImageConfig,
        position?: gsap.Position,
      ): this
    }
  }
}

/** SplitType instances made by `splitReveal`, so a block can restore its text on cleanup. */
const splits = new WeakMap<Element, SplitType>()

/**
 * Splits each target into lines (and words, like the source), wraps every line in an
 * `overflow: hidden` `.reveal-line-wrapper`, then slides the lines up from 100% with a
 * stagger. The target itself is made visible at the start (it starts `.anim-hidden`).
 */
gsap.registerEffect({
  name: 'splitReveal',
  effect: (targets: gsap.TweenTarget, config: Required<SplitRevealConfig>) => {
    const tl = gsap.timeline()
    gsap.utils.toArray<HTMLElement>(targets).forEach((element) => {
      const split = new SplitType(element, { types: ['lines', 'words'], lineClass: 'reveal-line' })
      splits.set(element, split)
      split.lines?.forEach((line) => {
        const wrapper = document.createElement('div')
        wrapper.className = 'reveal-line-wrapper'
        line.parentNode?.insertBefore(wrapper, line)
        wrapper.appendChild(line)
      })
      tl.set(element, { autoAlpha: 1 })
      tl.from(
        split.lines,
        {
          y: '100%',
          opacity: 0,
          duration: config.duration,
          stagger: config.stagger,
          ease: config.ease,
        },
        '<',
      )
    })
    return tl
  },
  defaults: { duration: 1.5, stagger: 0.12, ease: 'expo.out' },
  extendTimeline: true,
})

/** Fades and slides targets back to `y: 0`; callers `gsap.set` the start offset first. */
gsap.registerEffect({
  name: 'fadeSlideUp',
  effect: (targets: gsap.TweenTarget, config: Required<FadeSlideUpConfig>) =>
    gsap.to(gsap.utils.toArray(targets), {
      autoAlpha: 1,
      y: 0,
      duration: config.duration,
      stagger: config.stagger,
      ease: config.ease,
    }),
  defaults: { y: 24, duration: 0.6, stagger: 0.12, ease: 'power2.out' },
  extendTimeline: true,
})

/** Wipes targets open left to right; callers set the start clip-path first. */
gsap.registerEffect({
  name: 'clipReveal',
  effect: (targets: gsap.TweenTarget, config: Required<ClipRevealConfig>) =>
    gsap.to(gsap.utils.toArray(targets), {
      clipPath: 'inset(0 0% 0 0)',
      duration: config.duration,
      ease: config.ease,
    }),
  defaults: { from: 'inset(0 100% 0 0)', duration: 0.7, ease: 'power3.out' },
  extendTimeline: true,
})

/**
 * Shows each target, then wipes its `[data-anim-img-inner]` (or itself) open from the
 * bottom while it settles from a slight zoom; the zoom runs 1.4× longer than the wipe.
 */
gsap.registerEffect({
  name: 'revealImage',
  effect: (targets: gsap.TweenTarget, config: Required<RevealImageConfig>) => {
    const tl = gsap.timeline()
    gsap.utils.toArray<HTMLElement>(targets).forEach((element) => {
      const inner = element.querySelector('[data-anim-img-inner]') ?? element
      tl.set(element, { autoAlpha: 1 }, 0)
      tl.fromTo(
        inner,
        { clipPath: 'inset(100% 0 0 0)', scale: config.scale, transformOrigin: 'center center' },
        { clipPath: 'inset(0% 0 0 0)', duration: config.duration, ease: config.ease },
        0,
      )
      tl.to(inner, { scale: 1, duration: config.duration * 1.4, ease: 'power2.out' }, 0)
    })
    return tl
  },
  defaults: { duration: 1, scale: 1.1, ease: 'power3.inOut' },
  extendTimeline: true,
})

/** Restores the original markup of elements split by `splitReveal`. */
export function revertSplitReveal(targets: gsap.TweenTarget) {
  gsap.utils.toArray<Element>(targets).forEach((element) => {
    splits.get(element)?.revert()
    splits.delete(element)
  })
}
