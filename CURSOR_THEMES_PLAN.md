# Cursor Themes → Site "Modes" — Technical Plan & Recommendations

> **STATUS: SHIPPED ✅** — Phases 0–6 all complete & verified (tsc/build green, Playwright).
> 4 Modes + Off: each transforms cursor + global motion + section skins, with bespoke
> Hero bloom/dot-field per Mode. Orthogonal to the 6 palettes; respects reduced-motion
> (trail dropped, calm reveals) and touch (native cursor). Key gotcha learned: never
> rebuild a *pinned* ScrollTrigger on Mode change — drive its output imperatively in
> `onUpdate` from a live ref instead (see Hero bloom).

> Goal: the Settings sidebar offers **3–4 cursor designs + Off**. Choosing one doesn't
> just swap the cursor — it re-skins the **cursor animation**, the **global motion
> feel**, and the **section treatments**, so the whole site "changes personality."
> Temporary (resets on refresh), same as the rest of the Settings panel.

---

## 1. The core idea (naming)

A "cursor theme" is really a **Mode / Persona**: the cursor is the *badge* of a
coordinated design system. One control drives everything. I recommend labelling it
**"Mode"** (or "Cursor & Motion") in the panel, with the cursor as the visible icon.

Each Mode = **{ cursor design + cursor animation + motion profile + section skin }**.

---

## 2. Why this is cheap in THIS codebase (the seams already exist)

| Need | Existing seam we reuse |
|---|---|
| One global switch that re-skins CSS | `applySettings()` already writes attrs/vars to `<html>` |
| Imperative GSAP reacting without prop-drill | `motionFlag.ts` pattern (`get/set/subscribe`) → clone as `motionProfile.ts` |
| Context-aware cursor states | `data-variant` on `.cursor` (hover/view/click/text) — compose with theme |
| Data-driven presets | `data/settingsSchema.ts` (PALETTES/FONT_PAIRS) → add `data/cursorThemes.ts` |
| Layout recompute after change | `ScrollTrigger.refresh()` debounce already wired in `SettingsProvider` |
| Reduced-motion truth shared JS+CSS | `getReduceMotion()` + `data-reduce-motion` attr |

**Nothing structural has to be invented.** We add one attribute (`data-cursor-theme`),
one store (`motionProfile`), and a `switch` inside `Cursor.tsx`.

---

## 3. Recommended Modes (3 + Off, with an optional 4th)

Each is a *cohesive* pairing so the cursor visually "explains" the motion.

### A. **Precision** — *default, minimal* (this is today's site)
- **Cursor:** small ink dot + context ring + label (current behaviour).
- **Motion:** crisp `expo/power4.out`, short travel, snappy stagger.
- **Skin:** hard shadows, 0px radius, thick borders — the current brutalist look.
- **Vibe:** sharp, engineered, confident. *(Baseline — near-zero new work.)*

### B. **Fluid** — *soft / organic / premium*
- **Cursor:** a large **lagging blob** (outer ring trails the inner dot with high
  inertia + slight squash-on-move). Hover = blob swells & goes gooey.
- **Motion:** slow `power2/sine`, longer reveal travel, blur-up entrances, heavier parallax.
- **Skin:** rounded corners (`--skin-radius: 16–20px`), soft drop shadows, hairline borders.
- **Vibe:** calm, expensive, editorial.

### C. **Terminal** — *technical / retro-CAD*
- **Cursor:** a **crosshair + full-width/height guide lines** that track the pointer,
  with a live `x,y` coordinate readout (like a design tool / DOOM console).
- **Motion:** **stepped** `steps(n)` reveals, char-by-char type-on, no smoothing; instant snaps.
- **Skin:** visible baseline grid overlay, ticked corners, monospace-forward, scanline accents.
- **Vibe:** hacker, blueprint, precise-but-raw.

### D. *(optional)* **Kinetic** — *playful / high-energy*
- **Cursor:** a ring with a **short particle trail** (N trailing dots via chained `quickTo`)
  + aggressive magnetic snap to targets.
