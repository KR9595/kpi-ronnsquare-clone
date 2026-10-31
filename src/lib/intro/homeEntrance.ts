import { gsap } from '@/lib/gsap'

import {
  getClone,
  hideClones,
  measureClone,
  reparentClone,
  settleCloneIntoHeader,
  stageClone,
} from './brandClone'
import type { ClonePositions } from './brandClone'
import { createLogger, getSlowmo } from './debug'
import { animateHeaderIn, revealHeader } from './headerEntrance'
import { addGridReveal, isFirstSessionLoad } from './loaderReveal'
import { buildWordmarkReveal } from './wordmarkReveal'

/*
 * The homepage entrance, ported from the source's entrances/home.js (`buildEntrance`; its
 * Barba page-transition branch is left out, this is a single page). Three branches:
 *
 * 1. Reduced motion: everything jumps to its end state.
 * 2. Repeat visit in the session ("quick entrance"): the loader fades (`gridReveal`), the
 *    hero plays 0.3s in; on desktop the clone fades in at its hero spot.
 * 3. First load: wordmark reveal in the centre → `wordmarkDone` → loader fades
 *    (`gridReveal`) → header drops in (`header`) → hero (`content`). Desktop flies the clone
 *    to the hero at `cloneToHero` and staggers the nav in; scrolling then shrinks it into
 *    the header logo slot. Mobile settles the clone straight into the header
 *    (`cloneSettle`).
 *
 * The page isn't scroll-locked meanwhile (the source doesn't lock it either); on desktop the
 * scroll-scrubbed shrink just stays disabled until the clone reaches the hero.
 */

const log = createLogger('entrance:home', '#fdcb6e')

const DESKTOP_QUERY = '(min-width: 48em)'

/** The scroll-scrubbed shrink of the clone into the header (desktop), if one is live. */
let scrollShrink: gsap.core.Timeline | null = null

export function buildHomeEntrance(aboveFold: gsap.core.Timeline | null) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const loader = document.getElementById('site-loader')
  const clone = getClone()
  const headerLogo = document.querySelector('.header-ronn__logo')
  const isDesktop = window.matchMedia(DESKTOP_QUERY).matches
  const useClone = !!clone

  killScrollShrink()
  log(
    `buildEntrance — prefersReduced: ${prefersReduced}, useClone: ${useClone}, aboveFold: ${!!aboveFold}`,
  )

  if (prefersReduced) {
    loader?.remove()
    revealHeader()
    aboveFold?.paused(false).progress(1)
    hideClones()
    if (headerLogo) gsap.set(headerLogo, { clearProps: 'opacity,visibility' })
    document.body.classList.remove('is-home-entrance')
    return null
  }

  if (!isFirstSessionLoad()) {
    revealHeader()
    const tl = gsap.timeline({ id: 'entrance', paused: true })
    addGridReveal(tl, 0)
    if (clone && headerLogo && isDesktop) {
      reparentClone(clone)
      const positions = stageClone(clone, headerLogo, 'hero')
      prepareHeaderForShrink()
      buildScrollShrink(clone, headerLogo, positions)
      gsap.set(clone, { autoAlpha: 0 })
      tl.fromTo(
        clone,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.6, ease: 'power1.out' },
        'gridReveal',
      )
    } else {
      hideClones()
      if (headerLogo) gsap.set(headerLogo, { clearProps: 'opacity,visibility' })
    }
    document.body.classList.remove('is-home-entrance')
    if (aboveFold) {
      tl.addLabel('content', 'gridReveal+=0.3')
      tl.add(aboveFold.paused(false), 'content')
    }
    tl.progress(0).play()
    log('quick entrance playing (loader fade, no assembly)')
    return tl
  }

  const tl = gsap.timeline({ id: 'entrance', paused: true })
  if (clone && headerLogo) {
    reparentClone(clone)
    const positions = stageClone(clone, headerLogo, 'center')
    let shrink: gsap.core.Timeline | null = null
    if (isDesktop) {
      prepareHeaderForShrink()
      shrink = buildScrollShrink(clone, headerLogo, positions)
      shrink.scrollTrigger?.disable(false, false)
      gsap.set(clone, { x: positions.centerX, y: positions.centerY, scale: 1, autoAlpha: 0 })
    }
    buildWordmarkReveal(tl, 0, { target: clone })
    addGridReveal(tl, 'wordmarkDone')
    tl.addLabel('header', 'gridReveal+=0.3')
    animateHeaderIn(tl, 'header')
    if (aboveFold) {
      tl.addLabel('content', 'header+=0.1')
      tl.add(aboveFold.paused(false), 'content')
    }
    if (isDesktop && shrink) flyCloneToHero(tl, clone, positions, shrink)
    else settleCloneIntoHeader(tl, clone, headerLogo, positions)
  } else {
    addGridReveal(tl, 0)
    tl.addLabel('header', 'gridReveal+=0.3')
    animateHeaderIn(tl, 'header')
    if (aboveFold) {
      tl.addLabel('content', 'header+=0.1')
      tl.add(aboveFold.paused(false), 'content')
    }
    if (headerLogo) gsap.set(headerLogo, { clearProps: 'opacity,visibility' })
    document.body.classList.remove('is-home-entrance')
  }

  const slowmo = getSlowmo()
  if (slowmo) tl.timeScale(1 / slowmo)
  tl.progress(0).play()
  log('fresh entrance timeline playing')
  return tl
}

