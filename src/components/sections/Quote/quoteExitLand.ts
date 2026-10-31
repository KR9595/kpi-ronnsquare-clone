import { CustomEase } from 'gsap/CustomEase'
import { CustomWiggle } from 'gsap/CustomWiggle'
import Matter from 'matter-js'

import { ScrollTrigger, gsap } from '@/lib/animation/gsap'
import { createLogger } from '@/lib/utils/debug'

/*
 * The quote block's `land` exit, ported from the source's quote-exit-land.js (loaded lazily
 * when the quote pin is scrolled past, like the source). The four totem shapes fall onto the
 * shape cards of the next block (Preoccupations, `--shapes` variant):
 *
 * 1. A Matter.js world (matter-js 0.20.0, as bundled by the source) simulates the drop once,
 *    off screen, with a seeded random, so every run bakes the same frames for a given layout.
 *    Each shape lands on an invisible floor under its own card.
 * 2. The baked frames are eased towards the card's shape (position, snapped rotation, size)
 *    and played back by a scroll-scrubbed timeline while the totem slides down to the grid
 *    and the shapes' colour steps from the quote's maron to the cards' parme.
 * 3. From 1024px up, the triangle hands over to the triangle card's own (hidden) shape, which
 *    pins and scales up to cover the screen until the block after Preoccupations scrolls in.
 *
 * The source's `/sandbox` tuner panel is left out; `?fallSeed=<n>` still changes the seed.
 */

gsap.registerPlugin(ScrollTrigger, CustomEase, CustomWiggle)

const log = createLogger('quote-exit-land', '#dbb6fc')
const { Engine, Bodies, Body, Composite } = Matter

/* ------------------------------------------------------------------ triangle wipe */

/** Wipe start: the block's top this far (in viewport heights) above the viewport top… */
const WIPE_START_SECTION = -0.7
/** …or the triangle card's bottom at 75% of the viewport, whichever comes later. */
const WIPE_START_CARD = 0.75
/** The triangle's final height, relative to the viewport's width + height. */
const WIPE_COVER = 1.3
/** Part of the viewport height the wipe leaves still before the next block arrives. */
const WIPE_HOLD = 0.25
const WIPE_EASE = 'power1.out'
const WIPE_ROTATION = 14

/**
 * Pins the triangle card's shape (`dummy`) where the falling triangle landed and scales it
 * up into a full-screen parme wipe, scrubbed until the next block's top reaches the viewport
 * top. Desktop (≥1024px) only; needs a `[data-block]` after Preoccupations.
 */
