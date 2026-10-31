import type { MouseEvent } from 'react'

/**
 * This clone only has the homepage, so links to other pages render `href="#"` and swallow
 * the click instead of navigating.
 */
export function preventNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
}

/** Props for an anchor that looks like a link but goes nowhere. */
export const deadLinkProps = { href: '#', onClick: preventNavigation } as const
