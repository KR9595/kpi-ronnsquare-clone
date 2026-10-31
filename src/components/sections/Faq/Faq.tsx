import { useRef } from 'react'

// Importing effects also registers the timeline effects (splitReveal, …).
import { revertSplitReveal } from '@/lib/animation/effects'
import { prefersReducedMotion, registerBlockTimeline } from '@/lib/animation/entrance'
import { ScrollTrigger, gsap, useGSAP } from '@/lib/animation/gsap'

import './faq.css'
import { buildFaqLoop } from './faqLoop'

const QUESTIONS = [
  {
    question: 'Do you work on all types of projects?',
    answer:
      'We support businesses in the delivery of their office projects, whether it involves a new workspace, a refurbishment, or an expansion.',
  },
  {
    question: 'Do we need to work with other service providers alongside you?',
    answer:
      'No. Our strength lies in managing the entire project, from initial strategy and design through to project delivery. You benefit from a single point of contact, fully accountable for the success of your project.',
  },
  {
    question: 'What does the first stage of a project look like?',
    answer:
      'Every project begins with a listening and analysis phase. We assess your needs, ways of working, and constraints to build a strategy tailored to your objectives before any investment is made.',
  },
  {
    question: 'How do you support our teams through change?',
    answer:
      'We involve employees in the process from the very beginning through collaborative workshops and regular check-ins. After the move-in, we gather their feedback to refine what can be improved and confirm what is working well.',
  },
]

const ACTIVE_CLASS = 'block-1-11-faq__item--active'

/** The bowl, the ball with its "?" and the triangle base; `data-faq-part` groups loop. */
function FaqIllustration() {
  return (
    <svg
      className="faq-illustration faq-illustration--01"
      viewBox="-64 -85 492 431"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M109.832 346.095H253.523L181.677 284.533L109.832 346.095Z" fill="currentColor" />
      <g data-faq-part="main">
        <path
          d="M2.05044 110.428C2.36746 206.272 81.4674 284.471 179.987 285.638C278.507 286.805 359.438 210.502 362.025 114.693L2.05044 110.428Z"
          fill="currentColor"
        />
        <g data-faq-part="ball">
          <circle cx="182.4" cy="57" r="57.5" fill="currentColor" />
          <g transform="translate(168.2, 34.1)">
            <path
              d="M0 13.6567C0 9.4401 1.17477 6.11509 3.52431 3.68164C5.89482 1.22721 9.35619 0 13.9084 0C18.0201 0 21.45 1.18526 24.1981 3.55577C26.9672 5.92629 28.3518 9.01006 28.3518 12.8071C28.3518 17.4432 26.3589 21.0095 22.373 23.5059L16.7405 27.0616V32.7257H8.6849V22.8765L16.4258 18.2509C17.6215 17.5376 18.4816 16.7509 19.0061 15.8908C19.5305 15.0307 19.7928 14.0028 19.7928 12.8071C19.7928 11.4855 19.2788 10.3631 18.2509 9.4401C17.2439 8.51707 15.7964 8.05556 13.9084 8.05556C12.0833 8.05556 10.6254 8.53805 9.5345 9.50304C8.46463 10.468 7.92969 11.8526 7.92969 13.6567H0ZM8.37023 45.753V36.5332H17.1495V45.753H8.37023Z"
              fill="var(--faq-mark-color, var(--color-brand-maron, #231800))"
            />
          </g>
        </g>
      </g>
    </svg>
  )
}

/**
 * "FAQ" (`block-1-11-faq`), ported from the source's block-1-11-faq-anim.js.
 *
 * Accordion: one answer open at a time, the first open on load; clicking the open question
 * closes it. Opening tweens the answer to `height: auto` and full opacity (0.4s, power2.out)
 * while the plus turns 90° out and the minus turns in (0.3s); `aria-expanded` follows. The
 * list's min-height reserves room for the tallest answer, so toggling never shifts the page.
 *
 * Entrance at `top 75%`: the title's lines slide up (1.2s), 0.4s in the illustration fades
 * up (0.8s), 0.5s later the questions (0.7s, 0.12s apart); scrolling back above reverses it.
 * The illustration's loop (faqLoop.ts) only plays while the block is on screen.
 */
