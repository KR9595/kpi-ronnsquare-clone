import { useRef, useState } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'

import type { NavItem } from '@/data/navigation'

interface MobileAccordionProps {
  item: NavItem
}

/** Expand/collapse row used inside the mobile menu for "Concerns" / "Our Expertise". */
function MobileAccordion({ item }: MobileAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const chevronRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    const panel = panelRef.current
    const chevron = chevronRef.current
    if (!panel) return

    if (isOpen) {
      gsap.set(panel, { height: 'auto' })
      const fullHeight = panel.offsetHeight
      gsap.fromTo(panel, { height: 0 }, { height: fullHeight, duration: 0.35, ease: 'power3.out' })
    } else {
      gsap.to(panel, { height: 0, duration: 0.3, ease: 'power2.in' })
    }
    if (chevron) gsap.to(chevron, { rotate: isOpen ? 180 : 0, duration: 0.3, ease: 'power2.out' })
  }, [isOpen])

  return (
    <div className="border-cream/15 border-b">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-cream flex w-full items-center justify-between py-4 font-serif text-xl"
      >
        {item.label}
        <svg ref={chevronRef} viewBox="0 0 12 8" className="h-3 w-3" fill="none" aria-hidden="true">
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div ref={panelRef} className="h-0 overflow-hidden">
        <ul className="pb-3">
          {item.children?.map((child) => (
            <li key={child.href}>
              <a href={child.href} className="text-cream/75 block py-2 font-serif text-base">
                {child.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default MobileAccordion