function initTriangleWipe(shape: HTMLElement, dummy: HTMLElement, section: HTMLElement) {
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches
  if (!isDesktop) return

  let next = section.nextElementSibling
  if (next?.classList.contains('pin-spacer')) next = next.querySelector('[data-block]')
  if (!next || !next.hasAttribute('data-block')) return
  const nextBlock = next as HTMLElement

  const svg = dummy.querySelector('svg')
  const card = dummy.closest('.block-1-4-preoccupations__card')
  if (!svg || !card) {
    console.warn('[triangle-wipe] missing svg or card for the triangle dummy')
    return
  }

  const swapIn = () => {
    gsap.set(shape, { autoAlpha: 0 })
    gsap.set(dummy, { autoAlpha: 1 })
    card.classList.add('is-wiping')
    nextBlock.classList.add('is-above-wipe')
  }
  const swapOut = () => {
    gsap.set(shape, { autoAlpha: 1 })
    gsap.set(dummy, { autoAlpha: 0 })
    gsap.set(svg, { clearProps: 'transform' })
    card.classList.remove('is-wiping')
    nextBlock.classList.remove('is-above-wipe')
  }

  // The scale-up is measured on the first enter, once the dummy is pinned.
  let isBuilt = false
  const buildWipe = () => {
    if (isBuilt) return
    isBuilt = true
    const vw = window.innerWidth
    const vh = window.innerHeight
    const trigger = timeline.scrollTrigger!
    const svgRect = svg.getBoundingClientRect()
    const dummyRect = dummy.getBoundingClientRect()
    const spacerRect = (
      dummy.closest('.pin-spacer') ?? dummy.parentElement!
    ).getBoundingClientRect()
    const centerX = spacerRect.left + (svgRect.left - dummyRect.left) + svgRect.width / 2
    const centerY =
      spacerRect.top +
      window.scrollY -
      trigger.start +
      (svgRect.top - dummyRect.top) +
      svgRect.height / 2
    const scale = ((vw + vh) / svgRect.height) * WIPE_COVER
    const distance = trigger.end - trigger.start
    const share = gsap.utils.clamp(0.3, 1, (distance - vh * WIPE_HOLD) / distance)
    timeline
      .fromTo(
        svg,
        { x: 0, y: 0, scale: 1, rotation: 0 },
        {
          x: vw / 2 - centerX,
          y: vh / 2 - centerY,
          scale,
          rotation: WIPE_ROTATION,
          transformOrigin: '50% 50%',
          ease: WIPE_EASE,
          duration: share,
        },
        0,
      )
      .to({}, { duration: 1 - share })
  }

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: () => {
        const vh = window.innerHeight
        const sectionStart =
          section.getBoundingClientRect().top + window.scrollY - vh * WIPE_START_SECTION
        const cardStart =
          card.getBoundingClientRect().bottom + window.scrollY - vh * WIPE_START_CARD
        return Math.max(sectionStart, cardStart)
      },
      end: () => nextBlock.getBoundingClientRect().top + window.scrollY,
      pin: dummy,
      pinSpacing: false,
      pinType: isDesktop ? 'transform' : 'fixed',
      anticipatePin: 1,
      invalidateOnRefresh: true,
      scrub: true,
      onEnter: () => {
        swapIn()
        buildWipe()
      },
      onLeaveBack: swapOut,
    },
  })
}

/* ------------------------------------------------------------------ the fall */

/** Totem shape index → card index (the shapes land on the card with the same shape). */
const CARD_FOR_SHAPE = [0, 1, 2, 3]
const SHAPE_NAMES = ['square', 'diamond', 'circle', 'triangle']
/** Rotation symmetry of each shape: the resting angle snaps to a multiple of it (0 = keep). */
const SNAP_DEGREES = [180, 90, 0, 360]
/** Colour steps between the quote's and the cards' shape colour. */
const COLOR_STEPS = 24
/** The scrub runs while the block's top goes from 65% to -40% of the viewport. */
const SCROLL_START = 0.65
const SCROLL_END = -0.4
const SCROLL_SPAN = SCROLL_START - SCROLL_END

interface FallSettings {
  seed: number
  gravityY: number
  /** Sideways push towards the page centre (the totem's lean). */
  leanVX: number
  spin: number
  /** Share of the horizontal distance to the card given as a throw. */
  throwX: number
  /** Spring that pulls a shape towards its card's x until it settles (×1e-6). */
  xPull: number
  restitution: number
  friction: number
  frictionAir: number
  interShapeCollisions: boolean
  maxFrames: number
  /** Frames after the shape settles over which it aligns with the card. */
  alignPad: number
  /** Share of the impact frame at which the scale-down starts. */
  scaleStart: number
  /** Timeline share of the totem's slide down to the grid. */
  travelFrac: number
  /** Timeline share (of the rest) of each shape's playback. */
  cascadeDur: number
  /** Delay between shapes when they don't collide with each other. */
  cascadeStep: number
}

const DEFAULTS: FallSettings = {
  seed: 13820,
  gravityY: 0.9,
  leanVX: 2.2,
  spin: 0.08,
  throwX: 0.5,
  xPull: 1.2,
  restitution: 0.28,
  friction: 0.55,
  frictionAir: 0.015,
  interShapeCollisions: true,
  maxFrames: 200,
  alignPad: 12,
  scaleStart: 0.5,
  travelFrac: 0.3,
  cascadeDur: 0.75,
  cascadeStep: 0.04,
}

