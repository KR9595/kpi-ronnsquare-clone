import { gsap } from '@/lib/gsap'

import { createLogger } from './debug'

/*
 * The brand clone, ported from the source's brand-clone.js: a big fixed copy of the logo
 * (`[data-brand-clone]`, see BrandClone.tsx) that plays the wordmark reveal, then travels
 * to the hero (desktop) or straight into the header's logo slot (mobile). Positions are
 * plain viewport px, measured once from the header logo's box.
 */

const log = createLogger('brand-clone', '#e17055')

/** The logo's own art box (the header viewBox), in SVG units. */
const ART_WIDTH = 116.408
const ART_HEIGHT = 50.0008

export function getClone() {
  return document.querySelector<HTMLElement>('[data-brand-clone]')
}

/** Keeps one clone, as a direct child of <body> (BrandClone already portals it there). */
export function reparentClone(clone: HTMLElement) {
  document.querySelectorAll('body > [data-brand-clone]').forEach((other) => {
    if (other !== clone) other.remove()
  })
  if (clone.parentElement !== document.body) document.body.appendChild(clone)
}

export function hideClones() {
  document
    .querySelectorAll('[data-brand-clone]')
    .forEach((clone) => gsap.set(clone, { autoAlpha: 0 }))
}

/**
 * Sizes the clone's SVG to `--brand-clone-start-width` and measures where its art sits
 * inside the taller clone viewBox, plus the scale that shrinks it onto the header logo.
 */
export function measureClone(clone: HTMLElement, headerLogo: Element) {
  const svg = clone.querySelector('svg')!
  const logoRect = (headerLogo.querySelector('svg') ?? headerLogo).getBoundingClientRect()

  svg.style.width = 'var(--brand-clone-start-width)'
  const startWidth = parseFloat(getComputedStyle(svg).width) || 0
  const viewBox = (svg.getAttribute('viewBox') || `0 0 ${ART_WIDTH} ${ART_HEIGHT}`)
    .split(/[\s,]+/)
    .map(Number)
  const [minX, minY, boxWidth, boxHeight] =
    viewBox.length === 4 ? viewBox : [0, 0, ART_WIDTH, ART_HEIGHT]
  const startHeight =
    boxWidth > 0
      ? startWidth * (boxHeight / boxWidth)
      : logoRect.width > 0
        ? startWidth * (logoRect.height / logoRect.width)
        : logoRect.height
  gsap.set(svg, { width: startWidth || logoRect.width, height: startHeight || logoRect.height })

  const pxPerUnit = boxWidth > 0 ? startWidth / boxWidth : 0
  const artWidthPx = ART_WIDTH * pxPerUnit
  const artHeightPx = ART_HEIGHT * pxPerUnit
  const artLeftPx = (0 - minX) * pxPerUnit
  const artTopPx = (0 - minY) * pxPerUnit
  const endScale = artWidthPx > 0 && logoRect.width > 0 ? logoRect.width / artWidthPx : 1

  // Resolve the CSS custom property (a clamp()) to px through a throwaway margin.
  svg.style.marginTop = 'var(--brand-clone-hero-offset-y)'
  const heroOffsetY = parseFloat(getComputedStyle(svg).marginTop) || 0
  svg.style.marginTop = ''

  return {
    logoRect,
    startWidth,
    startHeight,
    endScale,
    heroOffsetY,
    artLeftPx,
    artTopPx,
    artWidthPx,
    artHeightPx,
  }
}

export interface ClonePositions {
  endScale: number
  heroX: number
  heroY: number
  slotY: number
  centerX: number
  centerY: number
}

/**
 * Hides the header logo and pins the clone (fixed, top-left origin) either at the viewport
 * centre (hidden, for the wordmark reveal) or at its hero spot (visible). Returns every
 * position the entrance moves it between.
 */
export function stageClone(
  clone: HTMLElement,
  headerLogo: Element,
  at: 'hero' | 'center',
): ClonePositions {
  gsap.set(clone, { clearProps: 'color' })
  const { logoRect, endScale, heroOffsetY, artLeftPx, artTopPx, artWidthPx, artHeightPx } =
    measureClone(clone, headerLogo)
  gsap.set(headerLogo, { autoAlpha: 0 })

  const positions = {
    endScale,
    heroX: logoRect.left - artLeftPx,
    heroY: logoRect.top + heroOffsetY - artTopPx,
    slotY: logoRect.top - endScale * artTopPx,
    centerX: Math.max(0, (window.innerWidth - artWidthPx) / 2 - artLeftPx),
    centerY: Math.max(0, (window.innerHeight - artHeightPx) / 2 - artTopPx),
  }
  const isHero = at === 'hero'
  gsap.set(clone, {
    position: 'fixed',
    top: 0,
    left: 0,
    transformOrigin: 'top left',
    x: isHero ? positions.heroX : positions.centerX,
    y: isHero ? positions.heroY : positions.centerY,
    scale: 1,
    autoAlpha: isHero ? 1 : 0,
  })
  log(
    `clone staged (${at}) — headerLogo ${Math.round(logoRect.width)}×${Math.round(logoRect.height)} @ ${Math.round(logoRect.left)},${Math.round(logoRect.top)}; endScale ${endScale.toFixed(3)}`,
  )
  return positions
}

/**
 * Mobile: at `header+=0.2` the clone shrinks straight into the header logo slot (1s,
 * power3.inOut) and takes on the header logo's colour, then swaps for the real logo.
 */
export function settleCloneIntoHeader(
  timeline: gsap.core.Timeline,
  clone: HTMLElement,
  headerLogo: Element,
  positions: ClonePositions,
) {
  timeline.addLabel('cloneSettle', 'header+=0.2')
  timeline.to(
    clone,
    {
      x: positions.heroX,
      y: positions.slotY,
      scale: positions.endScale,
      duration: 1,
      ease: 'power3.inOut',
      onComplete: () => {
        document.body.classList.remove('is-home-entrance')
        gsap.set(headerLogo, { clearProps: 'opacity,visibility' })
        gsap.set(clone, { autoAlpha: 0, clearProps: 'willChange' })
        log('clone settled → swapped to real header logo')
      },
    },
    'cloneSettle',
  )
  timeline.to(
    clone,
    { color: () => getComputedStyle(headerLogo).color, duration: 0.6, ease: 'none' },
    'cloneSettle+=0.4',
  )
}
