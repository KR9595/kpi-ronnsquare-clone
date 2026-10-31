/*
 * The source's success popup (main.js `mo`), toast variant: unhides the popup, forces a
 * reflow and adds `is-open` (CSS fades it in and slides the card up, 0.25s ease, while the
 * progress bar empties over `--sp-duration`). It closes itself after `duration` or on its ×
 * (`[data-success-close]`), removing `is-open` and hiding it once the opacity transition
 * ends (400ms at the latest). On phones a toast anchored to a form sits 16px above that form
 * instead of at the bottom of the screen. (The source's modal variant is only used by the
 * contact page's form, so it isn't ported.)
 */

const HIDE_FALLBACK_MS = 400
const PHONE_QUERY = '(max-width: 47.9375em)'
const ANCHOR_GAP = 16
const ANCHOR_MIN_TOP = 16

const openPopups = new WeakMap<HTMLElement, () => void>()

export function showSuccessPopup(
  popup: HTMLElement,
  { duration = 4000, anchor = null }: { duration?: number; anchor?: HTMLElement | null } = {},
) {
  popup.classList.remove('is-anchored')
  popup.style.top = ''
  const closers = popup.querySelectorAll<HTMLElement>('[data-success-close]')
  openPopups.get(popup)?.()

  popup.style.setProperty('--sp-duration', `${duration}ms`)
  popup.hidden = false
  void popup.offsetWidth

  if (anchor && window.matchMedia(PHONE_QUERY).matches) {
    popup.classList.add('is-anchored')
    const rect = anchor.getBoundingClientRect()
    const top = Math.max(rect.top - ANCHOR_GAP - popup.offsetHeight, ANCHOR_MIN_TOP)
    popup.style.top = `${top}px`
  }

  popup.classList.add('is-open')

  let isCleanedUp = false
  const cleanup = () => {
    if (isCleanedUp) return
    isCleanedUp = true
    window.clearTimeout(autoClose)
    closers.forEach((closer) => closer.removeEventListener('click', close))
    openPopups.delete(popup)
  }

  function close() {
    cleanup()
    popup.classList.remove('is-open')
    let isHidden = false
    const hide = () => {
      if (isHidden) return
      isHidden = true
      popup.hidden = true
      popup.classList.remove('is-anchored')
      popup.style.top = ''
    }
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === popup && event.propertyName === 'opacity') {
        popup.removeEventListener('transitionend', onTransitionEnd)
        hide()
      }
    }
    popup.addEventListener('transitionend', onTransitionEnd)
    window.setTimeout(hide, HIDE_FALLBACK_MS)
  }

  closers.forEach((closer) => closer.addEventListener('click', close))
  const autoClose = window.setTimeout(close, duration)
  openPopups.set(popup, cleanup)
}
