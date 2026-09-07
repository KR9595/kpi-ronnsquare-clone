import { useEffect, useRef } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'

import { languages, mobileExtraLinks, primaryNav } from '@/data/navigation'

import Button from '@/components/ui/Button'

import MobileAccordion from './MobileAccordion'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

/** Full-height slide-in panel shown on small screens when the hamburger is tapped. */
function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const [dnaTeam, ourProjects] = primaryNav

  // Build the open/close timeline once; toggling it is just play()/reverse().
  useGSAP(
    () => {
      const panel = panelRef.current
      if (!panel) return

      gsap.set(panel, { display: 'none', xPercent: 100 })

      const tl = gsap.timeline({ paused: true })
      tl.set(panel, { display: 'flex' })
        .to(panel, { xPercent: 0, duration: 0.45, ease: 'power3.out' })
        .fromTo(
          panel.querySelectorAll('[data-menu-item]'),
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out' },
          '-=0.2',
        )

      timelineRef.current = tl
      return () => {
        tl.kill()
        timelineRef.current = null
      }
    },
    { scope: panelRef },
  )

  useEffect(() => {
    const tl = timelineRef.current
    if (!tl) return

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      tl.play()
    } else {
      document.body.style.overflow = ''
      tl.eventCallback('onReverseComplete', () => gsap.set(panelRef.current, { display: 'none' }))
      tl.reverse()
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <div
      ref={panelRef}
      className="bg-ink fixed inset-0 z-50 flex flex-col overflow-y-auto px-6 pt-6 pb-10 lg:hidden"
      aria-hidden={!isOpen}
    >
      <div className="mb-8 flex items-center justify-end" data-menu-item>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="text-cream flex h-10 w-10 items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
            <path
              d="M5 5L19 19M19 5L5 19"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div data-menu-item>
        <Button label="Contact Us" variant="solid" fullWidth href="/contact" />
      </div>

      <nav className="mt-6 flex flex-col">
        <a
          data-menu-item
          href={dnaTeam.href}
          className="border-cream/15 text-cream border-b py-4 font-serif text-xl"
        >
          {dnaTeam.label}
        </a>
        <a
          data-menu-item
          href={ourProjects.href}
          className="border-cream/15 text-cream border-b py-4 font-serif text-xl"
        >
          {ourProjects.label}
        </a>
        {primaryNav.slice(2).map((item) => (
          <div data-menu-item key={item.href}>
            <MobileAccordion item={item} />
          </div>
        ))}
        {mobileExtraLinks.map((link) => (
          <a
            key={link.href}
            data-menu-item
            href={link.href}
            className="border-cream/15 text-cream border-b py-4 font-serif text-xl"
          >
            {link.label}
          </a>
        ))}
        <div data-menu-item>
          <MobileAccordion item={{ label: 'English', href: '#', children: languages }} />
        </div>
      </nav>
    </div>
  )
}

export default MobileMenu
