import { ScrollTrigger, gsap } from '@/lib/animation/gsap'
import { getScrub } from '@/lib/animation/scrub'

import { FLIP_KEYS, FORMATION, SLINKY_ROLES } from './servicesTotemData'

/*
 * The "Our Support" totem, ported from the source's block-1-7-services-totem.js. A stack of
 * three shapes (diamond on circle on triangle) runs down the card list:
 *
 * - One clone of the stack per card, each in a "band" clipped to its card and coloured with
 *   the card's text colour, so the totem changes colour exactly at each card edge.
 * - When the list is taller than the viewport, a timeline scrubbed over the list
 *   (`top top` → `bottom bottom`) moves the stacks down at 320px per unit, with a "slinky"
 *   lag per shape, and flips them half a turn over each card boundary along the source's
 *   baked keyframes (1.2 units per flip, 0.35 between steps, starting at 1.6). From 992px up
 *   the flip turns clockwise, except from a parme card into a dark one; below it always turns
 *   anticlockwise.
 * - The shapes assemble into the stack (61-frame formation) while the end of the first card
 *   goes from 80% to 30% of the viewport.
 * - Once the last card's bottom is on screen, the exit (servicesExitDestroy.ts) is loaded.
 */

/** Band colours by card theme, when the card has no `--_card-color`. */
const BAND_COLORS: Record<string, string> = {
  dark: 'var(--color-brand-parme, #dbb6fc)',
  parme: 'var(--color-brand-maron, #231800)',
  sable: 'var(--color-brand-maron, #231800)',
}
const FLIP_DURATION = 1.2
const STEP_GAP = 0.35
const TIMELINE_START = 1.6
/** Pixels of travel per timeline unit. */
const TRAVEL_SPEED = 320
const SHAPES = ['diamond', 'circle', 'triangle'] as const
type ShapeName = (typeof SHAPES)[number]
/** The diamond width the formation keyframes were baked for. */
const FORMATION_DIAMOND_WIDTH = 162

/** The per-shape lag while travelling (`?slinky=0` turns it off, as on the source). */
const slinky = (() => {
  const value = new URLSearchParams(window.location.search).get('slinky')
  return value === null ? true : value !== '0'
})()

interface CardInfo {
  top: number
  bottom: number
  theme: string
  color: string
}