- **Motion:** bouncy `back.out(1.6)` / `elastic`, pop-scale + small rotation/skew, faster marquees.
- **Skin:** bold, exaggerated hovers, card tilt-on-hover, chunkier accents.
- **Vibe:** fun, tactile, dribbble-y.

### Off — **Native**
- System cursor (removes `has-custom-cursor`), site falls back to the **Precision**
  motion profile + default skin. No custom-cursor JS runs.

> **LOCKED:** build **all four** — Precision + Fluid + Terminal + Kinetic (+ Off).
> Sequence them Precision → Fluid → Terminal → **Kinetic last** (its particle trail +
> magnetic snap is the most involved), so each ships verified before the hardest one.

---

## 4. Architecture — one attribute, three adaptation layers

```
        Settings panel (pick a Mode)
                 │  setSetting('cursorTheme', id)
                 ▼
        SettingsProvider effect
     ┌───────────┼───────────────────────────┐
     ▼           ▼                           ▼
applySettings   setMotionProfile(profile)   ScrollTrigger.refresh()
  writes:        (mirrors motionFlag)          (skins that move layout)
  <html
   data-cursor-theme="fluid"                ┌── read by ──┐
   style="--ease-reveal:…                   ▼             ▼
          --reveal-distance:…       useMotionProfile()  env.ts / GSAP
          --skin-radius:… ">        (React reveal hooks) (imperative code)
     │
     ├─► LAYER 1  CSS-var overrides   → transitions, durations, skin tokens
     ├─► LAYER 2  attribute CSS       → [data-cursor-theme='x'] .section {…}
     └─► LAYER 3  Cursor.tsx switch   → per-theme cursor DOM + animation
```

**Layer 1 — CSS variables (cheapest, most reuse).**
Define animation/skin *tokens* once in `theme.css`; re-point them per theme:
```css
:root { /* defaults = Precision */
  --ease-reveal: var(--ease-power-out);
  --reveal-distance: 32px;
  --skin-radius: 0px;
  --skin-shadow: var(--shadow);      /* hard */
  --skin-border: var(--bw);
}
:root[data-cursor-theme='fluid'] {
  --ease-reveal: cubic-bezier(.22,1,.36,1);
  --reveal-distance: 64px;
  --skin-radius: 18px;
  --skin-shadow: 0 22px 60px -24px color-mix(in srgb, var(--color-ink) 40%, transparent);
  --skin-border: 1px;
}
:root[data-cursor-theme='terminal'] { --skin-radius:0; --skin-border:var(--bw); /* + grid overlay */ }
```
Any CSS that reads these tokens adapts for free (buttons, cards, chips already use
`--bw`, `--radius`, `--shadow`, so we alias those to skin tokens or add new ones).

**Layer 2 — attribute-scoped section CSS (targeted skins).**
For things a var can't express (grid overlay, scanlines, card tilt), add small additive
rules in the section's own `.module.css`:
```css
[data-cursor-theme='terminal'] .hero { background-image: /* grid */; }
[data-cursor-theme='kinetic'] .card:hover { transform: rotate(-1.2deg) scale(1.02); }
```
Keep these **few and additive** — they are the expensive part; budget them.

**Layer 3 — the cursor itself (JS).**
`Cursor.tsx` reads `settings.cursorTheme` and renders/animates per theme (the only place
real per-theme JS lives). Variants still compose via `data-variant`.

**The motion profile (makes "different animation" real, not just CSS).**
GSAP reads JS values, not CSS vars — so mirror `motionFlag`:
```ts
// settings/motionProfile.ts
export interface MotionProfile {
  id: CursorThemeId;
  ease: string;      // 'expo.out' | 'power2.out' | 'steps(6)' | 'back.out(1.6)'
  revealY: number;   // entrance travel px
  stagger: number;   // s
  durScale: number;  // × base durations
  rotate: number;    // deg (playful themes only)
  blur: number;      // px blur-up (fluid)
}
let current = PRECISION_PROFILE;
export const getMotionProfile = () => current;
export function setMotionProfile(p: MotionProfile) { current = p; listeners.forEach(l=>l()); }
export function subscribeMotionProfile(l:()=>void){ … } // identical to motionFlag
```
Reveal code reads it: React via `useMotionProfile()`, imperative GSAP via
`getMotionProfile()`. **Reduced-motion always wins** — when `getReduceMotion()` is true,
reveal helpers ignore the profile and use the calm path (as they already do).