/** Where a totem shape starts and where its card's shape is (viewport px). */
interface ShapeTarget {
  sx: number
  sy: number
  tx: number
  ty: number
  dx: number
  dy: number
  scaleEnd: number
  w: number
  h: number
  tw: number
  th: number
}

/** One baked playback frame: offsets from the shape's place in the totem. */
interface Frame {
  x: number
  y: number
  rot: number
  scale: number
}

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
const smootherStep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

/** Seeded random in [0, 1) (mulberry32), so the simulation is the same on every run. */
function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// The source creates this wiggle ease (with a fallback) but doesn't use it; kept as a
// registered named ease for parity.
const WIGGLES = 3
try {
  CustomWiggle.create('land-wiggle', { wiggles: WIGGLES, type: 'easeOut' })
} catch (error) {
  console.warn('[quote-exit-land] CustomWiggle unavailable', error)
}

/**
 * Runs the `land` exit: bakes the fall and binds its playback to the scroll through the
 * next block. `shapes` are the totem's four shapes (square, diamond, circle, triangle).
 */
export function initQuoteExitLand(shapes: HTMLElement[], totem: HTMLElement, block: HTMLElement) {
  const section = (block.closest('.pin-spacer') ?? block).nextElementSibling as HTMLElement | null
  if (!section) {
    console.warn('[quote-exit-land] no next section found')
    return
  }
  const cardShapes = gsap.utils.toArray<HTMLElement>(
    section.querySelectorAll('.block-1-4-preoccupations__card-shape'),
  )
  if (!cardShapes.length) {
    console.warn(
      '[quote-exit-land] next section has no card shapes — is it preoccupations (shapes variant)?',
    )
    return
  }
  const isTotemLeft = block.classList.contains('block-1-3-quote--totem-left')

  gsap.set(totem, { y: 0 })
  gsap.set(shapes, { x: 0, y: 0, rotation: 0, scale: 1 })

  const grid = section.querySelector('.block-1-4-preoccupations__grid')
  const travel = grid
    ? grid.getBoundingClientRect().top - totem.getBoundingClientRect().bottom + 2
    : DEFAULTS.travelFrac * SCROLL_SPAN * window.innerHeight

  const targets = measureTargets(shapes, cardShapes)
  if (!targets) return

  const settings = { ...DEFAULTS }
  const seedParam = new URLSearchParams(window.location.search).get('fallSeed')
  if (seedParam !== null && seedParam !== '') settings.seed = parseInt(seedParam, 10) || 0

  const frames = simulate(targets, isTotemLeft, travel, settings)
  if (!frames) return

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: `top ${SCROLL_START * 100}%`,
      end: `top ${SCROLL_END * 100}%`,
      scrub: 1,
    },
  })
  timeline.to(totem, { y: travel, duration: settings.travelFrac, ease: 'none' }, 0)

  const rest = 1 - settings.travelFrac
  const playDuration = settings.cascadeDur * rest
  const step = (settings.interShapeCollisions ? 0 : settings.cascadeStep) * rest

  shapes.forEach((shape, index) => {
    const shapeFrames = frames[index]
    if (!shapeFrames) return
    gsap.set(shape, { transformOrigin: '50% 50%' })
    const card = cardShapes[CARD_FOR_SHAPE[index]]
    const colorAt = gsap.utils.interpolate(
      getComputedStyle(shape).color,
      getComputedStyle(card).color,
    )
    const state = { p: 0 }
    let lastColor: string | null = null
    timeline.to(
      state,
      {
        p: 1,
        duration: playDuration,
        ease: 'none',
        onUpdate: () => {
          const position = state.p * (shapeFrames.length - 1)
          const from = Math.floor(position)
          const to = Math.min(from + 1, shapeFrames.length - 1)
          const t = position - from
          const a = shapeFrames[from]
          const b = shapeFrames[to]
          gsap.set(shape, {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t,
            rotation: a.rot + (b.rot - a.rot) * t,
            scale: a.scale + (b.scale - a.scale) * t,
          })
          const color = colorAt(Math.round(state.p * COLOR_STEPS) / COLOR_STEPS)
          if (color !== lastColor) {
            lastColor = color
            shape.style.color = color
            shape.style.setProperty('--equilibre-cutout-fill', color)
          }
        },
      },
      settings.travelFrac + index * step,
    )
  })
  const used = settings.travelFrac + (shapes.length - 1) * step + playDuration
  if (used < 1) timeline.to({}, { duration: 1 - used }, used)

  initTriangleWipe(shapes[3], cardShapes[CARD_FOR_SHAPE[3]], section)
}

