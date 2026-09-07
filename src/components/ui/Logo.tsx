interface LogoProps {
  className?: string
}

/**
 * Two-line "RONN / SQUARE" wordmark with a small geometric cluster (diamond,
 * circle, triangle) echoing the source site's shape motif. Uses `currentColor`
 * so the header can flip it between the cream/dark theme variants.
 */
function Logo({ className = '' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 190 84"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="14.5"
        y="6"
        width="18"
        height="18"
        rx="1"
        transform="rotate(45 14.5 6)"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <text
        x="34"
        y="30"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="700"
        fontSize="30"
        letterSpacing="-0.5"
        fill="currentColor"
      >
        RONN
      </text>
      <circle cx="10" cy="60" r="9" stroke="currentColor" strokeWidth="2.4" />
      <path d="M10 73 L15.5 82 H4.5 Z" fill="currentColor" />
      <text
        x="0"
        y="82"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="700"
        fontSize="30"
        letterSpacing="-0.5"
        fill="currentColor"
      >
        <tspan x="26">SQUARE</tspan>
      </text>
    </svg>
  )
}

export default Logo
