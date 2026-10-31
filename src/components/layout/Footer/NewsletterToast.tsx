import './success-popup.css'

/**
 * "Thank you for subscribing!" toast (source: `div.success-popup--toast` after the footer),
 * shown by `@/lib/successPopup` after a valid newsletter signup.
 */
function NewsletterToast() {
  return (
    <div
      className="success-popup success-popup--toast"
      data-form-success="newsletter"
      hidden
      role="status"
      aria-live="polite"
    >
      <div className="success-popup__card">
        <button
          type="button"
          className="success-popup__close"
          data-success-close
          aria-label="Close"
        >
          <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M2 2l10 10M12 2L2 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <span className="success-popup__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <path
              d="M5 12.5L10 17.5L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="success-popup__text">
          <p className="success-popup__title" id="rs-newsletter-success-title">
            Thank you for subscribing!
          </p>
          <p className="success-popup__body">
            You will receive our latest news and exclusive content.
          </p>
        </div>
        <span className="success-popup__progress" data-success-progress aria-hidden="true" />
      </div>
    </div>
  )
}

export default NewsletterToast
