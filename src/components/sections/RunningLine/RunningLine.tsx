import { useRef } from 'react'

// Importing effects also registers the timeline effects (splitReveal, …).
import { revertSplitReveal } from '@/lib/effects'
import { prefersReducedMotion, registerBlockTimeline } from '@/lib/entrance'
import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'
import { horizontalLoop } from '@/lib/horizontalLoop'
import { deadLinkProps } from '@/lib/preventNavigation'

import './runningLine.css'

const TITLE = 'Our Latest Projects'
const UPLOADS = '/images'

interface Project {
  name: string
  location: string
  alt: string
  /** File name stem of the WordPress upload (sizes are `<stem>-<W>x<H>.jpg`). */
  file: string
  width: number
  height: number
  /** The srcset widths and their `-WxH` suffixes, as on the source (full size last). */
  sizes: [number, string][]
}

/** The source's eight latest projects, in order, with their WordPress srcsets. */
const PROJECTS: Project[] = [
  {
    name: 'ABYLSEN',
    location: 'Paris 8ème',
    alt: "Ronnsquare's key figures",
    file: '6.-CHIFFRES-CLES',
    width: 1024,
    height: 687,
    sizes: [
      [1024, '-1024x687'],
      [300, '-300x201'],
      [768, '-768x515'],
      [1536, '-1536x1030'],
      [2047, ''],
    ],
  },
  {
    name: 'EPICEUM',
    location: 'Montreuil',
    alt: 'Epiceum offices delivered by Ronnsquare',
    file: 'epiceum_compressed_3-1',
    width: 1024,
    height: 694,
    sizes: [
      [1024, '-1024x694'],
      [300, '-300x203'],
      [768, '-768x520'],
      [1536, '-1536x1040'],
      [2048, ''],
    ],
  },
  {
    name: 'GROUPE PHARMA',
    location: 'Grand Paris',
    alt: "Interior fit-out of a pharmaceutical group's offices by Ronnsquare",
    file: 'GROUPE-PHARMA-4_200kb',
    width: 1024,
    height: 683,
    sizes: [
      [1024, '-1024x683'],
      [300, '-300x200'],
      [768, '-768x512'],
      [1536, '-1536x1024'],
      [2048, ''],
    ],
  },
  {
    name: 'MERZ AESTHETIC',
    location: 'Courbevoie',
    alt: 'Fit-out of Merz Aesthetics offices by Ronnsquare',
    file: 'merz_compressed_1-1',
    width: 694,
    height: 1024,
    sizes: [
      [694, '-694x1024'],
      [203, '-203x300'],
      [768, '-768x1134'],
      [1040, '-1040x1536'],
      [1387, ''],
    ],
  },
  {
    name: 'NITERRA',
    location: 'Le Plessis Robinson',
    alt: 'Niterra workspaces fitted out by Ronnsquare',
    file: 'Niterra-1-retouche_200kb',
    width: 1024,
    height: 694,
    sizes: [
      [1024, '-1024x694'],
      [300, '-300x203'],
      [768, '-768x520'],
      [1536, '-1536x1040'],
      [2048, ''],
    ],
  },
  {
    name: 'ARNEG',
    location: 'Tremblay-en-France',
    alt: 'ARNEG offices fitted out by Ronnsquare',
    file: 'Arneg-11_200KB',
    width: 1024,
    height: 683,
    sizes: [
      [1024, '-1024x683'],
      [300, '-300x200'],
      [768, '-768x512'],
      [1536, '-1536x1024'],
      [2048, ''],
    ],
  },
  {
    name: 'SOCODA',
    location: 'Paris 1er',
    alt: 'Socoda workspaces fitted out by Ronnsquare',
    file: 'Socoda-_62B5280-retouchee_under200KB',
    width: 1024,
    height: 683,
    sizes: [
      [1024, '-1024x683'],
      [300, '-300x200'],
      [768, '-768x512'],
      [1536, '-1536x1024'],
      [2048, ''],
    ],
  },
  {
    name: 'RÖDL & PARTNER',
    location: 'Paris 8ème',
    alt: 'Rödl & Partner fit-out project by Ronnsquare',
    file: 'Temoignage_Rodl_200kb-1',
    width: 1024,
    height: 683,
    sizes: [
      [1024, '-1024x683'],
      [300, '-300x200'],
      [768, '-768x512'],
      [1536, '-1536x1024'],
      [2048, ''],
    ],
  },
]

