# vraj-portfolio — Agent Operating Manual

Single-page brutalist portfolio. React 19 · Vite 8 · TypeScript 6 (strict) · CSS Modules · GSAP 3 · Lenis.
No test framework. No CSS framework. No component library. Everything is hand-built and token-driven.

---

## Commands

| Task | Command | Notes |
|---|---|---|
| Dev server | `npm run dev` | Vite, port 5173 |
| Typecheck | `npx tsc -b` | Must be 0 errors. Project-references build. |
| Lint | `npx eslint .` | Must be 0 errors. `react-hooks` v7 rules are strict. |
| Full build | `npm run build` | `tsc -b` → `vite build` → `prerender` (Playwright SSG) |
| Build, no SSG | `npm run build:nossg` | Faster; use when only checking compile+bundle |
| Preview | `npm run preview` | Serves `dist/` |

`npm run build` runs `scripts/prerender.mjs`, which launches headless Chrome via Playwright to
snapshot the DOM into `dist/index.html`. If Chrome is unavailable, use `build:nossg`.

**Never edit `dist/`** — it is generated output. Never hand-edit `bun.lock`.

---

## Architecture

```
src/
  main.tsx              boot: applySettings() before first paint, then render
  App.tsx               section composition order
  site.config.ts        single knob file — name, links, feature flags
  config/               static config: theme triad, labels, types, content shape
  data/                 content payloads, cursor themes, settings schema
  context/              React contexts (definitions only — no components)
  components/providers/ context providers (components that own the state)
  components/primitives/ reusable UI atoms (Cursor, Magnetic, Marquee, Reveal, ...)
  components/sections/  page sections (Hero, About, Projects, Skills, ...)
  components/settings/  runtime settings panel + controls
  hooks/                one hook per file, named use*
  lib/gsap/             GSAP registration, easings, reveal/clip/split helpers
  lib/utils/            pure helpers (cx, math, env)
  settings/             settings model: types, colors, motionProfile, applySettings
  styles/               theme.css (tokens) + global.css (reset/base) + fonts.ts
```

**Context files are split from providers on purpose.** `src/context/*.ts` exports only the
`createContext` object so Fast Refresh stays intact (`react-refresh/only-export-components`).
Do not move a provider component into a `context/` file.

### Responsive split
`Hero`/`HeroMobile` and `Experience`/`ExperienceMobile` are **separate components**, switched at
runtime by `useIsCompact()`. This is deliberate: the desktop variants use pinned ScrollTriggers
that cannot be meaningfully expressed at mobile widths. Shared logic belongs in `heroShared.ts`.

### Settings system
`applySettings()` writes CSS custom properties inline onto `<html>`, which override the `:root`
defaults in `theme.css`. Runtime overrides therefore always win. The `:root` values in `theme.css`
exist **only** as a pre-JS first-paint fallback and must mirror the derived defaults from
`src/config/theme.ts`. Change the palette in `config/theme.ts`, then update `theme.css` to match.

---

## Styling law (brutalism)

**Every visual value comes from a token in `src/styles/theme.css`.** Consuming files use
`var(--token)` and nothing else.

Non-negotiables:
- `--radius: 0`. Sharp corners everywhere. The only exception is `--radius-pill` for nav pills and chips.
- **Shadows have zero blur.** `Npx Npx 0 0 <color>`. A blur radius is a design-system violation.
- **Accent is rationed.** `--color-accent` marks reveal, focus, and one point of emphasis per
  section — not decoration. Text on accent is always `--color-on-accent`.
- **No hardcoded colors outside the token layer.** Hex/rgb literals are allowed only in
  `styles/theme.css`, `config/theme.ts`, `settings/colors.ts`, and `data/cursorThemes.ts`.
  A `/* token-exempt */` comment on the line overrides this if genuinely unavoidable.
- Type comes from `--fs-100`…`--fs-900`; spacing from `--space-1`…`--space-10`, `--space-section`,
  `--gutter`. Do not write raw `rem`/`px` for either.
