import type { ReactNode } from 'react'
import { useRef } from 'react'

// Importing effects also registers the timeline effects (splitReveal, …).
import { revertSplitReveal } from '@/lib/effects'
import { prefersReducedMotion } from '@/lib/entrance'
import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'
import { initTotemSway } from '@/lib/totemSway'

import './advantages.css'

interface Advantage {
  badge: ReactNode
  title: string
  description: string
}

/** The source's badges (51px grid, filled with `currentColor`). */
const BADGES = {
  circle: (
    <svg viewBox="0 0 51 51" fill="none">
      <circle cx="25.5" cy="25.5" r="25.5" fill="currentColor" />
    </svg>
  ),
  halfCircle: (
    <svg viewBox="0 0 51 25.5" fill="none">
      <path d="M0 25.5C0 11.42 11.42 0 25.5 0C39.58 0 51 11.42 51 25.5" fill="currentColor" />
    </svg>
  ),
  square: (
    <svg viewBox="0 0 51 51" fill="none">
      <rect width="51" height="51" fill="currentColor" />
    </svg>
  ),
  triangle: (
    <svg viewBox="0 0 51 25.5" fill="none">
      <path d="M0 25.5L25.5 0L51 25.5H0Z" fill="currentColor" />
    </svg>
  ),
  diamond: (
    <svg viewBox="0 0 51 51" fill="none">
      <path d="M25.5 0L51 25.5L25.5 51L0 25.5Z" fill="currentColor" />
    </svg>
  ),
  rectangle: (
    <svg viewBox="0 0 51 30" fill="none">
      <rect width="51" height="30" fill="currentColor" />
    </svg>
  ),
}

const LEFT: Advantage[] = [
  {
    badge: BADGES.circle,
    title: 'A Single Point of Contact',
    description:
      'Our team is made up of specialists and industry experts who guide you through every stage of your project. One dedicated point of contact, always informed and always available.',
  },
  {
    badge: BADGES.halfCircle,
    title: 'A Clear Vision for Your Project',
    description:
      'We put our 35 years of experience at your service to help you make the choices that are right for you. Unbiased advice, always focused on your best interests.',
  },
  {
    badge: BADGES.square,
    title: 'Spaces That Reflect Who You Are',
    description:
      'We never rely on standard solutions or copy-and-paste designs. We create spaces that reflect your culture, values, and way of working. Tailor-made, every time.',
  },
]

const RIGHT: Advantage[] = [
  {
    badge: BADGES.triangle,
    title: 'Complete Risk Management',
    description:
      'We take full responsibility for the risks and challenges of your project, managing unexpected issues to deliver the best possible outcome. A successful project, with no surprises.',
  },
  {
    badge: BADGES.diamond,
    title: 'Workspaces Designed to Last',
    description:
      'We integrate tomorrow’s challenges into today’s project to maximize the value of your investment. A lasting solution, never a temporary fix.',
  },
  {
    badge: BADGES.rectangle,
    title: 'A Project Delivered Within a Fixed Budget',
    description:
      'We commit to a firm, final price with a clear breakdown of all services provided. A fixed budget, with no hidden costs.',
  },
]

/** Mobile/tablet: the background steps from sable to parme as the block reaches the top. */
const SABLE = '#FFEAD4'
/** The wipe chain fades the parme background in from this (parme, fully transparent). */
const PARME_TRANSPARENT = 'rgba(219, 182, 252, 0)'
/** Where the totem starts its parallax, in viewport heights above its resting top. */
const TOTEM_OFFSET = -0.02
const TOTEM_OFFSET_WIDE = -0.1
const WIDE_VIEWPORT = 1700

function totemOffset() {
  return window.innerWidth >= WIDE_VIEWPORT ? TOTEM_OFFSET_WIDE : TOTEM_OFFSET
}

function AdvantageItem({ badge, title, description }: Advantage) {
  return (
    <article className="block-1-5-advantages__item anim-hidden" data-anim="card">
      <div className="block-1-5-advantages__badge" aria-hidden="true">
        {badge}
      </div>
      <h3 className="block-1-5-advantages__item-title">{title}</h3>
      <p className="block-1-5-advantages__item-desc">{description}</p>
    </article>
  )
}

/**
 * Advantages (`block-1-5-advantages`), ported from the source's block-1-5-advantages-anim.js.
 * From 1024px up, right after Preoccupations, it chains off the triangle wipe
 * (`is-wipe-chain`): its background starts transparent over the pinned parme triangle and
 * fades to parme while its top goes from 30% to the top of the viewport, the totem slides
 * down with a parallax until then, and the entrance plays at `top 20%`. Elsewhere the block
 * plays its entrance at `top 75%`; below 1024px its background steps from sable to parme
 * once its top reaches the viewport top. The totem sways while the block is on screen.
 */
