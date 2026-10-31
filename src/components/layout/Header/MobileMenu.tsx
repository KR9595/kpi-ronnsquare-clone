import type { Ref } from 'react'

import { deadLinkProps } from '@/lib/preventNavigation'

import { announcement, languages, mobileExtraLinks, primaryNav } from '@/data/navigation'

import Button from '@/components/ui/Button'
import ChevronIcon from '@/components/ui/ChevronIcon'

import MobileAccordion, { AccordionChevron } from './MobileAccordion'

interface MobileMenuProps {
  id: string
  isOpen: boolean
  ref?: Ref<HTMLDivElement>
}

/**
 * Panel under the mobile bar (below 48em). Opening is a CSS fade + slide-down on
 * `.header-ronn__menu.is-open`; the Header owns the open state, focus and scroll lock.
 */
function MobileMenu({ id, isOpen, ref }: MobileMenuProps) {
  return (
    <div
      ref={ref}
      id={id}
      className={`header-ronn__menu ${isOpen ? 'is-open' : ''}`}
      role="dialog"
      aria-label="Navigation menu"
      aria-hidden={!isOpen}
      inert={!isOpen}
      tabIndex={-1}
    >
      <div className="header-ronn__menu-body">
        <Button
          {...deadLinkProps}
          label="Contact Us"
          animateChars={false}
          className="header-ronn__btn header-ronn__btn--solid header-ronn__btn--full header-ronn__btn--menu-top"
        />

        {primaryNav.map((item) =>
          item.children ? (
            <MobileAccordion
              key={item.path}
              renderRow={({ isOpen: isGroupOpen, onToggle }) => (
                <div className="header-ronn__menu-link header-ronn__menu-link--parent">
                  <a {...deadLinkProps} className="header-ronn__menu-parent-link">
                    {item.label}
                  </a>
                  <AccordionChevron label={item.label} isOpen={isGroupOpen} onToggle={onToggle} />
                </div>
              )}
            >
              {item.children.map((child) => (
                <a key={child.path} {...deadLinkProps} className="header-ronn__menu-sub-link">
                  {child.label}
                </a>
              ))}
            </MobileAccordion>
          ) : (
            <a key={item.path} {...deadLinkProps} className="header-ronn__menu-link">
              {item.label}
            </a>
          ),
        )}

        {mobileExtraLinks.map((link) => (
          <a key={link.path} {...deadLinkProps} className="header-ronn__menu-link">
            {link.label}
          </a>
        ))}

        <MobileAccordion
          renderRow={({ isOpen: isGroupOpen, onToggle }) => (
            <button
              type="button"
              className="header-ronn__menu-link header-ronn__menu-link--parent header-ronn__menu-link--lang"
              aria-expanded={isGroupOpen}
              onClick={onToggle}
            >
              <span>Language</span>
              <span className="header-ronn__menu-lang-right">
                <span>en</span>
              </span>
              <span className="header-ronn__chevron">
                <ChevronIcon />
              </span>
            </button>
          )}
        >
          {languages.map((lang) => (
            <a
              key={lang.code}
              {...deadLinkProps}
              className={`header-ronn__menu-sub-link ${lang.code === 'en' ? 'is-active' : ''}`}
            >
              {lang.label}
            </a>
          ))}
        </MobileAccordion>
      </div>

      <div className="header-ronn__menu-footer">
        <div className="header-ronn__menu-cta">
          <p className="header-ronn__menu-cta-text">{announcement.text}</p>
          <Button
            {...deadLinkProps}
            label={announcement.cta.label}
            className="header-ronn__menu-cta-btn"
          />
        </div>
      </div>
    </div>
  )
}

export default MobileMenu
