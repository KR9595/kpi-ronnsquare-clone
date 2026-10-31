import { useRef } from 'react'

// Importing effects also registers the timeline effects (splitReveal, …).
import { revertSplitReveal } from '@/lib/animation/effects'
import { prefersReducedMotion, registerBlockTimeline } from '@/lib/animation/entrance'
import { gsap, useGSAP } from '@/lib/animation/gsap'

import './cardReviews.css'
import { initCardReviewsSlider } from './cardReviewsSlider'

interface Review {
  quote: string
  name: string
  role: string
  /** Avatar base name: `-150x150.png` is the `src`, `.png` the 200w source. */
  avatar: string
  image: {
    base: string
    /** `[width, height]` of each WordPress `-WxH` copy; the first is the `src`. */
    sizes: [number, number][]
    alt: string
  }
}

const REVIEWS: Review[] = [
  {
    quote:
      '"Congratulations to the team for delivering the project on time and within budget. We had a number of constraints, particularly the need to minimize disruption to the business, and that objective was fully achieved"',
    name: 'Christophe Jallon',
    role: 'Chief Executive Officer – Vanderlande',
    avatar: 'Christophe_Jallon_Vanderlande',
    image: {
      base: 'Temoignage_Vanderlande_200kb',
      sizes: [
        [1024, 683],
        [300, 200],
        [768, 512],
        [1536, 1024],
      ],
      alt: 'Vanderlande fit-out project by Ronnsquare',
    },
  },
  {
    quote:
      '"Ronnsquare embraced the challenge and delivered successfully: spacious and light-filled workspaces, excellent acoustic performance, and an environment that everyone genuinely loved. It was exactly what we were looking for"',
    name: 'Confidential',
    role: 'Office Manager – Pharmaceutical Group',
    avatar: 'Office_manager_Groupe_Pharmaceutique_200kb',
    image: {
      base: 'Temoignage_Groupe_Pharma_3_200kb',
      sizes: [
        [1024, 690],
        [300, 202],
        [768, 518],
        [1536, 1035],
      ],
      alt: "A pharmaceutical group's fit-out project by Ronnsquare",
    },
  },
  {
    quote:
      '"I quickly felt that Ronnsquare truly understood the project: not to disrupt or dismantle what already existed, but to create a more welcoming environment with additional space for employees"',
    name: 'Nicola Lohrey',
    role: 'Managing Partner - Rödl & Partner',
    avatar: 'Nicola_Lohrey_Rodl_Partner_200kb',
    image: {
      base: 'Temoignage_Rodl_200kb-1',
      sizes: [
        [1024, 683],
        [300, 200],
        [768, 512],
        [1536, 1024],
      ],
      alt: 'Rödl & Partner fit-out project by Ronnsquare',
    },
  },
  {
    quote:
      '"We even invited our European colleagues to visit, and they were envious of our offices, which now serve as a benchmark for other Merz Aesthetics subsidiaries across Europe"',
    name: 'Nicolas de La Hosseraye',
    role: 'Chief Executive Officer – Merz Aesthetics',
    avatar: 'Nicolas_de_La_Hosseraye_Merz_Aesthetics_200kb',
    image: {
      base: 'Temoignage_Merz_Aesthetics_1_200kb',
      sizes: [
        [1024, 677],
        [300, 198],
        [768, 508],
        [1536, 1016],
      ],
      alt: 'Merz Aesthetics fit-out project by Ronnsquare',
    },
  },
]

const IMAGE_DIR = '/images'
const IMAGE_SIZES = 'auto, (min-width: 48em) calc((100vw - 160px) / 2), calc(100vw - 20px)'
const AVATAR_SIZES = 'auto, (max-width: 150px) 100vw, 150px'

function imageSources({ base, sizes }: Review['image']) {
  const [width, height] = sizes[0]
  const srcSet = [
    ...sizes.map(([w, h]) => `${IMAGE_DIR}/${base}-${w}x${h}.jpg ${w}w`),
    `${IMAGE_DIR}/${base}.jpg 2048w`,
  ].join(', ')
  return { src: `${IMAGE_DIR}/${base}-${width}x${height}.jpg`, width, height, srcSet }
}

