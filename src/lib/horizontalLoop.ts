import { Draggable, gsap } from './gsap'

/*
 * GSAP's `horizontalLoop` helper (https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop),
 * ported from the source site's `horizontal-loop.js` with the same behaviour: a seamless
 * looping timeline of `xPercent` tweens over the items, with index navigation and optional
 * Draggable + InertiaPlugin dragging that snaps to the closest item when thrown.
 */

export interface HorizontalLoopConfig {
  /** Pixels per second ÷ 100. */
  speed?: number
  repeat?: number
  paused?: boolean
  reversed?: boolean
  /** `false` disables snapping of the computed xPercent values. */
  snap?: number | false
  paddingRight?: number | string
  draggable?: boolean
  onChange?: (element: HTMLElement, index: number) => void
}

export interface HorizontalLoop extends gsap.core.Timeline {
  toIndex: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween | gsap.core.Timeline
  closestIndex: (setCurrent?: boolean) => number
  current: () => number
  next: (vars?: gsap.TweenVars) => gsap.core.Tween | gsap.core.Timeline
  previous: (vars?: gsap.TweenVars) => gsap.core.Tween | gsap.core.Timeline
  times: number[]
  draggable?: Draggable
}

/** Index in `values` closest to `value`, measured around a loop of length `wrap`. */
function getClosest(values: number[], value: number, wrap: number) {
  let i = values.length
  let closest = 1e10
  let index = 0
  while (i--) {
    let distance = Math.abs(values[i] - value)
    if (distance > wrap / 2) distance = wrap - distance
    if (distance < closest) {
      closest = distance
      index = i
    }
  }
  return index
}

export function horizontalLoop(
  itemsInput: gsap.TweenTarget,
  config: HorizontalLoopConfig = {},
): HorizontalLoop {
  const items = gsap.utils.toArray<HTMLElement>(itemsInput)
  const onChange = config.onChange
  let lastIndex = 0
  const tl = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: 'none' },
    onUpdate:
      onChange &&
      function () {
        const i = tl.closestIndex()
        if (lastIndex !== i) {
          lastIndex = i
          onChange(items[i], i)
        }
      },
    onReverseComplete: () => {
      tl.totalTime(tl.rawTime() + tl.duration() * 100)
    },
  }) as HorizontalLoop
  const length = items.length
  const startX = items[0].offsetLeft
  const times: number[] = []
  const widths: number[] = []
  const xPercents: number[] = []
  let curIndex = 0
  let indexIsDirty = false
  const pixelsPerSecond = (config.speed || 1) * 100
  const snap = config.snap === false ? (v: number) => v : gsap.utils.snap(config.snap || 1)

  // Convert any x into xPercent so the loop survives resizes.
  gsap.set(items, {
    xPercent: (i: number, el: HTMLElement) => {
      const w = (widths[i] = parseFloat(String(gsap.getProperty(el, 'width', 'px'))))
      xPercents[i] = snap(
        (parseFloat(String(gsap.getProperty(el, 'x', 'px'))) / w) * 100 +
          Number(gsap.getProperty(el, 'xPercent')),
      )
      return xPercents[i]
    },
  })
  gsap.set(items, { x: 0 })

  const last = items[length - 1]
  const totalWidth =
    last.offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    last.offsetWidth * Number(gsap.getProperty(last, 'scaleX')) +
    (parseFloat(String(config.paddingRight)) || 0)

  for (let i = 0; i < length; i++) {
    const item = items[i]
    const curX = (xPercents[i] / 100) * widths[i]
    const distanceToStart = item.offsetLeft + curX - startX
    const distanceToLoop = distanceToStart + widths[i] * Number(gsap.getProperty(item, 'scaleX'))
    tl.to(
      item,
      {
        xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0,
    )
      .fromTo(
        item,
        { xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100) },
        {
          xPercent: xPercents[i],
          duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond,
      )
      .add('label' + i, distanceToStart / pixelsPerSecond)
    times[i] = distanceToStart / pixelsPerSecond
  }

  const timeWrap = gsap.utils.wrap(0, tl.duration())

  function toIndex(index: number, vars: gsap.TweenVars = {}) {
    // Always go in the shortest direction.
    if (Math.abs(index - curIndex) > length / 2) index += index > curIndex ? -length : length
    const newIndex = gsap.utils.wrap(0, length, index)
    let time = times[newIndex]
    // Crossing the loop seam: offset by a full duration so the playhead moves the right way.
    if (time > tl.time() !== index > curIndex && index !== curIndex) {
      time += tl.duration() * (index > curIndex ? 1 : -1)
    }
    if (time < 0 || time > tl.duration()) vars.modifiers = { time: timeWrap }
    curIndex = newIndex
    vars.overwrite = true
    return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars)
  }

  tl.toIndex = (index, vars) => toIndex(index, vars)
  tl.closestIndex = (setCurrent) => {
    const index = getClosest(times, tl.time(), tl.duration())
    if (setCurrent) {
      curIndex = index
      indexIsDirty = false
    }
    return index
  }
  tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex)
  tl.next = (vars) => toIndex(tl.current() + 1, vars)
  tl.previous = (vars) => toIndex(tl.current() - 1, vars)
  tl.times = times
  // Pre-render for performance.
  tl.progress(1, true).progress(0, true)
  if (config.reversed) {
    tl.vars.onReverseComplete?.()
    tl.reverse()
  }

  if (config.draggable) {
    const proxy = document.createElement('div')
    const wrap = gsap.utils.wrap(0, 1)
    let ratio = 0
    let startProgress = 0
    let lastSnap = 0
    let initChangeX = 0
    let wasPlaying = false
    const align = () => tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio))
    const syncIndex = () => tl.closestIndex(true)

    const draggable: Draggable = Draggable.create(proxy, {
      trigger: items[0].parentNode as Element,
      type: 'x',
      onPressInit() {
        const x = this.x as number
        gsap.killTweensOf(tl)
        wasPlaying = !tl.paused()
        tl.pause()
        startProgress = tl.progress()
        ratio = 1 / totalWidth
        initChangeX = startProgress / -ratio - x
        gsap.set(proxy, { x: startProgress / -ratio })
      },
      onDrag: align,
      onThrowUpdate: align,
      overshootTolerance: 0,
      inertia: true,
      snap(value: number) {
        // A tiny drag counts as a click: stay where we are.
        if (Math.abs(startProgress / -ratio - (this.x as number)) < 10) {
          return lastSnap + initChangeX
        }
        const time = -(value * ratio) * tl.duration()
        const wrappedTime = timeWrap(time)
        const snapTime = times[getClosest(times, wrappedTime, tl.duration())]
        let dif = snapTime - wrappedTime
        if (Math.abs(dif) > tl.duration() / 2) dif += dif < 0 ? tl.duration() : -tl.duration()
        lastSnap = (time + dif) / tl.duration() / -ratio
        return lastSnap
      },
      onRelease() {
        syncIndex()
        if (draggable.isThrowing) indexIsDirty = true
      },
      onThrowComplete: () => {
        syncIndex()
        if (wasPlaying) tl.play()
      },
    })[0]
    tl.draggable = draggable
  }

  tl.closestIndex(true)
  lastIndex = curIndex
  onChange?.(items[curIndex], curIndex)
  return tl
}
