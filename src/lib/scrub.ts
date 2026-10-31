/*
 * Scroll-scrub smoothing, as on the source site (main.js): from 1024px up Lenis already
 * smooths the scroll, so scrubs follow it directly (`true`); below that they get a short lag.
 * `?scrub=0.5` overrides it for testing (`?scrub=0` means `true`).
 */
const DESKTOP_QUERY = '(min-width: 1024px)'

const scrubOverride = (() => {
  const value = new URLSearchParams(window.location.search).get('scrub')
  if (value === null) return null
  const parsed = parseFloat(value)
  if (Number.isNaN(parsed)) return null
  return parsed <= 0 ? true : parsed
})()

/** The ScrollTrigger `scrub` value for the current viewport. */
export function getScrub(fallback = 0.3): number | true {
  if (scrubOverride !== null) return scrubOverride
  return window.matchMedia(DESKTOP_QUERY).matches ? true : fallback
}
