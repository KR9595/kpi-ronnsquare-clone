import { useEffect } from 'react'
import type { RefObject } from 'react'

import { gsap } from '@/lib/gsap'

/** Ignore scroll deltas smaller than this (px) so tiny jitters don't toggle the header. */
const MIN_DELTA = 8
const DURATION = 0.45

/**
 * Slides the header up out of view when scrolling down past half a viewport, and back in
 * on any scroll up, like the source site. Works with Lenis or native scrolling, since both
 * move the window and fire `scroll`.
 */
export function useHeaderAutoHide(headerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    let lastY = window.scrollY
    let isHidden = false
    let frame = 0

    const hide = () => {
      gsap.to(header, {
        yPercent: -130,
        duration: DURATION,
        ease: 'power2.inOut',
        overwrite: 'auto',
      })
      isHidden = true
    }
    const show = () => {
      gsap.to(header, { yPercent: 0, duration: DURATION, ease: 'power3.out', overwrite: 'auto' })
      isHidden = false
    }

    const update = () => {
      frame = 0
      // Never hide while the mobile menu is open (the page is scroll-locked then anyway).
      if (document.body.classList.contains('is-header-menu-open')) return
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) < MIN_DELTA) return
      const isScrollingDown = delta > 0
      // A big jump upwards is usually a programmatic scroll (anchor, refresh): don't react.
      if (!isScrollingDown && Math.abs(delta) > window.innerHeight * 0.4) {
        lastY = y
        return
      }
      if (isScrollingDown && !isHidden && y > window.innerHeight * 0.5) hide()
      else if (!isScrollingDown && isHidden) show()
      lastY = y
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
      gsap.killTweensOf(header)
      gsap.set(header, { clearProps: 'transform' })
    }
  }, [headerRef])
}
