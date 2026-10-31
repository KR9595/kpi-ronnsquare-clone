import { useRef } from 'react'

// Importing effects also registers the timeline effects (splitReveal, revealImage, …).
import { revertSplitReveal } from '@/lib/animation/effects'
import { prefersReducedMotion, registerBlockTimeline } from '@/lib/animation/entrance'
import { gsap, useGSAP } from '@/lib/animation/gsap'
import { deadLinkProps } from '@/lib/utils/preventNavigation'

import Button from '@/components/ui/Button'

import './hero.css'

const TITLE = 'Architecture and Workplace Design Consulting Firm'

/**
 * The source's hero image and its WordPress srcset (local copies in `public/images/`).
 * The 4032w original (11.6 MB) is left out to keep it out of git; 1365w is the largest.
 */
const IMAGE_DIR = '/images/Entree-batiment-blanc-Paris'
const IMAGE_SRCSET = [
  `${IMAGE_DIR}-200x300.jpg 200w`,
  `${IMAGE_DIR}-683x1024.jpg 683w`,
  `${IMAGE_DIR}-768x1152.jpg 768w`,
  `${IMAGE_DIR}-1024x1536.jpg 1024w`,
  `${IMAGE_DIR}-1365x2048.jpg 1365w`,
].join(', ')

/**
 * Homepage hero (`block-1-1-hero`): title and button on the left, tall image on the right
 * from 48em; image on top below. The empty space above the title on desktop is where the
 * intro's "RONN SQUARE" wordmark (brand-clone) lands.
 */
function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  // Entrance, ported from the source's block-1-1-hero-anim.js.
  useGSAP(
    (_context, contextSafe) => {
      const section = sectionRef.current
      if (!section) return
      const title = section.querySelector<HTMLElement>('[data-anim="title"]')
      const image = section.querySelector<HTMLElement>('[data-anim="image"]')
      const button = section.querySelector<HTMLElement>('[data-anim="btn"]')

      if (prefersReducedMotion()) {
        gsap.set([title, button].filter(Boolean), { autoAlpha: 1, y: 0 })
        if (image) {
          const inner = image.querySelector('[data-anim-img-inner]') ?? image
          gsap.set(image, { autoAlpha: 1 })
          gsap.set(inner, { clipPath: 'none', scale: 1 })
        }
        return
      }

      let isCancelled = false
      let unregister: (() => void) | undefined

      // Split the title only once the webfonts are in, so the lines match the final layout.
      const build = contextSafe!(() => {
        if (isCancelled) return
        if (button) gsap.set(button, { autoAlpha: 0, y: 24 })

        const timeline = gsap.timeline({ id: 'block-1-1-hero', paused: true })
        if (title) timeline.splitReveal(title, { duration: 1.2 }, 0)
        if (image) timeline.revealImage(image, { duration: 1 }, '<0.2')
        if (button) timeline.fadeSlideUp(button, { y: 24, duration: 0.6 }, '<0.4')

        // Above the fold: the homepage entrance plays it at its `content` label.
        unregister = registerBlockTimeline(section, timeline)
      })
      void document.fonts.ready.then(build)

      return () => {
        isCancelled = true
        unregister?.()
        if (title) revertSplitReveal(title)
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      className="block-1-1-hero"
      data-block="block-1-1-hero"
      data-entrance="above-fold"
      aria-label={TITLE}
    >
      <div className="block-1-1-hero__image anim-hidden" data-anim="image">
        <div className="block-1-1-hero__image-inner" data-anim-img-inner="">
          <img
            width={4032}
            height={6048}
            src={`${IMAGE_DIR}-1365x2048.jpg`}
            srcSet={IMAGE_SRCSET}
            sizes="(min-width: 48em) 45vw, 100vw"
            alt="Workspace fitted out by Ronnsquare"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>

      <div className="block-1-1-hero__content">
        <h1 className="block-1-1-hero__heading anim-hidden" data-anim="title">
          {TITLE}
        </h1>
        <Button
          {...deadLinkProps}
          label="Our Areas of Expertise"
          className="btn--maron btn--lg block-1-1-hero__btn anim-hidden"
          data-anim="btn"
        />
      </div>
    </section>
  )
}

export default Hero
