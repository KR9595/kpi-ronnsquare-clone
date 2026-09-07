import { useRef } from 'react'
import type { AnchorHTMLAttributes } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'

import SplitChars from './SplitChars'

type ButtonVariant = 'solid' | 'outline' | 'cta'

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string
  variant?: ButtonVariant
  fullWidth?: boolean
  /** Flips ink/cream so the button reads correctly on a dark (mobile header) background. */
  invert?: boolean
}

/** True fill variants render solid at rest; only `outline` reveals its fill on hover. */
const REVEALS_ON_HOVER: Record<ButtonVariant, boolean> = {
  solid: false,
  outline: true,
  cta: false,
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  solid: 'border border-ink text-cream',
  outline: 'border border-ink text-ink',
  cta: 'border border-transparent text-ink',
}

const VARIANT_CLASSES_INVERTED: Record<ButtonVariant, string> = {
  solid: 'border border-cream text-ink',
  outline: 'border border-cream text-cream',
  cta: 'border border-transparent text-ink',
}

const VARIANT_FILL: Record<ButtonVariant, string> = {
  solid: 'bg-ink',
  outline: 'bg-ink',
  cta: 'bg-lilac',
}

const VARIANT_FILL_INVERTED: Record<ButtonVariant, string> = {
  solid: 'bg-cream',
  outline: 'bg-cream',
  cta: 'bg-lilac',
}

/**
 * Recreates ronnsquare.fr's pill button: a letter-split label sitting above an
 * absolutely-positioned fill layer. `outline` slides its fill in from the bottom
 * on hover (and swaps text to cream); `solid`/`cta` are filled at rest and only
 * get the letter stagger on hover.
 */
function Button({
  label,
  variant = 'outline',
  fullWidth = false,
  invert = false,
  className = '',
  ...rest
}: ButtonProps) {
  const rootRef = useRef<HTMLAnchorElement>(null)
  const revealsOnHover = REVEALS_ON_HOVER[variant]
  const hoverTextColor = invert ? 'var(--color-ink)' : 'var(--color-cream)'

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const fill = root.querySelector<HTMLElement>('[data-btn-fill]')
      const label = root.querySelector<HTMLElement>('[data-btn-label]')
      const chars = root.querySelectorAll<HTMLElement>('[data-char]')
      if (!fill) return

      gsap.set(fill, { yPercent: revealsOnHover ? 100 : 0 })

      const tl = gsap.timeline({ paused: true })
      if (revealsOnHover) {
        tl.to(fill, { yPercent: 0, duration: 0.4, ease: 'power3.out' }, 0)
        if (label) tl.to(label, { color: hoverTextColor, duration: 0.25, ease: 'power1.out' }, 0)
      }
      tl.to(
        chars,
        { y: -2, duration: 0.3, ease: 'power2.out', stagger: 0.015, yoyo: true, repeat: 1 },
        0.02,
      )

      const play = () => tl.play()
      const reverse = () => tl.reverse()
      root.addEventListener('mouseenter', play)
      root.addEventListener('mouseleave', reverse)
      return () => {
        root.removeEventListener('mouseenter', play)
        root.removeEventListener('mouseleave', reverse)
      }
    },
    { scope: rootRef, dependencies: [variant, invert] },
  )

  const variantClasses = invert ? VARIANT_CLASSES_INVERTED[variant] : VARIANT_CLASSES[variant]
  const variantFill = invert ? VARIANT_FILL_INVERTED[variant] : VARIANT_FILL[variant]

  return (
    <a
      ref={rootRef}
      className={`btn group relative inline-flex items-center justify-center overflow-hidden px-6 py-3.5 font-sans text-sm font-bold tracking-wide uppercase ${
        fullWidth ? 'w-full' : ''
      } ${variantClasses} ${className}`}
      {...rest}
    >
      <span data-btn-fill className={`pointer-events-none absolute inset-0 ${variantFill}`} />
      <span className="sr-only">{label}</span>
      <span data-btn-label className="relative">
        <SplitChars text={label} />
      </span>
    </a>
  )
}

export default Button
