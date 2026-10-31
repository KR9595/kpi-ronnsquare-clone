export type EquilibreShapeName = 'square' | 'diamond' | 'circle' | 'triangle'

/** Cutouts take `--equilibre-cutout-fill`, which the quote exit recolours as shapes land. */
const CUTOUT_FILL = 'var(--equilibre-cutout-fill, var(--color-brand-parme, #DBB6FC))'

/**
 * One of the source's four "équilibre" shapes (its `equilibre-shape` SVG partial), filled
 * with `currentColor`. Used by the quote's totem and the Preoccupations cards.
 */
function EquilibreShape({ shape }: { shape: EquilibreShapeName }) {
  const className = `equilibre-shape equilibre-shape--${shape}`
  switch (shape) {
    case 'square':
      return (
        <svg
          className={className}
          viewBox="0 0 132 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="132" height="110" fill="currentColor" />
        </svg>
      )
    case 'diamond':
      return (
        <svg
          className={className}
          viewBox="0 0 284 284"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M142.929 283.538L0.928784 143.165L141.071 0.93052L283.071 141.304L142.929 283.538Z"
            fill="currentColor"
          />
          <path
            d="M142.506 219.214L218.853 141.728L141.494 65.2544L65.1467 142.741L142.506 219.214Z"
            fill={CUTOUT_FILL}
          />
        </svg>
      )
    case 'circle':
      return (
        <svg
          className={className}
          viewBox="0 0 263 263"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M131.711 262.605C59.5562 263.081 0.475781 204.677 0.000781 132.403C-0.474219 60.1299 57.8334 0.952 129.988 0.476C202.143 0 261.223 58.404 261.698 130.678C262.173 202.951 203.866 262.129 131.711 262.605Z"
            fill="currentColor"
          />
          <path
            d="M131.417 217.882C178.949 217.569 217.362 178.582 217.049 130.972C216.736 83.362 177.814 44.885 130.282 45.199C82.7503 45.512 44.3369 84.499 44.6499 132.109C44.9629 179.719 83.8853 218.196 131.417 217.882Z"
            fill={CUTOUT_FILL}
          />
        </svg>
      )
    case 'triangle':
      return (
        <svg
          className={className}
          viewBox="0 0 132 67"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M132.07 66.144L66.035 0L0 66.144H132.07Z" fill="currentColor" />
        </svg>
      )
  }
}

export default EquilibreShape