/** Measures each totem shape and the card shape it lands on. */
function measureTargets(shapes: HTMLElement[], cardShapes: HTMLElement[]) {
  const targets = shapes.map((shape, index) => {
    const svg = shape.querySelector('svg')
    const cardIndex = CARD_FOR_SHAPE[index]
    const cardSvg = cardShapes[cardIndex]?.querySelector('svg')
    if (!svg || !cardSvg) return null
    const from = svg.getBoundingClientRect()
    const to = cardSvg.getBoundingClientRect()
    const sx = from.left + from.width / 2
    const sy = from.top + from.height / 2
    const tx = to.left + to.width / 2
    const ty = to.top + to.height / 2
    const target: ShapeTarget = {
      sx,
      sy,
      tx,
      ty,
      dx: tx - sx,
      dy: ty - sy,
      scaleEnd: to.width / from.width,
      w: from.width,
      h: from.height,
      tw: to.width,
      th: to.height,
    }
    log(
      `shape ${index} (${SHAPE_NAMES[index]}) → card ${cardIndex}, dx=${Math.round(target.dx)}, dy=${Math.round(target.dy)}, scaleEnd=${target.scaleEnd.toFixed(2)}`,
    )
    return target
  })
  if (targets.some((target) => !target)) {
    console.warn('[quote-exit-land] missing target svg for one or more shapes')
    return null
  }
  return targets as ShapeTarget[]
}

/**
 * Drops card-sized bodies from the totem (moved down by `travel`) onto a floor under each
 * card, one 60fps step at a time until every shape has settled, and returns per-shape frames
 * that blend the physics into the card's resting pose.
 */
