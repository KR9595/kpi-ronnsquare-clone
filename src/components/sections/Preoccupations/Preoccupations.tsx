import { useRef } from 'react'

// Importing effects also registers the timeline effects (splitReveal, …).
import { revertSplitReveal } from '@/lib/animation/effects'
import { prefersReducedMotion } from '@/lib/animation/entrance'
import { ScrollTrigger, gsap, useGSAP } from '@/lib/animation/gsap'
import { deadLinkProps } from '@/lib/utils/preventNavigation'

import Button from '@/components/ui/Button'
import EquilibreShape, { type EquilibreShapeName } from '@/components/ui/EquilibreShape'

import './preoccupations.css'

interface Preoccupation {
  shape: EquilibreShapeName
  title: string
  description: string
}

/** The source's four preoccupations, in order (each card's shape matches a totem shape). */
const PREOCCUPATIONS: Preoccupation[] = [
  {
    shape: 'square',
    title: 'End of Lease: Stay or Move?',
    description:
      'Is your lease coming to an end? Stay or move—we analyze both options for you. A clear, data-driven answer with no obligation.',
  },
  {
    shape: 'diamond',
    title: 'Bring Teams Back to the Office',
    description:
      'Bring teams back to the office? Struggling with team cohesion and engagement? We provide a clear solution that benefits both your business and your employees.',
  },
  {
    shape: 'circle',
    title: 'Attract and Retain Talent',
    description:
      'A workplace that reflects your culture attracts top talent and helps retain your teams. Your employees should want to come to the office—and stay.',
  },
  {
    shape: 'triangle',
    title: 'Complex Projects',
    description:
      'Is your project too complex for a single provider? We coordinate all the required expertise. We take on the risk—so you don’t have to.',
  },
]

/** The entrance plays when the block's top reaches 60% of the viewport (not the usual 75%). */
const ENTRANCE_START = 60

/**
 * "Your Challenges" (`block-1-4-preoccupations--shapes`), ported from the source's
 * block-1-4-preoccupations-anim.js: the title lines slide up, then the card bodies fade up
 * one after another. The cards' shapes stay hidden; the quote's totem shapes fall onto them
 * (the quote's `land` exit, src/components/sections/Quote/quoteExitLand.ts).
 */
function Preoccupations() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const section = sectionRef.current
      if (!section) return
      const title = section.querySelector<HTMLElement>('[data-anim="title"]')
      const bodies = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll('[data-anim="card-body"]'),
      )

      if (prefersReducedMotion()) {
        gsap.set(section, { autoAlpha: 1 })
        gsap.set([title, ...bodies].filter(Boolean), { autoAlpha: 1, y: 0, scale: 1 })
        return
      }

      if (bodies.length) gsap.set(bodies, { autoAlpha: 0, y: 24 })
      gsap.set(section, { autoAlpha: 1 })

      let isCancelled = false
      let trigger: ScrollTrigger | undefined

      // Split the title only once the webfonts are in, so the lines match the final layout.
      const build = contextSafe!(() => {
        if (isCancelled) return
        const timeline = gsap.timeline({ id: 'block-1-4-preoccupations', paused: true })
        if (title) timeline.splitReveal(title, { duration: 1.2 })
        if (bodies.length)
          timeline.fadeSlideUp(bodies, { y: 20, duration: 0.7, stagger: 0.12 }, '<0.1')
        trigger = ScrollTrigger.create({
          trigger: section,
          start: `top ${ENTRANCE_START}%`,
          onEnter: () => timeline.play(),
          onEnterBack: () => timeline.play(),
          onLeaveBack: () => timeline.reverse(),
        })
      })
      void document.fonts.ready.then(build)

      return () => {
        isCancelled = true
        trigger?.kill()
        if (title) revertSplitReveal(title)
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      className="block-1-4-preoccupations block-1-4-preoccupations--shapes anim-hidden"
      data-block="block-1-4-preoccupations"
      aria-label="YOUR CHALLENGES"
    >
      <h2 className="block-1-4-preoccupations__title anim-hidden" data-anim="title">
        YOUR
        <br />
        CHALLENGES
      </h2>

      <div className="block-1-4-preoccupations__grid">
        <div className="block-1-4-preoccupations__spacer" aria-hidden="true" />

        {PREOCCUPATIONS.map(({ shape, title, description }) => (
          <article key={shape} className="block-1-4-preoccupations__card">
            <div className="block-1-4-preoccupations__card-top">
              <div className="block-1-4-preoccupations__card-shape">
                <EquilibreShape shape={shape} />
              </div>
            </div>
            <div className="block-1-4-preoccupations__card-body anim-hidden" data-anim="card-body">
              <h3 className="block-1-4-preoccupations__card-title">
                <a className="block-1-4-preoccupations__card-title-link" {...deadLinkProps}>
                  {title}
                </a>
              </h3>
              <div className="block-1-4-preoccupations__card-bottom">
                <p className="block-1-4-preoccupations__card-desc">{description}</p>
                <div className="block-1-4-preoccupations__card-cta">
                  <Button label="LEARN MORE" className="btn--parme btn--sm" {...deadLinkProps} />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Preoccupations
