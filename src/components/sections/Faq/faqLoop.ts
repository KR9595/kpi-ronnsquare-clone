import { gsap } from '@/lib/animation/gsap'

/*
 * The source's faq-loop.js: the FAQ illustration's idle loop, baked from an After Effects
 * comp (30 fps keyframes with their cubic-bezier eases). Each part is a `[data-faq-part]`
 * group in the SVG; its keyframes become back-to-back tweens on one timeline. Only the "faq"
 * variant is ported, as the homepage illustration uses `data-faq-animation="faq"`.
 */

type Bezier = [number, number, number, number]
/** `[frame, rotation, ease]`; the first keyframe has no ease. */
type RotationKey = [number, number, Bezier?]
/** `[frame, x, y, ease]`; the first keyframe has no ease. */
type PositionKey = [number, number, number, Bezier?]

interface LoopPart {
  svgOrigin?: string
  rot?: RotationKey[]
  pos?: PositionKey[]
}

interface LoopAnimation {
  fps: number
  parts: Record<string, LoopPart>
}

const EASE_IN_OUT: Bezier = [0.333, 0, 0.667, 1]

const ANIMATIONS: Record<string, LoopAnimation> = {
  faq: {
    fps: 30,
    parts: {
      // The bowl and ball tilt ±12° around the bowl's bottom centre.
      main: {
        svgOrigin: '181.7 284.5',
        rot: [
          [0, 0],
          [30, -12, EASE_IN_OUT],
          [60, 12, EASE_IN_OUT],
          [90, 0, EASE_IN_OUT],
        ],
      },
      // The ball rolls along the rim, spinning around its own centre.
      ball: {
        pos: [
          [0, 0, 0],
          [30, -90.8, -0.9, EASE_IN_OUT],
          [60, 98.9, 1.7, EASE_IN_OUT],
          [90, 0, 0, EASE_IN_OUT],
        ],
        rot: [
          [0, 0],
          [30, -49.9, EASE_IN_OUT],
          [60, 49.9, [0.333, 0, 0.833, 1]],
          [90, 0, [0.167, 0, 0.667, 1]],
        ],
      },
    },
  },
}

/** A CSS-style `cubic-bezier(x1, y1, x2, y2)` ease, solved with Newton's method like the source. */
function cubicBezier([x1, y1, x2, y2]: Bezier) {
  const curveX = (t: number) =>
    3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t
  const curveY = (t: number) =>
    3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t
  return (progress: number) => {
    if (progress <= 0) return 0
    if (progress >= 1) return 1
    let t = progress
    for (let i = 0; i < 8; i++) {
      const error = curveX(t) - progress
      const slope = 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2)
      if (Math.abs(error) < 1e-4 || slope === 0) break
      t = Math.min(1, Math.max(0, t - error / slope))
    }
    return curveY(t)
  }
}

/**
 * Builds the paused loop of the illustration `container` (its `data-faq-animation`, default
 * "faq"). `repeat: -1` loops it forever.
 */
export function buildFaqLoop(container: HTMLElement, { repeat = 0 }: { repeat?: number } = {}) {
  const timeline = gsap.timeline({ paused: true, repeat })
  const animation = ANIMATIONS[container.dataset.faqAnimation ?? 'faq']
  if (!animation) return timeline
  const seconds = (frame: number) => frame / animation.fps

  Object.entries(animation.parts).forEach(([name, part]) => {
    const element = container.querySelector(`[data-faq-part="${name}"]`)
    if (!element) return
    if (part.pos) {
      gsap.set(element, { transformOrigin: '50% 50%' })
      for (let i = 1; i < part.pos.length; i++) {
        const [frame, x, y, ease] = part.pos[i]
        const from = part.pos[i - 1][0]
        timeline.to(
          element,
          { x, y, ease: cubicBezier(ease!), duration: seconds(frame) - seconds(from) },
          seconds(from),
        )
      }
    } else if (part.svgOrigin) {
      gsap.set(element, { svgOrigin: part.svgOrigin })
    }
    if (part.rot) {
      for (let i = 1; i < part.rot.length; i++) {
        const [frame, rotation, ease] = part.rot[i]
        const from = part.rot[i - 1][0]
        timeline.to(
          element,
          { rotation, ease: cubicBezier(ease!), duration: seconds(frame) - seconds(from) },
          seconds(from),
        )
      }
    }
  })
  return timeline
}
