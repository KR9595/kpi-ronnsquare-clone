import { ScrollTrigger } from './gsap'

/*
 * Block entrance timelines, wired like the source site: a block marked
 * `data-entrance="above-fold"` hands its paused timeline to the homepage entrance (which
 * plays it after the intro); any other block plays it when its top reaches 75% of the
 * viewport and reverses it when scrolled back above.
 */

const aboveFoldTimelines = new Map<Element, gsap.core.Timeline>()

/** The paused entrance timeline of an above-fold block, for the homepage intro to play. */
export function getAboveFoldTimeline(block: Element) {
  return aboveFoldTimelines.get(block) ?? null
}

/** Registers a block's paused entrance timeline. Returns a cleanup function. */
export function registerBlockTimeline(block: HTMLElement, timeline: gsap.core.Timeline) {
  if (block.dataset.entrance === 'above-fold') {
    aboveFoldTimelines.set(block, timeline)
    return () => {
      aboveFoldTimelines.delete(block)
    }
  }

  const trigger = ScrollTrigger.create({
    trigger: block,
    start: 'top 75%',
    onEnter: () => timeline.play(),
    onEnterBack: () => timeline.play(),
    onLeaveBack: () => timeline.reverse(),
  })
  return () => trigger.kill()
}

/** True when the visitor asked for reduced motion; blocks then skip to their end state. */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
