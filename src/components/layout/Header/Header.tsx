import { useEffect, useRef, useState } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'
import { deadLinkProps } from '@/lib/preventNavigation'

import { announcement, primaryNav } from '@/data/navigation'

import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'

import LangSwitcher from './LangSwitcher'
import MobileMenu from './MobileMenu'
import NavDropdown from './NavDropdown'
import './header.css'
import { useHeaderAutoHide } from './useHeaderAutoHide'

const MENU_ID = 'header-ronn-menu'
const LANG_DROPDOWN = 'lang'

/**
 * Fixed site header: announcement bar + main bar on desktop; dark bar with a callback pill,
 * hamburger and slide-down menu below 48em. Markup and class names follow the source site.
 */
function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const hamburgerTl = useRef<gsap.core.Timeline | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useHeaderAutoHide(headerRef)

  // Hamburger: the two lines rotate into an X around their own centres.
  useGSAP(
    () => {
      hamburgerTl.current = gsap
        .timeline({ paused: true })
        .to(
          '.header-ronn__hamburger-line--top',
          { y: 4, rotation: 45, svgOrigin: '12 8', duration: 0.4, ease: 'power2.inOut' },
          0,
        )
        .to(
          '.header-ronn__hamburger-line--bottom',
          { y: -4, rotation: -45, svgOrigin: '12 16', duration: 0.4, ease: 'power2.inOut' },
          0,
        )
    },
    { scope: headerRef },
  )

  useEffect(() => {
    if (isMenuOpen) {
      hamburgerTl.current?.play()
      document.body.classList.add('is-header-menu-open')
      requestAnimationFrame(() => menuRef.current?.focus({ preventScroll: true }))
    } else {
      hamburgerTl.current?.reverse()
      document.body.classList.remove('is-header-menu-open')
    }
  }, [isMenuOpen])

  useEffect(() => () => document.body.classList.remove('is-header-menu-open'), [])

  // Escape closes dropdowns and the mobile menu; Tab is trapped inside the open menu.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null)
        if (isMenuOpen) {
          setIsMenuOpen(false)
          hamburgerRef.current?.focus()
        }
        return
      }
      if (event.key !== 'Tab' || !isMenuOpen || !menuRef.current) return
      const focusables = menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen])

  const dropdownProps = (key: string) => ({
    isOpen: openDropdown === key,
    onOpen: () => setOpenDropdown(key),
    onClose: () => setOpenDropdown((current) => (current === key ? null : current)),
  })

  const toggleMenu = () => {
    if (isMenuOpen) hamburgerRef.current?.focus()
    setIsMenuOpen((prev) => !prev)
  }

  return (
    <header ref={headerRef} className="header-ronn header-ronn--light" data-header-ronn>
      <a
        href="#main-content"
        className="focus:text-ink sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[300] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold"
      >
        Skip to content
      </a>

      <div className="header-ronn__cta-bar">
        <p className="header-ronn__cta-text">{announcement.text}</p>
        <Button
          {...deadLinkProps}
          label={announcement.cta.label}
          className="header-ronn__cta-btn"
        />
      </div>

      <div className="header-ronn__main">
        <a href="/" className="header-ronn__logo" aria-label="Ronnsquare - Home">
          <Logo />
        </a>

        <nav className="header-ronn__nav" aria-label="Main navigation">
          <ul className="header-ronn__nav-list">
            {primaryNav.map((item) =>
              item.children ? (
                <NavDropdown key={item.path} item={item} {...dropdownProps(item.path)} />
              ) : (
                <li key={item.path} className="header-ronn__nav-item">
                  <a {...deadLinkProps} className="header-ronn__nav-link">
                    {item.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="header-ronn__actions">
          <Button
            {...deadLinkProps}
            label="Callback in 1 min"
            className="header-ronn__btn header-ronn__btn--outline"
          />
          <Button
            {...deadLinkProps}
            label="Contact Us"
            className="header-ronn__btn header-ronn__btn--solid"
          />
          <LangSwitcher {...dropdownProps(LANG_DROPDOWN)} />
        </div>

        <a {...deadLinkProps} className="header-ronn__mobile-cta">
          <span className="header-ronn__btn-label">Callback in 1 min</span>
        </a>
        <button
          ref={hamburgerRef}
          type="button"
          className="header-ronn__hamburger"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls={MENU_ID}
          onClick={toggleMenu}
        >
          <svg
            className="header-ronn__hamburger-svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <line
              className="header-ronn__hamburger-line header-ronn__hamburger-line--top"
              x1="2"
              y1="8"
              x2="22"
              y2="8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              className="header-ronn__hamburger-line header-ronn__hamburger-line--bottom"
              x1="2"
              y1="16"
              x2="22"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <MobileMenu ref={menuRef} id={MENU_ID} isOpen={isMenuOpen} />
    </header>
  )
}

export default Header
