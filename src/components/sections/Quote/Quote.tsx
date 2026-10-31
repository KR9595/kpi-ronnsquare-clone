import SplitType from 'split-type'

import { useRef } from 'react'

import { prefersReducedMotion } from '@/lib/entrance'
import { gsap, useGSAP } from '@/lib/gsap'
import { buildMainQuoteTimeline } from '@/lib/mainQuoteReveal'
import { getScrub } from '@/lib/scrub'

import './quote.css'

const QUOTE =
  'Our signature: Shaping spaces. Commitment is at the heart of how we work. A strong belief and a total dedication to supporting businesses and the people who use their spaces.'

/** Lazy exit animations the block runs once, when the pin is scrolled past (`data-quote-exit`). */
type QuoteExit = (shapes: HTMLElement[], totem: HTMLElement, block: HTMLElement) => void
// The homepage's `land` exit drops the shapes onto the next block's cards; it is added with
// the Preoccupations block (block-1-4), which it targets.
const QUOTE_EXITS: Record<string, () => Promise<QuoteExit>> = {}

/**
 * Signature quote (`block-1-3-quote--fly-in`), ported from the source's
 * block-1-3-quote-anim.js: the block pins for one viewport height while its characters
 * brighten one by one (opacity 0.05 → 1) and the totem's shapes fly in along the source's
 * Lottie-baked paths (src/lib/mainQuoteReveal.ts), both scrubbed by the scroll.
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
              void loadExit().then((exit) => exit(shapes, totem, section))
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
          <div className="block-1-3-quote__totem-shape" data-totem-shape="square">
            <svg
              className="equilibre-shape equilibre-shape--square"
              viewBox="0 0 132 110"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="132" height="110" fill="currentColor" />
            </svg>
          </div>
          <div className="block-1-3-quote__totem-shape" data-totem-shape="diamond">
            <svg
              className="equilibre-shape equilibre-shape--diamond"
              viewBox="0 0 284 284"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M142.929 283.538L0.928784 143.165L141.071 0.93052L283.071 141.304L142.929 283.538Z"
                fill="currentColor"
              />
              <path
                d="M142.506 219.214L218.853 141.728L141.494 65.2544L65.1467 142.741L142.506 219.214Z"
                fill="var(--equilibre-cutout-fill, var(--color-brand-parme, #DBB6FC))"
              />
            </svg>
          </div>
          <div className="block-1-3-quote__totem-shape" data-totem-shape="circle">
            <svg
              className="equilibre-shape equilibre-shape--circle"
              viewBox="0 0 263 263"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M131.711 262.605C59.5562 263.081 0.475781 204.677 0.000781 132.403C-0.474219 60.1299 57.8334 0.952 129.988 0.476C202.143 0 261.223 58.404 261.698 130.678C262.173 202.951 203.866 262.129 131.711 262.605Z"
                fill="currentColor"
              />
              <path
                d="M131.417 217.882C178.949 217.569 217.362 178.582 217.049 130.972C216.736 83.362 177.814 44.885 130.282 45.199C82.7503 45.512 44.3369 84.499 44.6499 132.109C44.9629 179.719 83.8853 218.196 131.417 217.882Z"
                fill="var(--equilibre-cutout-fill, var(--color-brand-parme, #DBB6FC))"
              />
            </svg>
          </div>
          <div className="block-1-3-quote__totem-shape" data-totem-shape="triangle">
            <svg
              className="equilibre-shape equilibre-shape--triangle"
              viewBox="0 0 132 67"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M132.07 66.144L66.035 0L0 66.144H132.07Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Quote
