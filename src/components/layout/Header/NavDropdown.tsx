import { useEffect, useRef } from 'react'

import { deadLinkProps } from '@/lib/utils/preventNavigation'

import type { NavItem } from '@/data/navigation'

import ChevronIcon from '@/components/ui/ChevronIcon'

/** Grace period before a dropdown closes after the pointer leaves, as on the source site. */
export const DROPDOWN_CLOSE_DELAY = 150

interface NavDropdownProps {
  item: NavItem
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

/**
 * Desktop "Concerns" / "Our Expertise" item. Hover opens it (closing the others), leaving
 * closes it after a short delay, and the chevron toggles it. The panel's fade/slide is CSS
 * (`.is-open > .header-ronn__dropdown` in header.css).
 */
function NavDropdown({ item, isOpen, onOpen, onClose }: NavDropdownProps) {
  const closeTimer = useRef<number | undefined>(undefined)

  const open = () => {
    window.clearTimeout(closeTimer.current)
    onOpen()
  }
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(onClose, DROPDOWN_CLOSE_DELAY)
  }

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  return (
    <li
      className={`header-ronn__nav-item header-ronn__nav-item--has-sub ${isOpen ? 'is-open' : ''}`}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
    >
      <a {...deadLinkProps} className="header-ronn__nav-link">
        {item.label}
      </a>
      <button
        type="button"
        className="header-ronn__chevron-toggle"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Open submenu ${item.label}`}
        onClick={() => (isOpen ? onClose() : open())}
      >
        <ChevronIcon />
      </button>
      <ul className="header-ronn__dropdown" role="menu">
        {item.children?.map((child) => (
          <li key={child.path} role="none">
            <a {...deadLinkProps} className="header-ronn__dropdown-link" role="menuitem">
              {child.label}
            </a>
          </li>
        ))}
      </ul>
    </li>
  )
}

export default NavDropdown
