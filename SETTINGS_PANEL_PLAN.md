# SETTINGS PANEL — Technical Plan

> A user-facing "system settings" popup that lets visitors live-tweak the site
> (colors, fonts, motion, density, …). Changes are **temporary**: they live only
> in memory + inline CSS variables on `<html>`, so a page refresh restores the
> original `theme.css` defaults. No persistence.

---

## 0. Why this is cheap in THIS codebase

The whole design system is already driven by CSS custom properties in one file
(`src/styles/theme.css`) and **every component consumes `var(--token)`** — no
hardcoded hex/px anywhere. That means:

- **Re-theming = overriding CSS variables on `document.documentElement`.** Setting
  `documentElement.style.setProperty('--color-accent', '#ff2e63')` overrides the
  `:root { --color-accent }` rule from `theme.css` for the whole page, instantly,
  **with zero React re-renders** (the browser repaints from the new variable).
- **Temporary is free.** Inline styles on `<html>` are not persisted; a refresh
  wipes them → back to `theme.css`. Reset = remove the inline properties.
- **Dark mode already exists.** `theme.css` ships a `:root[data-theme="dark"]`
  block — the panel just toggles the `data-theme` attribute.

The only new "plumbing" is for settings that aren't pure CSS (smooth scroll,
custom cursor, GSAP speed, reduced motion) — those read a shared flag.

---

## 1. What users can customize — suggestions (pick a scope)

Grouped by category. ★ = recommended MVP.

### A. Theme & Color
- ★ **Theme mode**: Light / Dark (toggle `data-theme`) — already supported.
- ★ **Preset palettes**: swatch grid (Bone+Ultramarine default, Ink+Lime, Oxblood+Cream, Mono, etc.). One click sets the whole triad + derived tints.
- ★ **Accent color** picker (drives `--color-accent`; auto-derive `--color-accent-press` = darken, `--color-on-accent` = auto black/white for contrast).
- ★ **Base / Ink** color pickers (auto-derive `--color-base-2/-3`, `--color-ink-muted`, `--color-line-soft`).
- **Accent intensity / saturation** slider.
- **Live AA contrast check** with a warning badge when ink/accent on base fails WCAG.
- **"Randomize"** / "Surprise me" button (generates a valid, AA-passing triad).
- **Invert / Grayscale / High-contrast** quick toggles (CSS filters or var swaps).

### B. Typography
- ★ **Display font** + **Mono font** pickers (curated list; see §6 for loading strategy).
- ★ **Font pairing presets** (Grotesk+Mono, Serif+Sans, all-Mono brutalist…).
- ★ **Type scale** slider (global size multiplier → `--fs-scale`).
- **Letter-spacing** on display (tighter/looser).
- **Line-height / reading width** (`--measure`).
- **UPPERCASE ↔ sentence case** for headings, **font-weight** for display.

### C. Layout & Density
- ★ **Spacing / density** slider (compact ↔ airy → `--space-scale`, affects section rhythm + gutters).
- **Container width** (`--container`) — narrow/wide.
- **Debug grid overlay** toggle (columns + baseline).

### D. Shape / Brutalism dial
- ★ **Border thickness** (`--bw*`) — hairline ↔ chunky.
- ★ **Corner radius** (`--radius`) — sharp ↔ rounded (turns the whole site from brutalist to soft).
- **Hard-shadow** offset + on/off (`--shadow*`) — the signature no-blur shadow.
- A single **"Brutalist ↔ Soft"** master preset that moves radius+shadow+borders+font together.

### E. Motion
- ★ **Reduce / disable motion** (respect + override `prefers-reduced-motion`).
- ★ **Animation speed** multiplier (`--dur-scale` for CSS + `gsap.globalTimeline.timeScale` for timed GSAP).
- ★ **Smooth scroll (Lenis)** on/off.
- **Marquee speed**, **scroll-scrub tightness**, **magnetic strength** globals.

### F. Cursor
- ★ **Custom cursor** on/off (fall back to native pointer).
- **Cursor size**, **blend/difference mode**, **trail length**.

### G. Accessibility helpers
- **Larger text** (ties to type scale), **high contrast**, **reduce motion**,
  **always-visible focus rings**, **dyslexia-friendly font** (OpenDyslexic/system).

