# PROJECT PLAN — Vraj Patel Portfolio (Light Editorial-Brutalist)

> Stage 2 (Planning) artifact. A complete, buildable spec for a GSAP-driven, brutalist
> animated portfolio that **exceeds** the reference teardown in `ANIMATION_STUDY.md` and
> mirrors the real content in `Vraj_Patel_Professional_Profile.md`.
>
> This plan is meant to be built **verbatim**. Every token, name, and signature is committed.
> The implementation agent (Stage 4) should not re-derive decisions — only execute them.

---

## 0. Build-constraint preflight (read first)

The existing boilerplate's `tsconfig.app.json` imposes three constraints that shape every file below:

| Flag (current) | Consequence for the build |
|---|---|
| `erasableSyntaxOnly: true` | **No TS `enum`, no `namespace`, no param-property shorthand.** All "enums" (e.g. cursor variant) are **string-literal union types** + a `const` object `as const`. This is why State Design uses a union, not an `enum`. |
| `verbatimModuleSyntax: true` | Every type-only import must be `import type { X } from '...'`. Mixed imports must split the type members out. |
| `strict` **not yet set** | Build Order Step 0 adds `"strict": true` (and `"noUncheckedIndexedAccess": true`) to `tsconfig.app.json` to satisfy the "TypeScript (strict)" mandate. |
| `noUnusedLocals` / `noUnusedParameters` | GSAP callbacks must consume or omit params; prefix intentionally-unused with `_`. |

Stack is fixed: **Vite + React 19 + TS + bun**, existing boilerplate at repo root. Package manager is **bun** (there is a `bun.lock`). Do not introduce Tailwind, Zustand, Redux, react-router, or react-snowfall.

---

## 1. Vision & Divergence

**Vision.** Where the reference is a dark, one-joke desktop toy whose single scroll effect was cut before shipping, this build is a **light editorial-brutalist "spec sheet that comes alive."** Warm bone paper, near-black ink, and one electric ultramarine that is *rationed* to reveal/focus/emphasis. It beats the reference on the exact axis the reference is thinnest — **scroll-driven motion** — by shipping a pinned+scrubbed hero, clip-path section wipes, kinetic split-type, a horizontal-scroll project track with real media, a scroll-velocity marquee, and an inertial magnetic cursor, all on one coherent GSAP engine with a first-class reduced-motion variant and a real mobile path. The whole site is re-skinnable (even flipped to dark) by editing ~10 tokens in one file.

**What we KEEP (transferable principles from the study):**
- Motion reveals **content/meaning**, never decoration (every reveal exposes real information).
- **Strict 3-role color** (base / ink / accent); grays only as hairlines/meta. Accent = "the important thing."
- **Extreme type contrast** — mono micro-caps vs oversized display caps; tight vs wide tracking.
- **Snappy timings** (0.1–0.45s for UI; slow 0.6–0.9s reserved for genuine transitions).
- **Cursor as a UI channel** (size/label/variant communicates affordance & personality).
- **Threshold intro ritual** (but fast, skippable, reduced-motion-aware).
- **Consistent structural grid** — container, gutters, hairline dividers, generous vertical rhythm.

**What we CHANGE (divergence mandate):**
| Axis | Reference | This build |
|---|---|---|
| Mood/palette | Dark `#050505`/`#f3f4f6`/`#eb5939` | **Light** bone `#ECE7DA` / ink `#111110` / **ultramarine** `#1F1BEB` |
| Type | Inter-only, faked system mono | **Bricolage Grotesque Variable** (display/body) + **Space Mono** (labels) |
| Motion engine | Framer Motion, no shipped scroll motion | **GSAP 3 + ScrollTrigger + useGSAP + Lenis** — pins, scrubs, wipes, split-type |
| Styling | Tailwind v4 inline arbitrary hex | **CSS Modules + one `theme.css` token file** (no hardcoded hex in components) |
| Signature | One spotlight mask reused 3–4× | **9 distinct escalating signatures**, one per section |
| Projects | Text only, no visuals | **Horizontal-scroll pinned track** with image/video media + hover-distort |
| Cursor | `setState`-per-mousemove | **`gsap.quickTo`** inertial cursor, zero per-frame React state |
| Mobile | Hover-gated → dead on touch | **Tap/auto-reveal fallbacks** on every hover-gated moment |
| A11y | No reduced-motion, `<div onClick>` | Reduced-motion variant + semantic `<button>`/`<a>` + focus-visible + aria |

---

## 2. Motion System

**Rationale (why GSAP, briefly).** The reference is its own argument: the author built exactly one scroll-scrub + pin effect — `TechStack.jsx`, a `sticky top-0` / `h-[200vh]` dual marquee driven by Framer's `useScroll`/`useTransform` — then **cut it before shipping** (it was never imported and referenced an undefined class). Framer Motion has no first-class pin/snap primitive; you hand-wire transforms and fake pinning with tall wrappers, which is precisely the friction that made the author abandon it. **ScrollTrigger** gives real `pin`, `scrub`, `snap`, `start/end`, and lets one timeline choreograph many elements against scroll. **SplitText** makes kinetic type trivial (Framer has no splitter). **Lenis** provides lerped inertia that links cleanly to scroll progress. **`gsap.quickTo`** drives the cursor with no React re-renders — fixing the reference's per-frame `setState` smell. **`@gsap/react`'s `useGSAP`** scopes and auto-reverts animations, StrictMode-safe under React 19. One engine, one mental model.

**Plugin registration (once, at module load).** `src/lib/gsap/register.ts`:
```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

let registered = false;
export function registerGsap() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  registered = true;
}
```
Imported once in `AppProviders` (or `main.tsx`) before any animation runs.

**SplitText + fallback splitter (no paid dependency).** SplitText became a free part of the public GSAP package in **GSAP 3.13 (2025)**. Plan:
1. Attempt `import { SplitText } from 'gsap/SplitText'` inside a guarded loader (`src/lib/gsap/splitText.ts`).
2. If unavailable at build (older gsap on the machine, or import throws), **fall back to a lightweight custom splitter** we own — `splitToLines`/`splitToWords`/`splitToChars` that wrap each unit in `<span class="split__unit"><span class="split__inner">…</span></span>` (double-wrap so `overflow:hidden` on the outer enables clip reveals), preserving spaces and marking `aria-hidden` on the visual copy while keeping an SR-only original. **We never hard-depend on the plugin.** The `useSplitText` hook returns the same shape (`{ lines, words, chars, revert }`) regardless of which engine produced it.

