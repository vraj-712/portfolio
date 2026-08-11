---
name: brutalist-design-system
description: The full brutalist design specification for vraj-portfolio — token layer, colour derivation, type and space scales, shadow and border law, cursor-theme skins, CSS Module conventions, and the review checklist. Read before any work that changes how the site looks.
---

# Brutalist design system

The visual system has one rule from which the others follow: **there is exactly one place a visual
value can be defined, and every consumer reads it through `var(--token)`.**

Brutalism here means honest structure — heavy type, hard edges, flat planes, visible grid, no
softening. Where a conventional design system reaches for a blur, a gradient, or a rounded corner to
smooth something over, this one does not.

---

## 1. The token layer

### Where values may be literal

| File | What it defines |
|---|---|
| `src/styles/theme.css` | The `:root` block — every token, and the per-`data-cursor-theme` skin overrides |
| `src/config/theme.ts` | The palette triad (base / ink / accent) that drives derivation |
| `src/settings/colors.ts` | `deriveColors()` — the shade maths that expands the triad |
| `src/data/cursorThemes.ts` | Per-Mode skin definitions |

A hex, `rgb()`, `hsl()`, raw `px` font size, or raw spacing value anywhere else is a defect. The
`design-token-guard.sh` PreToolUse hook blocks these writes.

### Why `:root` is only a fallback

`main.tsx` calls `applySettings()` *before* the first render. That writes CSS custom properties
**inline onto `<html>`**, and an inline style beats a `:root` rule. So at runtime the `:root` block
in `theme.css` is never the effective value.

It exists for exactly one frame: the pre-JS paint. Its job is to not flash the wrong palette. That
means it must **mirror** the derived defaults from `src/config/theme.ts`.

**Changing the palette is a two-file operation:** edit `src/config/theme.ts`, then run
`deriveColors()` mentally (or in the browser console) and update `:root` in `theme.css` to match.
Changing only one produces a colour flash on load that is easy to miss in dev and obvious on a cold
production load.

---

## 2. Colour

### The triad

Base (canvas), ink (text/lines), accent (emphasis). Everything else is derived:

- `--color-base-2`, `--color-base-3` — elevated and deepest surfaces
- `--color-ink-muted` — meta, captions, secondary text
- `--color-accent-press` — the pressed/active accent
- `--color-on-accent` — **the only** text colour permitted on an accent field
- `--color-line` (full-strength, equals ink), `--color-line-soft` (hairline)

### Accent rationing

The accent is the loudest thing on the page, so it is spent deliberately. Per section, it buys
**one** of:

- a reveal wipe
- a focus ring
- a single emphasised word, number, or rule

Accent as a background *and* a border *and* a text colour inside one component is over-spending —
the page loses its focal hierarchy. When reviewing, count the accent surfaces in a section; more
than one wants justification.

### Contrast is a property of the derivation, not of a pair

The Settings panel lets a visitor choose an arbitrary accent and flip the base. So you cannot
hand-verify one palette and call it done. `deriveColors()` must produce:

- ≥ 4.5:1 for body text on every surface (`--color-base`, `-2`, `-3`)
- ≥ 3:1 for large display type and for UI borders
- a legible `--color-on-accent` for **any** accent the picker allows

`--color-ink-muted` on `--color-base-3` is the pair that fails first. Check it explicitly.

---

## 3. Type

Nine steps, all fluid via `clamp()` between a 360px and 1440px viewport, all multiplied by the
runtime `--fs-scale`:

| Token | Role | Range |
|---|---|---|
| `--fs-100` | eyebrow | 12 → 14 |
| `--fs-200` | meta | 13 → 15 |
| `--fs-300` | body | 16 → 19 |
| `--fs-400` | lead | 20 → 26 |
| `--fs-500` | h3 | 26 → 36 |
| `--fs-600` | h2 | 34 → 56 |
| `--fs-700` | display | 44 → 88 |
| `--fs-800` | display-lg | 60 → 132 |
| `--fs-900` | hero | 76 → 208 |

Rules:

- Never write a raw font size. Never add a media query that changes a font size — the `clamp()`
  already handles the range, and a second mechanism will fight it.
- Three families only: `--font-display` (Bricolage Grotesque Variable), `--font-body` (same),
  `--font-mono` (Space Mono) for labels, meta, and numerals.
- Display type is set tight: `line-height: 1`, `letter-spacing: -0.02em`. **At `line-height` below
  ~1.15, descenders get clipped by any `overflow: hidden`** — which every split-line reveal uses.
  Give split lines a `padding-bottom` with a compensating negative `margin-bottom`.
- Body copy is capped at `--measure` (68ch).

---

## 4. Space

`--space-1` (4px) through `--space-10` (128px), all multiplied by `--space-scale`. Plus:

- `--space-section` — the vertical rhythm between sections, `clamp(4rem, 2rem + 8vw, 9rem)`
- `--gutter` — the page gutter, `clamp(1.5rem, 0.5rem + 3vw, 5rem)`

