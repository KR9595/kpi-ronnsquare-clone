# Ronnsquare Clone

A homepage clone of [ronnsquare.fr/en](https://ronnsquare.fr/en/) — English only, desktop + mobile,
built section by section.

## Stack

- React + TypeScript (Vite)
- pnpm
- Tailwind CSS v4
- GSAP (`@gsap/react`)
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
    ui/        # Reusable primitives (Button, Logo, SplitChars)
    layout/    # Page chrome (Header, and later Footer)
  data/        # Static content (nav links, etc.)
  lib/         # gsap.ts — registers GSAP plugins/hooks once
```

## Progress

- [x] Project scaffold
- [x] Header (desktop nav, dropdowns, language switcher, mobile slide-in menu)
- [ ] Hero section
- [ ] Remaining homepage sections
- [ ] Footer

## Notes

- Fonts: the source site uses licensed fonts (N27, Gambetta). This clone substitutes
  close free alternatives — **Space Grotesk** (bold uppercase UI/headings) and
  **Fraunces** (serif body/nav text) — loaded from Google Fonts.
- The logo is an original interpretation of the source mark's composition (wordmark +
  diamond/circle/triangle motif), not a traced copy of their proprietary artwork.
- Photography from the source site is not included; section images will need to be
  supplied separately when building those sections.