**Lenis ↔ ScrollTrigger integration** (`SmoothScrollProvider`):
```ts
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true }); // smoothTouch defaults off → native momentum on touch
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
On cleanup: `gsap.ticker.remove(...)`, `lenis.destroy()`. Lenis is **disabled when `prefers-reduced-motion: reduce`** (fall back to native scroll) and exposed via context so `useLenis()` can call `lenis.scrollTo(target)` for nav.

**Global reduced-motion strategy (single gate).** One hook `useReducedMotion()` reads `matchMedia('(prefers-reduced-motion: reduce)')` (live, with listener). Animation code uses **`gsap.matchMedia()`** with two branches so cleanup is automatic:
```ts
const mm = gsap.matchMedia();
mm.add({
  motion: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
}, (ctx) => {
  const { motion } = ctx.conditions!;
  if (motion) { /* full scrub/pin/timeline */ }
  else { /* instant end-states: gsap.set(...) to final, no scrub, no pin, no loop */ }
});
```
Rule: **every effect in §6 names its reduced-motion fallback**, and all fallbacks resolve to the *final* legible state (content is never hidden behind a scrub that won't run). Lenis off, marquees static or CSS-paused, cursor becomes native pointer, loops removed.

---

## 3. Design Tokens — `src/styles/theme.css`

One global file. Every component consumes `var(--token)`; **no hardcoded hex anywhere else.** Chosen palette: **Light Editorial-Brutalist / Bone + Ink + Ultramarine.**

### 3.1 Color tokens

```css
:root {
  /* --- Base / surfaces --- */
  --color-base:        #ECE7DA; /* bone paper — page canvas */
  --color-base-2:      #E3DCCB; /* elevated paper — cards, panels, wells */
  --color-base-3:      #DAD2BE; /* deepest paper — insets, marquee track */

  /* --- Ink / text --- */
  --color-ink:         #111110; /* near-black warm ink — primary text, borders */
  --color-ink-muted:   #57534A; /* warm gray — meta, captions, secondary */

  /* --- Accent (rationed: reveal / focus / emphasis) --- */
  --color-accent:      #1F1BEB; /* electric ultramarine */
  --color-accent-press:#1512B0; /* darker ultramarine — active/pressed/hover-deep */
  --color-on-accent:   #F7F4EC; /* paper-white — the ONLY text color allowed on accent */

  /* --- Lines --- */
  --color-line:        #111110; /* full-strength brutalist divider/frame (= ink) */
  --color-line-soft:   #C9C0AD; /* hairline on paper where full ink is too loud */

  /* --- Selection --- */
  --color-selection-bg: var(--color-accent);
  --color-selection-fg: var(--color-on-accent);
}
```

**Accent on-color rule (explicit):** ultramarine `#1F1BEB` may be used **both as a fill AND as text on paper** (7.05:1, below). Text placed **on** the ultramarine fill **must** be `--color-on-accent` (paper-white) — **never ink** (ink-on-accent is 2.17:1, fails AA). See table.

**Re-theming note.** Because all color is in these ~12 variables, the entire site re-skins by editing this block. A dark flip lives in the *same file* as an override and needs no component changes:
```css
:root[data-theme="dark"] {
  --color-base: #0E0E0D; --color-base-2: #161513; --color-base-3: #1E1C19;
  --color-ink: #ECE7DA; --color-ink-muted: #9A9284;
  --color-accent: #6C6BFF; --color-on-accent: #0E0E0D; /* re-verify AA on flip */
  --color-line: #ECE7DA; --color-line-soft: #2A2824;
}
```
(Dark palette is documented for future use; **ship light**. Re-run the contrast check if the dark theme is ever enabled.)

### 3.2 AA Contrast table (verified)

WCAG 2.1 relative-luminance method. Thresholds: **normal text ≥ 4.5**, **large text (≥24px, or ≥18.7px bold) ≥ 3.0**.

| Pair | Ratio | Normal AA | Large AA | Verdict / usage |
|---|---|---|---|---|
| Ink `#111110` on Base `#ECE7DA` | **15.3 : 1** | ✅ | ✅ | Body, headings — AAA. |
| Ink `#111110` on Base-2 `#E3DCCB` | **13.8 : 1** | ✅ | ✅ | Text on cards/panels. |
| Ink-muted `#57534A` on Base `#ECE7DA` | **6.2 : 1** | ✅ | ✅ | Meta, eyebrows, captions. |
| Accent `#1F1BEB` on Base `#ECE7DA` | **7.05 : 1** | ✅ | ✅ | Accent **text** on paper, links (≈AAA). |
| Accent `#1F1BEB` on Base-2 `#E3DCCB` | **6.4 : 1** | ✅ | ✅ | Accent text on panels. |
| On-accent `#F7F4EC` on Accent `#1F1BEB` | **7.9 : 1** | ✅ | ✅ | Text/UI **on** accent fills. |
| Base `#ECE7DA` on Accent `#1F1BEB` | **7.05 : 1** | ✅ | ✅ | Bone text on accent (also OK). |
| ~~Ink `#111110` on Accent `#1F1BEB`~~ | **2.17 : 1** | ❌ | ❌ | **FORBIDDEN** — never put ink on accent. |

Accent variant note: `#2D2BFF` (brighter end of the mandate range) measures **5.86:1** on base — still AA-normal, but we ship `#1F1BEB` for the stronger ~AAA 7:1 headroom.

### 3.3 Fluid type scale (clamp)

Named steps; fluid between 360px and 1440px viewports (root = 16px). vw term + rem intercept committed.

| Token | Role | `clamp()` | min→max px |
|---|---|---|---|
| `--fs-100` | mono eyebrow / label | `clamp(0.75rem, 0.708rem + 0.19vw, 0.875rem)` | 12 → 14 |
| `--fs-200` | small / meta | `clamp(0.8125rem, 0.771rem + 0.19vw, 0.9375rem)` | 13 → 15 |
| `--fs-300` | body | `clamp(1rem, 0.938rem + 0.28vw, 1.1875rem)` | 16 → 19 |
| `--fs-400` | lead / body-lg | `clamp(1.25rem, 1.125rem + 0.56vw, 1.625rem)` | 20 → 26 |
| `--fs-500` | h3 / card title | `clamp(1.625rem, 1.417rem + 0.93vw, 2.25rem)` | 26 → 36 |
| `--fs-600` | h2 | `clamp(2.125rem, 1.667rem + 2.04vw, 3.5rem)` | 34 → 56 |
| `--fs-700` | section display / h1 | `clamp(2.75rem, 1.833rem + 4.07vw, 5.5rem)` | 44 → 88 |
| `--fs-800` | display-lg | `clamp(3.75rem, 2.25rem + 6.67vw, 8.25rem)` | 60 → 132 |
| `--fs-900` | hero mega | `clamp(4.75rem, 2rem + 12.22vw, 13rem)` | 76 → 208 |

### 3.4 Spacing, layout, borders, shadows, motion, z-index

```css
:root {
  /* Spacing scale (8px base) */
  --space-1: .25rem; --space-2: .5rem;  --space-3: .75rem; --space-4: 1rem;
  --space-5: 1.5rem; --space-6: 2rem;   --space-7: 3rem;   --space-8: 4rem;
  --space-9: 6rem;   --space-10: 8rem;
  --space-section: clamp(4rem, 2rem + 8vw, 9rem);   /* vertical section rhythm */
  --gutter:        clamp(1.25rem, .5rem + 3vw, 5rem); /* horizontal page gutter */

  /* Containers / measure */
  --container:        90rem;  /* 1440 */
  --container-narrow: 60rem;  /* 960  */
  --measure:          68ch;   /* reading width */

  /* Borders — brutalist */
  --bw-hair: 1px; --bw: 2px; --bw-thick: 3px; --bw-brutal: 4px;
  --radius: 0;            /* sharp corners everywhere */
  --radius-pill: 999px;  /* single exception: nav pill, tag chips if desired */

  /* Hard shadows — NO blur (offset + spread 0) */
  --shadow-sm:     4px 4px 0 0 var(--color-ink);
  --shadow:        8px 8px 0 0 var(--color-ink);
  --shadow-lg:     12px 12px 0 0 var(--color-ink);
  --shadow-accent: 8px 8px 0 0 var(--color-accent);

  /* Easing — CSS cubic-bezier (for CSS transitions) */
  --ease-expo-out:     cubic-bezier(0.16, 1, 0.30, 1);   /* GSAP: "expo.out"  */
  --ease-power-out:    cubic-bezier(0.22, 1, 0.36, 1);   /* GSAP: "power4.out" */
  --ease-back-out:     cubic-bezier(0.34, 1.56, 0.64, 1);/* GSAP: "back.out(1.7)" */
  --ease-power-in-out: cubic-bezier(0.65, 0, 0.35, 1);   /* GSAP: "power2.inOut" */

  /* Durations */
  --dur-instant: .1s; --dur-fast: .2s; --dur-snappy: .3s;
  --dur-base: .45s;   --dur-slow: .6s; --dur-cinematic: .9s;

  /* Z-index layers */
  --z-base: 0; --z-content: 1; --z-rail: 20; --z-header: 90;
  --z-overlay: 100; --z-cursor: 9999;
}
```

