export interface NavLink {
  label: string
  href: string
}

export interface NavItem {
  label: string
  href: string
  children?: NavLink[]
}

export const primaryNav: NavItem[] = [
  { label: 'DNA & Team', href: '/dna-team' },
  { label: 'Our Projects', href: '/our-projects' },
  {
    label: 'Concerns',
    href: '/concerns',
    children: [
      { label: 'Lease Expiry', href: '/concerns/lease-expiry' },
      { label: 'Complex Projects', href: '/concerns/complex-projects' },
      {
        label: 'Attracting and Retaining Talent',
        href: '/concerns/attracting-and-retaining-talent',
      },
      {
        label: 'Bringing Teams Back to the Office',
        href: '/concerns/bringing-teams-back-to-the-office',
      },
    ],
  },
  {
    label: 'Our Expertise',
    href: '/our-expertise',
    children: [
      { label: 'Sustainability & Environment', href: '/our-expertise/sustainability-environment' },
      { label: 'Technical Delivery', href: '/our-expertise/technical-delivery' },
      { label: 'Consulting & Strategy', href: '/our-expertise/consulting-strategy' },
      { label: 'Architecture & Design', href: '/our-expertise/architecture-design' },
    ],
  },
]

export const mobileExtraLinks: NavLink[] = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Client Testimonials', href: '/client-testimonials' },
  { label: 'Contacts', href: '/contacts' },
]

export const languages: (NavLink & { code: string })[] = [
  { code: 'en', label: 'English', href: '/en' },
  { code: 'fr', label: 'Français', href: '/' },
]
