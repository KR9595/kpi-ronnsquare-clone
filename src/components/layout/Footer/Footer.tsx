import { deadLinkProps } from '@/lib/preventNavigation'

import { footerNav } from '@/data/navigation'

import Logo from '@/components/ui/Logo'

import NewsletterForm from './NewsletterForm'
import './footer.css'

const MAP_BASE = '/images/Footer-map'
const MAP_SRCSET = [
  `${MAP_BASE}-1024x276.png 1024w`,
  `${MAP_BASE}-300x81.png 300w`,
  `${MAP_BASE}-768x207.png 768w`,
  `${MAP_BASE}.png 1481w`,
].join(', ')

const LINKEDIN_URL = 'https://www.linkedin.com/company/ronnsquare/'

function LinkedInLink() {
  return (
    <a
      href={LINKEDIN_URL}
      className="footer-ronn__social-link"
      target="_blank"
      rel="noopener"
      aria-label="LinkedIn"
    >
      <span className="footer-ronn__social-icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.333 6.66797C14.6591 6.66797 15.9309 7.19475 16.8685 8.13243C17.8062 9.07012 18.333 10.3419 18.333 11.668V17.5013H14.9997V11.668C14.9997 11.2259 14.8241 10.802 14.5115 10.4895C14.199 10.1769 13.775 10.0013 13.333 10.0013C12.891 10.0013 12.4671 10.1769 12.1545 10.4895C11.8419 10.802 11.6663 11.2259 11.6663 11.668V17.5013H8.33301V11.668C8.33301 10.3419 8.85979 9.07012 9.79747 8.13243C10.7352 7.19475 12.0069 6.66797 13.333 6.66797Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.00033 7.5H1.66699V17.5H5.00033V7.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.33366 5.0013C4.25413 5.0013 5.00033 4.25511 5.00033 3.33464C5.00033 2.41416 4.25413 1.66797 3.33366 1.66797C2.41318 1.66797 1.66699 2.41416 1.66699 3.33464C1.66699 4.25511 2.41318 5.0013 3.33366 5.0013Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>LinkedIn</span>
    </a>
  )
}

function HeadOffice() {
  return (
    <>
      <h3 className="footer-ronn__map-group-title">Head Office – Paris</h3>
      <p className="footer-ronn__map-group-text">
        25 rue du 4 Septembre
        <br />
        75002 Paris
      </p>
    </>
  )
}

/**
 * Site footer (`footer.footer-ronn`), markup and styles ported from the source. It sits
 * after the page wrapper, as on the source, and has no scroll animation. (The source's logo
 * carries a `data-lottie="persistent"` / `data-lottie-play="scroll"` Lottie, but its
 * container is `display: none` until the Lottie mounts, so the IntersectionObserver that
 * would load it never fires and the static logo and tagline are what visitors see; that is
 * what is rendered here.) "Legal Notice" and "Privacy Policy" open their modals
 * (`LegalModal`); the newsletter forms send nothing and show the success toast
 * (`NewsletterForm`, `NewsletterToast`). Links to other pages go nowhere; `mailto:` and the
 * LinkedIn / credit links (new tab) are real.
 */
function Footer() {
  return (
    <footer className="footer-ronn" data-footer-ronn>
      <div className="footer-ronn__content">
        <section className="footer-ronn__map">
          <h2 className="footer-ronn__map-title">Based in Paris, operating across Europe</h2>

          <div className="footer-ronn__map-row">
            <div className="footer-ronn__map-image">
              <img
                width={1024}
                height={276}
                src={`${MAP_BASE}-1024x276.png`}
                srcSet={MAP_SRCSET}
                sizes="auto, (min-width: 48em) min(1375px, calc(100vw - 429px)), calc(100vw - 20px)"
                className="attachment-large size-large"
                alt="Map of Europe - Ronnsquare's areas of operation"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="footer-ronn__map-info">
              <div className="footer-ronn__map-group footer-ronn__map-group--office">
                <HeadOffice />
              </div>
              <div className="footer-ronn__map-group">
                <h3 className="footer-ronn__map-group-title">Presence in 6 European countries</h3>
                <p className="footer-ronn__map-group-text">
                  France
                  <br />
                  Germany
                  <br />
                  Spain
                  <br />
                  Italy
                  <br />
                  Ireland
                  <br />
                  United Kingdom
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="footer-ronn__nav">
          <div className="footer-ronn__nav-brand">
            <a
              {...deadLinkProps}
              className="footer-ronn__nav-logo"
              aria-label="Ronnsquare - Accueil"
            >
              <Logo />
              <span className="footer-ronn__nav-tagline">Activating the Space</span>
            </a>
            <a href="mailto:contact@ronnsquare.com" className="footer-ronn__nav-email">
              contact@ronnsquare.com
            </a>
          </div>

          <div className="footer-ronn__mobile-siege">
            <HeadOffice />
          </div>

          <div className="footer-ronn__mobile-newsletter">
            <span className="footer-ronn__newsletter-label">Newsletter signup</span>
            <NewsletterForm variant="mobile" />
          </div>

          <div className="footer-ronn__mobile-social">
            <LinkedInLink />
          </div>

          <div className="footer-ronn__nav-columns">
            {footerNav.map((column) => (
              <div key={column.title} className="footer-ronn__nav-col">
                <h3 className="footer-ronn__nav-col-title">{column.title}</h3>
                <ul className="footer-ronn__nav-col-list">
                  {column.links.map((link) => (
                    <li key={link.path}>
                      <a {...deadLinkProps} className="footer-ronn__nav-col-link">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="footer-ronn__bottom">
          <div className="footer-ronn__bottom-legal">
            <span>© 2026 Ronnsquare. All rights reserved.</span>
            <span className="footer-ronn__bottom-legal-sep">|</span>
            <a href="#" data-legal-open>
              Legal Notice
            </a>
            <span className="footer-ronn__bottom-legal-sep">|</span>
            <a href="#" data-privacy-open>
              Privacy Policy
            </a>
          </div>

          <div className="footer-ronn__bottom-newsletter">
            <span className="footer-ronn__newsletter-label">Newsletter signup</span>
            <NewsletterForm variant="desktop" />
          </div>

          <div className="footer-ronn__bottom-social">
            <LinkedInLink />
          </div>
        </section>

        <div className="footer-ronn__mobile-legal">
          <a href="#" data-legal-open>
            Legal Notice
          </a>
          <a href="#" data-privacy-open>
            Privacy Policy
          </a>
          <span>© 2026 Ronnsquare. All rights reserved.</span>
        </div>

        <a
          className="footer-ronn__credit footer-ronn__credit--en"
          href="https://colibrity.com/en/"
          target="_blank"
          rel="noopener"
          aria-label="Made by Colibrity — colibrity.com"
        >
          <span className="footer-ronn__credit-label">Made by</span>
          <img src="/svg/colibrity-made-by.svg" width={76} height={17} alt="" />
        </a>
      </div>
    </footer>
  )
}

export default Footer