### H. Experimental / fun (stretch)
- **Grain/noise texture** overlay, **CRT/scanlines**, **cursor-reactive background**,
  **"chaos mode"** (randomize everything), **section-scoped overrides**,
  **export current config** as JSON / shareable URL hash (opt-in persistence).

**Recommended MVP** = the ★ items: theme mode, palette presets + accent/base/ink
pickers with contrast check, font pairing + type-scale, density, radius+borders,
motion (reduce + speed + smooth-scroll), custom-cursor toggle, Reset.

---

## 2. Architecture overview

```
SettingsProvider (React Context, in-memory only)
   │  holds Settings state + setSetting/reset/applyPreset
   │
   ├─►  applySettings()  ──►  document.documentElement
   │        • CSS var overrides via style.setProperty('--token', value)
   │        • data-theme / data-reduce-motion attributes
   │        • root font-size / html classes
   │
   ├─►  imperative consumers read a shared flag/attribute:
   │        • SmoothScrollProvider  → settings.smoothScroll
   │        • Cursor                → settings.customCursor + size
   │        • useReducedMotion/env  → settings.reduceMotion (OR media query)
   │        • gsap.globalTimeline.timeScale(settings.motionSpeed)
   │
   └─►  <SettingsTrigger/> (floating cog)  +  <SettingsPanel/> (dialog/drawer)
            renders controls from a typed schema (data-driven, DRY)
```

- **State**: React Context (same pattern as `CursorContext` / `ActiveSectionContext`). **No `localStorage`** → temporary by construction. (Optional: `sessionStorage` if we ever want "survive within tab" — but the ask is reset-on-refresh, so skip.)
- **Apply layer**: a pure function `applySettings(settings)` that writes to `<html>`. Called in an effect whenever settings change. Cheap; no component re-render for CSS-var changes.
- **Reset**: remove every property we set + clear attributes → falls back to `theme.css`.

---

## 3. Data model (TypeScript, strict-safe)

`src/settings/types.ts`

```ts
export type ThemeMode = 'light' | 'dark';          // string-literal union (no enum)
export type FontPairId = 'bricolage-mono' | 'serif-sans' | 'all-mono' | 'grotesk-classic';
export type PaletteId = 'bone-ultramarine' | 'ink-lime' | 'oxblood-cream' | 'mono' | string;

export interface Settings {
  themeMode: ThemeMode;
  paletteId: PaletteId | null;        // null = custom colors
  colorBase: string;                  // hex
  colorInk: string;
  colorAccent: string;
  fontPair: FontPairId;
  typeScale: number;                  // 0.85 – 1.3 (→ --fs-scale)
  spacing: number;                    // 0.8 – 1.3  (→ --space-scale)
  radius: number;                     // 0 – 24px   (→ --radius)
  borderWidth: number;                // 1 – 4px    (→ --bw)
  hardShadows: boolean;
  reduceMotion: boolean;
  motionSpeed: number;                // 0.5 – 2    (1 = default)
  smoothScroll: boolean;
  customCursor: boolean;
}

export const DEFAULT_SETTINGS: Settings = { /* mirrors theme.css defaults */ };
```

The **control schema** is data-driven (mirrors the `content.ts` philosophy so adding
a control is data, not markup):

`src/data/settingsSchema.ts`

```ts
export type ControlKind = 'toggle' | 'slider' | 'color' | 'select' | 'preset' | 'segmented';

export interface Control {
  id: keyof Settings | string;
  kind: ControlKind;
  label: string;
  group: 'Theme' | 'Type' | 'Layout' | 'Shape' | 'Motion' | 'Cursor';
  min?: number; max?: number; step?: number; unit?: string;
  options?: { value: string; label: string }[];
}

export const SETTINGS_SCHEMA: Control[] = [ /* … */ ];
export const PALETTES: { id: PaletteId; name: string; base: string; ink: string; accent: string }[] = [ /* … */ ];
export const FONT_PAIRS: Record<FontPairId, { display: string; mono: string; body: string; loader?: () => Promise<unknown> }> = { /* … */ };
```

---

## 4. The apply layer — mapping settings → the page

