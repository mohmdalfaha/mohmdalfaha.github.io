# mohmdalfaha.github.io

Personal portfolio for **Mohammed Nasser** — Lead Mobile Engineer, Riyadh.
Live at <https://mohmdalfaha.github.io>.

## What this is

A two-language static site with no build step, no framework, and no third-party
requests at runtime. Open `index.html` in a browser and it works.

```
index.html          English (LTR)
indexAr.html        Arabic (RTL) — full content parity
404.html            Not-found page
assets/css/site.css One hand-written stylesheet, shared by both languages
assets/js/site.js   One vanilla-JS file, shared by both languages
assets/fonts/       Poppins, self-hosted as woff2
assets/img/         Portrait, favicon, Open Graph card
robots.txt          + sitemap.xml with hreflang alternates
```

## Design notes

- **No CDN.** Fonts are self-hosted woff2; there is no Tailwind runtime, no
  jQuery, and no analytics. Nothing about a visitor leaves their browser.
- **One stylesheet for both directions.** Layout is written with CSS logical
  properties (`padding-inline`, `inset-inline-start`, …), so the RTL page needs
  only a font stack and a handful of tweaks rather than a mirrored stylesheet.
- **Progressive enhancement.** Every section is readable with JavaScript
  disabled. JS adds the command palette, sector filtering, expandable case
  studies, count-up metrics, scroll reveals, and the hero canvas.
- **Themes.** Dark and light, following `prefers-color-scheme` on first visit
  and remembering an explicit choice in `localStorage`. The theme is applied
  before first paint so there is no flash.
- **Motion.** Everything animated is gated behind `prefers-reduced-motion`, and
  the hero canvas stops rendering when it scrolls out of view or the tab hides.

## Keyboard

`Ctrl`/`⌘` + `K` opens a command palette that jumps to any section or project,
toggles the theme, switches language, or copies the email address.

## Editing content

Projects are plain `<article class="case">` blocks in `index.html` and
`indexAr.html`. To add one, copy an existing block, change the copy, give the
panel a new `id` (and matching `aria-controls`), and set `data-cats` to one of
the sector keys used by the filter buttons. Keep the two languages in step —
the sector counts in the filter chips are written by hand.
