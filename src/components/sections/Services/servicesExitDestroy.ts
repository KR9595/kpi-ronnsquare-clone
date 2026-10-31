import Matter from 'matter-js'

import { gsap } from '@/lib/animation/gsap'

/*
 * The "Our Support" totem's exit, ported from the source's services-exit-destroy.js (loaded
 * lazily once the last card's bottom is on screen, like the source). The last band's three
 * shapes tip over to the left: a Matter.js world (no randomness, so every run bakes the same
 * frames) simulates the push once, and in the `arranged` mode the frames are then eased onto
 * resting places on the last card's bottom edge. A scroll-scrubbed timeline plays them back
 * while the block's bottom goes from 95% to 55% of the viewport.
 */

const { Engine, Bodies, Body, Composite } = Matter

const GRAVITY_X = -0.28
const GRAVITY_Y = 1
/** Initial leftward push (px per step), scaled per shape. */
const PUSH = 2
const SPIN = 0.04
const RESTITUTION = 0.04
const FRICTION = 0.6
const FRICTION_AIR = 0.02
const STEPS_ARRANGED = 90
const STEPS_PHYSICS = 150
/** Gap between a resting shape and the card's bottom edge. */
const FLOOR_GAP = 4
/** Resting x of each shape's centre, in totem widths from the totem's centre. */
const REST_X: Record<string, number> = { circle: -2.6, triangle: -1.4, diamond: -0.3 }
const REST_ROTATION: Record<string, number> = { circle: 0, triangle: 0, diamond: 45 }

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value)
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
/** The source's deterministic hash "random". */
const hash = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

interface Frame {
  x: number
  y: number
  rot: number
}

type Mode = 'arranged' | 'physics'

function bakeFrames(
  shapes: HTMLElement[],
  totem: HTMLElement,
  section: HTMLElement,
  lastCard: Element,
  mode: Mode,
  inverted: boolean,
) {
  const totemWidth = totem.offsetWidth
  const totemRect = totem.getBoundingClientRect()
  const sectionRect = section.getBoundingClientRect()
  const floorY = lastCard.getBoundingClientRect().bottom
  const centerX = totemRect.left + totemWidth / 2

  const info = shapes.map((shape) => {
    const rect = (shape.querySelector('svg') ?? shape).getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const name = shape.dataset.totemShape ?? ''
    const halfHeight = name === 'diamond' ? (rect.height / 2) * Math.SQRT1_2 : rect.height / 2
    const restX = centerX + (REST_X[name] ?? 0) * totemWidth
    const restY = floorY - halfHeight - FLOOR_GAP
    return {
      x,
      y,
      width: rect.width,
      height: rect.height,
      name,
      dx: restX - x,
      dy: restY - y,
      restRotation: (REST_ROTATION[name] ?? 0) - (inverted ? 180 : 0),
    }
  })

  const engine = Engine.create({ gravity: { x: GRAVITY_X, y: GRAVITY_Y, scale: 0.001 } })
  const floorTop = Math.max(...info.map(({ y, height }) => y + height / 2))
  const wallX = sectionRect.left + 30
  Composite.add(engine.world, [
    Bodies.rectangle(centerX, floorTop + 30, totemWidth * 24, 60, {
      isStatic: true,
      friction: 0.6,
    }),
    Bodies.rectangle(wallX - 25, floorY - 500, 50, 2000, { isStatic: true }),
  ])

  const options = { friction: FRICTION, frictionAir: FRICTION_AIR, restitution: RESTITUTION }
  const bodies = info.map(({ x, y, width, height, name }) => {
    if (name === 'circle') return Bodies.circle(x, y, width * 0.44, options)
    if (name === 'diamond') return Bodies.polygon(x, y, 4, width * 0.46, options)
    if (name === 'triangle') return Bodies.polygon(x, y, 3, width * 0.3, options)
    return Bodies.rectangle(x, y, width * 0.8, height * 0.8, options)
  })
  Composite.add(engine.world, bodies)
  const starts = bodies.map(({ position }) => ({ x: position.x, y: position.y }))

  bodies.forEach((body, index) => {
    const order = inverted ? bodies.length - 1 - index : index
    const push = PUSH * (2 - order * 0.7) * (0.85 + hash(order) * 0.3)
    Body.setVelocity(body, { x: -push, y: 0.3 * hash(order + 3) })
    Body.setAngularVelocity(body, -(SPIN * (0.6 + hash(order + 7) * 0.8)))
  })

  const steps = mode === 'physics' ? STEPS_PHYSICS : STEPS_ARRANGED
  const frames: Frame[][] = bodies.map(() => [{ x: 0, y: 0, rot: 0 }])
  for (let step = 0; step < steps; step++) {
    Engine.update(engine, 16.666)
    bodies.forEach((body, index) => {
      frames[index].push({
        x: body.position.x - starts[index].x,
        y: body.position.y - starts[index].y,
        rot: body.angle * (180 / Math.PI),
      })
    })
  }
  Composite.clear(engine.world, false)
  Engine.clear(engine)
  if (mode === 'physics') return frames

  // `arranged`: after the first 18% of the frames, blend the simulation into the rest pose.
  const last = frames[0].length - 1
  return frames.map((shapeFrames, index) => {
    const { dx, dy, restRotation } = info[index]
    return shapeFrames.map((frame, step) => {
      const blend = smootherstep(clamp01((step / last - 0.18) / 0.82))
      return {
        x: frame.x * (1 - blend) + dx * blend,
        y: frame.y * (1 - blend) + dy * blend,
        rot: frame.rot * (1 - blend) + restRotation * blend,
      }
    })
  })
}

interface ExitOptions {
  /** The stack ended upside down (an odd number of flips). */
  inverted?: boolean
}

/** Builds the scrubbed exit for the last band's `shapes`. Returns its timeline. */
export function initServicesExitDestroy(
  shapes: HTMLElement[],
  totem: HTMLElement,
  section: HTMLElement,
  { inverted = false }: ExitOptions = {},
) {
  const cards = section.querySelectorAll('[data-stacking-card]')
  const lastCard = cards[cards.length - 1]
  if (!lastCard) return null
  const mode: Mode = section.dataset.servicesDestroy === 'arranged' ? 'arranged' : 'physics'
  const sign = inverted ? -1 : 1

  gsap.set(shapes, { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' })
  const frames = bakeFrames(shapes, totem, section, lastCard, mode, inverted)

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'bottom 95%',
      end: 'bottom 55%',
      scrub: 1,
      invalidateOnRefresh: true,
    },
  })
  shapes.forEach((shape, index) => {
    const shapeFrames = frames[index]
    if (!shapeFrames) return
    const progress = { p: 0 }
    timeline.to(
      progress,
      {
        p: 1,
        duration: 1,
        ease: 'none',
        onUpdate: () => {
          const position = progress.p * (shapeFrames.length - 1)
          const from = Math.floor(position)
          const to = Math.min(from + 1, shapeFrames.length - 1)
          const t = position - from
          const a = shapeFrames[from]
          const b = shapeFrames[to]
          gsap.set(shape, {
            x: (a.x + (b.x - a.x) * t) * sign,
            y: (a.y + (b.y - a.y) * t) * sign,
            rotation: a.rot + (b.rot - a.rot) * t,
          })
        },
      },
      0,
    )
  })
  return timeline
}
