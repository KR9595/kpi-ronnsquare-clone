import { useRef, useState } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'

import type { NavItem } from '@/data/navigation'

interface NavDropdownProps {
  item: NavItem
}

/** Desktop "Concerns" / "Our Expertise" nav item: hover or click reveals a dropdown panel. */
function NavDropdown({ item }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLUListElement>(null)
  const chevronRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    const panel = panelRef.current
    const chevron = chevronRef.current
    if (!panel) return

    if (isOpen) {
      gsap.set(panel, { display: 'block', height: 'auto' })
      const fullHeight = panel.offsetHeight
      gsap.fromTo(
        panel,
        { height: 0, opacity: 0 },
        { height: fullHeight, opacity: 1, duration: 0.35, ease: 'power3.out' },
      )
      gsap.fromTo(
        panel.children,
        { y: -8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.04, delay: 0.05, ease: 'power2.out' },
      )
      if (chevron) gsap.to(chevron, { rotate: 180, duration: 0.3, ease: 'power2.out' })
    } else {
      gsap.to(panel, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => gsap.set(panel, { display: 'none' }),
      })
      if (chevron) gsap.to(chevron, { rotate: 0, duration: 0.3, ease: 'power2.out' })
    }
  }, [isOpen])

  return (
    <li
      className="group relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex items-center gap-1.5">
        <a href={item.href} className="text-ink font-serif text-sm">
          {item.label}
        </a>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={`Toggle ${item.label} submenu`}
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-4 w-4 items-center justify-center"
        >
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
      </div>

      <ul
        ref={panelRef}
        className="bg-cream absolute top-full left-1/2 z-40 mt-3 hidden w-64 -translate-x-1/2 overflow-hidden rounded-sm shadow-[0_12px_32px_rgba(35,24,0,0.16)]"
      >
        {item.children?.map((child) => (
          <li key={child.href}>
            <a
              href={child.href}
              className="border-ink/10 text-ink hover:bg-ink/5 block border-b px-5 py-3 font-serif text-sm last:border-none"
            >
              {child.label}
            </a>
          </li>
        ))}
      </ul>
    </li>
  )
}

export default NavDropdown