function simulate(
  targets: ShapeTarget[],
  isTotemLeft: boolean,
  travel: number,
  settings: FallSettings,
): Frame[][] | null {
  const random = mulberry32(settings.seed)
  const lean = isTotemLeft ? 1 : -1
  const engine = Engine.create({ gravity: { x: 0, y: settings.gravityY } })

  // Each shape collides with its own floor (and with the other shapes, if enabled).
  const bodyOptions = (index: number): Matter.IChamferableBodyDefinition => ({
    restitution: settings.restitution,
    friction: settings.friction,
    frictionAir: settings.frictionAir,
    collisionFilter: {
      category: 1 << index,
      mask: (1 << (4 + index)) | (settings.interShapeCollisions ? 15 : 0),
    },
  })

  const bodies = targets.map((target, index) => {
    const x = target.sx
    const y = target.sy + travel
    const width = target.tw
    const height = target.th
    if (index === 2) return Bodies.circle(x, y, width * 0.5, bodyOptions(index))
    if (index === 1) return Bodies.polygon(x, y, 4, width * 0.5, bodyOptions(index))
    if (index === 3) {
      const triangle = Bodies.polygon(x, y, 3, width * 0.45, bodyOptions(index))
      Body.rotate(triangle, -Math.PI / 2)
      return triangle
    }
    return Bodies.rectangle(x, y, width * 0.95, height * 0.95, bodyOptions(index))
  })
  const floors = targets.map((target, index) => {
    const floorTop = target.ty + target.th / 2
    return Bodies.rectangle(target.tx, floorTop + 25, target.tw * 8, 50, {
      isStatic: true,
      friction: settings.friction,
      restitution: 0,
      collisionFilter: { category: 1 << (4 + index), mask: 1 << index },
    })
  })
  Composite.add(engine.world, [...bodies, ...floors])

  const origins = bodies.map((body) => ({
    x: body.position.x,
    y: body.position.y,
    angle: body.angle,
  }))
  bodies.forEach((body, index) => {
    const leanVX = lean * settings.leanVX * (0.6 + random() * 0.8)
    const throwVX = (targets[index].dx / 100) * settings.throwX * (0.85 + random() * 0.3)
    Body.setVelocity(body, { x: leanVX + throwVX, y: 0 })
    const spinSign = random() > 0.7 ? -1 : 1
    Body.setAngularVelocity(body, lean * spinSign * settings.spin * (0.5 + random()))
  })

  const raw = bodies.map(() => [{ x: 0, y: 0, rot: 0 }])
  const impactFrame = bodies.map(() => -1)
  const settledFrame = bodies.map(() => -1)
  const stillFrames = bodies.map(() => 0)
  const pull = settings.xPull * 1e-6
  let lastFrame = 0

  for (let frame = 1; frame <= settings.maxFrames; frame++) {
    bodies.forEach((body, index) => {
      if (settledFrame[index] !== -1) return
      Body.applyForce(body, body.position, {
        x: body.mass * (targets[index].tx - body.position.x) * pull,
        y: 0,
      })
    })
    Engine.update(engine, 16.666)
    lastFrame = frame
    bodies.forEach((body, index) => {
      raw[index].push({
        x: body.position.x - origins[index].x,
        y: body.position.y - origins[index].y,
        rot: (body.angle - origins[index].angle) * (180 / Math.PI),
      })
      const floorTop = targets[index].ty + targets[index].th / 2
      if (impactFrame[index] === -1 && body.position.y + targets[index].th / 2 >= floorTop - 1) {
        impactFrame[index] = frame
      }
      if (settledFrame[index] === -1 && impactFrame[index] !== -1) {
        if (body.speed < 0.08 && body.angularSpeed < 0.008) {
          stillFrames[index] += 1
          if (stillFrames[index] >= 8) settledFrame[index] = frame
        } else {
          stillFrames[index] = 0
        }
      }
    })
    if (settledFrame.every((value) => value !== -1)) break
  }
  Composite.clear(engine.world, false)
  Engine.clear(engine)

  const total = lastFrame
  return raw.map((shapeFrames, index) => {
    const target = targets[index]
    const endX = target.dx
    const endY = target.dy - travel
    const impact = impactFrame[index] !== -1 ? impactFrame[index] : Math.round(total * 0.6)
    const settled = settledFrame[index] !== -1 ? settledFrame[index] : total
    const alignStart = impact
    const alignEnd = Math.min(total, Math.max(settled, impact + settings.alignPad))
    const restRotation = shapeFrames[Math.min(settled, total)].rot
    const snap = SNAP_DEGREES[index]
    const endRotation = snap === 0 ? restRotation : Math.round(restRotation / snap) * snap
    log(
      `shape ${index} (${SHAPE_NAMES[index]}) impact@${impact} settled@${settled}/${total}, rest rot ${restRotation.toFixed(1)}° → snap ${endRotation.toFixed(1)}°`,
    )
    const scaleFrom = Math.round(impact * settings.scaleStart)
    const scaleTo = Math.max(impact, scaleFrom + 1)
    return shapeFrames.map((point, frame) => {
      const align =
        frame <= alignStart
          ? 0
          : smootherStep(clamp01((frame - alignStart) / (alignEnd - alignStart)))
      const shrink = smootherStep(clamp01((frame - scaleFrom) / (scaleTo - scaleFrom)))
      return {
        x: point.x * (1 - align) + endX * align,
        y: point.y * (1 - align) + endY * align,
        rot: point.rot * (1 - align) + endRotation * align,
        scale: 1 + (target.scaleEnd - 1) * shrink,
      }
    })
  })
}