/** Desktop start state of the scrubbed header: nav pushed 25% right, bottom border at 0. */
function prepareHeaderForShrink() {
  const nav = document.querySelector('.header-ronn__nav')
  const main = document.querySelector('.header-ronn__main')
  if (nav) gsap.set(nav, { xPercent: 25 })
  if (main) gsap.set(main, { '--hr-border-scale': 0 })
}

/**
 * Desktop: 1.1s into the wordmark the clone glides from the centre to its hero spot (1s,
 * power2.inOut) and the scroll shrink is switched on when it lands. From
 * `cloneToHero+=0.4` the header logo/nav may show and the nav items stagger in.
 */
function flyCloneToHero(
  tl: gsap.core.Timeline,
  clone: HTMLElement,
  positions: ClonePositions,
  shrink: gsap.core.Timeline,
) {
  tl.addLabel('cloneToHero', 'wordmark+=1.1')
  tl.to(
    clone,
    {
      x: positions.heroX,
      y: positions.heroY,
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        shrink.scrollTrigger?.enable(false, false)
        shrink.scrollTrigger?.refresh()
        log('clone at hero → scroll scrub enabled')
      },
    },
    'cloneToHero',
  )
  tl.call(() => document.body.classList.remove('is-home-entrance'), [], 'cloneToHero+=0.4')
  staggerHeaderItems(tl, 'cloneToHero+=0.4')
}

/**
 * Desktop: over the first 35% of a viewport height of scroll, the clone shrinks from the
 * hero into the header logo slot while the nav slides from xPercent 25 to 0 and the bar's
 * bottom border grows in; in the last 10% the clone hands over to the real header logo.
 */
function buildScrollShrink(clone: HTMLElement, headerLogo: Element, positions: ClonePositions) {
  killScrollShrink()
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      start: 0,
      end: () => window.innerHeight * 0.35,
      scrub: true,
      invalidateOnRefresh: true,
    },
  })
  tl.fromTo(
    clone,
    { scale: 1, y: positions.heroY },
    {
      scale: () => measureClone(clone, headerLogo).endScale,
      y: positions.slotY,
      duration: 0.9,
    },
    0,
  )
  tl.fromTo(clone, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1, immediateRender: false }, 0.9)
  tl.fromTo(
    headerLogo,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.1, immediateRender: false },
    0.9,
  )
  const nav = document.querySelector('.header-ronn__nav')
  const main = document.querySelector('.header-ronn__main')
  if (nav) tl.fromTo(nav, { xPercent: 25 }, { xPercent: 0, duration: 0.9 }, 0)
  if (main) {
    tl.fromTo(main, { '--hr-border-scale': 0 }, { '--hr-border-scale': 1, duration: 0.9 }, 0)
  }
  scrollShrink = tl
  return tl
}

/** Kills the scroll shrink and its ScrollTrigger, if any. */
export function killScrollShrink() {
  if (!scrollShrink) return
  const trigger = scrollShrink.scrollTrigger
  scrollShrink.kill()
  trigger?.kill(false)
  scrollShrink = null
}

/** Desktop: the nav items and header buttons rise 10px and fade in, 0.06s apart. */
function staggerHeaderItems(tl: gsap.core.Timeline, position: string) {
  const items = [
    ...document.querySelectorAll('.header-ronn__nav-item'),
    ...document.querySelectorAll('.header-ronn__actions > *'),
  ]
  if (!items.length) return
  const containers = [
    document.querySelector('.header-ronn__nav'),
    document.querySelector('.header-ronn__actions'),
  ].filter(Boolean)
  tl.set(containers, { autoAlpha: 1 }, position)
  tl.set(items, { autoAlpha: 0, y: 10 }, position)
  tl.to(items, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' }, position)
}
