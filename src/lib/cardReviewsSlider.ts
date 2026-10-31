import { Draggable, ScrollTrigger, gsap } from './gsap'

/*
 * The testimonials slider, ported from the source's block-1-9-card-reviews-anim.js. Slides
 * (quote + author) and their images are stacked; going to a slide fades the current pair out
 * (0.35s, power2.in) and 0.2s in fades the next one in (0.35s, power2.out). The arrows (desktop
 * nav and mobile controls), the dots, ←/→ while focus is in the block and, below 992px, a
 * horizontal swipe (> 50px) on the body change slide. Autoplay advances every 6s while the
 * block is on screen; any manual change pauses it for 5s. The quotes' container takes the
 * height of the tallest slide.
 */

const AUTOPLAY_DELAY = 6
const RESUME_DELAY = 5
const FADE = 0.35
const SWIPE_THRESHOLD = 50
const SWIPE_QUERY = '(max-width: 991px)'

/** Wires the slider inside `block`. Returns a cleanup function. */
export function initCardReviewsSlider(block: HTMLElement, isReduced: boolean) {
  const media = block.querySelectorAll<HTMLElement>('.block-1-9-card-reviews__media-wrapper')
  const slides = block.querySelectorAll<HTMLElement>('.block-1-9-card-reviews__slide')
  const container = block.querySelector<HTMLElement>('.block-1-9-card-reviews__slides-container')
  const dots = block.querySelectorAll<HTMLElement>('.block-1-9-card-reviews__dot')
  const previousButtons = block.querySelectorAll('.block-1-9-card-reviews__arrow--prev')
  const nextButtons = block.querySelectorAll('.block-1-9-card-reviews__arrow--next')
  const body = block.querySelector<HTMLElement>('[data-anim="body"]')
  const count = slides.length
  if (!container || !count) return () => {}

  let current = 0
  let isAnimating = false
  let autoplay: gsap.core.Timeline | null = null
  let resumeCall: gsap.core.Tween | null = null
  const cleanups: (() => void)[] = []
  const listen = (target: EventTarget, type: string, handler: EventListener) => {
    target.addEventListener(type, handler)
    cleanups.push(() => target.removeEventListener(type, handler))
  }

  /** Lays the slides out in flow to find the tallest, then stacks them again. */
  const measure = () => {
    gsap.set(slides, { visibility: 'visible', position: 'relative' })
    let height = 0
    slides.forEach((slide) => {
      height = Math.max(height, slide.offsetHeight)
    })
    gsap.set(slides, { position: 'absolute' })
    slides.forEach((slide, index) => {
      gsap.set(slide, index === current ? { autoAlpha: 1 } : { autoAlpha: 0 })
    })
    container.style.height = `${height}px`
  }

  gsap.set(media[0], { autoAlpha: 1 })
  measure()
  const resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(container)
  // The webfonts can change the quotes' heights after the first measure.
  void document.fonts.ready.then(measure)

  const setActiveDot = (index: number) => {
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex % count === index
      dot.classList.toggle('is-active', isActive)
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false')
    })
  }

  const goTo = (index: number) => {
    if (index < 0 || index >= count || index === current || isAnimating) return
    isAnimating = true
    const from = current
    if (isReduced) {
      gsap.set([media[from], slides[from]], { autoAlpha: 0 })
      gsap.set([media[index], slides[index]], { autoAlpha: 1 })
      current = index
      isAnimating = false
      setActiveDot(index)
      return
    }
    gsap
      .timeline({
        onComplete() {
          current = index
          isAnimating = false
        },
      })
      .to(media[from], { autoAlpha: 0, duration: FADE, ease: 'power2.in' }, 0)
      .to(slides[from], { autoAlpha: 0, duration: FADE, ease: 'power2.in' }, 0)
      .to(media[index], { autoAlpha: 1, duration: FADE, ease: 'power2.out' }, 0.2)
      .to(slides[index], { autoAlpha: 1, duration: FADE, ease: 'power2.out' }, 0.2)
    setActiveDot(index)
  }
  const next = () => goTo((current + 1) % count)
  const previous = () => goTo((current - 1 + count) % count)

  if (!isReduced && count > 1) {
    autoplay = gsap.timeline({ paused: true, repeat: -1 })
    for (let i = 0; i < count; i++) autoplay.call(next, undefined, `+=${AUTOPLAY_DELAY}`)
  }

  /** A manual change pauses the autoplay and resumes it 5s later. */
  const pauseAutoplay = () => {
    if (!autoplay) return
    autoplay.pause()
    resumeCall?.kill()
    resumeCall = gsap.delayedCall(RESUME_DELAY, () => autoplay?.play())
  }

  previousButtons.forEach((button) =>
    listen(button, 'click', () => {
      previous()
      pauseAutoplay()
    }),
  )
  nextButtons.forEach((button) =>
    listen(button, 'click', () => {
      next()
      pauseAutoplay()
    }),
  )
  dots.forEach((dot, index) =>
    listen(dot, 'click', () => {
      goTo(index % count)
      pauseAutoplay()
    }),
  )
  listen(block, 'keydown', (event) => {
    const { key } = event as KeyboardEvent
    if (key === 'ArrowLeft') {
      previous()
      pauseAutoplay()
    } else if (key === 'ArrowRight') {
      next()
      pauseAutoplay()
    }
  })

  const trigger = ScrollTrigger.create({
    trigger: block,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => autoplay?.play(),
    onEnterBack: () => autoplay?.play(),
    onLeave: () => autoplay?.pause(),
    onLeaveBack: () => autoplay?.pause(),
  })

  // Swipe: Draggable on a detached 1px proxy, triggered by the body, as on the source.
  let draggable: Draggable | undefined
  let proxy: HTMLElement | undefined
  if (body && !isReduced && window.matchMedia(SWIPE_QUERY).matches) {
    proxy = document.createElement('div')
    proxy.style.cssText = 'position:absolute;width:1px;height:1px;visibility:hidden;'
    block.appendChild(proxy)
    const swipeProxy = proxy
    ;[draggable] = Draggable.create(proxy, {
      type: 'x',
      trigger: body,
      inertia: false,
      onDragEnd(this: Draggable) {
        const distance = this.endX - this.startX
        if (distance < -SWIPE_THRESHOLD) next()
        else if (distance > SWIPE_THRESHOLD) previous()
        gsap.set(swipeProxy, { x: 0 })
        pauseAutoplay()
      },
    })
  }

  return () => {
    cleanups.forEach((cleanup) => cleanup())
    resizeObserver.disconnect()
    trigger.kill()
    autoplay?.kill()
    resumeCall?.kill()
    draggable?.kill()
    proxy?.remove()
  }
}
