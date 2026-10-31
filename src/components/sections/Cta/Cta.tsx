import { useRef } from 'react'

// Importing effects also registers the timeline effects (splitReveal, …).
import { revertSplitReveal } from '@/lib/effects'
import { prefersReducedMotion, registerBlockTimeline } from '@/lib/entrance'
import { gsap, useGSAP } from '@/lib/gsap'
import { initParallax } from '@/lib/parallax'
import { deadLinkProps } from '@/lib/preventNavigation'

import Button from '@/components/ui/Button'

import './cta.css'

const IMAGE_BASE = '/images/14.-CALL-TO-ACTION'
const IMAGE_SRCSET = [
  `${IMAGE_BASE}-1024x683.jpg 1024w`,
  `${IMAGE_BASE}-300x200.jpg 300w`,
  `${IMAGE_BASE}-768x512.jpg 768w`,
  `${IMAGE_BASE}-1536x1024.jpg 1536w`,
  `${IMAGE_BASE}.jpg 2048w`,
].join(', ')

/**
 * "Do you have a workplace design project?" (`block-1-10-cta`), ported from the source's
 * block-1-10-cta-anim.js: at `top 75%` the dark card fades in (0.6s, power2.out), 0.1s in
 * the title's lines slide up (1.2s), 0.4s later the body fades up from 24px (0.8s) and 0.3s
 * later the button (0.6s); scrolling back above reverses it. The background photo runs the
 * global parallax from -15% to 15%. "Free Audit" links to the contact page, so it goes
 * nowhere here.
 */
function Cta() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const section = sectionRef.current
      if (!section) return
      const card = section.querySelector<HTMLElement>('[data-anim="card"]')
      const title = section.querySelector<HTMLElement>('[data-anim="title"]')
      const body = section.querySelector<HTMLElement>('[data-anim="body"]')
      const button = section.querySelector<HTMLElement>('[data-anim="button"]')

      if (prefersReducedMotion()) {
        gsap.set([card, title, body, button].filter(Boolean), { autoAlpha: 1, y: 0 })
        return
      }

      gsap.set(card, { autoAlpha: 0 })
      gsap.set([body, button].filter(Boolean), { autoAlpha: 0, y: 24 })

      let isCancelled = false
      let unregister: (() => void) | undefined
      let stopParallax: (() => void) | undefined
      // Built once the webfonts are in, like the blocks above, so the title splits into its
      // final lines and the triggers are created after the pins above.
      const build = contextSafe!(() => {
        if (isCancelled) return
        const timeline = gsap.timeline({ id: 'block-1-10-cta', paused: true })
        timeline.to(card, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' })
        if (title) timeline.splitReveal(title, { duration: 1.2 }, '<0.1')
        if (body) timeline.fadeSlideUp(body, { y: 20, duration: 0.8 }, '<0.4')
        if (button) timeline.fadeSlideUp(button, { y: 20, duration: 0.6 }, '<0.3')
        unregister = registerBlockTimeline(section, timeline)
        stopParallax = initParallax(section)
      })
      void document.fonts.ready.then(build)

      return () => {
        isCancelled = true
        unregister?.()
        stopParallax?.()
        if (title) revertSplitReveal(title)
      }
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="block-1-10-cta" data-block="block-1-10-cta">
      <div
        className="block-1-10-cta__bg"
        data-parallax="trigger"
        data-parallax-start="-15"
        data-parallax-end="15"
      >
        <div
          className="block-1-10-cta__bg-inner block-1-10-cta__bg-inner--parallax"
          data-parallax="target"
        >
          <img
            width={1024}
            height={683}
            src={`${IMAGE_BASE}-1024x683.jpg`}
            srcSet={IMAGE_SRCSET}
            sizes="auto, 100vw"
            className="attachment-large size-large"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="block-1-10-cta__overlay" />
      </div>

      <div className="block-1-10-cta__card anim-hidden" data-anim="card">
        <div className="block-1-10-cta__text">
          <h2 className="block-1-10-cta__title anim-hidden" data-anim="title">
            Do you have a workplace design project?
          </h2>
          <p className="block-1-10-cta__body anim-hidden" data-anim="body">
            Receive a complimentary workspace audit and get personalized recommendations tailored to
            your project.
          </p>
        </div>
        <div className="block-1-10-cta__action anim-hidden" data-anim="button">
          <Button
            label="Free Audit"
            className="btn--parme btn--md block-1-10-cta__btn"
            {...deadLinkProps}
          />
        </div>
      </div>
    </section>
  )
}

export default Cta
