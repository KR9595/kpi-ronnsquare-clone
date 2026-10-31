import { gsap } from '@/lib/gsap'

import { createLogger } from './debug'
import { PRELOADER_DATA } from './preloaderData'
import type { ShapeTrack } from './preloaderData'

/*
 * The wordmark preloader, ported from the source's wordmark-reveal.js: the diamond, circle
 * and triangle tumble in along the Lottie keyframes in preloaderData.ts, then the letters
 * slide in on their own cubic-beziers. Lottie px are mapped onto the rendered SVG by
 * measuring the logo itself (diamond→circle distance for y, s→e distance for x).
 */

const log = createLogger('wordmark-reveal', '#DBB6FC')

/** A CSS-style `cubic-bezier(x1, y1, x2, y2)` easing, solved with Newton's method. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const bezierX = (t: number) => 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t ** 3
  const bezierY = (t: number) => 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3
  return (progress: number) => {
    if (progress <= 0) return 0
    if (progress >= 1) return 1
    let t = progress
    for (let i = 0; i < 8; i++) {
      const error = bezierX(t) - progress
      const slope = 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2)
      if (Math.abs(error) < 1e-4 || slope === 0) break
      t -= error / slope
      t = Math.min(1, Math.max(0, t))
    }
    return bezierY(t)
  }
}

function bboxCenter(element: SVGGraphicsElement) {
  const box = element.getBBox()
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

interface ShapeTweak {
  xMul: number
  yAdd: number
}

/** The wordmark timeline for one logo SVG, plus the Lottie→SVG scales it used. */
export function buildWordmarkTimeline(svg: SVGSVGElement) {
  const { fps } = PRELOADER_DATA
  const toSeconds = (frame: number) => frame / fps
  const diamond = svg.querySelector<SVGGraphicsElement>('[data-shape="diamond"]')!
  const circle = svg.querySelector<SVGGraphicsElement>('[data-shape="circle"]')!
  const triangle = svg.querySelector<SVGGraphicsElement>('[data-shape="triangle"]')!
  const letters: Record<string, SVGGraphicsElement> = {}
  svg.querySelectorAll<SVGGraphicsElement>('[data-wm="letter"]').forEach((letter) => {
    letters[letter.dataset.glyph!] = letter
  })

  const diamondCenter = bboxCenter(diamond)
  const circleCenter = bboxCenter(circle)
  const scaleY =
    Math.abs(circleCenter.y - diamondCenter.y) / PRELOADER_DATA.ref.lottieDiamondToCircleY
  let scaleX = scaleY
  if (letters.s && letters.e) {
    scaleX =
      Math.abs(bboxCenter(letters.e).x - bboxCenter(letters.s).x) / PRELOADER_DATA.ref.lottieSToEX
  }
  log(`scales — x:${scaleX.toFixed(4)} y:${scaleY.toFixed(4)}`)

  const tl = gsap.timeline({ paused: true })
  const triangleBox = triangle.getBBox()
  const baseline = triangleBox.y + triangleBox.height
  const tweaks: Record<'diamond' | 'circle' | 'triangle', ShapeTweak> = {
    diamond: { xMul: 1, yAdd: 3 },
    circle: { xMul: 1, yAdd: 0 },
    triangle: { xMul: 1, yAdd: 0 },
  }

  // Each shape starts resting on the triangle's baseline; its own y scale maps the first
  // keyframe's y onto that resting offset.
  const animateShape = (
    shape: SVGGraphicsElement | null,
    track: ShapeTrack | undefined,
    tweak: ShapeTweak = { xMul: 1, yAdd: 0 },
  ) => {
    if (!shape || !track) return
    const { pos, rot } = track
    const xScale = scaleX * tweak.xMul
    const box = shape.getBBox()
    const centerY = box.y + box.height / 2
    const restingY = baseline - box.height / 2 + tweak.yAdd
    const firstY = pos[0][2]
    const yScale = firstY !== 0 ? (restingY - centerY) / firstY : 0

    gsap.set(shape, { transformOrigin: '50% 50%' })
    tl.set(shape, { x: pos[0][1] * xScale, y: pos[0][2] * yScale }, 0)
    for (let i = 1; i < pos.length; i++) {
      const [frame, x, y] = pos[i]
      const previousFrame = pos[i - 1][0]
      tl.to(
        shape,
        {
          x: x * xScale,
          y: y * yScale,
          ease: 'none',
          duration: toSeconds(frame) - toSeconds(previousFrame),
        },
        toSeconds(previousFrame),
      )
    }
    if (rot) {
      tl.set(shape, { rotation: rot[0][1] }, 0)
      for (let i = 1; i < rot.length; i++) {
        const [frame, rotation] = rot[i]
        const previousFrame = rot[i - 1][0]
        tl.to(
          shape,
          {
            rotation,
            ease: 'none',
            duration: toSeconds(frame) - toSeconds(previousFrame),
          },
          toSeconds(previousFrame),
        )
      }
    }
  }

  animateShape(diamond, PRELOADER_DATA.shapes.diamond, tweaks.diamond)
  animateShape(circle, PRELOADER_DATA.shapes.circle, tweaks.circle)
  animateShape(triangle, PRELOADER_DATA.shapes.triangle, tweaks.triangle)

  PRELOADER_DATA.letters.forEach((track) => {
    const letter = letters[track.glyph]
    if (!letter) return
    const ease = cubicBezier(...track.bez)
    tl.set(letter, { autoAlpha: 0, x: track.fromX * scaleX }, 0)
    tl.to(
      letter,
      { x: 0, ease, duration: toSeconds(track.posEnd) - toSeconds(track.posStart) },
      toSeconds(track.posStart),
    )
    tl.to(
      letter,
      {
        autoAlpha: 1,
        ease: 'none',
        duration: toSeconds(track.fadeEnd) - toSeconds(track.fadeStart),
      },
      toSeconds(track.fadeStart),
    )
  })

  log(`timeline built — duration ${tl.duration().toFixed(2)}s`)
  return { tl, scaleX, scaleY }
}

/**
 * Adds the wordmark reveal of `target` (the brand clone) to `timeline` at `position`:
 * label `wordmark` at the start and `wordmarkDone` 0.3s after it ends.
 */
export function buildWordmarkReveal(
  timeline: gsap.core.Timeline,
  position: gsap.Position,
  { target }: { target?: HTMLElement | null } = {},
) {
  const svg = target?.querySelector('svg')
  if (!target || !svg) {
    log('no wordmark svg — skipping')
    return
  }
  timeline.addLabel('wordmark', position)
  const { tl } = buildWordmarkTimeline(svg)
  timeline.set(target, { autoAlpha: 1 }, 'wordmark')
  timeline.add(tl.paused(false), 'wordmark')
  timeline.addLabel('wordmarkDone', '>+=0.3')
}