`src/settings/applySettings.ts`

```ts
import type { Settings } from './types';
import { deriveColors } from './colors';

const ROOT = () => document.documentElement;

// every CSS var this panel may override (so reset() can clear exactly these)
const MANAGED_VARS = [
  '--color-base','--color-base-2','--color-base-3','--color-ink','--color-ink-muted',
  '--color-accent','--color-accent-press','--color-on-accent','--color-line','--color-line-soft',
  '--font-display','--font-body','--font-mono','--fs-scale','--space-scale',
  '--radius','--bw','--dur-scale',
] as const;

export function applySettings(s: Settings) {
  const root = ROOT();
  const c = deriveColors(s);                       // base/ink/accent → full token set
  for (const [k, v] of Object.entries(c)) root.style.setProperty(k, v);

  const fonts = FONT_PAIRS[s.fontPair];
  root.style.setProperty('--font-display', fonts.display);
  root.style.setProperty('--font-body', fonts.body);
  root.style.setProperty('--font-mono', fonts.mono);
  fonts.loader?.();                                // lazy-load webfont if needed

  root.style.setProperty('--fs-scale', String(s.typeScale));
  root.style.setProperty('--space-scale', String(s.spacing));
  root.style.setProperty('--radius', `${s.radius}px`);
  root.style.setProperty('--bw', `${s.borderWidth}px`);
  root.style.setProperty('--dur-scale', String(1 / s.motionSpeed));

  root.setAttribute('data-theme', s.themeMode);
  root.toggleAttribute('data-reduce-motion', s.reduceMotion);
  root.classList.toggle('no-hard-shadows', !s.hardShadows);
}

export function resetSettings() {
  const root = ROOT();
  MANAGED_VARS.forEach((v) => root.style.removeProperty(v));
  root.removeAttribute('data-theme');
  root.removeAttribute('data-reduce-motion');
  root.classList.remove('no-hard-shadows');
}
```

### Required `theme.css` refactor (small, additive)
To make **type-scale / spacing / speed** globally tunable, thread scale knobs into
the existing tokens (defaults keep current behavior — nothing changes visually):

```css
:root {
  --fs-scale: 1;
  --space-scale: 1;
  --dur-scale: 1;

  /* wrap fluid type in the scale (example for two steps) */
  --fs-700: calc(clamp(2.75rem, 1.833rem + 4.07vw, 5.5rem) * var(--fs-scale));
  /* …same pattern for --fs-100…900 */

  --space-section: calc(clamp(4rem, 2rem + 8vw, 9rem) * var(--space-scale));
  --gutter:        calc(clamp(1.25rem, .5rem + 3vw, 5rem) * var(--space-scale));

  --dur-base: calc(0.45s * var(--dur-scale));
  /* …same for --dur-* */
}
.no-hard-shadows { --shadow-sm: none; --shadow: none; --shadow-lg: none; --shadow-accent: none; }
```

- **Radius / borderWidth** already exist as `--radius` / `--bw` → override directly.
- **CSS-driven reduced motion** already has an `@media (prefers-reduced-motion)`
  block; add a parallel `:root[data-reduce-motion] *{ … }` rule so the toggle also
  neutralizes CSS transitions/animations.

---

## 5. Non-CSS settings — integration points

| Setting | How it's wired | File touched |
|---|---|---|
| **reduceMotion** | `useReducedMotion()` returns `mediaQuery OR settings.reduceMotion`; `env.prefersReducedMotion()` also reads a module flag the provider updates | `hooks/useReducedMotion.ts`, `lib/utils/env.ts` |
| **smoothScroll** | `SmoothScrollProvider` inits Lenis only if enabled; destroys/recreates on change | `components/providers/SmoothScrollProvider.tsx` |
| **customCursor + size** | `Cursor` returns `null` when off, removes `has-custom-cursor`; size from a var | `components/primitives/Cursor/Cursor.tsx` |
| **motionSpeed** | `gsap.globalTimeline.timeScale(speed)` in an effect (note: only affects *timed* GSAP; scroll-*scrub* is scroll-linked, unaffected — call this out in UI) | `SettingsProvider` |
| **borders/radius/shadows/type/space/colors/fonts** | pure CSS var overrides (§4) | none (CSS only) |