function Advantages() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const section = sectionRef.current
      if (!section) return
      const title = section.querySelector<HTMLElement>('[data-anim="title"]')
      const cards = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-anim="card"]'))

      if (prefersReducedMotion()) {
        gsap.set([title, ...cards].filter(Boolean), { autoAlpha: 1, y: 0 })
        return
      }

      const isDesktop = window.matchMedia('(min-width: 1024px)').matches
      const followsPreoccupations =
        section.previousElementSibling?.getAttribute('data-block') === 'block-1-4-preoccupations'
      const isWipeChain = isDesktop && followsPreoccupations
      const totem = section.querySelector<HTMLElement>('[data-anim="totem"]')
      const body = section.querySelector<HTMLElement>('.block-1-5-advantages__body')

      let isCancelled = false
      let trigger: ScrollTrigger | undefined
      let stopSway: (() => void) | undefined

      // Built once the webfonts are in, like the blocks above, so the triggers are created
      // after the quote's pin and the title splits into its final lines.
      const build = contextSafe!(() => {
        if (isCancelled) return

        if (!isDesktop) {
          const background = getComputedStyle(section).backgroundColor
          gsap.set(section, { backgroundColor: SABLE })
          gsap.to(section, {
            backgroundColor: background,
            duration: 0.8,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              toggleActions: 'play none none reverse',
            },
          })
        }

        gsap.set(cards, { autoAlpha: 0, y: 40 })

        if (!isWipeChain) {
          stopSway = initTotemSway(section, section, { mobile: true })
          const timeline = gsap.timeline({ id: 'block-1-5-advantages', paused: true })
          if (title) timeline.splitReveal(title, { duration: 1.2 })
          if (cards.length) timeline.fadeSlideUp(cards, { stagger: 0.15, duration: 0.8 }, '<0.3')
          trigger = ScrollTrigger.create({
            trigger: section,
            start: 'top 75%',
            onEnter: () => timeline.play(),
            onEnterBack: () => timeline.play(),
            onLeaveBack: () => timeline.reverse(),
          })
          return
        }

        const background = getComputedStyle(section).backgroundColor
        gsap.set(section, { backgroundColor: 'transparent' })
        section.classList.add('is-wipe-chain')
        gsap.fromTo(
          section,
          { backgroundColor: PARME_TRANSPARENT },
          {
            backgroundColor: background,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 30%',
              end: 'top top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        )

        if (totem && body) {
          const totemTop = () =>
            totem.offsetTop + (totem.offsetParent === section ? 0 : body.offsetTop)
          gsap.fromTo(
            totem,
            { y: () => -(totemTop() - window.innerHeight * totemOffset()) },
            {
              y: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'top top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          )
        }

        stopSway = initTotemSway(section, section, { mobile: false })
        const timeline = gsap.timeline({ id: 'block-1-5-advantages', paused: true })
        if (title) timeline.splitReveal(title, { duration: 1.2 })
        if (cards.length) timeline.fadeSlideUp(cards, { stagger: 0.1, duration: 0.8 }, '<0.3')
        trigger = ScrollTrigger.create({
          trigger: section,
          start: 'top 20%',
          onEnter: () => timeline.play(),
          onEnterBack: () => timeline.play(),
          onLeaveBack: () => timeline.reverse(),
        })
      })
      void document.fonts.ready.then(build)

      return () => {
        isCancelled = true
        trigger?.kill()
        stopSway?.()
        section.classList.remove('is-wipe-chain')
        if (title) revertSplitReveal(title)
      }
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="block-1-5-advantages" data-block="block-1-5-advantages">
      <h2 className="block-1-5-advantages__title anim-hidden" data-anim="title">
        What you gain by working with us is a balanced approach built on:
      </h2>

      <div className="block-1-5-advantages__body">
        <div className="block-1-5-advantages__col block-1-5-advantages__col--left">
          {LEFT.map((advantage) => (
            <AdvantageItem key={advantage.title} {...advantage} />
          ))}
        </div>

        <div className="block-1-5-advantages__totem-rail">
          <div className="block-1-5-advantages__totem" data-anim="totem" aria-hidden="true">
            <EquilibreTotem />
          </div>
        </div>

        <div className="block-1-5-advantages__col block-1-5-advantages__col--right">
          {RIGHT.map((advantage) => (
            <AdvantageItem key={advantage.title} {...advantage} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** The source's `equilibre-totem` partial: diamond on circle (swaying) on a triangle. */
function EquilibreTotem() {
  return (
    <svg
      className="equilibre-totem"
      viewBox="-120 -30 524 641"
      overflow="visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g className="equilibre-totem__sway" data-shape="sway">
        <g className="equilibre-totem__diamond" data-shape="diamond">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M141.1.9L.9,143.2l142,140.4,140.1-142.2L141.1.9ZM142.5,219.2l-77.4-76.5,76.3-77.5,77.4,76.5-76.3,77.5Z"
            fill="currentColor"
          />
        </g>
        <g className="equilibre-totem__circle" data-shape="circle">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M142.9,283.3c-72.2.5-130.5,59.7-130,131.9.5,72.3,59.6,130.7,131.7,130.2,72.2-.5,130.5-59.7,130-131.9-.5-72.3-59.6-130.7-131.7-130.2ZM144.3,500.7c-47.5.3-86.5-38.2-86.8-85.8-.3-47.6,38.1-86.6,85.6-86.9,47.5-.3,86.5,38.2,86.8,85.8.3,47.6-38.1,86.6-85.6,86.9Z"
            fill="currentColor"
          />
        </g>
      </g>
      <g className="equilibre-totem__triangle" data-shape="triangle">
        <path d="M207.91 611L141.875 544.856L75.8398 611H207.91Z" fill="currentColor" />
      </g>
    </svg>
  )
}

export default Advantages
