interface SplitCharsProps {
  text: string
  className?: string
}

/**
 * Renders text as one <span> per character so GSAP can stagger them individually.
 * The split markup is hidden from assistive tech; pair it with a visible sr-only
 * label carrying the full string (see Button.tsx) so screen readers announce it once.
 */
function SplitChars({ text, className }: SplitCharsProps) {
  return (
    <span aria-hidden="true" className="inline-block">
      {text.split('').map((char, index) => (
        <span key={`${char}-${index}`} data-char className={`inline-block ${className ?? ''}`}>
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  )
}

export default SplitChars