**GSAP ease mirror** (`src/lib/gsap/easings.ts`) exports the string equivalents so JS and CSS stay in sync:
```ts
export const EASE = {
  expoOut: 'expo.out', powerOut: 'power4.out',
  backOut: 'back.out(1.7)', powerInOut: 'power2.inOut',
} as const;
export const DUR = { instant: .1, fast: .2, snappy: .3, base: .45, slow: .6, cinematic: .9 } as const;
```

---

## 4. Type System

**Families & Fontsource packages** (self-hosted, offline-safe):

| Role | Family (CSS) | Fontsource package | Weights / axes |
|---|---|---|---|
| Display + body | `'Bricolage Grotesque Variable'` | `@fontsource-variable/bricolage-grotesque` | Variable: `wght 200–800`, `opsz 12–96`, `wdth 75–100` |
| Labels / meta / mono | `'Space Mono'` | `@fontsource/space-mono` | Static `400`, `700` (+ italics) |

Import once in `src/styles/global.css` (or a `fonts.ts` imported by `main.tsx`):
```ts
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import '@fontsource/space-mono/400-italic.css';
```
Font-family tokens (added to `theme.css`):
```css
--font-display: 'Bricolage Grotesque Variable', 'Arial Narrow', system-ui, sans-serif;
--font-body:    'Bricolage Grotesque Variable', system-ui, sans-serif;
--font-mono:    'Space Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
```
Use `font-optical-sizing: auto` on display; `font-display: swap` (Fontsource default).

**Type-scale usage map:**

| Element | Step | Family | Weight | Case | Tracking | Leading |
|---|---|---|---|---|---|---|
| Hero mega name | `--fs-900` | display | 780–800 | UPPER | `-0.03em` | 0.86 |
| Section display / h1 | `--fs-700` | display | 700 | UPPER | `-0.02em` | 0.92 |
| h2 | `--fs-600` | display | 640 | UPPER/title | `-0.02em` | 0.95 |
| h3 / card title | `--fs-500` | display | 600 | title | `-0.01em` | 1.02 |
| Lead / statement | `--fs-400` | body | 440 | sentence | `-0.005em` | 1.2 |
| Body | `--fs-300` | body | 400 | sentence | `0` | 1.55 |
| Eyebrow / label / index | `--fs-100` | **mono** | 400/700 | UPPER | **`0.18em`** | 1 |
| Meta / period / tags | `--fs-200` | mono | 400 | UPPER | `0.12em` | 1.3 |

**Tracking rules:** display/headings = **tight** (negative); body = neutral; **mono labels = wide** (`0.12–0.2em`) and always `text-transform: uppercase`. This preserves the reference's "mono micro-caps vs black giant caps" contrast that reads as instant hierarchy.

---

## 5. Site Map & Section Flow

Ordered spine (justified adaptation of the suggested spine). Every profile block is placed (right column). Each section owns **one distinct "moment"** — no signature repeats (see §6 summary).

