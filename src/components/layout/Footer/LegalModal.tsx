import { useEffect, useRef } from 'react'

import { initLegalModal } from '@/lib/legalModal'

import { type LegalDoc, legalSections } from '@/data/legal'

import './legal-modal.css'

const MODALS: Record<LegalDoc, { blockClass: string; title: string }> = {
  legal: { blockClass: 'legal-mentions', title: 'Legal Notice' },
  privacy: { blockClass: 'privacy-policy', title: 'Privacy Policy' },
}

interface LegalModalProps {
  doc: LegalDoc
}

/**
 * The "Legal Notice" / "Privacy Policy" dialog the footer links open (source markup:
 * `div.legal-mentions` / `div.privacy-policy` after the footer). The source fills it from its
 * REST API on first use; here the sections are rendered from `@/data/legal`. Behaviour is in
 * `@/lib/legalModal`.
 */
function LegalModal({ doc }: LegalModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const { blockClass, title } = MODALS[doc]
  const sections = legalSections[doc]
  const dataKey = (suffix: string) => ({ [`data-${doc}-${suffix}`]: '' })

  useEffect(() => {
    if (!modalRef.current) return
    return initLegalModal(modalRef.current, doc)
  }, [doc])

  return (
    <div
      ref={modalRef}
      className={blockClass}
      {...dataKey('modal')}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${blockClass}-title`}
      hidden
    >
      <div className={`${blockClass}__backdrop`} {...dataKey('close')} />
      <div className={`${blockClass}__modal`} role="document">
        <header className={`${blockClass}__header`}>
          <h2 className={`${blockClass}__title`} id={`${blockClass}-title`}>
            {title}
          </h2>
          <button
            type="button"
            className={`${blockClass}__close`}
            {...dataKey('close')}
            aria-label="Close"
          >
            <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2 2l10 10M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>
        <div className={`${blockClass}__body`}>
          <aside className={`${blockClass}__sidebar`}>
            <span className={`${blockClass}__sidebar-label`}>Contents</span>
            <nav className={`${blockClass}__nav`} aria-label="Sections" {...dataKey('nav-list')}>
              {sections.map((section) => (
                <button
                  key={section.slug}
                  type="button"
                  className={`${blockClass}__nav-item`}
                  {...{ [`data-${doc}-nav`]: section.slug }}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>
          <div
            className={`${blockClass}__content`}
            {...dataKey('scroll')}
            data-lenis-prevent
            onClick={(event) => {
              // Links to other pages (turned into `#` in the data) go nowhere.
              const link = (event.target as Element).closest('a')
              if (link?.getAttribute('href') === '#') event.preventDefault()
            }}
          >
            {sections.map((section) => (
              <section
                key={section.slug}
                className={`${blockClass}__section`}
                id={`${doc}-section-${section.slug}`}
                {...{ [`data-${doc}-section`]: section.slug }}
              >
                <h3 className={`${blockClass}__section-title`}>{section.title}</h3>
                <div
                  className={`${blockClass}__section-body`}
                  dangerouslySetInnerHTML={{ __html: section.body }}
                />
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegalModal
