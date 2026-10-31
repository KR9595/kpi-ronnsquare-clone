/*
 * The source site's learning/verification switches, read from the URL:
 * - `?debug` logs each intro step to the console (same tags and colours as the source) and
 *   exposes `window.gsap`, `window.ScrollTrigger` and `window.lenis`.
 * - `?slowmo=4` plays the first-load entrance 4× slower (an unparsable value means 4).
 */
const params = new URLSearchParams(window.location.search)

export const isDebug = params.has('debug')

/** A `console.log` that only logs with `?debug`, prefixed with a coloured tag. */
export function createLogger(tag: string, color: string) {
  return (...args: unknown[]) => {
    if (isDebug) console.log(`%c[${tag}]`, `color:${color};font-weight:bold`, ...args)
  }
}

/** The `?slowmo` factor (at least 1), or null when the param is absent or empty. */
export function getSlowmo() {
  const value = params.get('slowmo')
  if (!value) return null
  return Math.max(1, parseFloat(value) || 4)
}
