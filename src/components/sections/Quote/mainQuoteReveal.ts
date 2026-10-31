import { gsap } from '@/lib/animation/gsap'
import { createLogger } from '@/lib/utils/debug'

/*
 * The quote block's "fly-in" totem, ported from the source's main-quote-reveal.js: four
 * shapes (square, diamond, circle, triangle) fly in and settle along keyframes baked from
 * the original Lottie animation (30fps, frames 0–90). Positions are in Lottie pixels and are
 * scaled to the rendered totem (column span and square width).
 */

type ShapeName = 'square' | 'diamond' | 'circle' | 'triangle'

interface ShapeKeyframes {
  /** Frame the shape appears on. */
  enter: number
  /** `[frame, x, y]` offsets from the shape's resting place, in Lottie pixels. */
  pos: [number, number, number][]
  /** `[frame, degrees]` rotation keys, or null. */
  rot: [number, number][] | null
}

const LOTTIE = {
  fps: 30,
  activeEnd: 90,
  /** Lottie distance between the triangle and square centres, and the square's width. */
  refs: { lottieColSpan: 319.63, lottieRectW: 134.2 },
}

const SHAPE_NAMES: ShapeName[] = ['square', 'diamond', 'circle', 'triangle']

const SHAPES: Record<ShapeName, ShapeKeyframes> = {
  square: {
    enter: 30,
    pos: [
      [30, -279, 430],
      [31, -276.59, 424.88],
      [32, -266.84, 404.13],
      [33, -242.1, 351.54],
      [34, -193.83, 248.88],
      [35, -145.9, 146.96],
      [36, -112.88, 76.73],
      [37, -89.58, 27.2],
      [38, -72.23, -9.71],
      [39, -58.81, -38.24],
      [40, -48.21, -60.78],
      [41, -39.74, -78.81],
      [42, -32.93, -93.29],
      [43, -27.46, -104.91],
      [44, -23.11, -114.16],
      [45, -19.71, -121.4],
      [46, -17.11, -126.92],
      [47, -15.22, -130.94],
      [48, -13.95, -133.64],
      [49, -13.23, -135.18],
      [50, -13, -135.66],
      [51, -12.95, -135.18],
      [52, -12.8, -133.57],
      [53, -12.51, -130.51],
      [54, -12.03, -125.5],
      [55, -11.28, -117.7],
      [56, -10.11, -105.46],
      [57, -8.12, -84.73],
      [58, -4.16, -43.44],
      [59, -0.59, -6.2],
      [60, 0, 0],
      [61, -0.32, -0.01],
      [62, -2.24, 0],
      [63, -4.37, 0.12],
      [64, -5.44, 0.22],
      [65, -6.06, 0.29],
      [66, -6.46, 0.34],
      [67, -6.72, 0.38],
      [68, -6.88, 0.4],
      [69, -6.96, 0.41],
      [70, -6.98, 0.42],
      [71, -6.9, 0.41],
      [72, -6.63, 0.37],
      [73, -6.15, 0.3],
      [74, -5.45, 0.22],
      [75, -4.53, 0.13],
      [76, -3.42, 0.05],
      [77, -2.21, 0],
      [78, -1.09, -0.01],
      [79, -0.29, -0.01],
      [80, 0, 0],
      [81, 0, 0],
      [82, 0, 0],
      [83, 0, 0],
      [84, 0, 0],
      [85, 0, 0],
      [86, 0, 0],
    ],
    rot: [
      [60, 0],
      [70, -10],
      [80, 0],
    ],
  },
  diamond: {
    enter: 25,
    pos: [
      [25, 218.48, 322.78],
      [26, 216.54, 318.75],
      [27, 209.01, 302.56],
      [28, 190.66, 262.02],
      [29, 155.6, 183.35],
      [30, 120.4, 105.13],
      [31, 95.17, 50.86],
      [32, 76.39, 12.29],
      [33, 61.49, -16.67],
      [34, 49.15, -39.17],
      [35, 38.65, -56.99],
      [36, 29.58, -71.23],
      [37, 21.71, -82.63],
      [38, 14.88, -91.69],
      [39, 9.01, -98.8],
      [40, 4.06, -104.27],
      [41, -0.01, -108.36],
      [42, -3.2, -111.27],
      [43, -5.5, -113.18],
      [44, -6.9, -114.23],
      [45, -7.37, -114.56],
      [46, -7.16, -114.18],
      [47, -6.63, -112.9],
      [48, -5.88, -110.45],
      [49, -4.99, -106.47],
      [50, -4.01, -100.35],
      [51, -2.98, -91.03],
      [52, -1.97, -76.25],
      [53, -1.09, -49.78],
      [54, -0.46, -9.69],
      [55, 0, 0],
      [56, -0.39, 0],
      [57, -1.07, 0.01],
      [58, -1.85, 0.03],
      [59, -2.67, 0.06],
      [60, -3.52, 0.1],
      [61, -4.35, 0.15],
      [62, -5.18, 0.21],
      [63, -5.95, 0.27],
      [64, -6.63, 0.34],
      [65, -7.02, 0.38],
      [66, -6.68, 0.34],
      [67, -6.08, 0.29],
      [68, -5.39, 0.22],
      [69, -4.66, 0.17],
      [70, -3.9, 0.12],
      [71, -3.13, 0.08],
      [72, -2.37, 0.04],
      [73, -1.63, 0.02],
      [74, -0.94, 0.01],
      [75, -0.34, 0],
      [76, 0, 0],
      [77, 0, 0],
      [78, 0, 0],
      [79, 0, 0],
      [80, 0, 0],
      [81, 0, 0],
      [82, 0, 0],
      [83, 0, 0],
      [84, 0, 0],
      [85, 0, 0],
      [86, 0, 0],
    ],
    rot: [
      [25, 31],
      [45, -7.4],
      [55, 0],
      [65, -6.2],
      [76, 0],
    ],
  },
  circle: {
    enter: 20,
    pos: [
      [20, -193.87, 233.19],
      [21, -192.12, 229.44],
      [22, -185.01, 214.26],
      [23, -167.01, 175.76],
      [24, -131.86, 100.63],
      [25, -96.96, 26.03],
      [26, -72.92, -25.37],
      [27, -55.96, -61.62],
      [28, -43.32, -88.63],
      [29, -33.56, -109.51],
      [30, -25.84, -126.01],
      [31, -19.67, -139.2],
      [32, -14.71, -149.8],
      [33, -10.73, -158.31],
      [34, -7.56, -165.07],
      [35, -5.09, -170.37],
      [36, -3.2, -174.41],
      [37, -1.82, -177.35],
      [38, -0.89, -179.33],
      [39, -0.37, -180.46],
      [40, -0.2, -180.81],
      [41, -0.2, -180.17],
      [42, -0.2, -178.02],
      [43, -0.19, -173.94],
      [44, -0.19, -167.27],
      [45, -0.17, -156.88],
      [46, -0.16, -140.55],
      [47, -0.13, -112.92],
      [48, -0.06, -57.9],
      [49, -0.01, -8.27],
      [50, 0, 0],
      [51, -0.42, 0],
      [52, -1.55, 0.02],
      [53, -3.21, 0.08],
      [54, -5.23, 0.22],
      [55, -7.42, 0.45],
      [56, -9.6, 0.77],
      [57, -11.59, 1.13],
      [58, -13.22, 1.48],
      [59, -14.32, 1.74],
      [60, -14.73, 1.84],
      [61, -14.2, 1.71],
      [62, -12.75, 1.37],
      [63, -10.61, 0.94],
      [64, -7.99, 0.53],
      [65, -5.13, 0.21],
      [66, -2.25, 0.04],
      [67, 0.4, 0],
      [68, 2.59, 0.06],
      [69, 4.07, 0.15],
      [70, 4.61, 0.19],
      [71, 4.13, 0.15],
      [72, 2.99, 0.08],
      [73, 1.63, 0.03],
      [74, 0.48, 0],
      [75, 0, 0],
      [76, 0, 0],
      [77, 0, 0],
      [78, 0, 0],
      [79, 0, 0],
      [80, 0, 0],
      [81, 0, 0],
      [82, 0, 0],
      [83, 0, 0],
      [84, 0, 0],
      [85, 0, 0],
      [86, 0, 0],
    ],
    rot: [
      [50, 0],
      [60, -14.5],
      [70, 4.5],
      [75, 0],
    ],
  },
  triangle: {
    enter: 0,
    pos: [
      [0, 0, 175],
      [1, 0, 170.46],
      [2, 0, 159.39],
      [3, 0, 144.87],
      [4, 0, 128.96],
      [5, 0, 112.91],
      [6, 0, 97.44],
      [7, 0, 82.94],
      [8, 0, 69.61],
      [9, 0, 57.54],
      [10, 0, 46.73],
      [11, 0, 37.18],
      [12, 0, 28.85],
      [13, 0, 21.69],
      [14, 0, 15.65],
      [15, 0, 10.68],
      [16, 0, 6.71],
      [17, 0, 3.71],
      [18, 0, 1.62],
      [19, 0, 0.4],
      [20, 0, 0],
      [21, 0, 0],
      [22, 0, 0],
      [23, 0, 0],
      [24, 0, 0],
      [25, 0, 0],
      [26, 0, 0],
      [27, 0, 0],
      [28, 0, 0],
      [29, 0, 0],
      [30, 0, 0],
      [31, 0, 0],
      [32, 0, 0],
      [33, 0, 0],
      [34, 0, 0],
      [35, 0, 0],
      [36, 0, 0],
      [37, 0, 0],
      [38, 0, 0],
      [39, 0, 0],
      [40, 0, 0],
      [41, 0, 0],
      [42, 0, 0],
      [43, 0, 0],
      [44, 0, 0],
      [45, 0, 0],
      [46, 0, 0],
      [47, 0, 0],
      [48, 0, 0],
      [49, 0, 0],
      [50, 0, 0],
      [51, 0, 0],
      [52, 0, 0],
      [53, 0, 0],
      [54, 0, 0],
      [55, 0, 0],
      [56, 0, 0],
      [57, 0, 0],
      [58, 0, 0],
      [59, 0, 0],
      [60, 0, 0],
      [61, 0, 0],
      [62, 0, 0],
      [63, 0, 0],
      [64, 0, 0],
      [65, 0, 0],
      [66, 0, 0],
      [67, 0, 0],
      [68, 0, 0],
      [69, 0, 0],
      [70, 0, 0],
      [71, 0, 0],
      [72, 0, 0],
      [73, 0, 0],
      [74, 0, 0],
      [75, 0, 0],
      [76, 0, 0],
      [77, 0, 0],
      [78, 0, 0],
      [79, 0, 0],
      [80, 0, 0],
      [81, 0, 0],
      [82, 0, 0],
      [83, 0, 0],
      [84, 0, 0],
      [85, 0, 0],
      [86, 0, 0],
    ],
    rot: null,
  },
}

