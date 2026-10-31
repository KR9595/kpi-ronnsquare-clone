import { useRef } from 'react'

// Importing effects also registers the timeline effects (splitReveal, …).
import { revertSplitReveal } from '@/lib/effects'
import { prefersReducedMotion } from '@/lib/entrance'
import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'
import { deadLinkProps } from '@/lib/preventNavigation'
import { initProjectSlideshow } from '@/lib/projectsSlideshow'

import Button from '@/components/ui/Button'

import './projects.css'

interface ProjectImage {
  base: string
  /** The full-size `base.jpg`'s width. */
  width: number
  /** `[width, height]` of each WordPress `-WxH` copy; the first is the `src`. */
  sizes: [number, number][]
  alt: string
}

interface Project {
  company: string
  location: string
  /** Spans both columns from 768px up. */
  isFull: boolean
  images: ProjectImage[]
}

const PROJECTS: Project[] = [
  {
    company: 'ABYLSEN',
    location: 'Paris 8ème',
    isFull: true,
    images: [
      {
        base: '6.-CHIFFRES-CLES',
        width: 2047,
        sizes: [
          [1024, 687],
          [300, 201],
          [768, 515],
          [1536, 1030],
        ],
        alt: "Ronnsquare's key figures",
      },
      {
        base: 'abylsen_compressed_3-1',
        width: 2048,
        sizes: [
          [1024, 684],
          [300, 200],
          [768, 513],
          [1536, 1026],
        ],
        alt: 'Abylsen offices delivered by Ronnsquare',
      },
      {
        base: 'abylsen_compressed_1-1',
        width: 2048,
        sizes: [
          [1024, 678],
          [300, 198],
          [768, 508],
          [1536, 1016],
        ],
        alt: 'Fit-out of Abylsen offices by Ronnsquare',
      },
    ],
  },
  {
    company: 'EPICEUM',
    location: 'Montreuil',
    isFull: false,
    images: [
      {
        base: 'epiceum_compressed_3-1',
        width: 2048,
        sizes: [
          [1024, 694],
          [300, 203],
          [768, 520],
          [1536, 1040],
        ],
        alt: 'Epiceum offices delivered by Ronnsquare',
      },
      {
        base: 'epiceum_compressed_7-1',
        width: 2048,
        sizes: [
          [1024, 684],
          [300, 200],
          [768, 513],
          [1536, 1025],
        ],
        alt: 'Epiceum office project by Ronnsquare',
      },
      {
        base: 'epiceum_compressed_6-1',
        width: 2048,
        sizes: [
          [1024, 683],
          [300, 200],
          [768, 512],
          [1536, 1025],
        ],
        alt: 'Epiceum offices designed by Ronnsquare',
      },
    ],
  },
  {
    company: 'GROUPE PHARMA',
    location: 'Grand Paris',
    isFull: false,
    images: [
      {
        base: 'GROUPE-PHARMA-4_200kb',
        width: 2048,
        sizes: [
          [1024, 683],
          [300, 200],
          [768, 512],
          [1536, 1024],
        ],
        alt: "Interior fit-out of a pharmaceutical group's offices by Ronnsquare",
      },
      {
        base: 'GROUPE-PHARMA-11_200kb',
        width: 2048,
        sizes: [
          [1024, 683],
          [300, 200],
          [768, 512],
          [1536, 1024],
        ],
        alt: "A pharmaceutical group's workspaces by Ronnsquare",
      },
      {
        base: 'GROUPE-PHARMA-9_200kb',
        width: 2048,
        sizes: [
          [1024, 690],
          [300, 202],
          [768, 518],
          [1536, 1035],
        ],
        alt: "A pharmaceutical group's offices designed by Ronnsquare",
      },
    ],
  },
  {
    company: 'MERZ AESTHETIC',
    location: 'Courbevoie',
    isFull: true,
    images: [
      {
        base: 'merz_compressed_1-1',
        width: 1387,
        sizes: [
          [694, 1024],
          [203, 300],
          [768, 1134],
          [1040, 1536],
        ],
        alt: 'Fit-out of Merz Aesthetics offices by Ronnsquare',
      },
      {
        base: 'merz_compressed_2-1',
        width: 2048,
        sizes: [
          [1024, 683],
          [300, 200],
          [768, 512],
          [1536, 1025],
        ],
        alt: 'Merz Aesthetics workspaces fitted out by Ronnsquare',
      },
      {
        base: 'merz_compressed_4-1',
        width: 2048,
        sizes: [
          [1024, 681],
          [300, 199],
          [768, 510],
          [1536, 1021],
        ],
        alt: 'Interior fit-out of Merz Aesthetics offices by Ronnsquare',
      },
    ],
  },
]

