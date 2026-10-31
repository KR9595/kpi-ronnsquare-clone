import { useRef } from 'react'

// Importing effects also registers the timeline effects (splitReveal, …).
import { revertSplitReveal } from '@/lib/animation/effects'
import { prefersReducedMotion } from '@/lib/animation/entrance'
import { ScrollTrigger, gsap, useGSAP } from '@/lib/animation/gsap'
import { initParallax } from '@/lib/animation/parallax'
import { deadLinkProps } from '@/lib/utils/preventNavigation'

import Button from '@/components/ui/Button'

import './services.css'
import { initServicesTotem } from './servicesTotem'

interface Service {
  theme: 'dark' | 'parme' | 'sable'
  title: string
  description: string
  image: { base: string; width: number; sizes: [number, number][]; alt: string }
}

/**
 * Images: `sizes` lists the `[width, height]` of each WordPress `-WxH` copy (the first is the
 * `src`); `width` is the full-size `base.jpg`'s.
 */
const SERVICES: Service[] = [
  {
    theme: 'dark',
    title: 'Consulting & Strategy',
    description:
      'Before thinking about square meters, we focus on your business and your goals. We analyze your challenges, ways of working, and ambitions to build a solid project strategy—one that will guide every decision that follows.',
    image: {
      base: '3.-CONSEIL-STRATEGIQUE_200kb',
      width: 2047,
      sizes: [
        [1024, 668],
        [300, 196],
        [768, 501],
        [1536, 1002],
      ],
      alt: 'Strategic workspace fit-out consulting by Ronnsquare',
    },
  },
  {
    theme: 'parme',
    title: 'Architecture & Design',
    description:
      'Your spaces tell your story. We design them to support your goals and meet your challenges, combining creativity, aesthetics, functionality, and sustainability—while always keeping your budget in mind.',
    image: {
      base: '4.-ARCHITECTURE-DESIGN_200kb',
      width: 2048,
      sizes: [
        [1024, 673],
        [300, 197],
        [768, 505],
        [1536, 1010],
      ],
      alt: 'Workspace architecture and design by Ronnsquare',
    },
  },
  {
    theme: 'dark',
    title: 'Technical Delivery & Project Execution',
    description:
      'From the initial cost estimate to project completion, we manage every aspect of the construction process. Timelines are met, costs are controlled, and quality is guaranteed—giving you peace of mind while we handle the complexity.',
    image: {
      base: '5.-TECNIQUE-REALISATION_200kb',
      width: 2048,
      sizes: [
        [1024, 680],
        [300, 199],
        [768, 510],
        [1536, 1019],
      ],
      alt: 'Technical delivery of fit-outs by Ronnsquare',
    },
  },
  {
    theme: 'sable',
    title: 'Sustainability & Ecology',
    description:
      'We integrate tomorrow’s challenges into today’s projects by developing a strategy aligned with your vision. Sustainable certifications, material reuse, and carbon footprint reduction are all part of the conversation.',
    image: {
      base: '6.-DURABILITE-ECOLOGIE_200kb',
      width: 2048,
      sizes: [
        [1024, 680],
        [300, 199],
        [768, 510],
        [1536, 1020],
      ],
      alt: 'Sustainable, eco-friendly office fit-out by Ronnsquare',
    },
  },
]

const IMAGE_DIR = '/images'
const IMAGE_SIZES = 'auto, (min-width: 48em) 50vw, calc(100vw - 20px)'

