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

Code that only one block uses lives next to that block; `lib/` holds only what several blocks share.

```
src/
  components/
    ui/          # Reusable primitives (Button, Logo, ChevronIcon, SplitChars, EquilibreShape)
    layout/
      Header/    # Header, dropdowns, mobile menu, auto-hide hook
      Footer/    # Footer, legal modals, newsletter form + toast (*Controller.ts = their behaviour)
    intro/       # Homepage intro markup (brand clone) and its CSS
      timeline/  # Entrance timeline builders (loader, wordmark, brand clone, header)
    sections/    # One folder per homepage block: component, ported CSS, and its own
                 # animation modules (e.g. Quote/quoteExitLand.ts, Services/servicesTotem.ts)
  data/          # Static content (nav links, legal texts)
  lib/
    animation/   # gsap.ts (plugins), smoothScroll.ts (Lenis + ScrollTrigger), effects.ts (the
                 # source's GSAP effects), entrance.ts (block entrance wiring), scrub, parallax,
                 # horizontalLoop
    hooks/       # Shared React hooks (useMediaQuery)
    utils/       # preventNavigation, reloadOnResize, debug (?debug / ?slowmo)
public/
  fonts/         # Original N27 + Gambetta woff2 files
  images/        # Original photos
  svg/           # Original SVG assets
```

## Progress

- [x] Project scaffold
- [x] Header (desktop nav, dropdowns, language switcher, mobile slide-in menu)
- [x] Original fonts, logo and Lenis smooth scroll; header rechecked against the source
      at 1440×900, 1024×768 and 375×812
- [x] Hero section (layout, image srcset, entrance timeline; checked at 1440×900, 1024×768
      and 375×812)
- [x] Homepage entrance (wordmark preloader, brand clone to hero + scroll shrink into the
      header, mobile settle, repeat-visit quick entrance; checked against the source's
      timeline at 1440×900, 1024×768 and 375×812)
- [x] "Our Latest Projects" running line (draggable endless ticker with inertia snapping,
      prev/next arrows, hover pause, entrance; checked at 1440×900, 1024×768 and 375×812)
- [x] Signature quote (pinned, scrubbed character reveal and totem fly-in)
- [x] "Your Challenges" preoccupations (shape cards, entrance) with the quote's `land` exit:
      the totem shapes fall onto the cards (Matter.js), plus the desktop triangle wipe; checked
      at 1440×900, 1024×768 and 375×812
- [x] Advantages (two columns around the swaying totem; from 1024px up it chains off the
      triangle wipe; checked at 1440×900, 1024×768 and 375×812)
- [x] "Ronnsquare is" key figures and "Our Support" services list (card images with
      parallax, flipping totem with its tipping exit; checked at 1440×900, 1024×768 and 375×812)
- [x] "Our Projects" grid (image slideshows: hover zones and bars from 768px, autoplay,
      swipe and tap below; entrances; checked at 1440×900, 1024×768 and 375×812)
- [x] "Client Testimonials" slider (crossfading quote + image, arrows, dots, arrow keys,
      autoplay, swipe below 992px; entrance; checked at 1440×900, 1024×768 and 375×812)
- [x] "Do you have a workplace design project?" call to action (parallax photo, card
      entrance) and FAQ accordion (one answer open at a time, looping illustration); checked
      at 1440×900, 1024×768 and 375×812
- [x] Footer (map, link columns, newsletter signup with validation and success toast,
      Legal Notice / Privacy Policy modals); checked at 1440×900, 1024×768 and 375×812

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
  `clipReveal`), ported to `src/lib/animation/effects.ts` with the same defaults; titles are split with
  SplitType (pinned 0.3.4), as on the source. Above-fold blocks (`data-entrance="above-fold"`)
  register a paused timeline via `src/lib/animation/entrance.ts`; the homepage intro plays it at its
  `content` label.
- The "Our Latest Projects" ticker uses GSAP's `horizontalLoop` helper (`src/lib/animation/horizontalLoop.ts`,
  ported from the source's `horizontal-loop.js`) with Draggable + InertiaPlugin, registered in
  `src/lib/animation/gsap.ts`.
- The signature quote (`src/components/sections/Quote/`) ports the source's
  block-1-3-quote-anim.js: a pinned (`end: '+=100%'`), scroll-scrubbed timeline brightens the
  split characters and flies the totem's shapes in along the source's Lottie-baked keyframes
  (`src/components/sections/Quote/mainQuoteReveal.ts`, from its main-quote-reveal.js). Scrubs follow the scroll
  directly from 1024px up and lag 0.3s below (`src/lib/animation/scrub.ts`; `?scrub=0.5` overrides).
- The quote's `data-quote-exit="land"` exit (`src/components/sections/Quote/quoteExitLand.ts`, from the source's
  quote-exit-land.js, loaded lazily when the quote pin is passed) drops the totem shapes onto
  the Preoccupations cards: a seeded Matter.js simulation (matter-js pinned 0.20.0, as bundled
  by the source) is baked once and scrubbed by the scroll, so the fall is the same on every
  run for a given viewport; `?fallSeed=<n>` changes the seed. From 1024px up the triangle
  card's own shape then pins and scales into a full-screen wipe until the block after
  Preoccupations (Advantages) scrolls over it — the wipe only starts once a `[data-block]`
  follows Preoccupations. CustomEase/CustomWiggle are registered in that lazy
  module, as on the source.
