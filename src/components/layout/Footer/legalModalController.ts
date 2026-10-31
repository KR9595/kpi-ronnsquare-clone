import { getLenis } from '@/lib/animation/smoothScroll'

/**
 * The Legal Notice / Privacy Policy modals, ported from the source's main.js (`yn("legal")`,
 * `yn("privacy")`). Any `[data-<doc>-open]` link on the page opens its modal (capture-phase
 * click, so it wins over the link), as does a link or page URL with `?modal=<doc>`. Opening
 * unhides the dialog, forces a reflow and sets `data-open="true"` (CSS fades it in over 0.3s)
 * and stops Lenis; closing (backdrop, ×, Escape) fades it out, restarts Lenis and hides it
 * 300ms later. The sidebar highlights the section crossing the top 30% of the scroll pane;
 * clicking an entry smooth-scrolls to it.
 *
 * The source fetches the sections from its REST API on first hover/open; here they are
 * rendered from static data, so nothing is fetched.
 */
export function initLegalModal(modal: HTMLElement, doc: string) {
  const closers = modal.querySelectorAll<HTMLElement>(`[data-${doc}-close]`)
  const scroller = modal.querySelector<HTMLElement>(`[data-${doc}-scroll]`)
  const navItems = [...modal.querySelectorAll<HTMLButtonElement>(`[data-${doc}-nav]`)]
  const blockClass = modal.classList[0]
  const activeClass = `${blockClass}__nav-item--active`
  const navKey = `${doc}Nav`
  const sectionKey = `${doc}Section`
  let hideTimer: number | undefined

  const isOpen = () => modal.dataset.open === 'true'

  function open() {
    window.clearTimeout(hideTimer)
    modal.hidden = false
    void modal.offsetHeight
    modal.dataset.open = 'true'
    getLenis()?.stop()
  }

  function close() {
    modal.dataset.open = 'false'
    getLenis()?.start()
    hideTimer = window.setTimeout(() => {
      if (modal.dataset.open !== 'true') modal.hidden = true
    }, 300)
  }

  function setActive(slug: string | undefined) {
    navItems.forEach((item) => {
      const isActive = item.dataset[navKey] === slug
      item.classList.toggle(activeClass, isActive)
      item.setAttribute('aria-current', isActive ? 'true' : 'false')
    })
  }

  const sections = new Map<string, HTMLElement>()
  scroller
    ?.querySelectorAll<HTMLElement>(`[data-${doc}-section]`)
    .forEach((section) => sections.set(section.dataset[sectionKey] ?? '', section))

  const navCleanups = navItems.map((item) => {
    const onClick = () => {
      const slug = item.dataset[navKey] ?? ''
      const section = sections.get(slug)
      setActive(slug)
      if (section && scroller) {
        scroller.scrollTo({ top: section.offsetTop - scroller.offsetTop, behavior: 'smooth' })
      }
    }
    item.addEventListener('click', onClick)
    return () => item.removeEventListener('click', onClick)
  })
  setActive(navItems[0]?.dataset[navKey])

  let observer: IntersectionObserver | null = null
  if (sections.size > 1 && scroller) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive((entry.target as HTMLElement).dataset[sectionKey])
        })
      },
      { root: scroller, rootMargin: '0px 0px -70% 0px', threshold: 0 },
    )
    sections.forEach((section) => observer!.observe(section))
  }

  // `?modal=<doc>` links open the modal instead of navigating.
  const onParamLinkClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!link) return
    try {
      if (new URL(link.href, location.origin).searchParams.get('modal') === doc) {
        event.preventDefault()
        event.stopImmediatePropagation()
        open()
      }
    } catch {
      // Not a URL; nothing to do.
    }
  }
  const onOpenLinkClick = (event: MouseEvent) => {
    if ((event.target as Element | null)?.closest?.(`[data-${doc}-open]`)) {
      event.preventDefault()
      event.stopImmediatePropagation()
      open()
    }
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen()) close()
  }

  document.addEventListener('click', onParamLinkClick, true)
  document.addEventListener('click', onOpenLinkClick, true)
  closers.forEach((closer) => closer.addEventListener('click', close))
  document.addEventListener('keydown', onKeyDown)

  let paramFrame = 0
  if (new URLSearchParams(location.search).get('modal') === doc) {
    paramFrame = requestAnimationFrame(() => {
      open()
      const url = new URL(location.href)
      url.searchParams.delete('modal')
      history.replaceState(history.state, '', url.pathname + url.search + url.hash)
    })
  }

  return () => {
    cancelAnimationFrame(paramFrame)
    window.clearTimeout(hideTimer)
    observer?.disconnect()
    navCleanups.forEach((cleanup) => cleanup())
    document.removeEventListener('click', onParamLinkClick, true)
    document.removeEventListener('click', onOpenLinkClick, true)
    closers.forEach((closer) => closer.removeEventListener('click', close))
    document.removeEventListener('keydown', onKeyDown)
    if (isOpen()) getLenis()?.start()
  }
}
