import { Draggable, ScrollTrigger, gsap } from './gsap'

/*
 * A project card's image slideshow, ported from the source's block-1-8-projects-anim.js.
 * From 768px up, each third of the card (`[data-slide-index]` zones) crossfades to its image
 * on hover, leaving the card goes back to the first image and clicking a zone clicks the
 * card's "Discover" button. Below 768px the images advance every 3s while the card is on
 * screen; a swipe (> 50px) goes to the next/previous image, a tap advances after 0.3s and a
 * double tap clicks the button; any of these pauses the autoplay for 5s. The bars under the
 * info box jump to their image at every size.
 */

const DESKTOP = '(min-width: 768px)'
const MOBILE = '(max-width: 767px)'
/** Crossfade between two images, in seconds. */
const FADE = 0.35
/** Seconds each image stays up in the mobile autoplay. */
const AUTOPLAY_DELAY = 3
/** Seconds the autoplay waits after a manual change. */
const RESUME_DELAY = 5
/** Minimum swipe distance, in px. */
const SWIPE_THRESHOLD = 50
/** Double-tap window and the single-tap delay, in seconds. */
const TAP_DELAY = 0.3
const INACTIVE_BAR_OPACITY = 0.4

/** Wires one `[data-has-slideshow]` card. Returns a cleanup function. */
export function initProjectSlideshow(card: HTMLElement, isReduced: boolean) {
  const slides = card.querySelectorAll<HTMLElement>('[data-slide]')
  const bars = card.querySelectorAll<HTMLElement>('[data-bar-index]')
  const zones = card.querySelectorAll<HTMLElement>('[data-slide-index]')
  if (slides.length < 2) return () => {}

  const listeners = new AbortController()
  const { signal } = listeners
  let current = 0
  let autoplay: gsap.core.Timeline | null = null
  let resumeCall: gsap.core.Tween | null = null

  const isDesktop = () => window.matchMedia(DESKTOP).matches

  function pauseAutoplay() {
    if (!autoplay) return
    autoplay.pause()
    resumeCall?.kill()
    resumeCall = gsap.delayedCall(RESUME_DELAY, () => {
      if (window.matchMedia(MOBILE).matches) autoplay?.play()
    })
  }

  const button = card.querySelector<HTMLElement>('.block-1-8-projects__btn')
  const clickButton = () => button?.click()
  const next = () => goTo((current + 1) % slides.length)
  const previous = () => goTo((current - 1 + slides.length) % slides.length)

  function goTo(index: number) {
    if (index === current) return
    gsap.to(slides[current], { opacity: 0, duration: FADE, ease: 'power1.inOut' })
    gsap.to(slides[index], { opacity: 1, duration: FADE, ease: 'power1.inOut' })
    bars.forEach((bar, barIndex) => {
      gsap.to(bar, { opacity: barIndex === index ? 1 : INACTIVE_BAR_OPACITY, duration: 0.3 })
    })
    current = index
  }

  gsap.set(slides, { opacity: 0 })
  gsap.set(slides[0], { opacity: 1 })
  bars.forEach((bar, index) => {
    gsap.set(bar, { opacity: index === 0 ? 1 : INACTIVE_BAR_OPACITY })
  })

  bars.forEach((bar, index) => {
    bar.addEventListener(
      'click',
      () => {
        if (isReduced) {
          gsap.set(slides, { opacity: 0 })
          gsap.set(slides[index], { opacity: 1 })
          bars.forEach((other, otherIndex) => {
            gsap.set(other, { opacity: otherIndex === index ? 1 : INACTIVE_BAR_OPACITY })
          })
          current = index
          return
        }
        goTo(index)
        pauseAutoplay()
      },
      { signal },
    )
  })

  zones.forEach((zone) => {
    zone.addEventListener(
      'click',
      () => {
        if (isDesktop()) clickButton()
      },
      { signal },
    )
  })

  if (isReduced) return () => listeners.abort()

  zones.forEach((zone) => {
    zone.addEventListener(
      'mouseenter',
      () => {
        if (isDesktop()) goTo(parseInt(zone.dataset.slideIndex ?? '0', 10))
      },
      { signal },
    )
  })
  card.addEventListener(
    'mouseleave',
    () => {
      if (isDesktop()) goTo(0)
    },
    { signal },
  )

  const mm = gsap.matchMedia()
  mm.add(MOBILE, () => {
    const timeline = gsap.timeline({ paused: true, repeat: -1 })
    for (let i = 0; i < slides.length; i++) timeline.call(next, undefined, `+=${AUTOPLAY_DELAY}`)
    autoplay = timeline

    const trigger = ScrollTrigger.create({
      trigger: card,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => timeline.play(),
      onEnterBack: () => timeline.play(),
      onLeave: () => timeline.pause(),
      onLeaveBack: () => timeline.pause(),
    })

    // Dragging a detached proxy only measures the swipe; the slideshow itself never moves.
    const slideshow = card.querySelector('.block-1-8-projects__slideshow')
    const proxy = document.createElement('div')
    let lastTap = 0
    let tapCall: gsap.core.Tween | null = null
    const [draggable] = Draggable.create(proxy, {
      type: 'x',
      trigger: slideshow,
      allowNativeTouchScrolling: true,
      onDragEnd(this: Draggable) {
        const distance = this.endX - this.startX
        if (distance < -SWIPE_THRESHOLD) next()
        else if (distance > SWIPE_THRESHOLD) previous()
        gsap.set(proxy, { x: 0 })
        pauseAutoplay()
      },
      onClick() {
        const now = performance.now()
        if (now - lastTap < TAP_DELAY * 1000) {
          tapCall?.kill()
          clickButton()
        } else {
          tapCall = gsap.delayedCall(TAP_DELAY, next)
          pauseAutoplay()
        }
        lastTap = now
      },
    })

    return () => {
      draggable.kill()
      tapCall?.kill()
      resumeCall?.kill()
      trigger.kill()
      timeline.kill()
      autoplay = null
    }
  })

  return () => {
    listeners.abort()
    mm.revert()
  }
}