function ArrowIcon({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={
          direction === 'prev' ? 'M19 12H5M5 12L12 5M5 12L12 19' : 'M5 12H19M19 12L12 5M19 12L12 19'
        }
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Arrow({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <button
      type="button"
      className={`block-1-9-card-reviews__arrow block-1-9-card-reviews__arrow--${direction}`}
      aria-label={direction === 'prev' ? 'Previous testimonial' : 'Next testimonial'}
    >
      <ArrowIcon direction={direction} />
    </button>
  )
}

function Dots({ variant }: { variant: 'desktop' | 'mobile' }) {
  return (
    <div
      className={`block-1-9-card-reviews__dots block-1-9-card-reviews__dots--${variant}`}
      role="tablist"
    >
      {REVIEWS.map(({ name }, index) => (
        <button
          key={name}
          type="button"
          className={`block-1-9-card-reviews__dot ${index === 0 ? 'is-active' : ''}`}
          role="tab"
          aria-selected={index === 0 ? 'true' : 'false'}
          aria-label={`Testimonial ${index + 1}`}
        />
      ))}
    </div>
  )
}

/**
 * "Client Testimonials" (`block-1-9-card-reviews`), ported from the source's
 * block-1-9-card-reviews-anim.js: at `top 75%` the title's lines slide up (1.2s), 0.4s in the
 * subtitle fades up from 24px (0.8s), 0.3s later the slider (0.8s) and 0.3s later the mobile
 * controls (0.6s); scrolling back above reverses it. The slider itself is in
 * cardReviewsSlider.ts.
 */
function CardReviews() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const section = sectionRef.current
      if (!section) return
      const isReduced = prefersReducedMotion()
      const title = section.querySelector<HTMLElement>('[data-anim="title"]')
      const subtitle = section.querySelector<HTMLElement>('[data-anim="subtitle"]')
      const body = section.querySelector<HTMLElement>('[data-anim="body"]')
      const controls = section.querySelector<HTMLElement>('[data-anim="controls-mobile"]')
      const fadeTargets = [subtitle, body, controls].filter(Boolean)

      const stopSlider = initCardReviewsSlider(section, isReduced)

      if (isReduced) {
        gsap.set([title, ...fadeTargets].filter(Boolean), { autoAlpha: 1, y: 0 })
        return stopSlider
      }

      gsap.set(fadeTargets, { autoAlpha: 0, y: 24 })

      let isCancelled = false
      let unregister: (() => void) | undefined
      // Built once the webfonts are in, like the blocks above, so the title splits into its
      // final lines and the trigger is created after the pins above.
      const build = contextSafe!(() => {
        if (isCancelled) return
        const timeline = gsap.timeline({ id: 'block-1-9-card-reviews', paused: true })
        if (title) timeline.splitReveal(title, { duration: 1.2 })
        if (subtitle) timeline.fadeSlideUp(subtitle, { y: 20, duration: 0.8 }, '<0.4')
        if (body) timeline.fadeSlideUp(body, { duration: 0.8 }, '<0.3')
        if (controls) timeline.fadeSlideUp(controls, { duration: 0.6 }, '<0.3')
        unregister = registerBlockTimeline(section, timeline)
      })
      void document.fonts.ready.then(build)

      return () => {
        isCancelled = true
        unregister?.()
        stopSlider()
        if (title) revertSplitReveal(title)
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      className="block-1-9-card-reviews"
      data-block="block-1-9-card-reviews"
      aria-label="Client testimonials"
    >
      <div className="block-1-9-card-reviews__header">
        <h2 className="block-1-9-card-reviews__title anim-hidden" data-anim="title">
          Client Testimonials
        </h2>
        <p className="block-1-9-card-reviews__subtitle anim-hidden" data-anim="subtitle">
          They trust us
        </p>
      </div>

      <div className="block-1-9-card-reviews__body anim-hidden" data-anim="body">
        <div className="block-1-9-card-reviews__video-col">
          {REVIEWS.map(({ image }, index) => (
            <div
              key={image.base}
              className="block-1-9-card-reviews__media-wrapper"
              data-slide-index={index}
              data-media-type="image"
            >
              <img
                {...imageSources(image)}
                className="block-1-9-card-reviews__image"
                alt={image.alt}
                sizes={IMAGE_SIZES}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>

        <div className="block-1-9-card-reviews__content-col">
          <div className="block-1-9-card-reviews__nav" data-anim="nav">
            <Arrow direction="prev" />
            <Arrow direction="next" />
          </div>

          <div className="block-1-9-card-reviews__slides-container" aria-live="polite">
            {REVIEWS.map(({ quote, name, role, avatar }, index) => (
              <div key={name} className="block-1-9-card-reviews__slide" data-slide-index={index}>
                <blockquote className="block-1-9-card-reviews__quote">{quote}</blockquote>
                <div className="block-1-9-card-reviews__author">
                  <img
                    width={150}
                    height={150}
                    src={`${IMAGE_DIR}/${avatar}-150x150.png`}
                    srcSet={`${IMAGE_DIR}/${avatar}-150x150.png 150w, ${IMAGE_DIR}/${avatar}.png 200w`}
                    sizes={AVATAR_SIZES}
                    className="block-1-9-card-reviews__author-avatar"
                    alt={name}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="block-1-9-card-reviews__author-info">
                    <span className="block-1-9-card-reviews__author-name">{name}</span>
                    <span className="block-1-9-card-reviews__author-title">{role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Dots variant="desktop" />
        </div>
      </div>

      <div
        className="block-1-9-card-reviews__controls-mobile anim-hidden"
        data-anim="controls-mobile"
      >
        <Arrow direction="prev" />
        <Dots variant="mobile" />
        <Arrow direction="next" />
      </div>
    </section>
  )
}

export default CardReviews