---

## 5. What actually changes per Mode (the vision, concretely)

| Surface | Precision | Fluid | Terminal | Kinetic |
|---|---|---|---|---|
| Cursor | dot + ring | lagging gooey blob | crosshair + guides + x,y | ring + particle trail |
| Reveal ease | expo.out | soft cubic | steps() | back.out |
| Reveal motion | slide-up short | blur-up, long | type/step-in | pop + rotate |
| Hero bloom | circle wipe | radial morph | hard rect wipe | fast diagonal |
| Hero dot-field | subtle lean | big laggy, linked | strict grid + ticks | jittery |
| Marquees | steady | slow smooth | stepped ticker | fast + skew |
| Cards | hard shadow, square | soft float, round | ticked, scanline | tilt on hover |
| Section chips | current | rounded | grid-locked | bold pop |

> **Scope reality check:** the top 4 rows (cursor + global motion profile + skin tokens)
> re-skin the *entire* site for modest code. The bottom rows (bespoke per-section) are
> where cost explodes. See §7.

---

## 6. File-by-file change list

**New**
- `data/cursorThemes.ts` — `CURSOR_THEMES: CursorTheme[]` = `{ id, name, blurb, motion: MotionProfile, previewKind }`. Single source of truth (data-driven, like PALETTES).
- `settings/motionProfile.ts` — store (get/set/subscribe) + the per-theme profiles.
- `hooks/useMotionProfile.ts` — React subscriber hook.
- `components/primitives/Cursor/variants/` — `PrecisionCursor`, `FluidCursor`, `TerminalCursor`, `KineticCursor` (small components) OR one switch in `Cursor.tsx`.

**Edited**
- `settings/types.ts` — add `CursorThemeId` union + `cursorTheme: CursorThemeId`; fold `customCursor` → derived (`cursorTheme !== 'off'`) or keep as alias.
- `settings/applySettings.ts` — set `data-cursor-theme`; write profile-derived CSS vars (`--ease-reveal`, `--reveal-distance`, `--skin-*`); `has-custom-cursor` follows theme≠off.
- `components/providers/SettingsProvider.tsx` — in apply effect call `setMotionProfile(themeProfile)`; add `cursorTheme` to the `ScrollTrigger.refresh` dep list.
- `components/primitives/Cursor/Cursor.tsx` (+ `.module.css`) — theme switch + per-theme animation; `enabled = !coarse && cursorTheme !== 'off'`.
- `styles/theme.css` — define default skin/motion tokens + `:root[data-cursor-theme='…']` blocks.
- Reveal consumers (`hooks/useSplitText.ts`, section `useGSAP` reveal blocks, `Hero`, marquees) — read `getMotionProfile()`/`useMotionProfile()` instead of hardcoded `EASE`/distances. *(Centralize into a `revealPreset()` helper to avoid touching every file.)*
- `components/settings/SettingsPanel/SettingsPanel.tsx` — new "Mode" group with a `CursorThemePicker` (live mini-preview per option) + Off. Replaces the standalone "Custom cursor" toggle.

---

## 7. Scope recommendation (my strong opinion)

"Whole website redesign per cursor" can 4× the surface area. Deliver it in tiers and
**stop at Tier 3 site-wide**, using Tier 4 only as a showcase:

- **Tier 1 — Cursor design + animation per Mode.** The direct payoff. *Do it.*
- **Tier 2 — Global motion profile** (ease/distance/stagger/dur). Whole site *feels*
  different from ~one store + a reveal helper. *Highest value-to-code. Do it.*
