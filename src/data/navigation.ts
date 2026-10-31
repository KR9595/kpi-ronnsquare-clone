/**
 * Header navigation, copied from the source site's English menu. `path` is the page on the
 * source site; this clone only has the homepage, so links render `href="#"` and don't navigate.
 */
export interface NavLink {
  label: string
  path: string
}

export interface NavItem extends NavLink {
  children?: NavLink[]
}

export const primaryNav: NavItem[] = [
  { label: 'DNA & Team', path: '/en/dna-team/' },
  { label: 'Our Projects', path: '/en/realisations/' },
  {
    label: 'Concerns',
    path: '/en/preoccupations/',
    children: [
      { label: 'Lease Expiry', path: '/en/preoccupations/lease-expiry/' },
      { label: 'Complex Projects', path: '/en/preoccupations/complex-projects/' },
      {
        label: 'Attracting and Retaining Talent',
        path: '/en/preoccupations/attract-and-retain-talent/',
      },
      {
        label: 'Bringing Teams Back to the Office',
        path: '/en/preoccupations/bring-teams-back/',
      },
    ],
  },
  {
    label: 'Our Expertise',
    path: '/en/expertises/',
    children: [
      { label: 'Sustainability & Environment', path: '/en/expertises/sustainability-ecology/' },
      { label: 'Technical Delivery', path: '/en/expertises/technical-execution/' },
      { label: 'Consulting & Strategy', path: '/en/expertises/consulting-strategy/' },
      { label: 'Architecture & Design', path: '/en/expertises/architecture-design/' },
    ],
  },
]

/** Extra rows the mobile menu shows before the language row (label copied as-is from the source). */
export const mobileExtraLinks: NavLink[] = [
  { label: 'FAQ', path: '/en/faq/' },
  { label: 'Témoignages clients', path: '/en/testimonials/' },
  { label: 'Contacts', path: '/en/contact/' },
]

/** English only: the clone keeps EN as the single language option. */
export const languages: (NavLink & { code: string })[] = [
  { code: 'en', label: 'English', path: '/en/' },
]

export const announcement = {
  text: 'ADP Group becomes Ronnsquare!',
  cta: { label: 'Discover', path: '/en/adn-equipe/' },
}