- Borders use `--bw-hair` / `--bw` / `--bw-thick` / `--bw-brutal`.
- Durations use `--dur-*`, easings use `--ease-*` (these mirror the GSAP strings in
  `lib/gsap/easings.ts` — keep the two in sync).

`data-cursor-theme` on `<html>` re-points skin tokens (`--skin-radius`, `--skin-shadow`,
`--ease-ui`, `--reveal-distance`), so one attribute re-skins the site. Components must read the
skin tokens, not the base ones, wherever a Mode is meant to change the look.

---

## Motion law (GSAP + Lenis)

- Always animate inside `useGSAP()` from `@gsap/react` with a `scope`. It handles cleanup.
  A bare `useEffect` + `gsap.to()` leaks ScrollTriggers on unmount.
- Register plugins once, via `lib/gsap/register.ts`. Never call `gsap.registerPlugin` in a component.
- Every `ScrollTrigger` that pins **must** be killed on unmount and must not be rebuilt on
  unrelated state changes. Read volatile values through a ref inside the tween callback rather than
  listing them as effect dependencies — but assign that ref in an effect, never during render
  (`react-hooks/refs` will flag a render-phase assignment as an error).
- `prefers-reduced-motion` must short-circuit to the **end state**, never to a hidden state.
  A reduced-motion user must never be left with `opacity: 0` or `visibility: hidden` content.
- Lenis owns scroll. Do not call `window.scrollTo` directly; use the Lenis instance from
  `SmoothScrollContext`. Anchors must go through it or they will fight the smooth scroller.
- Touch/coarse pointers disable the custom cursor and the pinned horizontal Projects track.
  Check `useIsCoarsePointer()` before wiring pointer-driven motion.

---

## TypeScript conventions

- `strict` + `noUncheckedIndexedAccess` + `noUnusedLocals` + `noUnusedParameters` are on.
  Indexing an array yields `T | undefined` — handle it, do not `!` it away.
- `verbatimModuleSyntax` is on: type-only imports **must** use `import type { ... }`.
- `erasableSyntaxOnly` is on: no enums, no parameter properties, no namespaces.
- Prefer `as const` objects + union types over `enum`.
- No `any`. No non-null `!` assertions except on refs immediately after a null guard.

---

## Agent fleet

Project agents live in `.claude/agents/`:

| Agent | Use for |
|---|---|
| `brutalist-stylist` | Token discipline, CSS Modules, visual/design-system review |
| `frontend-engineer` | React 19 component work, hooks, composition, state |
| `motion-engineer` | GSAP, ScrollTrigger, Lenis, reduced-motion correctness |
| `code-quality-auditor` | Types, dead code, duplication, complexity, structure |
| `bug-hunter` | Runtime/logic defect discovery with reproduction steps |
| `assessment-reporter` | Merges findings into a ranked, deduplicated report |

ECC plugin agents (`ecc:react-reviewer`, `ecc:typescript-reviewer`, `ecc:a11y-architect`,
`ecc:performance-optimizer`, `ecc:security-reviewer`, `ecc:silent-failure-hunter`) are used
alongside these for independent second opinions.

Skills in `.claude/skills/` (`brutalist-design-system`, `gsap-motion-patterns`, `worktree-flow`,
`commit-discipline`, `visual-verification`) carry the deep reference detail. Read the relevant
skill before doing work in its area.

---

## Working rules

1. **One concern per commit.** See `.claude/skills/commit-discipline`.
2. **Green before commit.** `npx tsc -b` and `npx eslint .` must both pass. The Stop hook enforces this.
3. **Refactors preserve rendered output.** If a change alters what the page looks like or how it
   animates, that is a feature change — call it out explicitly, do not bury it in a refactor commit.
4. **Verify in a browser for anything visual.** See `.claude/skills/visual-verification`.
5. Placeholder content and `// TODO` markers in `data/content.ts` are intentional — do not
   invent real contact details or project copy.
