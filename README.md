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
    sections/  # Homepage blocks (Hero, …), each with its ported CSS
  data/        # Static content (nav links, etc.)
  lib/         # gsap.ts (plugins), smoothScroll.ts (Lenis + ScrollTrigger), effects.ts (the
               # source's GSAP effects), entrance.ts (block entrance wiring), small helpers
public/
  fonts/       # Original N27 + Gambetta woff2 files
  images/      # Original photos (hero srcset)
  svg/         # Original SVG assets (logo)
```

## Progress

- [x] Project scaffold
- [x] Header (desktop nav, dropdowns, language switcher, mobile slide-in menu)
- [x] Original fonts, logo and Lenis smooth scroll; header rechecked against the source
      at 1440×900, 1024×768 and 375×812
- [x] Hero section (layout, image srcset, entrance timeline; checked at 1440×900, 1024×768
      and 375×812)
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
- Block entrances use the source's GSAP effects (`splitReveal`, `revealImage`, `fadeSlideUp`,
  `clipReveal`), ported to `src/lib/effects.ts` with the same defaults; titles are split with
  SplitType (pinned 0.3.4), as on the source. Above-fold blocks (`data-entrance="above-fold"`)
  register a paused timeline via `src/lib/entrance.ts` for the homepage intro to play; until
  the intro exists, the hero plays its own on mount.
- Only English is built. Links to other pages render `href="#"` and don't navigate; the
  language switcher lists English only.
- Reference material from the source site (HTML, CSS, JS) lives in
  `.scratch/homepage-clone/reference/` and is gitignored.
