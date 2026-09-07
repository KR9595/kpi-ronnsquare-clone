import { useRef, useState } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'

import { languages } from '@/data/navigation'

/** "EN ⌄" trigger with an English / Français dropdown. */
function LangSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLUListElement>(null)
  const chevronRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    const panel = panelRef.current
    const chevron = chevronRef.current
    if (!panel) return

    if (isOpen) {
      gsap.set(panel, { display: 'block' })
      gsap.fromTo(
        panel,
        { y: -6, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' },
      )
      if (chevron) gsap.to(chevron, { rotate: 180, duration: 0.25 })
    } else {
      gsap.to(panel, {
        y: -6,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => gsap.set(panel, { display: 'none' }),
      })
      if (chevron) gsap.to(chevron, { rotate: 0, duration: 0.25 })
    }
  }, [isOpen])

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-ink flex items-center gap-1.5 font-sans text-sm font-bold tracking-wide uppercase"
      >
        EN
        <svg
          ref={chevronRef}
          viewBox="0 0 12 8"
          className="h-2.5 w-2.5"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <ul
        ref={panelRef}
        className="bg-cream absolute top-full right-0 z-40 mt-3 hidden w-36 overflow-hidden rounded-sm shadow-[0_12px_32px_rgba(35,24,0,0.16)]"
      >
        {languages.map((lang) => (
          <li key={lang.code}>
            <a
              href={lang.href}
              aria-current={lang.code === 'en' ? 'true' : undefined}
              className={`block px-4 py-2.5 font-serif text-sm ${
                lang.code === 'en' ? 'text-ink font-semibold' : 'text-ink/70'
              } hover:bg-ink/5`}
            >
              {lang.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LangSwitcher