const log = createLogger('main-quote-reveal', '#DBB6FC')

/** Centre and width of a shape (its SVG bbox for SVG children, else its client rect). */
function measure(element: Element) {
  if (element instanceof SVGGraphicsElement && element.ownerSVGElement) {
    const box = element.getBBox()
    return { x: box.x + box.width / 2, y: box.y + box.height / 2, w: box.width }
  }
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, w: rect.width }
}

interface MainQuoteOptions {
  /** Mirror the horizontal paths (totem on the left). */
  flipX?: boolean
  /** Timeline to add the tweens to (a new paused one otherwise). */
  target?: gsap.core.Timeline
  /** Time of frame 0 on the target. */
  base?: number
  /** Time frames 0–90 span on the target; without it, frames play at 30fps. */
  span?: number
}

/** Adds the totem fly-in to `options.target` (or a new paused timeline) and returns it. */
export function buildMainQuoteTimeline(totem: Element, options: MainQuoteOptions = {}) {
  const direction = options.flipX ? -1 : 1
  const base = options.base ?? 0
  const span = options.span
  const time = span
    ? (frame: number) => base + (frame / LOTTIE.activeEnd) * span
    : (frame: number) => frame / LOTTIE.fps
  const shapes = Object.fromEntries(
    SHAPE_NAMES.map((name) => [
      name,
      totem.querySelector(`[data-shape="${name}"], [data-totem-shape="${name}"]`),
    ]),
  ) as Record<ShapeName, Element | null>

  let scaleY = 1
  let scaleX = 1
  if (shapes.square && shapes.triangle) {
    const columnSpan = Math.abs(measure(shapes.triangle).y - measure(shapes.square).y)
    if (columnSpan) scaleY = columnSpan / LOTTIE.refs.lottieColSpan
  }
  if (shapes.square) {
    const width = measure(shapes.square).w
    if (width) scaleX = width / LOTTIE.refs.lottieRectW
  }
  log(`scales — x:${scaleX.toFixed(4)} y:${scaleY.toFixed(4)}`)

  const timeline = options.target ?? gsap.timeline({ paused: true })
  SHAPE_NAMES.forEach((name) => {
    const element = shapes[name]
    if (!element) return
    const { pos, rot, enter } = SHAPES[name]
    gsap.set(element, { transformOrigin: '50% 50%' })

    timeline.set(
      element,
      { x: pos[0][1] * scaleX * direction, y: pos[0][2] * scaleY, autoAlpha: 0 },
      0,
    )
    timeline.to(element, { autoAlpha: 1, duration: 0, immediateRender: false }, time(enter))
    for (let i = 1; i < pos.length; i++) {
      const [frame, x, y] = pos[i]
      const previous = pos[i - 1][0]
      timeline.to(
        element,
        {
          x: x * scaleX * direction,
          y: y * scaleY,
          ease: 'none',
          duration: time(frame) - time(previous),
        },
        time(previous),
      )
    }

    if (rot) {
      timeline.set(element, { rotation: rot[0][1] * direction }, time(rot[0][0]))
      for (let i = 1; i < rot.length; i++) {
        const [frame, degrees] = rot[i]
        const previous = rot[i - 1][0]
        timeline.to(
          element,
          { rotation: degrees * direction, ease: 'none', duration: time(frame) - time(previous) },
          time(previous),
        )
      }
    }
  })
  log(`timeline built — duration ${timeline.duration().toFixed(2)}s`)

  return { timeline, scaleX, scaleY }
}