function Faq() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const section = sectionRef.current
      if (!section) return
      const isReduced = prefersReducedMotion()
      const title = section.querySelector<HTMLElement>('[data-anim="title"]')
      const illustration = section.querySelector<HTMLElement>('[data-anim="illustration"]')
      const items = Array.from(section.querySelectorAll<HTMLElement>('[data-anim="item"]'))
      const list = section.querySelector<HTMLElement>('.block-1-11-faq__list')

      const parts = items.map((item) => ({
        item,
        answer: item.querySelector<HTMLElement>('[data-faq-answer]')!,
        toggle: item.querySelector<HTMLButtonElement>('[data-faq-toggle]')!,
        plus: item.querySelector('.block-1-11-faq__icon-plus'),
        minus: item.querySelector('.block-1-11-faq__icon-minus'),
      }))

      // Reserve the tallest answer's height, whichever item is open.
      const reserveListHeight = () => {
        if (!list || !parts.length) return
        const tallest = Math.max(...parts.map(({ answer }) => answer.scrollHeight))
        const open = section.querySelector(`.${ACTIVE_CLASS} [data-faq-answer]`)
        const openHeight = open ? open.getBoundingClientRect().height : 0
        list.style.minHeight = ''
        list.style.minHeight = `${Math.ceil(list.offsetHeight - openHeight + tallest)}px`
      }
      reserveListHeight()
      void document.fonts.ready.then(() => {
        if (section.isConnected) reserveListHeight()
      })
      let lastWidth = window.innerWidth
      const onResize = () => {
        if (window.innerWidth === lastWidth) return
        lastWidth = window.innerWidth
        reserveListHeight()
      }
      window.addEventListener('resize', onResize)

      const open = (index: number, animate = true) => {
        const { item, answer, toggle, plus, minus } = parts[index]
        item.classList.add(ACTIVE_CLASS)
        toggle.setAttribute('aria-expanded', 'true')
        if (animate && !isReduced) {
          gsap.to(answer, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' })
          gsap.to(plus, { autoAlpha: 0, rotation: 90, duration: 0.3, ease: 'power2.out' })
          gsap.to(minus, { autoAlpha: 1, rotation: 0, duration: 0.3, ease: 'power2.out' })
        } else {
          gsap.set(answer, { height: 'auto', opacity: 1 })
          gsap.set(plus, { autoAlpha: 0 })
          gsap.set(minus, { autoAlpha: 1 })
        }
      }

      const close = (index: number, animate = true) => {
        const { item, answer, toggle, plus, minus } = parts[index]
        item.classList.remove(ACTIVE_CLASS)
        toggle.setAttribute('aria-expanded', 'false')
        if (animate && !isReduced) {
          gsap.to(answer, { height: 0, opacity: 0, duration: 0.4, ease: 'power2.out' })
          gsap.to(plus, { autoAlpha: 1, rotation: 0, duration: 0.3, ease: 'power2.out' })
          gsap.to(minus, { autoAlpha: 0, rotation: -90, duration: 0.3, ease: 'power2.out' })
        } else {
          gsap.set(answer, { height: 0, opacity: 0 })
          gsap.set(plus, { autoAlpha: 1 })
          gsap.set(minus, { autoAlpha: 0 })
        }
      }

      let openIndex = -1
      const toggleItem = contextSafe!((index: number) => {
        if (index === openIndex) {
          close(index)
          openIndex = -1
          return
        }
        if (openIndex >= 0) close(openIndex)
        open(index)
        openIndex = index
      })
      const listeners = parts.map(({ toggle }, index) => {
        const onClick = () => toggleItem(index)
        toggle.addEventListener('click', onClick)
        return () => toggle.removeEventListener('click', onClick)
      })

      parts.forEach((_part, index) => close(index, false))
      if (parts.length) {
        open(0, false)
        openIndex = 0
      }

      const cleanupListeners = () => {
        window.removeEventListener('resize', onResize)
        listeners.forEach((removeListener) => removeListener())
      }

      if (isReduced) {
        gsap.set([title, illustration, ...items].filter(Boolean), {
          autoAlpha: 1,
          clearProps: 'transform',
        })
        return cleanupListeners
      }

      gsap.set(title, { autoAlpha: 0 })
      if (illustration) gsap.set(illustration, { autoAlpha: 0, y: 24 })
      gsap.set(items, { autoAlpha: 0, y: 24 })

      // The loop only runs while the block is on screen.
      let loopTrigger: ScrollTrigger | undefined
      if (illustration) {
        const loop = buildFaqLoop(illustration, { repeat: -1 })
        loopTrigger = ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        })
      }

      let isCancelled = false
      let unregister: (() => void) | undefined
      // Built once the webfonts are in, like the blocks above, so the title splits into its
      // final lines and the trigger is created after the pins above.
      const build = contextSafe!(() => {
        if (isCancelled) return
        const timeline = gsap.timeline({ id: 'block-1-11-faq', paused: true })
        if (title) timeline.splitReveal(title, { duration: 1.2 })
        if (illustration) timeline.fadeSlideUp(illustration, { y: 20, duration: 0.8 }, '<0.4')
        timeline.fadeSlideUp(items, { duration: 0.7, stagger: 0.12 }, '<0.5')
        unregister = registerBlockTimeline(section, timeline)
      })
      void document.fonts.ready.then(build)

      return () => {
        isCancelled = true
        cleanupListeners()
        unregister?.()
        loopTrigger?.kill()
        if (title) revertSplitReveal(title)
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      className="block-1-11-faq"
      data-block="block-1-11-faq"
      aria-label="FAQ"
    >
      <div className="block-1-11-faq__container">
        <div className="block-1-11-faq__left">
          <h2 className="block-1-11-faq__title anim-hidden" data-anim="title">
            FAQ
          </h2>
          <div
            className="block-1-11-faq__illustration block-1-11-faq__illustration--sable anim-hidden"
            data-anim="illustration"
            data-faq-animation="faq"
          >
            <FaqIllustration />
          </div>
        </div>

        <div className="block-1-11-faq__list">
          {QUESTIONS.map(({ question, answer }) => (
            <div key={question} className="block-1-11-faq__item anim-hidden" data-anim="item">
              <button
                type="button"
                className="block-1-11-faq__question"
                data-faq-toggle
                aria-expanded="false"
              >
                <span className="block-1-11-faq__question-text">{question}</span>
                <span className="block-1-11-faq__icon" aria-hidden="true">
                  <svg className="block-1-11-faq__icon-plus" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 3v10M3 8h10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <svg className="block-1-11-faq__icon-minus" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
              <div className="block-1-11-faq__answer" data-faq-answer>
                <div className="block-1-11-faq__answer-inner">
                  <p>{answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Faq