const IMAGE_DIR = '/images'
const SIZES_FULL = 'auto, (min-width: 48em) calc(100vw - 120px), 100vw'
const SIZES_HALF = 'auto, (min-width: 48em) calc((100vw - 160px) / 2), 100vw'
/** Entrances play when their element's top reaches 85% of the viewport. */
const ENTRANCE_START = 'top 85%'

function imageSources({ base, width, sizes }: ProjectImage) {
  const [largeWidth, largeHeight] = sizes[0]
  const srcSet = [
    ...sizes.map(([w, h]) => `${IMAGE_DIR}/${base}-${w}x${h}.jpg ${w}w`),
    `${IMAGE_DIR}/${base}.jpg ${width}w`,
  ].join(', ')
  return {
    src: `${IMAGE_DIR}/${base}-${largeWidth}x${largeHeight}.jpg`,
    width: largeWidth,
    height: largeHeight,
    srcSet,
  }
}

/**
 * Plays `timeline` at `top 85%` and reverses it when scrolled back above, as the source's
 * block-1-8-projects-anim.js does for each of its elements. Returns the trigger.
 */
function playAtEntrance(element: HTMLElement, timeline: gsap.core.Timeline) {
  const trigger = ScrollTrigger.create({
    trigger: element,
    start: ENTRANCE_START,
    onEnter: () => timeline.play(),
    onEnterBack: () => timeline.play(),
    onLeaveBack: () => timeline.reverse(),
  })
  if (element.getBoundingClientRect().top < window.innerHeight * 0.85) timeline.play()
  return trigger
}

/**
 * "Our Projects" (`block-1-8-projects`), ported from the source's block-1-8-projects-anim.js:
 * the title's lines slide up (1.2s); each card's slideshow wipes open from the bottom (1s)
 * and 0.3s in its info box and bars fade up from 40px (0.7s); the CTA fades up from 20px
 * (0.6s). Each plays at `top 85%` and reverses when scrolled back above. Each card is an
 * image slideshow (see projectsSlideshow.ts).
 */