Containers: `--container` (90rem), `--container-narrow` (60rem), `--measure` (68ch).

Above `--page-max` (120rem) the canvas stops growing and centres; `--page-inset` is the dead margin
outside it. **Viewport-fixed chrome must offset by `--page-inset`** or it will hug the screen edge
while the content hugs the page edge — a misalignment that only appears on very wide monitors.

A raw `24px` margin is a defect even when it equals `--space-5`. The token is what makes the density
slider work.

---

## 5. Edges, shadows, borders

```
--radius: 0;           /* everything */
--radius-pill: 999px;  /* nav pills and chips only */
```

Shadows are **offset + spread, zero blur**:

```
--shadow-sm:     4px 4px 0 0 var(--color-ink);
--shadow:        8px 8px 0 0 var(--color-ink);
--shadow-lg:    12px 12px 0 0 var(--color-ink);
--shadow-accent: 8px 8px 0 0 var(--color-accent);
```

A third non-zero length is a blur radius, and a blur radius is a violation of the system. The
`.no-hard-shadows` settings class flips all four to `none` — so no component may assume a shadow is
present for layout.

Borders: `--bw-hair` (1px), `--bw` (2px), `--bw-thick` (3px), `--bw-brutal` (4px).

---

## 6. Mode skins

`data-cursor-theme` on `<html>` re-points a small set of **skin tokens**, so one attribute re-skins
the whole site:

- `--skin-radius` — defaults to `--radius`
- `--skin-shadow`, `--skin-shadow-sm` — default to `--shadow`, `--shadow-sm`
- `--ease-ui` — the interaction easing
- `--reveal-distance` — how far reveals travel

**A component that should change with the Mode must read the skin token, not the base token.**
Reading `--radius` where you meant `--skin-radius` is the single most common way a Mode ends up
half-applied — some components change, others don't, and the site looks broken rather than themed.

When adding a component, decide explicitly: does this respond to Mode? Then pick the token layer to
match, and say which in a comment if it is not obvious.

---

## 7. Motion tokens

Durations `--dur-instant` (0.1s) → `--dur-cinematic` (0.9s), all × `--dur-scale`.
Easings `--ease-expo-out`, `--ease-power-out`, `--ease-back-out`, `--ease-power-in-out`.

These **mirror** `src/lib/gsap/easings.ts`:

| CSS | GSAP |
|---|---|
| `--ease-expo-out` → `cubic-bezier(0.16, 1, 0.30, 1)` | `EASE.expoOut` → `'expo.out'` |
| `--ease-power-out` → `cubic-bezier(0.22, 1, 0.36, 1)` | `EASE.powerOut` → `'power4.out'` |
| `--ease-back-out` → `cubic-bezier(0.34, 1.56, 0.64, 1)` | `EASE.backOut` → `'back.out(1.7)'` |
| `--ease-power-in-out` → `cubic-bezier(0.65, 0, 0.35, 1)` | `EASE.powerInOut` → `'power2.inOut'` |

Same for `DUR`. **Change one side, change the other in the same commit.** Drift here means a CSS
transition and a GSAP tween on the same element move at different speeds, which reads as a glitch.

---

## 8. CSS Modules

- One `.module.css` per component, colocated, same basename. They are one unit — read and edit them
  together.
- Class names are camelCase and name the **role**: `.lead`, `.railTrack`, `.cardMeta`.
  Never appearance (`.blueBox`), never utility (`.mt24`).
- Compose with `cx()` from `src/lib/utils/cx.ts`. Not template literals.
- `:global` only in `global.css`.
- `!important` only to beat an inline style set by a JS animation library — and only with a comment
  on that line saying which one. (This is real here: `<Magnetic>` sets an inline `display`, so the
  mobile hide rule genuinely needs `!important`.)
- Media queries sit next to the rule they modify.

---

## 9. Review checklist

Run this before accepting any visual change:

- [ ] No hex / `rgb()` / `hsl()` outside the four permitted files
- [ ] No raw `px`/`rem` font sizes or spacing values
- [ ] `border-radius` is `0`, `--radius`, `--skin-radius`, or `--radius-pill` on a pill/chip
- [ ] Every `box-shadow` has zero blur
- [ ] Accent spent once in this section; text on accent is `--color-on-accent`
- [ ] `--color-ink-muted` clears 4.5:1 on `--color-base-3`
- [ ] Mode-responsive components read `--skin-*`
- [ ] `--dur-*` / `--ease-*` still match `lib/gsap/easings.ts`
- [ ] `theme.css` `:root` still mirrors `config/theme.ts` after any palette change
- [ ] Split-line reveals have descender room
- [ ] Fixed chrome offsets by `--page-inset`
- [ ] No horizontal overflow at 360px, and at `--fs-scale` / `--space-scale` maximum