function ProjectItem({ project, isDuplicate }: { project: Project; isDuplicate: boolean }) {
  const [, srcSuffix] = project.sizes[0]
  return (
    <a
      {...deadLinkProps}
      className="block-1-2-running-line__item"
      aria-hidden={isDuplicate || undefined}
      tabIndex={isDuplicate ? -1 : undefined}
    >
      <div className="block-1-2-running-line__item-img">
        <div className="block-1-2-running-line__item-frame">
          <img
            width={project.width}
            height={project.height}
            src={`${UPLOADS}/${project.file}${srcSuffix}.jpg`}
            srcSet={project.sizes
              .map(([w, suffix]) => `${UPLOADS}/${project.file}${suffix}.jpg ${w}w`)
              .join(', ')}
            sizes="auto, 768px"
            className="attachment-large size-large"
            alt={isDuplicate ? '' : project.alt}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      <div className="block-1-2-running-line__item-caption">
        <span className="block-1-2-running-line__item-type">{project.name}</span>
        <span className="block-1-2-running-line__item-meta">{project.location}</span>
      </div>
    </a>
  )
}

/**
 * "Our Latest Projects" (`block-1-2-running-line`): an endless, draggable ticker of project
 * cards with prev/next arrows (from 48em), ported from the source's
 * block-1-2-running-line-anim.js. The set is rendered twice so the loop is seamless.
 */