function Projects() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const section = sectionRef.current
      if (!section) return
      const isReduced = prefersReducedMotion()
      const title = section.querySelector<HTMLElement>('[data-anim="title"]')
      const cards = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-anim="card"]'))
      const cta = section.querySelector<HTMLElement>('[data-anim="cta"]')

      const initSlideshows = () =>
        gsap.utils
          .toArray<HTMLElement>(section.querySelectorAll('[data-has-slideshow]'))
          .map((card) => initProjectSlideshow(card, isReduced))

      if (isReduced) {
        gsap.set([title, ...cards, cta].filter(Boolean), { autoAlpha: 1, y: 0 })
        const stopSlideshows = initSlideshows()
        return () => stopSlideshows.forEach((stop) => stop())
      }

      cards.forEach((card) => {
        const content = [
          card.querySelector('.block-1-8-projects__info'),
          card.querySelector('.block-1-8-projects__scroll-bar'),
        ].filter(Boolean)
        gsap.set(card, { autoAlpha: 0 })
        gsap.set(content, { autoAlpha: 0, y: 40 })
      })
      if (cta) gsap.set(cta, { autoAlpha: 0, y: 20 })

      let isCancelled = false
      const triggers: ScrollTrigger[] = []
      let stopSlideshows: (() => void)[] = []
      // Built once the webfonts are in, like the blocks above, so the title splits into its
      // final lines and the triggers (the slideshows' autoplay ones too) are created after the
      // pins above, which they must account for.
      const build = contextSafe!(() => {
        if (isCancelled) return
        if (title) {
          const timeline = gsap.timeline({ id: 'block-1-8-projects', paused: true })
          timeline.splitReveal(title, { duration: 1.2 })
          triggers.push(playAtEntrance(title, timeline))
        }
        cards.forEach((card) => {
          const content = [
            card.querySelector('.block-1-8-projects__info'),
            card.querySelector('.block-1-8-projects__scroll-bar'),
          ].filter(Boolean)
          const timeline = gsap.timeline({ paused: true })
          timeline.revealImage(card, { duration: 1 }, 0)
          if (content.length) timeline.fadeSlideUp(content, { y: 40, duration: 0.7 }, '<0.3')
          triggers.push(playAtEntrance(card, timeline))
        })
        if (cta) {
          const timeline = gsap.timeline({ paused: true })
          timeline.fadeSlideUp(cta, { y: 20, duration: 0.6 })
          triggers.push(playAtEntrance(cta, timeline))
        }
        stopSlideshows = initSlideshows()
      })
      void document.fonts.ready.then(build)

      return () => {
        isCancelled = true
        triggers.forEach((trigger) => trigger.kill())
        stopSlideshows.forEach((stop) => stop())
        if (title) revertSplitReveal(title)
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      className="block-1-8-projects"
      data-block="block-1-8-projects"
      data-grid="mixed"
      aria-label="Our projects"
    >
      <h2 className="block-1-8-projects__title anim-hidden" data-anim="title">
        Our Projects
      </h2>

      <div className="block-1-8-projects__grid">
        {PROJECTS.map(({ company, location, isFull, images }) => (
          <article
            key={company}
            className={`block-1-8-projects__card ${isFull ? 'block-1-8-projects__card--full' : ''} anim-hidden`}
            data-anim="card"
            data-has-slideshow=""
          >
            <div className="block-1-8-projects__slideshow" data-anim-img-inner="">
              {images.map((image, index) => (
                <img
                  key={image.base}
                  {...imageSources(image)}
                  className={`block-1-8-projects__image ${index === 0 ? 'block-1-8-projects__image--active' : ''}`}
                  alt={image.alt}
                  data-slide={index}
                  sizes={isFull ? SIZES_FULL : SIZES_HALF}
                  loading="lazy"
                  decoding="async"
                />
              ))}
              <div className="block-1-8-projects__gradient" aria-hidden="true" />
            </div>
            <div className="block-1-8-projects__zones" aria-hidden="true">
              {images.map((image, index) => (
                <div
                  key={image.base}
                  className="block-1-8-projects__zone"
                  data-slide-index={index}
                />
              ))}
            </div>
            <div className="block-1-8-projects__info">
              <h3 className="block-1-8-projects__company">{company}</h3>
              <div className="block-1-8-projects__details">
                <p className="block-1-8-projects__location">{location}</p>
              </div>
              <Button
                label="Discover"
                className="btn--parme btn--md block-1-8-projects__btn"
                {...deadLinkProps}
              />
            </div>
            <div className="block-1-8-projects__scroll-bar" aria-hidden="true">
              {images.map((image, index) => (
                <span key={image.base} className="block-1-8-projects__bar" data-bar-index={index} />
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="block-1-8-projects__cta anim-hidden" data-anim="cta">
        <Button
          label="Explore Our Projects"
          className="btn--maron btn--md block-1-8-projects__cta-btn"
          {...deadLinkProps}
        />
      </div>
    </section>
  )
}

export default Projects
