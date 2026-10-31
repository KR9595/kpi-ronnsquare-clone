/**
 * Reloads the page 300ms after its width changes, like the source site: the intro's brand
 * clone and other measured layouts are sized once in px, so a fresh load is the simplest
 * way to keep them right. Height-only changes (mobile URL bar) are ignored.
 */
export function initReloadOnResize() {
  let width = document.documentElement.clientWidth
  let timer: ReturnType<typeof setTimeout> | undefined
  window.addEventListener('resize', () => {
    const nextWidth = document.documentElement.clientWidth
    if (nextWidth === width) return
    width = nextWidth
    clearTimeout(timer)
    timer = setTimeout(() => location.reload(), 300)
  })
}