/** Wires the totem of a `block-1-7-services--totem` block. Returns a cleanup function. */
export function initServicesTotem(section: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  const totem = section.querySelector<HTMLElement>('[data-anim="totem"]')
  const list = section.querySelector<HTMLElement>('.block-1-7-services__list')
  const stack = totem?.querySelector<HTMLElement>('[data-totem-stack]')
  if (!totem || !list || !stack) return () => {}
  const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-stacking-card]'))
  if (!cards.length) return () => {}

  const mm = gsap.matchMedia()
  mm.add({ isDesktop: '(min-width: 992px)', isMobile: '(max-width: 991.98px)' }, (context) => {
    const { isMobile } = context.conditions as { isMobile: boolean }
    let flipTimeline: gsap.core.Timeline | null = null
    let formationTimeline: gsap.core.Timeline | null = null
    let exitTimeline: gsap.core.Timeline | null = null
    let bands: HTMLElement[] = []
    let stacks: HTMLElement[] = []
    let shapes = {} as Record<ShapeName, HTMLElement[]>
    let finalRotation = 0
    let cardInfo: CardInfo[] = []

    const measureCards = () => {
      cardInfo = cards.map((card) => ({
        top: card.offsetTop,
        bottom: card.offsetTop + card.offsetHeight,
        theme: card.className.match(/--(dark|parme|sable)/)?.[1] ?? 'dark',
        color: getComputedStyle(card).getPropertyValue('--_card-color').trim(),
      }))
    }

    const buildBands = () => {
      measureCards()
      const listHeight = list.offsetHeight
      stack.style.display = 'none'
      cardInfo.forEach(({ top, bottom, color, theme }) => {
        const band = document.createElement('div')
        band.className = 'block-1-7-services__totem-band'
        band.style.clipPath = `inset(${top}px -9999px ${listHeight - bottom}px -9999px)`
        band.style.color = color || BAND_COLORS[theme]
        const clone = stack.cloneNode(true) as HTMLElement
        clone.style.display = ''
        band.appendChild(clone)
        totem.appendChild(band)
        bands.push(band)
        stacks.push(clone)
      })
      shapes = {} as Record<ShapeName, HTMLElement[]>
      SHAPES.forEach((name) => {
        shapes[name] = bands
          .map((band) => band.querySelector<HTMLElement>(`[data-totem-shape="${name}"]`))
          .filter((shape): shape is HTMLElement => shape !== null)
      })
    }

    const removeBands = () => {
      bands.forEach((band) => band.remove())
      bands = []
      stacks = []
      shapes = {} as Record<ShapeName, HTMLElement[]>
      stack.style.display = ''
    }

    let isExitStarted = false
    let isTornDown = false
    const lastCardInView = () => {
      const lastCard = cards[cards.length - 1]
      return lastCard.getBoundingClientRect().bottom <= window.innerHeight + 2
    }
    const startExit = () => {
      if (isExitStarted) return
      isExitStarted = true
      const lastStack = stacks[stacks.length - 1]
      void import('./servicesExitDestroy').then(({ initServicesExitDestroy }) => {
        if (isTornDown || !lastStack?.isConnected) return
        const lastShapes = Array.from(lastStack.querySelectorAll<HTMLElement>('[data-totem-shape]'))
        if (!lastShapes.length) return
        exitTimeline = initServicesExitDestroy(lastShapes, totem, section, {
          inverted: finalRotation % 360 !== 0,
        })
      })
    }
    const checkExit = () => {
      if (lastCardInView()) startExit()
    }

    const buildFlip = (isTall: boolean) => {
      const first = stacks[0]
      const diamond = first?.querySelector<HTMLElement>('[data-totem-shape="diamond"]')
      const triangle = first?.querySelector<HTMLElement>('[data-totem-shape="triangle"]')
      if (!first || !diamond || !triangle) return null

      // The stack turns about the midpoint between the diamond's and the triangle's centres.
      const pivot =
        (diamond.offsetTop +
          diamond.offsetHeight / 2 +
          (triangle.offsetTop + triangle.offsetHeight / 2)) /
        2
      const below = first.offsetHeight - pivot
      const above = pivot
      /** The stack's extent below its pivot for a given rotation. */
      const reach = (rotation: number) => (rotation % 360 === 0 ? below : above)
      /** The `y` that puts the pivot at `pivotY` in the list. */
      const toY = (pivotY: number) => pivotY - pivot

      gsap.set(stacks, { transformOrigin: `50% ${pivot}px` })
      gsap.set(bands.slice(1), { autoAlpha: 0 })
      const boundaries = cardInfo.slice(1).map(({ top }) => top)
      const listHeight = list.offsetHeight

      if (!isTall) {
        gsap.set(stacks, { x: 0, y: toY((boundaries[0] ?? listHeight) - below), rotation: 0 })
        return null
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: list,
          start: 'top top',
          end: 'bottom bottom',
          scrub: getScrub(),
          invalidateOnRefresh: true,
          onLeave: checkExit,
          onRefresh: checkExit,
        },
      })

      let rotation = 0
      let pivotY = (boundaries[0] ?? listHeight) - below
      gsap.set(stacks, { x: 0, y: toY(pivotY), rotation: 0 })
      let time = TIMELINE_START
      const flipTime = (frame: number) => (frame / FLIP_KEYS.frames) * FLIP_DURATION

      const travel = (at: number, from: number, to: number, inverted: boolean) => {
        const distance = to - from
        const duration = distance / TRAVEL_SPEED
        timeline.to(stacks, { y: toY(to), duration, ease: 'none' }, at)
        if (!slinky) return duration
        const order = inverted
          ? (['lead', 'mid', 'trail'] as const)
          : (['trail', 'mid', 'lead'] as const)
        const sign = inverted ? -1 : 1
        SHAPES.forEach((name, index) => {
          const track = SLINKY_ROLES.roles[order[index]]
          for (let key = 1; key < track.length; key++) {
            const [frame, offset] = track[key]
            const previous = track[key - 1][0]
            timeline.to(
              shapes[name],
              {
                y: offset * distance * sign,
                duration: ((frame - previous) / SLINKY_ROLES.frames) * duration,
                ease: 'none',
              },
              at + (previous / SLINKY_ROLES.frames) * duration,
            )
          }
        })
        return duration
      }

      boundaries.forEach((boundary, index) => {
        const direction =
          isMobile || (cardInfo[index].theme === 'parme' && cardInfo[index + 1].theme === 'dark')
            ? -1
            : 1
        const extent = reach(rotation)
        const arrival = boundary - extent
        if (arrival - pivotY > 1) {
          time += travel(time, pivotY, arrival, rotation % 360 !== 0) + STEP_GAP
        }
        if (bands[index + 1]) timeline.set(bands[index + 1], { autoAlpha: 1 }, time)
        for (let key = 1; key < FLIP_KEYS.keys.length; key++) {
          const [frame, x, y, turn] = FLIP_KEYS.keys[key]
          const previous = FLIP_KEYS.keys[key - 1][0]
          timeline.to(
            stacks,
            {
              x: direction * x * extent,
              y: toY(boundary + y * extent),
              rotation: rotation + direction * turn,
              duration: flipTime(frame) - flipTime(previous),
              ease: 'none',
            },
            time + flipTime(previous),
          )
        }
        time += FLIP_DURATION + STEP_GAP
        rotation += direction * 180
        pivotY = boundary + extent
      })

      const end = listHeight - reach(rotation)
      if (end - pivotY > 1) travel(time, pivotY, end, rotation % 360 !== 0)
      finalRotation = rotation
      return timeline
    }

    const buildFormation = () => {
      const first = stacks[0]
      const diamond = first?.querySelector<HTMLElement>('[data-totem-shape="diamond"]')
      if (!first || !diamond) return null
      const scale = diamond.offsetWidth / FORMATION_DIAMOND_WIDTH
      const offset = (cardInfo[1]?.top ?? list.offsetHeight) - first.offsetHeight
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: list,
          start: `top+=${offset} 80%`,
          end: `top+=${offset} 30%`,
          scrub: getScrub(),
          invalidateOnRefresh: true,
        },
      })
      SHAPES.forEach((name) => {
        const keys = FORMATION.shapes[name]
        const [, x, y, rotation] = keys[0]
        gsap.set(shapes[name], {
          x: x * scale,
          y: y * scale,
          rotation,
          transformOrigin: '50% 50%',
        })
        for (let key = 1; key < keys.length; key++) {
          const [frame, x, y, rotation] = keys[key]
          const previous = keys[key - 1][0]
          timeline.to(
            shapes[name],
            {
              x: x * scale,
              y: y * scale,
              rotation,
              ease: 'none',
              duration: (frame - previous) / FORMATION.frames,
            },
            previous / FORMATION.frames,
          )
        }
      })
      return timeline
    }

    const killTimeline = (timeline: gsap.core.Timeline | null) => {
      timeline?.scrollTrigger?.kill()
      timeline?.kill()
    }

    let builtHeight = 0
    const build = () => {
      buildBands()
      const isTall = list.offsetHeight > window.innerHeight + 4
      flipTimeline = buildFlip(isTall)
      formationTimeline = isTall ? buildFormation() : null
      builtHeight = list.offsetHeight
    }
    const teardown = () => {
      killTimeline(flipTimeline)
      killTimeline(formationTimeline)
      killTimeline(exitTimeline)
      flipTimeline = formationTimeline = exitTimeline = null
      isExitStarted = false
      removeBands()
    }

    build()

    // Rebuild when the list's height changes (images, fonts) …
    let isRebuilding = false
    const onRefreshInit = () => {
      if (isRebuilding || Math.abs(list.offsetHeight - builtHeight) < 2) return
      isRebuilding = true
      teardown()
      build()
      isRebuilding = false
    }
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit)

    // … or the viewport's width does.
    let lastWidth = window.innerWidth
    let frame = 0
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        teardown()
        build()
        ScrollTrigger.refresh()
      })
    }
    window.addEventListener('resize', onResize)

    return () => {
      isTornDown = true
      window.removeEventListener('resize', onResize)
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit)
      cancelAnimationFrame(frame)
      teardown()
    }
  })
  return () => mm.revert()
}