function imageSources({ base, width, sizes }: Service['image']) {
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

/** The source's three totem shapes (holes cut with `evenodd`, so the card shows through). */
function TotemStack() {
  return (
    <div className="block-1-7-services__totem-stack" data-totem-stack>
      <div className="block-1-7-services__totem-shape" data-totem-shape="diamond">
        <svg
          className="equilibre-shape equilibre-shape--diamond"
          viewBox="0 0 284 284"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M142.929 283.538L0.928784 143.165L141.071 0.93052L283.071 141.304L142.929 283.538ZM142.506 219.214L218.853 141.728L141.494 65.2544L65.1467 142.741L142.506 219.214Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="block-1-7-services__totem-shape" data-totem-shape="circle">
        <svg
          className="equilibre-shape equilibre-shape--circle"
          viewBox="0 0 263 263"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M131.711 262.605C59.5562 263.081 0.475781 204.677 0.000781 132.403C-0.474219 60.1299 57.8334 0.952 129.988 0.476C202.143 0 261.223 58.404 261.698 130.678C262.173 202.951 203.866 262.129 131.711 262.605ZM131.417 217.882C178.949 217.569 217.362 178.582 217.049 130.972C216.736 83.362 177.814 44.885 130.282 45.199C82.7503 45.512 44.3369 84.499 44.6499 132.109C44.9629 179.719 83.8853 218.196 131.417 217.882Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="block-1-7-services__totem-shape" data-totem-shape="triangle">
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
  )
}

/**
 * "Our Support" (`block-1-7-services`, `--list --totem` variant), ported from the source's
 * block-1-7-services-anim.js: the title's lines slide up (1s) once at `top 80%`, each card's
 * image runs the global parallax (-10% → 10%), and the totem (servicesTotem.ts) flips down
 * the cards and tips over at the end (`data-services-destroy="arranged"`).
 */
function Services() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const section = sectionRef.current
      if (!section) return
      const title = section.querySelector<HTMLElement>('[data-anim="title"]')
      const isReduced = prefersReducedMotion()

      if (isReduced) {
        if (title) gsap.set(title, { autoAlpha: 1, clearProps: 'transform' })
        return
      }

      let isCancelled = false
      let trigger: ScrollTrigger | undefined
      let stopParallax: (() => void) | undefined
      let stopTotem: (() => void) | undefined
      // Built once the webfonts are in, like the blocks above, so the title splits into its
      // final lines and the triggers are created after the pins above.
      const build = contextSafe!(() => {
        if (isCancelled) return
        if (title) {
          gsap.set(title, { autoAlpha: 0 })
          const timeline = gsap.timeline({ id: 'block-1-7-services', paused: true })
          timeline.splitReveal(title, { duration: 1 })
          trigger = ScrollTrigger.create({
            trigger: section,
            start: 'top 80%',
            onEnter: () => timeline.play(),
          })
        }
        stopTotem = initServicesTotem(section)
        stopParallax = initParallax(section)
      })
      void document.fonts.ready.then(build)

      return () => {
        isCancelled = true
        trigger?.kill()
        stopParallax?.()
        stopTotem?.()
        if (title) revertSplitReveal(title)
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      className="block-1-7-services block-1-7-services--list block-1-7-services--totem"
      data-block="block-1-7-services"
      data-services-totem=""
      data-services-destroy="arranged"
    >
      <div className="block-1-7-services__pinned" data-anim="pinned">
        <div className="block-1-7-services__header">
          <h2 className="block-1-7-services__title anim-hidden" data-anim="title">
            Our Support
          </h2>
        </div>

        <div className="block-1-7-services__list">
          {SERVICES.map(({ theme, title, description, image }, index) => (
            <div
              key={title}
              className={`block-1-7-services__card block-1-7-services__card--${theme}`}
              data-stacking-card=""
              data-card-index={String(index + 1).padStart(2, '0')}
            >
              <div className="block-1-7-services__card-content">
                <div className="block-1-7-services__card-text">
                  <div className="block-1-7-services__card-top">
                    <h3 className="block-1-7-services__card-title">{title}</h3>
                  </div>
                  <p className="block-1-7-services__card-description">{description}</p>
                </div>
                <Button
                  label="LEARN MORE"
                  className="btn--md block-1-7-services__btn"
                  {...deadLinkProps}
                />
              </div>
              <div className="block-1-7-services__card-images block-1-7-services__card-images--single">
                <div
                  className="block-1-7-services__card-img"
                  data-parallax="trigger"
                  data-parallax-start="-10"
                  data-parallax-end="10"
                >
                  <div className="block-1-7-services__card-img-inner" data-parallax="target">
                    <img
                      {...imageSources(image)}
                      className="attachment-large size-large"
                      alt={image.alt}
                      sizes={IMAGE_SIZES}
                      data-stacking-card-img=""
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="block-1-7-services__totem" data-anim="totem" aria-hidden="true">
            <TotemStack />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Services
