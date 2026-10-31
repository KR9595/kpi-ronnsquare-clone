interface SplitCharsProps {
  text: string
  /** Seconds added per letter to each span's `transition-delay`, for a staggered CSS hover. */
  stagger?: number
}

/**
 * Renders text as one inline <span> per character (no wrapper), so CSS can transition each
 * letter with its own delay. Hidden from assistive tech; pair it with an sr-only copy of
 * the text (see Button.tsx).
 */
function SplitChars({ text, stagger = 0 }: SplitCharsProps) {
  return (
    <>
      {[...text].map((char, index) => (
        <span
          key={`${char}-${index}`}
          aria-hidden="true"
          style={{
            transitionDelay: `${index * stagger}s`,
            whiteSpace: char === ' ' ? 'pre' : undefined,
          }}
        >
          {char}
        </span>
      ))}
    </>
  )
}

export default SplitChars
