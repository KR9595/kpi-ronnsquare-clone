import { useEffect, useRef } from 'react'

import { deadLinkProps } from '@/lib/preventNavigation'

import { languages } from '@/data/navigation'

import ChevronIcon from '@/components/ui/ChevronIcon'

import { DROPDOWN_CLOSE_DELAY } from './NavDropdown'

interface LangSwitcherProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

/** Desktop "EN ⌄" trigger; hover or click shows the language list (English only here). */
function LangSwitcher({ isOpen, onOpen, onClose }: LangSwitcherProps) {
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
    <div
      className={`header-ronn__lang-wrap ${isOpen ? 'is-open' : ''}`}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className="header-ronn__lang"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Change language"
        onClick={() => (isOpen ? onClose() : open())}
      >
        <span>EN</span>
        <span className="header-ronn__chevron">
          <ChevronIcon />
        </span>
      </button>
      <ul className="header-ronn__lang-dropdown" role="menu">
        {languages.map((lang) => (
          <li key={lang.code} role="none">
            <a
              {...deadLinkProps}
              className={`header-ronn__lang-option ${lang.code === 'en' ? 'is-active' : ''}`}
              role="menuitem"
              aria-current={lang.code === 'en' ? 'true' : undefined}
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