- **Tier 3 — Skin tokens** (radius/shadow/border/accent-treatment/overlay) via CSS vars.
  Re-skins every card/chip/section cheaply. *Do it.*
- **Tier 4 — Bespoke per-section layout** (different hero bloom, grid overlay, card tilt).
  Expensive & multiplicative. **Limit to the Hero + marquees as signature moments;** do
  NOT bespoke every section, or quality/maintenance suffers.

This gives the "the whole site transformed" wow **without** maintaining 4 parallel designs.

---

## 8. Accessibility, performance, correctness

- **Reduced motion wins.** All profiles collapse to the calm path when
  `getReduceMotion()` / OS `prefers-reduced-motion` is true. Trails/particles disabled.
- **Coarse pointer (touch):** no custom cursor at all; Modes still apply skin + (calm)
  motion. Cursor-specific JS never mounts (existing `useIsCoarsePointer` guard).
- **Performance:** blob = 2 elements; crosshair guides = 2 lines; trail capped at ~6 dots
  via chained `quickTo` (no per-frame React state — same discipline as today's cursor).
- **Palette stays 3-color.** Modes must NOT introduce new hues; "terminal green" etc. is
  out unless expressed through the existing accent. Keep **Mode ⟂ Palette** (orthogonal)
  so the two controls don't combinatorially fight. A Mode *may* suggest a default palette,
  but shouldn't force one.
- **Temporary, like the rest of Settings** (resets on refresh). Persistence = a 1-line
  `localStorage` add later if you want it to stick.
- **No layout thrash:** only `cursorTheme` changes that move layout trigger the existing
  debounced `ScrollTrigger.refresh()`.

---

## 9. Session plan (phased build order)

**Phase 0 — Tokens & plumbing (no visible change yet).**
Add `cursorTheme` to settings + `data-cursor-theme` attr + `motionProfile` store +
`useMotionProfile`. Define default skin/motion tokens in `theme.css`. Verify: nothing
changes at defaults; attribute + vars appear on `<html>`.

**Phase 1 — Panel control.**
`CursorThemePicker` in the panel (Precision / Fluid / Terminal / Kinetic / Off) with live
previews. Verify (Playwright): selecting each writes the attribute; Off removes custom cursor.

**Phase 2 — Cursor visuals per Mode.**
Implement the cursors in order: Precision (reuse) → Fluid blob → Terminal crosshair →
**Kinetic trail (last)**. Verify each renders + reacts to `data-variant`
(hover/click/text) + the reduced-motion / coarse-pointer fallback.

**Phase 3 — Global motion profile wiring.**
Route reveals/split-text/marquees through `revealPreset()` reading the profile. Verify the
*same* section animates differently under each Mode; reduced-motion still calm.

**Phase 4 — Skin tokens site-wide (Tier 3).**
Alias `--radius/--bw/--shadow` (and new `--skin-*`) per Mode; confirm cards/chips/buttons
re-skin. Verify contrast (AA) holds in each Mode × palette.

**Phase 5 — Signature per-section moments (Tier 4, budgeted).**
Hero bloom + dot-field variants; marquee easing. Stop here.

**Phase 6 — Polish + regression.**
Mobile (no cursor, skins apply), reduced-motion, all palettes, `tsc -b` + `vite build`,
Playwright captures of every Mode at hero/stack.

Each phase ends with `tsc -b` + `vite build` green and a Playwright screenshot set, exactly
like the work we've been doing.

---

## 10. Decisions — LOCKED
1. **Personas:** ✅ **Precision + Fluid + Terminal + Kinetic + Off** (all four, Kinetic built last).
2. **Depth:** ✅ **Tier 1–3 site-wide + Tier 4 for Hero/marquees only.**
3. **Panel naming:** "Mode" *(default unless you say otherwise)*.
4. **Custom-cursor toggle:** fold **Off** into the Mode picker (one control) *(default)*.