| # | Section (id) | Purpose / the moment it owns | Profile content mapped |
|---|---|---|---|
| 0 | `intro` | **Threshold ritual** — fast, skippable gate; brand name assembles from split units; curtain lifts. | Name, brand tagline (fragment) |
| 1 | `header` (nav) | Fixed brutalist nav; scroll-driven **active-section** highlight; magnetic links. | Nav |
| 2 | `hero` | **Pinned + scrub kinetic-type** — name scales/settles, tagline word-swaps, accent bloom. | Name, role, tagline, location, summary hook |
| 3 | `marquee` | **Scroll-velocity ticker** — skew/scale reacts to scroll speed. | Strengths + role keywords (`marqueeWords`) |
| 4 | `about` | **Line-mask clip reveal** of philosophy; one accent word spotlighted on scrub. Includes education credential + interests chips. | Summary, Philosophy, Education (LJIET), Interests |
| 5 | `expertise` | **Escalated semantic accordion** — batch stagger-in, accent flood on open, magnetic rows. | Areas of Expertise |
| 6 | `experience` | **Scrubbed timeline** — progress line draws, markers pop, bullets stagger. | Experience @ PrimeApps (role, bullets, clients, tech) |
| 7 | `projects` | **Horizontal-scroll pinned track** with real media placeholders + hover-distort. | Notable Projects (RN TV, LMS, MERN) |
| 8 | `skills` | **Pinned dual counter-marquee** (the reference's abandoned TechStack, done right) + "now learning" callout. | Skills: Frontend / Backend / Tools |
| 9 | `closing` | **Clip-path curtain WIPE** + typographic collapse of the brand tagline; magnetic contact; back-to-top. | Career Vision, Personal Brand tagline, Contact |

**Global reduced-motion & mobile notes** (per-section specifics in §6): all pins/scrubs degrade to static end-states under reduced-motion; the horizontal Projects track becomes a **native vertical stack** on coarse pointers and reduced-motion; every hover-gated reveal (About spotlight word, project distort, accordion quip) has a **tap or auto-in-view** fallback so mobile is never dead like the reference.

---

## 6. Per-Section Animation Spec

**Signature-uniqueness ledger** (proves no reveal is reused 3×):

| Section | UNIQUE signature | Core GSAP technique |
|---|---|---|
| intro | Counter + name-unit assembly + curtain lift | timeline, split units, `y`/clip |
| hero | Type scale/settle + tagline word-swap + accent bloom | **pin + scrub** timeline |
| marquee | Velocity-reactive skew/scale ticker | `quickTo` + ScrollTrigger velocity |
| about | Per-line clip mask + single accent-word spotlight | SplitText lines + scrub emphasis |
| expertise | Accent flood accordion + batch stagger | `ScrollTrigger.batch` + height auto tween |
| experience | Drawing timeline line + marker pop | scrub `drawSVG`-style scaleY + batch |
| projects | Horizontal pin translate + media parallax + distort | **pin + horizontal scrub** + skew distort |
| skills | Dual counter-marquee, scrubbed | **pin** + opposed `x` scrub |
| closing | Clip-path curtain wipe + tagline collapse | clip-path timeline + SplitText |

Nine distinct signatures. Requirement coverage: **(a) pinned+scrub** → hero, skills, projects; **(b) clip-path wipe** → closing (+ about line-masks, hero bloom); **(c) kinetic split-type** → intro, hero, about, closing; **(d) horizontal media track** → projects; **(e) velocity marquee** → marquee (+ skills); **(f) magnetic + distort + quickTo cursor** → header/expertise/projects/closing primitives; **(g) escalating variety** → the ledger above.

---

### 6.0 `intro` — Threshold gate
- **Layout.** Full-viewport `--color-ink` overlay (`z: var(--z-overlay)`); centered mono counter `000 → 100`; brand name `VRAJ PATEL` in `--color-on-accent` split into word/char units; small "ENTER" affordance + auto-advance.
- **Signature.** Counter ticks; name units rise+unblur into place; on complete (or click/skip) an **accent panel wipes up** (`clip-path` inset bottom→0) revealing the hero. Distinct from every later reveal.
- **Technique.** `useGSAP` timeline: `gsap.to(counter,{ innerText:100, snap:{innerText:1}, duration:1.1, ease:'power2.out' })`; name units `from({ yPercent:120, autoAlpha:0 }, { stagger:0.04, ease: EASE.expoOut })`; exit `clipPath` inset tween `0.7s power4.inOut`, then unmount. Body scroll locked via Lenis `stop()` until exit, then `start()`.
- **Trigger.** Mount-driven (no ScrollTrigger). Hard cap **~1.4s** then auto-exit; **Skip** button always present.
- **Timing/easing.** counter 1.1s `power2.out`; units `stagger 0.04, expo.out`; curtain 0.7s `power4.inOut`.
- **Reduced-motion.** No counter animation; name set to final; overlay fades out `0.25s` (or is skipped entirely). Scroll never locked > 200ms.
- **Mobile/touch.** Identical (not hover-gated). Tap anywhere = skip. Runs once per session (sessionStorage flag optional).

### 6.1 `header` — Nav
- **Layout.** Fixed pill/bar, `top: var(--space-4)`, centered; monogram `VP` (mono) + nav items (`<a>`), + magnetic "Resume" button. `z: var(--z-header)`.
- **Signature.** On scroll past hero, chrome crossfades to `--color-base-2` + `--bw` ink border + `--shadow-sm` (brutalist framed pill). **Active section** gets an accent underline that slides between items (FLIP/`x`+`width` tween). Links are **magnetic**.
- **Technique.** One ScrollTrigger toggles a `.is-scrolled` class at `start: 'top top-=80'`. Active underline: `useActiveSection()` → `gsap.to(indicator,{ x, width, duration:0.35, ease:EASE.powerOut })`. Nav click → `lenis.scrollTo('#id', { offset:-80 })`.
- **Trigger.** `start: 'top top-=80'` (chrome); active state from each section's ScrollTrigger `onToggle`.
- **Timing/easing.** chrome `--dur-snappy` `--ease-power-out`; underline 0.35s `power4.out`.
- **Reduced-motion.** Underline jumps (no tween); chrome crossfade kept (cheap, non-vestibular) or set instantly.
- **Mobile.** Collapses to monogram + a `<button aria-expanded>` menu (full-screen sheet, focus-trapped); nav is real `<a>` — keyboard operable. No hover dependence.

### 6.2 `hero` — Pinned scrub kinetic-type (SIGNATURE / big one)
- **Layout.** `100vh`, pinned. Oversized name `--fs-900` (two lines `VRAJ` / `PATEL`), mono eyebrow = brand tagline fragment, role line `--fs-400`, scroll hint. An accent shape (block/underline) behind/through the name.
- **Signature.** As you scroll the pinned range: the name **settles** (slight scale-down + letterspacing tighten + `yPercent` drift apart), the **role word-swaps** through 3 role facets ("FULL STACK" → "REACT NATIVE" → "PRODUCT-MINDED"), and an **accent bloom** grows behind the name (`clip-path: circle()` from 0 → full) — the reference's spotlight generalized to a scrubbed, viewport-scale event (no hover needed).
- **Technique.** `ScrollTrigger` `{ pin:true, scrub:0.6, start:'top top', end:'+=120%' }` driving one timeline: name `scale 1.06→1`, letterSpacing `0→-0.03em`, split lines `yPercent ±6`; role text steps via `SplitText` word-swap keyed to timeline labels; accent bloom `clipPath circle(0%)→circle(140%)`. Entrance (pre-pin) name lines `from yPercent:110` on load via `useGSAP`.
- **Trigger.** `start:'top top'`, `end:'+=120%'`, `scrub:0.6`.
- **Timing/easing.** Scrub-linked (no fixed duration); entrance lines `0.9s expo.out stagger 0.08`; role-swap segments eased `power2.inOut` within the scrub.
- **Reduced-motion.** No pin, no scrub. Name set to final state; role shows first facet only (static); bloom rendered at a fixed subtle state; entrance = simple 0.3s fade. Section is normal-height.
- **Mobile/touch.** Keep the pin+scrub (works with touch scroll via Lenis/native), but shorten `end:'+=80%'` and reduce bloom size for perf; scroll hint tappable to advance.

### 6.3 `marquee` — Scroll-velocity ticker
- **Layout.** Full-bleed band, `--color-ink` background, `--color-on-accent`/`--color-base` giant mono/display words separated by an accent bullet glyph; 1–2 rows.
- **Signature.** Base auto-scroll; **scroll velocity skews and boosts** the marquee (`skewX` + speed proportional to `ScrollTrigger.getVelocity`), and direction flips with scroll direction. The band reads as a live "stock ticker" of Vraj's strengths/keywords.
- **Technique.** Seamless loop via `gsap.to(row,{ xPercent:-50, repeat:-1, duration, ease:'none' })` (content duplicated ×2). A ScrollTrigger `onUpdate` reads `self.getVelocity()`, mapped to `skewX` and a `timeScale` boost applied with `gsap.quickTo(row,'skewX')` and `tl.timeScale()`; eases back to 1 on idle.
- **Trigger.** `start:'top bottom'`, `end:'bottom top'` (active while in view); velocity sampled each update.
- **Timing/easing.** Loop `ease:'none'`; skew `quickTo` `0.4s power3`; timeScale lerps back to 1 over ~0.6s.
- **Reduced-motion.** No auto-scroll, no velocity skew. Render a **static** single-line band (words comma-joined), fully legible.
- **Mobile.** Keep auto-scroll (CSS/GSAP) but drop velocity sampling if `pointer:coarse` for perf; still animates, just no skew.

### 6.4 `about` — Line-mask clip reveal + accent spotlight
- **Layout.** Narrow measure (`--measure`) statement (`--fs-400`), section label "01 / ABOUT", a right-column meta stack: **Education** card (LJIET, B.E. Computer Engineering) + **Interests** chips (mono). Philosophy quote emphasized.
- **Signature.** The philosophy statement reveals **line by line** via clip mask (each line wipes up from a hidden inner span); as the last line lands, **one keyword** ("memorable" / "purpose") **fills with accent** on a scrub-linked emphasis. Distinct from hero (no scale/pin) and from marquee.
- **Technique.** `useSplitText(ref,{type:'lines'})` → per-line `from({ yPercent:110 })` with outer `overflow:hidden`, `ScrollTrigger.batch` for stagger. Accent word wrapped in a `<mark>`; a second ScrollTrigger `scrub` animates its `background-size 0→100%` (accent) or color `ink→accent`. Interest chips + education card `Reveal` (batch fade-up).
- **Trigger.** Lines `start:'top 78%'` (once); accent word `start:'top 60%' end:'top 40%' scrub:true`.
- **Timing/easing.** Lines `0.7s expo.out stagger 0.09`; chips `0.5s power2.out stagger 0.05`; accent word scrub-linked.
- **Reduced-motion.** Lines set visible (no clip); accent word rendered pre-filled (accent color static); chips/card appear with no transform.
- **Mobile/touch.** All in-view driven (no hover) → identical payoff on touch. Accent word auto-fills in-view (no hover needille).

### 6.5 `expertise` — Escalated semantic accordion
- **Layout.** Full-width rows (Areas of Expertise), `border-top: var(--bw) solid var(--color-line)`; each row = index (mono) + title (`--fs-500/600`) + `+` toggle; expandable body with blurb.
- **Signature.** Rows **stagger in** on enter (batch); on open, the row **floods accent** (background wipe L→R via `clip-path`, text → `--color-on-accent`) — the reference's flood, but as a real GSAP height-auto reveal on a semantic `<button>`, with a **magnetic** hover on the toggle. Escalation over About: color takeover, not just type.
- **Technique.** `AccordionRow` = `<button aria-expanded>` controlling a body. Open: measure target height, `gsap.fromTo(body,{height:0},{height:'auto'... }` then set `height:auto`); flood = `clip-path inset(0 100% 0 0)→inset(0)` `0.4s power4.out`. Rows enter via `ScrollTrigger.batch(rows,{ onEnter: b=>gsap.to(b,{yPercent:0,autoAlpha:1,stagger:0.08}) })`.
- **Trigger.** Batch `start:'top 85%'`; open/close = interaction (not scroll).
- **Timing/easing.** enter `0.6s power4.out stagger 0.08`; flood/height `--dur-base` `--ease-power-out`; toggle icon rotate `--dur-snappy`.
- **Reduced-motion.** No stagger/flood transform; open = instant show (height auto set, no tween); rows visible immediately.
- **Mobile/touch.** `<button>` = tap opens (no hover needed). Magnetic disabled on coarse pointers; flood still plays on tap. Full keyboard + SR support via `aria-expanded`/`aria-controls`.