- Advantages (`src/components/sections/Advantages/`) ports block-1-5-advantages-anim.js. From
  1024px up, right after Preoccupations, it adds `is-wipe-chain` (z-index 1, above the pinned
  triangle): its background starts transparent and scrubs to parme while its top goes from
  30% to the viewport top, the totem slides in with a parallax over the same approach, and the
  entrance plays at `top 20%`. Below 1024px the entrance plays at `top 75%` and the background
  steps from sable to parme (0.8s) when the block reaches the top. The totem's idle sway is
  `src/components/sections/Advantages/totemSway.ts` (the source's totem-sway.js).
- "Ronnsquare is" (`src/components/sections/Theses/`) ports block-1-7-theses-anim.js (title
  split reveal, figures fade up, `top 75%`). "Our Support" (`src/components/sections/Services/`)
  ports block-1-7-services-anim.js and its lazily loaded block-1-7-services-totem.js
  (`src/components/sections/Services/servicesTotem.ts`, keyframes in `servicesTotemData.ts` from the source's
  accompagnement-data.js): one clone of the totem per card, clipped to it and coloured with
  the card's text colour, travels down the list and flips half a turn over each card edge,
  scrubbed over the list (`top top` → `bottom bottom`); the shapes assemble as the first card
  scrolls up. Once the last card is on screen, `src/components/sections/Services/servicesExitDestroy.ts` (the source's
  services-exit-destroy.js, `arranged` mode) bakes a Matter.js tip-over and scrubs it while
  the block's bottom goes from 95% to 55%. `?slinky=0` turns off the per-shape lag, as on the
  source. Card images use the source's global `data-parallax` attributes
  (`src/lib/animation/parallax.ts`).
- "Our Projects" (`src/components/sections/Projects/`) ports block-1-8-projects-anim.js: the
  title, each card (image wipe + info box) and the CTA play their own entrance at `top 85%`.
  Each card is a three-image slideshow (`src/components/sections/Projects/projectsSlideshow.ts`): from 768px up the
  card's thirds crossfade to their image on hover (0.35s) and back to the first on leave;
  below 768px the images advance every 3s while the card is on screen, a swipe goes to the
  next/previous image, a tap advances and a double tap "clicks" Discover (Draggable on a
  detached proxy, as on the source). The bars jump to their image at every size.
- "Client Testimonials" (`src/components/sections/CardReviews/`) ports
  block-1-9-card-reviews-anim.js: at `top 75%` the title's lines slide up, then the subtitle,
  the slider and the mobile controls fade up. The slider (`src/components/sections/CardReviews/cardReviewsSlider.ts`)
  crossfades the quote and its image (0.35s out, the next one in 0.2s later); the arrows,
  dots, ←/→ and, below 992px, a swipe on the slider change testimonial. It advances every 6s
  while on screen and pauses for 5s after any manual change.
- Call to action (`src/components/sections/Cta/`) ports block-1-10-cta-anim.js: at `top 75%`
  the card fades in, the title's lines slide up, then the body and "Free Audit" fade up; the
  photo runs the global parallax (-15% → 15%). "Free Audit" links to the contact page, so it
  goes nowhere here.
- FAQ (`src/components/sections/Faq/`) ports block-1-11-faq-anim.js: one answer open at a
  time (the first on load, clicking the open question closes it), height and plus/minus
  tweens, `aria-expanded` on each question, and a list min-height that reserves the tallest
  answer so toggling never moves the page. The illustration's loop (`src/components/sections/Faq/faqLoop.ts`,
  from faq-loop.js: After Effects keyframes with their cubic-bezier eases) plays only while
  the block is on screen.
- Footer (`src/components/layout/Footer/`) ports `footer.footer-ronn` and the popups the
  source renders after it. It sits after the page wrapper, as on the source, and has no
  scroll animation (the source's logo Lottie sits in a `display: none` box its observer never
  sees, so it never loads; the static logo is what shows). "Legal Notice" / "Privacy
  Policy" open the source's modals (`src/components/layout/Footer/legalModalController.ts`: 0.3s fade, Lenis stopped while
  open, Escape/backdrop/× close, a contents sidebar that follows the scroll; `?modal=legal`
  or `?modal=privacy` opens one on load); their text is stored in `src/data/legal.ts`
  instead of fetched. The newsletter forms (`src/components/layout/Footer/newsletterFormController.ts`) validate like the
  source (messages on blur/submit, the consent checkbox appears once the email is valid) but
  **send nothing**: a valid submit only shows the "Thank you for subscribing!" toast
  (`src/components/layout/Footer/successPopupController.ts`, 4s progress bar; above the form on phones) and resets the form.
- Homepage intro: a port of the source's entrance (`src/components/intro/timeline/`, mirroring its
  `entrances/home.js`, `brand-clone.js`, `wordmark-reveal.js` and `preloader-data.js`; markup
  in `src/components/intro/` plus the static `#site-loader` and session gate in `index.html`).
  The full wordmark preloader plays once per browser session; clear `sessionStorage` (or use a
  new tab) to see it again. URL params as on the source: `?slowmo=4` slows the first-load
  entrance down 4×, `?debug` logs each step and exposes `window.gsap` / `ScrollTrigger` /
  `lenis` (e.g. `gsap.getById('entrance').labels`). As on the source, a width change reloads
  the page.
- Only English is built. Links to other pages render `href="#"` and don't navigate; the
  language switcher lists English only.
- Reference material from the source site (HTML, CSS, JS) lives in
  `.scratch/homepage-clone/reference/` and is gitignored.