**Shared "reduce motion" source of truth**: both React hooks and imperative GSAP
code (Magnetic, SmoothScrollProvider) must agree. Simplest: the provider keeps a
module-level `let reduceMotionFlag` (exported getter) updated on change, AND sets
`data-reduce-motion` on `<html>`; hooks read `matchMedia || flag`, imperative code
reads the getter. This avoids prop-drilling into GSAP callbacks.

---

## 6. Font-loading strategy (the one real tradeoff)

Fonts can't be "overridden" like a color — the family must be available. Options,
best combined:

1. **System stacks (free, instant)** — e.g. `ui-serif, Georgia`, `ui-monospace`, a
   system sans. Zero load. Good for several pairings.
2. **Already-bundled** — Bricolage Grotesque Variable + Space Mono (the default).
3. **Extra Fontsource families (bundled, offline-safe)** — add 1–2 (e.g. a serif
   like `@fontsource-variable/fraunces`, a grotesk like `@fontsource-variable/space-grotesk`).
   Cost: ~30–60KB woff2 each, code-split so they only download when selected via the
   `loader()` in `FONT_PAIRS`.
4. **Google Fonts on-demand** — inject a `<link>` when chosen. No bundle cost, but an
   external request (fine for a real app; the site isn't under the Artifact CSP).

**Recommendation:** MVP = 3–4 pairings using (1)+(2)+one code-split Fontsource face.
Lazy-load via `loader()` so nothing extra ships unless the user picks it.

---

## 7. Component inventory & folder structure (follows the codebase)

```
src/
  settings/
    types.ts                 # Settings, unions, DEFAULT_SETTINGS
    applySettings.ts         # apply/reset → document.documentElement
    colors.ts                # deriveColors(), darken/lighten, contrast helpers
  data/
    settingsSchema.ts        # SETTINGS_SCHEMA, PALETTES, FONT_PAIRS (data-driven)
  context/
    SettingsContext.ts       # createContext<SettingsContextValue | null>
  hooks/
    useSettings.ts           # consume context (throws outside provider)
  components/
    providers/
      SettingsProvider.tsx   # state + applySettings effect + gsap timeScale + reduce-motion flag
    settings/
      SettingsTrigger/       # floating cog button (fixed, z above content, below cursor)
      SettingsPanel/         # dialog/drawer: focus-trap, Esc, grouped controls, Reset
      controls/
        ToggleControl.tsx
        SliderControl.tsx
        ColorControl.tsx     # <input type=color> + hex + swatch + AA badge
        SelectControl.tsx / SegmentedControl.tsx
        PresetSwatches.tsx   # palette + font-pair presets
      SettingsPanel.module.css (+ per-control modules)
```

Everything: **CSS Modules + `theme.css` tokens**, **TS strict** (string unions not
enums, `import type`, guard `noUncheckedIndexedAccess` on schema/array access),
hooks in `src/hooks`, context object in `src/context`, provider in
`src/components/providers` — identical conventions to the existing cursor/active-section
systems.

### Provider wiring (`AppProviders.tsx`)
`SettingsProvider` must be **outermost** so the others can read settings:

```
<SettingsProvider>
  <SmoothScrollProvider>      {/* reads settings.smoothScroll */}
    <CursorProvider>
      <ActiveSectionProvider>{children}</ActiveSectionProvider>
```

`App.tsx` renders `<SettingsTrigger/>` + `<SettingsPanel/>` (alongside `<Cursor/>`),
outside `<main>`, inert-aware during the intro.

---

## 8. State design

```ts
export interface SettingsContextValue {
  settings: Settings;
  isOpen: boolean;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  applyPreset: (id: PaletteId) => void;
  reset: () => void;
  open: () => void; close: () => void; toggle: () => void;
}
```

- Value memoized; setters are stable `useCallback`s.
- A `useEffect([settings])` calls `applySettings(settings)`.
- **No persistence.** On mount, state = `DEFAULT_SETTINGS`; nothing read from storage.
- Reset → `setSettings(DEFAULT_SETTINGS)` + `resetSettings()`.
- Only the panel + provider re-render on change; the *site* re-themes via CSS vars
  (no section re-renders) → cheap.

---

## 9. Accessibility

- Panel is a real `role="dialog" aria-modal="true"` with a labelled title; **focus
  trap**, **Esc to close**, focus returns to the trigger. (We already built this
  pattern for the mobile menu — reuse it or extract a `useFocusTrap` hook.)
- Trigger is a `<button aria-expanded aria-controls>` with a visible focus ring.
- Every control is a native input (`<input type=color|range|checkbox>`, `<select>`),
  keyboard-operable, with `<label>`s.
- The panel **respects reduce-motion** for its own open/close animation.
- **Panel chrome is self-stable**: it does NOT theme itself from the editable
  `--color-base/-ink` (otherwise setting base=ink makes the panel unreadable). It
  uses its own fixed neutral surface tokens (e.g. `--panel-bg`, `--panel-fg`) so it
  stays usable while you edit the site behind it. Swatches still show live previews.

---

## 10. Performance & gotchas

- CSS-var overrides are a **style recalc + paint**, not a React render — very cheap.
- **Debounce** `<input type=color>` "input" events (fires continuously while dragging).
- **`motionSpeed` caveat**: `globalTimeline.timeScale` speeds *timed* tweens;
  ScrollTrigger **scrub** animations are scroll-linked (not time) so they won't
  change speed — the UI copy should say "entrance/idle animation speed."
- **Contrast**: after any color change, run the AA check (`colors.ts`) and surface a
  non-blocking warning; still let the user proceed (it's a playground).
- **`invalidateOnRefresh` / pinned sections**: changing type-scale/spacing/fonts
  changes layout heights → call `ScrollTrigger.refresh()` (debounced) after apply so
  pins/triggers recompute. (One extra line in the apply effect.)
- **Fonts** changing metrics also warrants a `ScrollTrigger.refresh()` after
  `document.fonts.ready`.
- No SSR here (Vite SPA) so `document` access in the apply layer is safe.

---

## 11. Build order

1. **theme.css knobs** — add `--fs-scale`, `--space-scale`, `--dur-scale`, thread
   into `--fs-*` / `--space-*` / `--gutter` / `--dur-*`; add `[data-reduce-motion]`
   and `.no-hard-shadows` rules. (Purely additive; site looks identical.)
2. **settings/** core — `types.ts`, `colors.ts` (derive + contrast), `applySettings.ts`.
3. **data/settingsSchema.ts** — controls, palettes, font pairs.
4. **Context + provider + hook** — `SettingsContext`, `SettingsProvider` (apply
   effect, gsap timeScale, reduce-motion flag, `ScrollTrigger.refresh`), `useSettings`.
5. **Integrate flags** — `useReducedMotion`, `env.ts`, `SmoothScrollProvider`,
   `Cursor` read settings. Wire `SettingsProvider` outermost in `AppProviders`.
6. **UI** — `SettingsTrigger`, `SettingsPanel` (+ focus trap), the `controls/*`
   primitives, `PresetSwatches`. Render in `App.tsx`.
7. **Polish** — debounce color inputs, AA warnings, "Randomize", reduced-motion for
   the panel, mobile layout (bottom-sheet), Reset. Verify with Playwright + axe.

---

## 12. Stretch / optional
- **Share/export**: encode settings in the URL hash (opt-in, makes it persistent &
  shareable — but off by default to honor "reset on refresh").
- **Section-scoped** overrides (edit only the hero, etc.).
- **Grain / scanline / invert** experimental toggles.
- **"Brutalist ↔ Soft" master slider** that moves radius+shadow+borders+font together.

---

### TL;DR recommendation
Ship the ★ MVP: a right-side drawer with **Theme (mode + palette presets + accent/
base/ink pickers w/ live AA check)**, **Type (font pairing + scale)**, **Layout
(density)**, **Shape (radius + border + hard-shadow)**, **Motion (reduce + speed +
smooth-scroll)**, **Cursor toggle**, and **Reset** — all driven by CSS-variable
overrides on `<html>` (temporary by nature) plus four small integration hooks for
the non-CSS bits. Data-driven control schema, CSS Modules, strict TS, React Context,
`SettingsProvider` outermost — fully consistent with the existing architecture.
```
