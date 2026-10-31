import { useEffect, useRef } from 'react'

import { preventNavigation } from '@/lib/utils/preventNavigation'

import { initNewsletterForm } from './newsletterFormController'

interface NewsletterFormProps {
  /** The source renders the form twice (phone and desktop layouts); ids carry the variant. */
  variant: 'mobile' | 'desktop'
}

/** The footer's newsletter signup, markup copied from the source. Submitting sends nothing. */
function NewsletterForm({ variant }: NewsletterFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!formRef.current) return
    return initNewsletterForm(formRef.current)
  }, [])

  return (
    <form ref={formRef} className="footer-ronn__newsletter-form" noValidate>
      <div className="footer-ronn__newsletter-row">
        <label htmlFor={`footer-email-${variant}`} className="sr-only">
          Email
        </label>
        <input
          type="email"
          id={`footer-email-${variant}`}
          name="email"
          className="footer-ronn__newsletter-input"
          placeholder="Email"
          autoComplete="email"
          required
          pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
          aria-describedby={`rs-nl-err-${variant}`}
          data-error-required="Please enter your email."
          data-error-type="Please enter a valid email."
          data-error-pattern="Please enter a valid email."
        />
        <button
          type="submit"
          className="footer-ronn__newsletter-btn"
          aria-label="Subscribe to newsletter"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <span
        className="field-error field-error--footer"
        id={`rs-nl-err-${variant}`}
        data-field-error
        role="alert"
        aria-live="polite"
      />

      <div className="form-honeypot" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="footer-ronn__newsletter-consent" data-consent-gate hidden>
        <label className="checkbox checkbox--footer">
          <input
            className="checkbox__input"
            type="checkbox"
            name="consent_privacy"
            id={`footer-consent-${variant}`}
            required
            aria-describedby={`rs-nl-consent-err-${variant}`}
            data-error-required="Please accept the Privacy Policy."
          />
          <span className="checkbox__box" aria-hidden="true">
            <svg viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6L5 8.5 9.5 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="checkbox__label">
            I accept Ronnsquare's{' '}
            <a className="consent-link" href="#" data-privacy-open>
              Privacy Policy
            </a>
            . It is also protected by reCAPTCHA and the Google{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={preventNavigation}
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              onClick={preventNavigation}
            >
              Terms of Service
            </a>{' '}
            apply.
          </span>
        </label>
        <span
          className="field-error field-error--footer"
          id={`rs-nl-consent-err-${variant}`}
          data-field-error
          role="alert"
          aria-live="polite"
        />
      </div>
    </form>
  )
}

export default NewsletterForm
