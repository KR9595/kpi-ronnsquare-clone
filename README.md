# Ronnsquare Clone

A homepage clone of [ronnsquare.fr/en](https://ronnsquare.fr/en/) — English only, desktop + mobile,
built section by section.

## Stack

- React + TypeScript (Vite)
- pnpm
- Tailwind CSS v4
- GSAP (`@gsap/react`) + ScrollTrigger
- Lenis smooth scroll (pinned 1.3.23, same as the source site; desktop ≥1024px only)
- Prettier (with Tailwind class sorting + import sorting)

## Getting started

```bash
pnpm install
pnpm dev
```

- `pnpm dev` — start the dev server
- `pnpm build` — type-check and build for production
- `pnpm lint` — run oxlint
- `pnpm format` / `pnpm format:check` — Prettier

## Project structure

```
src/
  components/
    ui/        # Reusable primitives (Button, Logo, ChevronIcon, SplitChars)
    layout/    # Page chrome (Header, and later Footer)
  data/        # Static content (nav links, etc.)
  lib/         # gsap.ts (plugins), smoothScroll.ts (Lenis + ScrollTrigger), small helpers
public/
  fonts/       # Original N27 + Gambetta woff2 files
  svg/         # Original SVG assets (logo)
```

## Progress

- [x] Project scaffold
- [x] Header (desktop nav, dropdowns, language switcher, mobile slide-in menu)
- [x] Original fonts, logo and Lenis smooth scroll; header rechecked against the source
      at 1440×900, 1024×768 and 375×812
- [ ] Hero section
- [ ] Remaining homepage sections
- [ ] Footer

## Notes

- **Local learning project only — not for public deployment.** It uses the source site's
  licensed fonts (N27, Gambetta) and its original logo/image assets, served locally from
  `public/`. Don't publish a build of this repo.
- Fonts: N27 (`font-primary`) for uppercase headings, buttons and the language code;
  Gambetta (`font-secondary`, also the body default) for body text, nav and links — the
  same split as the source CSS.
- Header styles are ported from the source's `.header-ronn` block into
  `src/components/layout/Header/header.css`, keeping its BEM class names because the
  homepage entrance animation (built later) targets them.
- Only English is built. Links to other pages render `href="#"` and don't navigate; the
  language switcher lists English only.
- Reference material from the source site (HTML, CSS, JS) lives in
  `.scratch/homepage-clone/reference/` and is gitignored.
