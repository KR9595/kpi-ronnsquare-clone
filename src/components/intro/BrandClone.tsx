import { createPortal } from 'react-dom'

import Logo, { LOGO_CLONE_VIEWBOX } from '@/components/ui/Logo'

/**
 * The intro's big logo copy (`[data-brand-clone]`). Rendered straight into <body>, where the
 * source keeps it, so its fixed positioning isn't affected by any transformed ancestor. The
 * taller viewBox leaves room for the shapes' tumble; `timeline/` moves it around.
 */
function BrandClone() {
  return createPortal(
    <div className="brand-clone" data-brand-clone="" aria-hidden="true">
      <Logo viewBox={LOGO_CLONE_VIEWBOX} />
    </div>,
    document.body,
  )
}

export default BrandClone