### 6.6 `experience` — Scrubbed timeline
- **Layout.** Left vertical **progress line** (2px ink) with accent markers per role; right column = PrimeApps role, period (mono), client note (SportsGrid), **Key Responsibilities** bullets, **tech** pills. (Data-driven array; currently one primary role.)
- **Signature.** The vertical line **draws** (scaleY 0→1) as the section scrolls; each **marker pops** (scale + accent fill) as its role scrolls into the active band; bullets **stagger** in. Distinct: a scrubbed "draw," not a clip or flood.
- **Technique.** Line: `gsap.fromTo(line,{scaleY:0},{scaleY:1, ease:'none', scrollTrigger:{ scrub:true, start:'top 70%', end:'bottom 70%' }})` (transform-origin top). Markers: per-marker ScrollTrigger `start:'top 60%'` → `scale 0→1 back.out`, `backgroundColor → accent`. Bullets `ScrollTrigger.batch` fade-up.
- **Trigger.** Line scrub across section; markers/bullets `start:'top 65–70%'`.
- **Timing/easing.** line scrub-linked; marker `0.4s back.out(1.7)`; bullets `0.5s power2.out stagger 0.06`.
- **Reduced-motion.** Line rendered full (scaleY 1, static); markers pre-filled; bullets visible, no stagger.
- **Mobile.** Line moves to far-left gutter; same scrub (cheap). Tech pills wrap. No hover dependence.

### 6.7 `projects` — Horizontal-scroll pinned track (SIGNATURE / media)
- **Layout.** Pinned `100vh`; a horizontal **track** of full-bleed `ProjectCard`s (RN TV App, LMS, MERN) each with **media placeholder** (image/video), title `--fs-700`, blurb, tags, links. A mono progress counter "01/03".
- **Signature.** Vertical scroll translates the track **sideways** (`x`); media **parallaxes** within each card; hovering a card applies a **distortion** (skewX + subtle scale + accent edge) and the cursor swaps to **"VIEW"**. Fixes the reference's "no visuals" gap; unique horizontal motion.
- **Technique.** `ScrollTrigger` `{ pin:true, scrub:0.8, end: () => '+=' + track.scrollWidth }` with `gsap.to(track,{ x: () => -(track.scrollWidth - innerWidth) })`. Per-card media parallax = nested tween on the same scrub (`xPercent` small). Hover distort via `useMagnetic`/`quickTo` `skewX` + `scale`; cursor `setCursor('view','VIEW')`. Media lazy: `<video preload="none" poster>` played via IntersectionObserver; `<img loading="lazy">`.
- **Trigger.** `start:'top top'`, `end` = track width; parallax on same scrub.
- **Timing/easing.** track scrub `0.8`; distort `quickTo 0.3s power3`; entrance of first card `0.7s expo.out`.
- **Reduced-motion.** **No pin, no horizontal scrub.** Track becomes a **vertical stack** of cards (CSS `flex-direction:column`), each a static `Reveal` fade-up; media shows poster (video not autoplayed).
- **Mobile/touch (critical).** On `pointer:coarse` **default to the vertical stack** (horizontal pin is awkward on touch) OR a native `scroll-snap` horizontal carousel — plan ships **vertical stack** for reliability. Distort → replaced by an always-visible accent edge; "VIEW" affordance = a visible tap target/link. Media taps to open live/source.

