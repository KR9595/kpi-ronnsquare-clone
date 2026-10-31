import type { AnchorHTMLAttributes } from 'react'

import { useMediaQuery } from '@/lib/hooks/useMediaQuery'

import SplitChars from './SplitChars'

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string
  /**
   * Split the label into letters for the rolling hover (desktop only, like the source site's
   * `data-button-animate-chars`). Off for buttons the source never splits.
   */
  animateChars?: boolean
}

/** Seconds between letters in the hover roll. */
const CHAR_STAGGER = 0.01

/**
 * The source site's `.btn`: a fill layer under a label. Colors and sizes come from the
 * `--btn-*` custom properties, so callers style a button by adding a class that sets them
 * (see `header.css`). Hover behaviour lives in `index.css`.
 */
function Button({ label, animateChars = true, className = '', ...rest }: ButtonProps) {
  const isDesktop = useMediaQuery('(min-width: 48em)')
  const splitChars = animateChars && isDesktop

  return (
    <a className={`btn ${className}`} aria-label={splitChars ? label : undefined} {...rest}>
      <span className="btn__bg" aria-hidden="true" />
      <span className="btn__label">
        {splitChars ? <SplitChars text={label} stagger={CHAR_STAGGER} /> : label}
      </span>
    </a>
  )
}

export default Button
