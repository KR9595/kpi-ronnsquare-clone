import { useRef } from 'react'

// Importing effects also registers the timeline effects (splitReveal, …).
import { revertSplitReveal } from '@/lib/animation/effects'
import { prefersReducedMotion, registerBlockTimeline } from '@/lib/animation/entrance'
import { gsap, useGSAP } from '@/lib/animation/gsap'

import './theses.css'

const STATS = [
  { number: '+1M', label: 'm² of office space completed' },
  { number: '35', label: 'years of experience' },
  { number: '50+', label: 'dedicated experts' },
  { number: '10', label: 'year warranty' },
]

/**
 * "Ronnsquare is" key figures (`block-1-7-theses`), ported from the source's
 * block-1-7-theses-anim.js: at `top 75%` the title's lines slide up (1.2s) and 0.4s in the
 * four figures fade up from 40px (0.8s, 0.15s apart); scrolling back above reverses it.
 */
function Theses() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const section = sectionRef.current
      if (!section) return
      const title = section.querySelector<HTMLElement>('[data-anim="title"]')
      const stats = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-anim="stat"]'))

      if (prefersReducedMotion()) {
        gsap.set([title, ...stats].filter(Boolean), { autoAlpha: 1, clearProps: 'transform' })
        return
      }

      gsap.set(stats, { autoAlpha: 0, y: 40 })

      let isCancelled = false
      let unregister: (() => void) | undefined
      // Built once the webfonts are in, like the blocks above, so the title splits into its
      // final lines and the trigger is created after the pins above.
      const build = contextSafe!(() => {
        if (isCancelled) return
        const timeline = gsap.timeline({ id: 'block-1-7-theses', paused: true })
        if (title) timeline.splitReveal(title, { duration: 1.2 })
        timeline.fadeSlideUp(stats, { duration: 0.8, stagger: 0.15 }, '<0.4')
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
      className="block-1-7-theses"
      data-block="block-1-7-theses"
      aria-label="Ronnsquare is"
    >
      <div className="block-1-7-theses__content">
        <h2 className="block-1-7-theses__title anim-hidden" data-anim="title">
          Ronnsquare is
        </h2>

        <div className="block-1-7-theses__stats">
          {STATS.map(({ number, label }) => (
            <div key={label} className="block-1-7-theses__stat anim-hidden" data-anim="stat">
              <span className="block-1-7-theses__stat-number">{number}</span>
              <span className="block-1-7-theses__stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Theses