### 6.8 `skills` — Pinned dual counter-marquee (TechStack, done right)
- **Layout.** Pinned `~200vh` scroll range; two rows of skill tokens (Frontend / Backend / Tools) with a centered category heading; edge fade masks (`mask-image` gradient) — **using our tokens, no undefined classes, on-palette** (the reference's failure fixed).
- **Signature.** Row A slides ← and Row B slides → **scrubbed by scroll progress** (not time); the centered category label **flips** (RollingText) between "FRONTEND / BACKEND / TOOLS" at progress thresholds; a "NOW LEARNING → REDIS" accent tag pulses in. This is the reference's abandoned `TechStack` reborn with a real pin + real palette.
- **Technique.** `ScrollTrigger { pin:true, scrub:true, start:'top top', end:'+=150%' }`; `gsap.to(rowA,{ xPercent:-30 })`, `gsap.to(rowB,{ xPercent:30 })` on the scrub; category label swapped at `onUpdate` progress bands (0–.33/.33–.66/.66–1). Edge masks pure CSS.
- **Trigger.** `start:'top top'`, `end:'+=150%'`, `scrub:true`.
- **Timing/easing.** scrub-linked; label flip `0.4s power3.out`; learning-tag `0.5s back.out`.
- **Reduced-motion.** No pin/scrub. Render three static labeled grids (Frontend/Backend/Tools) of tokens; no marquee motion.
- **Mobile.** Keep pin+scrub (short `end:'+=120%'`) OR degrade to three stacked static grids on coarse pointers (perf). Plan: **static grids** on coarse pointers.

### 6.9 `closing` — Clip-path curtain wipe + contact
- **Layout.** Full-viewport. The **brand tagline** ("Engineering with precision. Designing with purpose. Building experiences that people remember.") as huge `--fs-700/800` display; Career Vision as a lead paragraph; contact links (email/phone/LinkedIn/GitHub/resume) as magnetic rows; a **back-to-top** control; footer meta (location, year).
- **Signature.** Entering the section, an **accent panel wipes across** (`clip-path` inset, curtain) and hands off to the outro — a full-section version of the reference's `circle()` reveal, used **once** as the finale. The tagline then **collapses/assembles** via SplitText (words drop into place), and one clause fills accent. Contact links are magnetic with context labels ("MESSAGE" / "CALL" / "SOURCE").
- **Technique.** Section-enter timeline: accent overlay `clipPath inset(0 0 100% 0)→inset(0)` then `→inset(0 0 0 100%)` off (curtain in/out) `0.7s power4.inOut`; tagline `useSplitText('words')` `from yPercent:120 stagger:0.05`; accent clause color scrub. Contact rows = `MagneticButton`/`Magnetic` + `setCursor('click', label)`. Back-to-top → `lenis.scrollTo(0)`.
- **Trigger.** Curtain `start:'top 90%'` (once); tagline `start:'top 75%'`; clause `scrub` `top 60%→top 45%`.
- **Timing/easing.** curtain `0.7s power4.inOut`; tagline `0.7s expo.out stagger 0.05`; links hover `--dur-fast`.
- **Reduced-motion.** No curtain wipe (overlay skipped); tagline set visible; clause pre-filled; contact links static (magnetic off). Back-to-top = native jump.
- **Mobile/touch.** In-view driven → full payoff on touch. Magnetic off on coarse; links are large tap targets with visible labels. Real `<a href="mailto:/tel:/...">`.

---

## 7. Component Inventory (DRY)

### 7.1 Folder structure (feature + atomic)
```
src/
  main.tsx
  App.tsx                      # composes providers + sections in order
  vite-env.d.ts
  styles/
    theme.css                  # THE token file (§3) — imported first
    global.css                 # reset, base element styles, font imports, selection, focus-visible
  lib/
    gsap/
      register.ts              # registerGsap() — plugins once
      easings.ts               # EASE / DUR string mirror of tokens
      splitText.ts             # SplitText loader + custom fallback splitter
    utils/
      math.ts                  # clamp, lerp, mapRange
      dom.ts                   # rect helpers (rAF-batched)
  hooks/
    useReducedMotion.ts
    useIsCoarsePointer.ts
    useLenis.ts                # consumes SmoothScroll context
    useMagnetic.ts
    useSplitText.ts
    useActiveSection.ts
  context/
    CursorContext.tsx
    ActiveSectionContext.tsx
  components/
    providers/
      SmoothScrollProvider.tsx # Lenis + ScrollTrigger wiring
      AppProviders.tsx         # registerGsap + SmoothScroll + Cursor + ActiveSection
    primitives/
      Cursor/                  Cursor.tsx + Cursor.module.css
      Magnetic/                Magnetic.tsx, MagneticButton.tsx + .module.css
      Section/                 Section.tsx + .module.css
      AnimatedText/            SplitReveal.tsx + .module.css
      Marquee/                 Marquee.tsx (Ticker) + .module.css
      Reveal/                  Reveal.tsx + .module.css
      AccordionRow/            AccordionRow.tsx + .module.css
      ProjectCard/             ProjectCard.tsx + .module.css
      SectionLabel/            SectionLabel.tsx + .module.css
      ScrollProgress/          ScrollProgress.tsx + .module.css  (side rail/index)
    sections/
      Intro/  Header/  Hero/  MarqueeBand/  About/  Expertise/
      Experience/  Projects/  Skills/  Closing/     # each: X.tsx + X.module.css
  data/
    content.ts                 # typed content (§9)
public/
  media/projects/{tv-app,lms,mern}.{jpg,webp,mp4}   # placeholders
  vraj-patel-resume.pdf                              # placeholder
```

### 7.2 Shared primitive prop interfaces (sketched TS)

```ts
// --- Cursor (state lives in CursorContext; see §8) ---
export type CursorVariant =
  | 'default' | 'hover' | 'view' | 'drag' | 'click' | 'text' | 'hidden';

// --- Magnetic wrappers ---
export interface MagneticProps {
  children: React.ReactElement;         // single enhanced child
  strength?: number;                    // pull factor 0..1, default 0.35
  radius?: number;                      // activation radius px, default 120
  disabled?: boolean;                   // auto-true on coarse pointer / reduced-motion
}
export interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number;
  cursorLabel?: string;                 // sets cursor 'click' + label on hover
  variant?: 'solid' | 'outline';        // solid = accent fill (on-accent text)
}

// --- Section semantic wrapper ---
export interface SectionProps {
  id: string;
  index?: number;                       // "01" numbering
  label?: string;                       // eyebrow (mono)
  as?: 'section' | 'header' | 'footer';
  reveal?: 'none' | 'fade' | 'clip' | 'lines';
  registerActive?: boolean;             // default true → drives ActiveSection
  className?: string;
  children: React.ReactNode;
}

// --- Kinetic split-type ---
export type SplitBy = 'chars' | 'words' | 'lines';
export interface SplitRevealProps {
  as?: React.ElementType;               // 'h1' | 'h2' | 'p' | ...
  children: string;                     // plain text (kept as SR-only original)
  splitBy?: SplitBy;                    // default 'words'
  stagger?: number;                     // default 0.06
  duration?: number;                    // default 0.7
  ease?: string;                        // default EASE.expoOut
  y?: number;                           // initial yPercent, default 110
  skew?: number;                        // deg, default 0
  trigger?: 'inview' | 'mount' | 'scrub';
  start?: string;                       // ScrollTrigger start, default 'top 80%'
  className?: string;
}

// --- Marquee / Ticker ---
export interface MarqueeProps {
  items: React.ReactNode[];
  speed?: number;                       // base px/s, default 60
  direction?: 'left' | 'right';         // default 'left'
  velocityFactor?: number;              // scroll-velocity skew/boost, default 0.1
  separator?: React.ReactNode;          // accent bullet by default
  className?: string;
}

// --- Reveal (batch entrance) ---
export interface RevealProps {
  children: React.ReactNode;
  as?: React.ElementType;
  variant?: 'fade' | 'up' | 'clip' | 'scale';   // default 'up'
  delay?: number;
  stagger?: number;                     // stagger direct children
  batch?: boolean;                      // ScrollTrigger.batch sibling group
  start?: string;                       // default 'top 85%'
}

// --- Accordion (semantic) ---
export interface AccordionRowProps {
  index: number;
  title: string;
  meta?: string;
  defaultOpen?: boolean;
  cursorLabel?: string;                 // default 'OPEN'
  children: React.ReactNode;            // body content
}

// --- Project card (media + distort) ---
export interface ProjectCardProps {
  project: Project;                     // from content types (§9)
  index: number;
  total: number;
  distort?: boolean;                    // hover displacement, default true (off on coarse)
}

// --- Section label / index ---
export interface SectionLabelProps {
  index?: number;
  align?: 'left' | 'right';
  children: React.ReactNode;
}

// --- Scroll progress rail / index ---
export interface ScrollProgressProps {
  sections: ReadonlyArray<{ id: string; label: string }>;
}
```

### 7.3 Hooks (signatures)
```ts
export function useReducedMotion(): boolean;                       // live matchMedia
export function useIsCoarsePointer(): boolean;                     // '(pointer: coarse)'
export function useLenis(): import('lenis').default | null;        // from provider
export function useMagnetic<T extends HTMLElement>(
  opts?: { strength?: number; radius?: number; disabled?: boolean }
): React.RefObject<T | null>;                                      // quickTo-driven, no state
export function useSplitText(
  ref: React.RefObject<HTMLElement | null>,
  opts: { type: SplitBy; deps?: unknown[] }
): { lines: HTMLElement[]; words: HTMLElement[]; chars: HTMLElement[]; revert: () => void };
export function useActiveSection(): string;                        // current section id
```

### 7.4 Feature/section components
`Intro`, `Header`, `Hero`, `MarqueeBand`, `About`, `Expertise`, `Experience`, `Projects`, `Skills`, `Closing` — each composes primitives, owns a `*.module.css`, reads from `data/content.ts`, and wires its §6 spec via `useGSAP` scoped to its root ref.

### 7.5 Providers
`AppProviders` = `registerGsap()` (side-effect) → `SmoothScrollProvider` → `CursorProvider` → `ActiveSectionProvider` → children. `App.tsx` renders `<AppProviders>` then `<Cursor/>`, `<ScrollProgress/>`, `<Header/>`, `<main>` with sections in spine order, and mounts `<Intro/>` above everything until dismissed.

---

## 8. State Design (React Context only)

**Two tiny cross-cutting signals — nothing else needs global state.**

**`CursorContext`** — holds the *discrete* cursor mode (not position; position is `quickTo`, never React state):
```ts
export interface CursorState { variant: CursorVariant; label: string; }
export interface CursorContextValue extends CursorState {
  setCursor: (variant: CursorVariant, label?: string) => void;
  reset: () => void;                    // → { variant:'default', label:'' }
}
```
Value memoized; `setCursor`/`reset` are stable `useCallback`s. Hover handlers across the app call `setCursor('view','VIEW')` / `setCursor('click','MESSAGE')` etc. Only the single `<Cursor/>` consumer re-renders, and only on discrete enter/leave — **not per frame**. (Uses a string-literal union, **not** a TS `enum`, per `erasableSyntaxOnly`.)

**`ActiveSectionContext`** — holds the current section id for nav highlighting:
```ts
export interface ActiveSectionValue {
  activeId: string;
  setActiveId: (id: string) => void;
}
```
Each `Section` (when `registerActive`) creates a ScrollTrigger `{ start:'top center', end:'bottom center', onToggle: self => self.isActive && setActiveId(id) }`. `Header` + `ScrollProgress` call `useActiveSection()` to drive the underline/rail. Writes are infrequent (once per section crossing), so no render storm.

**Why no Zustand/Redux.** Exactly two write-rarely signals, each consumed by 1–2 components; the heavy, high-frequency data (cursor XY, scroll progress, magnetic offsets) is deliberately kept **out of React** in GSAP `quickTo`/ScrollTrigger. A store would add a dependency and a second state paradigm for zero benefit. Two narrow, memoized contexts are the minimal correct tool.

---

## 9. Content Schema — `src/data/content.ts`

Full types + a filled object mirroring the profile. Real copy is a drop-in replacement (swap string values; structure stays). Placeholders (email/phone/links/media) are marked `// TODO`. Compiles under `verbatimModuleSyntax` (type-only exports) and `erasableSyntaxOnly` (no enums).

```ts
// ---------- Types ----------
export interface NavItem { id: string; label: string; }

export interface Brand {
  name: string; firstName: string; lastName: string;
  role: string; roleFacets: string[];           // hero word-swap
  tagline: string;                              // the personal brand line
  taglineParts: [string, string, string];       // for split emphasis
  location: string; summary: string;
}

export interface EducationItem { degree: string; field: string; school: string; short: string; }

export interface AboutContent {
  lead: string; philosophy: string;
  education: EducationItem;
  interests: string[]; strengths: string[];
}

export interface ExperienceItem {
  company: string; role: string; period: string; location: string;
  clients?: string[]; summary: string; bullets: string[]; tech: string[];
}

export interface SkillGroup { label: string; items: string[]; }
export interface Skills { frontend: SkillGroup; backend: SkillGroup; tools: SkillGroup; learning: string[]; }

export interface ExpertiseItem { title: string; blurb: string; }

export interface ProjectMedia { type: 'image' | 'video'; src: string; poster?: string; alt: string; }
export interface ProjectLinks { live?: string; source?: string; }
export interface Project {
  id: string; title: string; year: string; role: string;
  blurb: string; tags: string[]; media: ProjectMedia; links: ProjectLinks;
}

export interface Contact {
  email: string; phone: string;
  linkedin: string; github: string; resume: string; location: string;
}

export interface SiteContent {
  brand: Brand;
  nav: NavItem[];
  marqueeWords: string[];
  about: AboutContent;
  experience: ExperienceItem[];
  skills: Skills;
  expertise: ExpertiseItem[];
  projects: Project[];
  vision: string;
  contact: Contact;
}

// ---------- Data ----------
export const content: SiteContent = {
  brand: {
    name: 'Vraj Patel', firstName: 'Vraj', lastName: 'Patel',
    role: 'Full Stack Software Developer',
    roleFacets: ['FULL STACK', 'REACT NATIVE', 'PRODUCT-MINDED'],
    tagline: 'Engineering with precision. Designing with purpose. Building experiences that people remember.',
    taglineParts: [
      'Engineering with precision.',
      'Designing with purpose.',
      'Building experiences that people remember.',
    ],
    location: 'Ahmedabad, Gujarat, India',
    summary:
      'Full Stack Software Developer building production web, mobile, and TV apps with modern JavaScript — focused on scalable architecture, maintainable code, and interfaces people remember.',
  },

  nav: [
    { id: 'about', label: 'About' },
    { id: 'expertise', label: 'Expertise' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Work' },
    { id: 'skills', label: 'Stack' },
    { id: 'closing', label: 'Contact' },
  ],

  marqueeWords: [
    'REACT', 'NEXT.JS', 'REACT NATIVE', 'ANDROID TV', 'NODE.JS', 'MONGODB',
    'DETAIL-ORIENTED', 'FAST LEARNER', 'PERFORMANCE', 'MERN', 'TYPESCRIPT',
  ],

  about: {
    lead:
      'I build modern digital products that combine clean engineering with exceptional user experiences — production-ready web, mobile, and TV apps across the modern JavaScript ecosystem.',
    philosophy:
      'Exceptional software is created through a balance of engineering excellence and thoughtful design. Every animation, interaction, loading state, and user flow should have a purpose. I build products people enjoy using — not just products that function correctly.',
    education: {
      degree: 'Bachelor of Engineering',
      field: 'Computer Engineering',
      school: 'LJ Institute of Engineering & Technology (LJIET)',
      short: 'B.E. Computer Engineering · LJIET',
    },
    interests: [
      'Artificial Intelligence', 'Product Development', 'Backend Engineering',
      'UI/UX Design', 'Motion Design', 'Photography', 'Modern Web',
    ],
    strengths: [
      'Analytical thinking', 'Fast learner', 'Detail-oriented',
      'Adaptable', 'Collaborative', 'Continuous improvement',
    ],
  },

  experience: [
    {
      company: 'PrimeApps',
      role: 'Full Stack Developer / React Native Developer',
      period: 'Present',
      location: 'Ahmedabad, India',
      clients: ['SportsGrid, Inc.'],
      summary:
        'Built and maintained production applications for real-world clients across web, mobile, and Android TV platforms.',
      bullets: [
        'Developed and maintained React Native apps for mobile and Android TV.',
        'Contributed to applications for SportsGrid, Inc.',
        'Built responsive frontend interfaces with React and Next.js.',
        'Developed backend APIs with Node.js and Express.js.',
        'Worked with MongoDB and RESTful API integrations.',
        'Implemented authentication systems and secure user flows.',
        'Integrated CMS platforms and modern development tooling.',
        'Owned debugging, optimization, feature work, and production deploys.',
      ],
      tech: ['React Native', 'React', 'Next.js', 'Node.js', 'Express.js', 'MongoDB', 'Payload CMS'],
    },
  ],

  skills: {
    frontend: { label: 'Frontend', items: ['React', 'Next.js', 'React Native', 'JavaScript (ES6+)', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS'] },
    backend:  { label: 'Backend',  items: ['Node.js', 'Express.js', 'REST APIs', 'MongoDB', 'Auth & Authorization'] },
    tools:    { label: 'Tools & Platforms', items: ['Git', 'GitHub', 'Firebase', 'Cloudinary', 'Payload CMS', 'Vite', 'npm', 'pnpm'] },
    learning: ['Redis'],
  },

  expertise: [
    { title: 'Full Stack Web Development', blurb: 'End-to-end products from data model to interface, MERN and Next.js.' },
    { title: 'Cross-platform Mobile Development', blurb: 'React Native apps that ship to mobile and Android TV from one codebase.' },
    { title: 'React Native TV Development', blurb: 'Media-rich, performance-tuned TV experiences and focus navigation.' },
    { title: 'API Development', blurb: 'RESTful APIs with Node.js/Express, auth, and clean integration contracts.' },
    { title: 'Performance Optimization', blurb: 'Profiling, rendering, and delivery work that makes products feel instant.' },
    { title: 'Responsive UI Development', blurb: 'Interfaces that hold up from small screens to the living-room ten-foot view.' },
    { title: 'Database Integration', blurb: 'MongoDB modeling, queries, and reliable data flows.' },
    { title: 'Modern JavaScript Ecosystem', blurb: 'TypeScript-first, current tooling, maintainable architecture.' },
  ],

  projects: [
    {
      id: 'rn-tv',
      title: 'React Native TV Application',
      year: '2024', role: 'UI · API · Performance',
      blurb: 'A television application focused on performance, usability, and media-rich experiences — UI development, API integration, performance improvements, feature work, and bug fixing.',
      tags: ['React Native', 'Android TV', 'Performance', 'Media'],
      media: { type: 'video', src: '/media/projects/tv-app.mp4', poster: '/media/projects/tv-app.jpg', alt: 'React Native TV application interface' }, // TODO real media
      links: {}, // TODO
    },
    {
      id: 'lms',
      title: 'Learning Management System',
      year: '2023', role: 'Frontend',
      blurb: 'Frontend for an LMS: responsive layouts, authentication flows, interactive dashboards, and a modern React architecture.',
      tags: ['React', 'Auth', 'Dashboards', 'Responsive'],
      media: { type: 'image', src: '/media/projects/lms.jpg', alt: 'Learning Management System dashboard' }, // TODO real media
      links: {}, // TODO
    },
    {
      id: 'mern',
      title: 'Full Stack MERN Applications',
      year: '2023', role: 'Full Stack',
      blurb: 'Complete web apps in MongoDB, Express, React, Node — authentication, CRUD, REST APIs, and reusable component architecture.',
      tags: ['MongoDB', 'Express', 'React', 'Node.js'],
      media: { type: 'image', src: '/media/projects/mern.jpg', alt: 'MERN stack web application' }, // TODO real media
      links: {}, // TODO
    },
  ],

  vision:
    'My long-term objective is to build impactful software that reaches millions — growing as a full stack engineer while exploring AI-powered applications, scalable systems, and premium digital experiences.',

  contact: {
    email: 'hello@vrajpatel.dev',                 // TODO real
    phone: '+91 00000 00000',                     // TODO real
    linkedin: 'https://linkedin.com/in/vrajpatel',// TODO real
    github: 'https://github.com/vrajpatel',       // TODO real
    resume: '/vraj-patel-resume.pdf',             // TODO real
    location: 'Ahmedabad, Gujarat, India',
  },
};
```

**Media/assets location.** Placeholders live in `public/media/projects/` (`tv-app.mp4`+`.jpg` poster, `lms.jpg`, `mern.jpg`) and `public/vraj-patel-resume.pdf`. Ship lightweight placeholder art (solid bone/ultramarine frames labeled with the project name) so the build renders before real media exists.

---

## 10. Dependencies to install (bun)

```bash
# Motion engine
bun add gsap @gsap/react lenis

# Self-hosted fonts
bun add @fontsource-variable/bricolage-grotesque @fontsource/space-mono
```
- **No extra `@types`** needed: `gsap` and `lenis` ship their own types; `@gsap/react` is typed; Fontsource packages are CSS-only. `@types/node` is already present (dev).
- **SplitText:** part of the free public `gsap` package since **3.13 (2025)** → `import { SplitText } from 'gsap/SplitText'`. **Do not** depend on Club/bonus plugins. If the installed `gsap` predates 3.13 or the import fails, the build uses our **custom splitter fallback** (`lib/gsap/splitText.ts`, §2) — same API, zero paid dependency. Verify the plugin's presence at build; either path works.
- **Do NOT install:** tailwind, framer-motion, zustand, redux, react-router-dom, react-snowfall (reference dead weight — explicitly excluded).
- **tsconfig:** enable `"strict": true` + `"noUncheckedIndexedAccess": true` in `tsconfig.app.json` (Build Order Step 0).

---

## 11. Performance & A11y Plan

**Performance**
- **Cursor & magnetics via `gsap.quickTo`/`quickSetter`** — position, magnetic offset, distort skew all animate on GSAP's ticker, **zero React state per frame** (directly fixes the reference's `setState`-per-`mousemove`). Only discrete variant/label are in Context.
- **`ScrollTrigger.batch`** for all multi-element entrance reveals (about lines, expertise rows, experience bullets, interest chips) — one observer, staggered, instead of N triggers.
- **Below-the-fold triggers are lazy by nature** (ScrollTrigger only fires in range); heavy sections (`projects`, `skills`) pin/scrub only while active. `ScrollTrigger.config({ ignoreMobileResize:true })`; `ScrollTrigger.refresh()` after fonts load.
- **`will-change` discipline:** applied only to elements mid-animation, removed on complete (GSAP does this for transforms; add/remove class for pinned wrappers). Prefer `transform`/`opacity`/`clip-path` (compositor-friendly) — no animating layout props except the intentional accordion `height:auto` (measured, then set to auto).
- **Cleanup via `useGSAP({ scope })`** — every section scopes its animations to its root ref; auto-revert on unmount, StrictMode-safe (React 19 double-invoke). Lenis + ticker torn down in provider cleanup.
- **Media:** `<img loading="lazy" decoding="async">`, responsive `srcset`/`width`+`height` to reserve space (no CLS); project `<video preload="none" poster muted playsInline>` played/paused by IntersectionObserver; only the in-view project video decodes.
- **Fonts:** self-hosted (Fontsource) → no third-party RTT; `font-display: swap`; variable Bricolage = one file for all display weights. Preload the two most-used faces if needed.
- **Lighthouse targets:** Performance ≥ 90, Accessibility ≥ 95, Best-Practices ≥ 95, SEO ≥ 90 (desktop; mobile Perf ≥ 80 given the pinned scenes).

