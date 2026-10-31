import SplitType from 'split-type'

import { useRef } from 'react'

import { prefersReducedMotion } from '@/lib/animation/entrance'
import { gsap, useGSAP } from '@/lib/animation/gsap'
import { getScrub } from '@/lib/animation/scrub'

import EquilibreShape, { type EquilibreShapeName } from '@/components/ui/EquilibreShape'

import { buildMainQuoteTimeline } from './mainQuoteReveal'
import './quote.css'

const QUOTE =
  'Our signature: Shaping spaces. Commitment is at the heart of how we work. A strong belief and a total dedication to supporting businesses and the people who use their spaces.'

/** The totem's shapes, top to bottom (the `land` exit relies on this order). */
const TOTEM_SHAPES: EquilibreShapeName[] = ['square', 'diamond', 'circle', 'triangle']

/** Lazy exit animations the block runs once, when the pin is scrolled past (`data-quote-exit`). */
type QuoteExit = (shapes: HTMLElement[], totem: HTMLElement, block: HTMLElement) => void
const QUOTE_EXITS: Record<string, () => Promise<QuoteExit>> = {
  // Drops the shapes onto the next block's (Preoccupations) cards, with Matter.js physics.
  land: () => import('./quoteExitLand').then((module) => module.initQuoteExitLand),
}

/**
 * Signature quote (`block-1-3-quote--fly-in`), ported from the source's
 * block-1-3-quote-anim.js: the block pins for one viewport height while its characters
 * brighten one by one (opacity 0.05 → 1) and the totem's shapes fly in along the source's
 * Lottie-baked paths (src/components/sections/Quote/mainQuoteReveal.ts), both scrubbed by the scroll.
 */
function Quote() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const section = sectionRef.current
      if (!section) return
      const text = section.querySelector<HTMLElement>('[data-highlight-text]')
      const totem = section.querySelector<HTMLElement>('[data-anim="totem"]')
      const pinWrapper = section.querySelector<HTMLElement>('.block-1-3-quote__pin-wrapper')
      if (!text) return

      if (prefersReducedMotion()) {
        gsap.set(text, { autoAlpha: 1 })
        if (totem) gsap.set(totem.querySelectorAll('[data-totem-shape]'), { autoAlpha: 1 })
        return
      }

      let isCancelled = false
      let split: SplitType | undefined

      // Split once the webfonts are in, like the other blocks, so triggers are created in
      // page order and measure the final layout.
      const build = contextSafe!(() => {
        if (isCancelled) return
        split = new SplitType(text, { types: 'words,chars' })
        const chars = split.chars ?? []
        if (!chars.length) return
        gsap.set(chars, { opacity: 0.05 })

        const shapes = totem
          ? gsap.utils.toArray<HTMLElement>(totem.querySelectorAll('.block-1-3-quote__totem-shape'))
          : []
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches
        const exitName = section.dataset.quoteExit ?? null
        let hasExited = false

        const timeline = gsap.timeline({
          id: 'block-1-3-quote',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=100%',
            pin: true,
            pinSpacing: true,
            pinType: isDesktop ? 'transform' : 'fixed',
            anticipatePin: 1,
            invalidateOnRefresh: true,
            scrub: getScrub(),
            onLeave: () => {
              if (hasExited || !exitName || !shapes.length || !totem) return
              const loadExit = QUOTE_EXITS[exitName]
              if (!loadExit) return
              hasExited = true
              // Run inside the GSAP context, so the exit's tweens and triggers revert with it.
              const runExit = contextSafe!((exit: QuoteExit) => exit(shapes, totem, section))
              void loadExit().then(runExit)
            },
          },
        })

        const fallbackDuration = 1 + chars.length * 0.1
        timeline.to(chars, { opacity: 1, duration: 40 * 0.1, stagger: 0.1, ease: 'none' }, 0)

        if (totem && pinWrapper && shapes.length) {
          const isTotemLeft = section.classList.contains('block-1-3-quote--totem-left')
          const duration = timeline.duration() || fallbackDuration
          buildMainQuoteTimeline(totem, {
            flipX: isTotemLeft,
            target: timeline,
            base: duration * 0.04,
            span: duration * 0.9,
          })
        }
      })
      void document.fonts.ready.then(build)

      return () => {
        isCancelled = true
        split?.revert()
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      className="block-1-3-quote block-1-3-quote--fly-in"
      data-block="block-1-3-quote"
      data-quote-exit="land"
    >
      <div className="block-1-3-quote__pin-wrapper">
        <div className="block-1-3-quote__content">
          <p className="block-1-3-quote__text" data-highlight-text data-anim="text">
            {QUOTE}
          </p>
        </div>

        <div className="block-1-3-quote__totem" data-anim="totem">
          {TOTEM_SHAPES.map((shape) => (
            <div key={shape} className="block-1-3-quote__totem-shape" data-totem-shape={shape}>
              <EquilibreShape shape={shape} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Quote