function RunningLine() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const section = sectionRef.current
      if (!section) return
      const isReduced = prefersReducedMotion()
      const title = section.querySelector<HTMLElement>('[data-anim="title"]')
      const ticker = section.querySelector<HTMLElement>('[data-anim="ticker"]')
      const track = section.querySelector<HTMLElement>('[data-anim="track"]')
      const prev = section.querySelector<HTMLElement>('[data-anim="arrow-prev"]')
      const next = section.querySelector<HTMLElement>('[data-anim="arrow-next"]')
      const arrows = [prev, next].filter((el): el is HTMLElement => !!el)
      const items = track
        ? gsap.utils.toArray<HTMLElement>(track.querySelectorAll('.block-1-2-running-line__item'))
        : []
      const frames = track
        ? gsap.utils.toArray<HTMLElement>(
            track.querySelectorAll('.block-1-2-running-line__item-frame'),
          )
        : []
      const captions = track
        ? gsap.utils.toArray<HTMLElement>(
            track.querySelectorAll('.block-1-2-running-line__item-caption'),
          )
        : []

      if (!track || !items.length) {
        gsap.set([title, ticker].filter(Boolean), { autoAlpha: 1, y: 0 })
        return
      }

      const loop = horizontalLoop(items, { speed: 1.2, repeat: -1, paused: true, draggable: true })
      const isInteracting = () => {
        const d = loop.draggable
        return !!(d && (d.isPressed || d.isDragging || d.isThrowing))
      }
      // An arrow click snaps to the closest card, then eases one card over and resumes.
      const step = (direction: number) => {
        if (isInteracting()) return
        loop.pause()
        loop.closestIndex(true)
        const vars: gsap.TweenVars = isReduced
          ? { duration: 0 }
          : {
              duration: 0.5,
              ease: 'power2.inOut',
              onComplete: () => {
                if (!isInteracting()) loop.play()
              },
            }
        if (direction > 0) loop.next(vars)
        else loop.previous(vars)
      }
      const onNext = contextSafe!(() => step(1))
      const onPrev = contextSafe!(() => step(-1))
      next?.addEventListener('click', onNext)
      prev?.addEventListener('click', onPrev)

      const listeners: (() => void)[] = [
        () => next?.removeEventListener('click', onNext),
        () => prev?.removeEventListener('click', onPrev),
        () => loop.draggable?.kill(),
      ]
      const cleanup = () => listeners.forEach((fn) => fn())

      if (isReduced) {
        gsap.set([title, ticker].filter(Boolean), { autoAlpha: 1, y: 0 })
        gsap.set([...frames, ...arrows], { clipPath: 'inset(0% 0 0 0)' })
        return cleanup
      }

      const onEnterTrack = () => loop.pause()
      const onLeaveTrack = () => {
        if (!isInteracting()) loop.play()
      }
      track.addEventListener('mouseenter', onEnterTrack)
      track.addEventListener('mouseleave', onLeaveTrack)
      listeners.push(
        () => track.removeEventListener('mouseenter', onEnterTrack),
        () => track.removeEventListener('mouseleave', onLeaveTrack),
      )

      // Only run the ticker while the block is on screen.
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => {
          if (!isInteracting()) loop.play()
        },
        onLeave: () => loop.pause(),
        onEnterBack: () => {
          if (!isInteracting()) loop.play()
        },
        onLeaveBack: () => loop.pause(),
      })

      gsap.set(frames, { clipPath: 'inset(100% 0 0 0)' })
      gsap.set(arrows, { clipPath: 'inset(100% 0 0 0)' })
      gsap.set(captions, { autoAlpha: 0 })
      gsap.set(ticker, { autoAlpha: 1, y: 0 })

      let isCancelled = false
      let unregister: (() => void) | undefined

      // Split the title only once the webfonts are in, so the lines match the final layout.
      const build = contextSafe!(() => {
        if (isCancelled) return
        const timeline = gsap.timeline({ id: 'block-1-2-running-line', paused: true })
        if (title) timeline.splitReveal(title, { duration: 1.2 })
        timeline.to(
          frames,
          { clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'power3.inOut', stagger: 0.07 },
          '-=0.8',
        )
        timeline.to(
          captions,
          { autoAlpha: 1, duration: 0.6, ease: 'power2.out', stagger: 0.07 },
          '<0.2',
        )
        timeline.to(
          arrows,
          { clipPath: 'inset(0% 0 0 0)', duration: 0.7, ease: 'power3.out' },
          '<0.4',
        )
        // Plays when the block's top reaches 75% of the viewport, reverses above it.
        unregister = registerBlockTimeline(section, timeline)
      })
      void document.fonts.ready.then(build)

      return () => {
        isCancelled = true
        unregister?.()
        cleanup()
        if (title) revertSplitReveal(title)
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      className="block-1-2-running-line"
      data-block="block-1-2-running-line"
      aria-label={TITLE}
    >
      <h2 className="block-1-2-running-line__title anim-hidden" data-anim="title">
        {TITLE}
      </h2>

      <div className="block-1-2-running-line__slider">
        <div className="block-1-2-running-line__ticker anim-hidden" data-anim="ticker">
          <div className="block-1-2-running-line__track" data-anim="track">
            {PROJECTS.map((project) => (
              <ProjectItem key={project.file} project={project} isDuplicate={false} />
            ))}
            {/* Duplicate set for a seamless loop. */}
            {PROJECTS.map((project) => (
              <ProjectItem key={`${project.file}-copy`} project={project} isDuplicate />
            ))}
          </div>
        </div>

        <button
          type="button"
          className="block-1-2-running-line__arrow block-1-2-running-line__arrow--prev"
          data-anim="arrow-prev"
          aria-label="Previous project"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M19 12H5M5 12L12 5M5 12L12 19"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="block-1-2-running-line__arrow block-1-2-running-line__arrow--next"
          data-anim="arrow-next"
          aria-label="Next project"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  )
}

export default RunningLine