**Accessibility**
- **Semantic HTML:** `<header><nav>`, `<main>`, `<section aria-labelledby>`, `<footer>`; correct heading order (one `<h1>` in hero, `<h2>` per section). Accordions are `<button aria-expanded aria-controls>` + region — **keyboard operable and SR-announced** (fixing the reference's `<div onClick>`). Nav items are real `<a>`; menu toggle has `aria-expanded` and traps focus when open.
- **Focus-visible system:** a clear `:focus-visible` ring in `--color-accent` (2px offset outline) on every interactive element — required because the custom cursor uses `cursor:none` on fine pointers. Never `cursor:none` without this.
- **Keyboard:** full tab order; accordions toggle on Enter/Space; nav anchors + skip-link to `#main`; back-to-top is a `<button>`.
- **Reduced motion:** the single `gsap.matchMedia` gate (§2) swaps every scrub/pin/loop for instant end-states; Lenis disabled; marquees static. No content is ever hidden behind an animation that won't run.
- **Coarse-pointer / touch:** `useIsCoarsePointer` disables the custom cursor (native pointer restored) and magnetics; **every hover-gated reveal has a tap or auto-in-view equivalent** (About accent word auto-fills, project cards show visible affordances + tap to open, accordions tap-open) so mobile gets the full payoff — the reference's biggest failure, fixed.
- **Color/contrast:** all pairings AA-verified (§3.2); accent-on-accent-text rule enforced; `prefers-contrast` honored via slightly stronger `--color-ink-muted` if needed.
- **Media a11y:** every image has meaningful `alt`; decorative overlays `aria-hidden`; project videos are muted/decorative with captions/labels in text; the SR-only original text is preserved wherever SplitText fragments the DOM.

---

## 12. Build Order (turn-key sequence for Stage 4)

1. **Config & tokens.** Enable `strict` + `noUncheckedIndexedAccess` in `tsconfig.app.json`. `bun add` all deps (§10). Author `styles/theme.css` (all §3 tokens) and `styles/global.css` (reset, base element styles, font imports, `::selection`, `:focus-visible`, `cursor:none` on fine pointers only). Import fonts. **Gate:** page renders bone/ink with correct type scale, no hardcoded hex.
2. **GSAP + smooth-scroll spine.** `lib/gsap/register.ts`, `easings.ts`, `splitText.ts` (loader + fallback). `SmoothScrollProvider` (Lenis ↔ ScrollTrigger ↔ ticker, reduced-motion off-switch). `AppProviders`. `hooks/useReducedMotion`, `useIsCoarsePointer`, `useLenis`. **Gate:** inertial scroll works; disables under reduced-motion.
3. **Cursor + interaction primitives.** `CursorContext` + `<Cursor/>` (quickTo, variants). `useMagnetic`, `Magnetic`, `MagneticButton`. `useSplitText`, `SplitReveal`. `Reveal` (batch). `Marquee`. `Section` + `SectionLabel` + `ActiveSectionContext` + `useActiveSection`. `ScrollProgress`. **Gate:** primitives demoable in isolation; cursor causes no re-render storm (verify with React DevTools).
4. **Content + shell.** `data/content.ts` (§9). `App.tsx` composing providers + `<main>` + sections in spine order (empty section shells with labels). `Header` (nav, active highlight, mobile menu). `Intro` gate. **Gate:** nav scrolls to sections; active highlight tracks; intro dismisses.
5. **Sections top-to-bottom (each: layout → content → §6 signature → reduced-motion branch → mobile branch, verify before next).** `Hero` → `MarqueeBand` → `About` → `Expertise` → `Experience` → `Projects` → `Skills` → `Closing`.
6. **Polish pass.** Placeholder media into `public/media/…`; `ScrollTrigger.refresh()` after fonts; magnetic/distort tuning; focus-visible + keyboard audit; run reduced-motion and coarse-pointer passes; Lighthouse + axe; final token sweep (grep for stray hex). **Gate:** all §6 fallbacks verified on desktop, mobile, and reduced-motion.

---

*End of plan. Committed values are final unless the review stage overrides them.*
