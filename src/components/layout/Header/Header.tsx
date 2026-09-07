import { useState } from 'react'

import { primaryNav } from '@/data/navigation'

import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'

import LangSwitcher from './LangSwitcher'
import MobileMenu from './MobileMenu'
import NavDropdown from './NavDropdown'

/** Site header: announcement bar + main nav bar, with a slide-in panel on small screens. */
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="relative z-50">
      <a
        href="#main-content"
        className="focus:bg-cream sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      {/* Announcement bar (desktop only) */}
      <div className="bg-ink hidden items-center justify-center gap-4 px-4 py-2.5 lg:flex">
        <p className="text-cream font-serif text-sm">ADP Group becomes Ronnsquare!</p>
        <Button label="Discover" variant="cta" href="/about" className="px-4 py-1.5 text-xs" />
      </div>

      {/* Main bar */}
      <div className="bg-ink lg:bg-cream flex h-[70px] items-center justify-between px-5 lg:h-[88px] lg:px-10">
        <a href="/" aria-label="Ronnsquare home" className="text-cream lg:text-ink">
          <Logo className="h-10 w-auto lg:h-12" />
        </a>

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {primaryNav.map((item) =>
              item.children ? (
                <NavDropdown key={item.href} item={item} />
              ) : (
                <li key={item.href}>
                  <a href={item.href} className="text-ink font-serif text-sm">
                    {item.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Button label="Callback in 1 min" variant="outline" href="/callback" />
          <Button label="Contact Us" variant="solid" href="/contact" />
          <LangSwitcher />
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <Button
            label="Callback in 1 min"
            variant="outline"
            invert
            href="/callback"
            className="xs:inline-flex hidden"
          />
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
            className="text-cream flex h-10 w-10 items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
              <path
                d="M3 6H21M3 12H21M3 18H21"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  )
}

export default Header
