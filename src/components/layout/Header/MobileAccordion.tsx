import { useState } from 'react'
import type { ReactNode } from 'react'

import ChevronIcon from '@/components/ui/ChevronIcon'

interface MobileAccordionProps {
  /** Row content; receives the toggle props so the row decides which element toggles. */
  renderRow: (toggle: { isOpen: boolean; onToggle: () => void }) => ReactNode
  children: ReactNode
}

/**
 * Mobile menu group that expands a sub-list. The height animation is pure CSS
 * (`grid-template-rows: 0fr → 1fr` on `.header-ronn__menu-sub`, see header.css).
 */
function MobileAccordion({ renderRow, children }: MobileAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`header-ronn__menu-group ${isOpen ? 'is-open' : ''}`}>
      {renderRow({ isOpen, onToggle: () => setIsOpen((prev) => !prev) })}
      <div className="header-ronn__menu-sub">
        <div className="header-ronn__menu-sub-inner">{children}</div>
      </div>
    </div>
  )
}

/** Chevron button used by the "Concerns" / "Our Expertise" rows. */
export function AccordionChevron({
  label,
  isOpen,
  onToggle,
}: {
  label: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className="header-ronn__chevron-toggle"
      aria-expanded={isOpen}
      aria-label={`Open submenu ${label}`}
      onClick={onToggle}
    >
      <ChevronIcon />
    </button>
  )
}

export default MobileAccordion
