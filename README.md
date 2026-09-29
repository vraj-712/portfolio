# vraj-portfolio

A single-page, scroll-driven portfolio for **Vraj Patel** — full stack developer, Ahmedabad.
Brutalist by design: sharp corners, hard shadows with zero blur, one rationed accent, and a
token layer that lets the entire site be re-skinned from three colours.

**React 19 · Vite 8 · TypeScript 6 (strict) · CSS Modules · GSAP 3 · Lenis**

No CSS framework. No component library. No UI kit. Everything is hand-built and token-driven.

---

## Quick start

```bash
bun install          # this project uses bun.lock
bun run dev          # http://localhost:5173
```

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Typecheck | `npx tsc -b` — must be 0 errors |
| Lint | `npx eslint .` — must be 0 errors |
| Full build (incl. prerender) | `npm run build` |
| Build without SSG | `npm run build:nossg` |
| Preview `dist/` | `npm run preview` |
| **Browser checks** | `npm run verify -- http://localhost:5173` |

`npm run build` ends with `scripts/prerender.mjs`, which drives headless Chrome to snapshot the
DOM into `dist/index.html`. It fails open — if no browser can be launched it ships the CSR build
and says so.

---

## What makes it unusual

**Every visual value is a token.** `src/styles/theme.css` is the single source of truth; components
only ever read `var(--token)`. Hex literals are legal in exactly four files. `--radius: 0` and
shadows are `Npx Npx 0 0 <color>` — a blur radius is a design-system violation, not a preference.

**The palette is contrast-solved, not hand-picked.** `src/settings/colors.ts` derives the full token
set from three editable colours (base / ink / accent) and runs a bisection search so
`--color-ink-muted` clears WCAG AA 4.5:1 and `--color-line-soft` clears 3:1 — for *any* triad the
settings panel can produce, not just the shipped one. A fixed mix factor cannot hold when both the
canvas and the ink are user-editable.

**A live settings panel re-skins the site at runtime.** Fourteen knobs — six palettes, four font
pairs, type scale, density, radius, border width, hard shadows, motion speed, reduced motion,
smooth scroll, and cursor Mode. `applySettings()` writes CSS custom properties inline onto `<html>`,
so runtime values always beat the stylesheet. Nothing persists; a refresh restores the config.

**Cursor "Modes" re-skin motion and chrome together.** Precision, Fluid, Terminal, Kinetic, Off.
Each has a CSS half (`[data-cursor-theme]` re-points `--skin-radius`, `--skin-shadow`, `--ease-ui`,
`--reveal-distance`) and a JS half (a `MotionProfile` of GSAP ease, travel, stagger, rotation,
marquee speed). One attribute changes how the whole site feels.

**The intro varies.** One of four loader variants is drawn at random per visit.

---

## Architecture

```
src/
  main.tsx              boot: applySettings() before first paint, then render
  App.tsx               section composition order
  site.config.ts        the one file to edit for a rebrand
  config/               content · labels · theme · types
  data/                 cursor Modes, settings schema
  context/              createContext objects only — no components
  components/providers/ the components that own the state
  components/primitives/ Cursor, Magnetic, Marquee, Reveal, PinHost, ErrorBoundary, ...
  components/sections/  Hero, About, Projects, Skills, ...
  hooks/                one hook per file
  lib/gsap/             register · easings · clipReveal · splitText
  settings/             the runtime settings model
  styles/               theme.css (tokens) + global.css (reset)
```

Two structural choices that look like mistakes but are not:

- **`context/` holds only `createContext` objects.** Providers live in `components/providers/`, so
  Fast Refresh stays intact (`react-refresh/only-export-components`).
- **`Hero`/`HeroMobile` and `Experience`/`ExperienceMobile` are separate components**, switched by
  `useIsCompact()`. The desktop variants use pinned ScrollTriggers that have no meaningful mobile
  equivalent. Shared logic lives in `heroShared.ts`.

Anything that pins is wrapped in `<PinHost>`. ScrollTrigger's pin re-parents the pinned element into
a `.pin-spacer` div React does not know about; keeping a stable React-owned wrapper between `<main>`
and the pinned section stops React's sibling references going stale. See `SITE_AUDIT.md`.

---

## Rebranding

Edit `src/site.config.ts` and the three modules it re-exports:

- `config/content.ts` — profile, experience, projects, skills, links
- `config/labels.ts` — every UI string that is not profile data
- `config/theme.ts` — the boot palette, fonts, and default look

Then mirror the palette into the `:root` block of `styles/theme.css` — those values exist only as a
pre-JS first-paint fallback and must match what `deriveColors()` produces, or the first frame
flashes the wrong colours. SEO metadata is static HTML in `index.html`.

---

## Testing

There is no unit-test framework. For a scroll-driven site the browser is the test, so
`scripts/verify.mjs` automates it:

```bash
npm run dev
npm run verify -- http://localhost:5173
```

It checks static viewports (1440, 390 touch, 360), reduced-motion end states, horizontal overflow,
console/page-error/failed-request counts, and — importantly — **crossing the compact breakpoint at
runtime**, which no fixed-viewport check can see. It exits non-zero, so it works as a merge gate.

Conventions for contributors live in `CLAUDE.md` and `.claude/skills/`.

---

## Documents

| File | What it is |
|---|---|
| `CLAUDE.md` | The operating manual — styling law, motion law, TypeScript conventions |
| `ANIMATION_STUDY.md` | Research artifact: teardown of the reference portfolio that set the motion mandate |
| `SITE_AUDIT.md` | Audit of the built site measured against that mandate, with open findings |
