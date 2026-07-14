# ANIMATION STUDY — Reference Brutalist Portfolio

> Stage 1 (Research/Doc) artifact. A technical teardown of the existing React portfolio at
> `/var/www/html/vraj-github/portfolio/` so downstream agents can build something in the same
> brutalist language but with a **significantly higher motion ceiling**.
>
> Author's stance: this is an *insight* document, not a description. Every "why it works" and
> every "ceiling" is written to be actioned by the planning + build agents.

---

## Overview

### What the reference actually is
A single-page, dark, brutalist developer portfolio for "Henil Suhagiya". Built with **Vite 6 + React 19 + Tailwind v4 (CSS-based) + Framer Motion 12**. One font (**Inter**), one accent (**#eb5939**), near-black canvas (**#050505**), and a **custom cursor** (`cursor: none` globally). The entire personality is a running joke: every section has a "professional" base layer and a "sarcastic" hidden layer revealed by a spotlight/hover mask.

### Rendered section flow (from `src/App.jsx`)
```
Loader (gate)  →  Header (fixed pill)  →  Hero  →  About  →  WhatIDo (Services)
→  Experience  →  Projects  →  Footer (Contact/Feedback)
```
`<CustomCursor />` sits above everything; `<CursorProvider>` wraps the tree.

### Critical structural finding: the reference SHIPS LESS THAN IT CONTAINS
Three components exist in `src/components/` but are **never mounted**, and one context is **never used**:

| File | What it does | Status |
|---|---|---|
| `TechStack.jsx` | **The only scroll-scrub + pin effect** — `h-[200vh]` section, `sticky top-0`, dual marquee rows driven by `useScroll`/`useTransform` | **Dead code** — not imported in `App.jsx` (also references an undefined `gradient-text` class, so it would render unstyled) |
| `Background.jsx` | Canvas particle-network (blue nodes + connecting lines, `requestAnimationFrame`) | **Dead code** — never imported; colors are off-palette (blue) |
| `Contact.jsx` | 4 masked-reveal links (`MaskedLink`) | **Dead code** — `{/* <Contact /> */}` commented out in `App.jsx`; the *Footer* is the real contact surface |
| `contexts/ThemeContext.jsx` | light/dark toggle w/ `localStorage` + `matchMedia` | **Dead code** — never provided or consumed; site is hard-dark |
| `react-router-dom` (`BrowserRouter`) | wraps `<App/>` in `main.jsx` | **Overhead** — no routes/links used |
| `react-snowfall` | dependency | **Unused** — never imported |

**Consequence for us:** the *live* experience has **essentially no scroll-driven animation**. Everything shipped is entrance/hover/click/loop. The single scroll-scrubbed effect the author built (`TechStack`) was cut. That is the single biggest opportunity gap — see "Opportunities to Surpass."

### The "feel" in one line
Snappy and reactive, not floaty. Motion is dominated by **fast hover masks (0.1s)**, **quick accordion reveals (0.4s)**, and a **stiff cursor spring (stiffness 800 / damping 30)**. The only slow, cinematic beats are the loader curtain (0.8s) and the app fade-in (1.0s).

---

## Section-by-Section Breakdown

### 0. Loader — `components/Loader.jsx` (the entry "moment")
**Technique.** A fixed `z-[100]` black overlay with an SVG **circular progress ring** and a fake percentage counter, gated behind a manual **"Start"** button.

- **Progress engine:** `setInterval(…, 50)` adds `Math.floor(Math.random()*5)+1` (1–5) per tick → fills to 100 in ~20–100 ticks. **Average ≈ 1.6s**, but non-deterministic (1.0s best case, up to ~5s worst) because of the RNG.
- **Ring:** `<circle r="70">`, `strokeDasharray="440"` (circumference `2π·70 ≈ 439.8`), `strokeDashoffset={440 - (440 * progress) / 100}`. Parent SVG is `-rotate-90` so fill starts at 12 o'clock. Track `#333`, progress `#eb5939`, `strokeWidth 4`. The offset animates via a CSS class `transition-all duration-100 ease-out` (not Framer) — smooth catch-up between the 50ms JS steps.
- **Choreography on complete:** at 100%, `setTimeout(() => setShowStart(true), 500)` → 500ms beat, then the ring container slides up (`animate={{ y: -50 }}`, `duration 0.8, ease "easeInOut"`) to make room for the button, which enters `initial {opacity:0,y:20} → animate {opacity:1,y:0}` (`duration 0.5`).
- **Exit:** click → `setIsCompleted(true)`, and the whole overlay does `exit={{ y: '-100%', opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}` (a curtain sliding up), wrapped in `<AnimatePresence>`. `onComplete` fires after `setTimeout(…, 800)` to match.
- **Hand-off:** `App.jsx` locks `document.body.style.overflow = "hidden"` while loading, and the `<main>` uses `transition-opacity duration-1000` from `opacity-0 → opacity-100`. So the reveal is: curtain up (0.8s) **overlapping** main fade-in (1.0s).

**Why it works.** The manual "Start" converts a loader into a **threshold ritual** — the user *commits* to entering, which primes attention for the hero gag. The percentage + ring reads as "craft."
**Ceiling.** It's a **forced wait + forced click** with a random duration; bad for perceived performance and interaction metrics, and the ring is a generic pattern. No skip, no reduced-motion path.

---

### 1. Header — `components/Header.jsx`
**Technique.** A `fixed top-6 left-1/2 -translate-x-1/2 z-[90]` **floating pill**. Scroll listener sets `scrolled = window.scrollY > 50`; when true the pill swaps to `bg-[#050505]/80 backdrop-blur-md border border-gray-800 shadow-xl` (from fully transparent), tweened by `transition-all duration-300`. Nav uses `scrollIntoView({ behavior: "smooth" })`.
**Timing/feel.** Single 300ms crossfade of the container chrome. No item stagger, no underline animation — just `hover:text-[#FF5722]` color.
**Why it works.** The glass-pill-on-scroll is a clean, restrained brutalist nav; the `HS` monogram + `font-mono tracking-widest uppercase` items sell the aesthetic cheaply.
**Bugs/ceilings.** (a) Nav items are `<span onClick>` — **not focusable, not keyboard-operable, no `<a>`/`<button>` semantics**. (b) Hover color is **`#FF5722`**, a *different* orange from the site accent **`#eb5939`** — an inconsistency to fix, not copy. (c) `onCursor('hidden')` fully hides the custom cursor over the nav (jarring — the pointer vanishes).

---

### 2. Hero — `components/Hero.jsx` (the signature effect)
**Technique — the spotlight text-swap mask.** Two absolutely-stacked full-screen layers:
- **Base** (`z-10`): white display type on `#050505` — `MAKING / GOOD / SHIT SINCE / 2021`.
- **Mask** (`z-20`): a solid `#eb5939` panel with `#050505` type — `HIDING / BAD / SHIT SINCE / 2021`.

The mask layer is a `motion.div` animated by **clip-path circle**:
```jsx
animate={{ clipPath: `circle(${maskSize}px at ${mousePosition.x}px ${mousePosition.y}px)` }}
transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
maskSize = isHovered ? 200 : 0   // px
```
So hovering the headline opens a **200px orange spotlight** that follows the cursor and reveals the alternate (joke) copy underneath. `ease: "backOut"` gives a tiny overshoot as the circle grows; `duration: 0.1` makes it feel *attached* to the pointer.

**Pointer math (repeated verbatim in About & Contact).** A `window` `mousemove` handler stores `globalMouse` in a ref; `updatePosition()` reads `containerRef.getBoundingClientRect()` and converts to element-local `x/y`, but **only** if the pointer is inside the rect (bounds check prevents a detached circle). Crucially it **also** recomputes on `scroll`, so the spotlight stays correct while the page moves under a stationary cursor.

**Supporting motion.**
- Eyebrow: `font-mono tracking-widest uppercase text-gray-400`.
- Display `h1`: `text-6xl md:text-[8vw] font-black uppercase tracking-tighter leading-[0.9] max-w-[90vw]` — fluid `8vw` on desktop.
- "Download CV" link calls `onCursor('hidden')` on hover.
- Scroll hint: `animate={{ y: [0,10,0] }}`, `duration 2, repeat Infinity, ease "easeInOut"` — an infinite bob.

**Why it works.** The mask is a *content* device, not decoration — it hides a punchline, so the user is rewarded for moving the mouse. High contrast (orange on black) makes the reveal legible instantly. The cursor is set to the `'hover'` variant here, which is **opacity 0** — i.e. the orange dot *becomes* the spotlight, so there's no double element.
**Ceilings.** It's a hover interaction ⇒ **desktop-only**. On touch there is no hover, so mobile users **never see the joke layer at all** — half the site's personality is invisible on phones. No parallax, no scrub, no entrance animation on the hero type (it just appears after the app fade).

---

### 3. About — `components/About.jsx`
**Technique.** **Identical** spotlight-mask engine as Hero (same `mousemove`+`scroll` refs, same `clipPath` tween, `ease "backOut"`, `duration 0.1`) with `maskSize = isHovered ? 250 : 0` (slightly larger circle). Base statement (`text-xl md:text-5xl font-medium text-gray-300`) reads earnest; mask (`#eb5939`/`#050505`, `font-bold`) reads sarcastic. A small `font-mono` "About" label is pinned top-left.
**Why it works.** Reusing the exact Hero idiom builds a *rhythm* — the user has learned "hover = secret," so About reinforces the game without new mechanics.
**Ceiling.** Precisely because it's identical, it's the reference's core weakness: **one trick, three times** (Hero, About, footer feedback). No escalation, no variation, no scroll payoff.

---

### 4. WhatIDo / "Services" — `components/WhatIDo.jsx`
**Technique — brutalist accordion rows.** Three `SkillRow`s (Frontend / Backend / Cloud Arch.). Each row:
- `border-t border-gray-800`, `hover:bg-[#eb5939] group` — the **entire row floods orange** on hover (`transition-colors`), and all child text flips to `#050505` via `group-hover:` utilities.
- The sarcastic `hoverText` quip fades/slides in: `opacity-0 group-hover:opacity-100 … translate-y-2 group-hover:translate-y-0`, `transition-opacity duration-300`.
- A `↓` chevron: `motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}`.
- Body expands via `<AnimatePresence>`: `initial {height:0,opacity:0} → animate {height:"auto",opacity:1}`, `exit` reverse, `duration 0.4, ease "easeInOut"`, `overflow-hidden`.
- Cursor becomes the big **`click`** variant with label **"CLICK"** (`onCursor("click", "CLICK")`).

**Why it works.** The full-bleed color flood is the loudest, most *brutalist* gesture on the site — it's tactile and unambiguous. `height:auto` animation via Framer is the honest way to do accordions. The "CLICK" cursor telegraphs affordance.
**Ceiling.** No stagger between rows on entrance (they don't animate in at all); `height:auto` animation can jank on long content; rows are `<div onClick>` (a11y gap, below).

---

### 5. Experience — `components/Experience.jsx`
**Technique.** Same accordion idiom as WhatIDo (`ExperienceRow`), but **data-driven** (array of 3 jobs) and richer: `border-b`, larger title `text-3xl md:text-5xl font-black tracking-tighter`, a `font-mono` period + duration, and an expanded panel containing description, a **Key Achievements** bullet list, and **Technologies** pills (`border border-gray-700 rounded-full font-mono text-[10px]`). Same `hover:bg-[#eb5939]` flood, same chevron `rotate 0→180 @ 0.3s`, same `height:auto @ 0.4s ease "easeInOut"`, same `onCursor("click","CLICK")`.
**Why it works.** It scales the accordion to real content without new code — consistent interaction language. The tech pills add texture inside the reveal.
**Ceiling.** No timeline/marker/line connecting the roles; the chevron is `hidden md:block` so mobile loses the open/close affordance; no scroll-reveal of rows.

---

### 6. Projects — `components/Projects.jsx`
**Technique.** Again the same accordion (`ProjectRow`, "Selected Works"): `border-t`, `hover:bg-[#eb5939]`, chevron `rotate @ 0.3s`, body `height:auto @ 0.4s`. Expanded panel adds `Live Demo` / `Source` links (react-icons `FaLink`/`FaGithub`) that `stopPropagation()` and swap the cursor to `'hidden'` on hover.
**Why it works.** Consistency; the project titles as oversized `font-black uppercase` are strong brutalist anchors.
**Ceiling.** **No project imagery/thumbnails/video** — a portfolio's "work" section with zero visuals is a major missed moment. No hover-preview, no media reveal, no case-study depth.

---

### 7. Footer (rendered as Contact) — `components/Footer.jsx`
**Technique.** Exports `ContactAndTestimonials`, `id="contact"`, `min-h-[70vh]`. Two parts:
1. **"The Feedback" cross-fade** — a CSS grid stack (`col-start-1 row-start-1` on both layers). Base (professional quote, white) vs hover (sarcastic quote, `#eb5939`), swapped by `transition-all duration-500 ease-in-out` toggling `opacity` + `translate-y-2`. **Note: pure CSS transitions here, not Framer** — a third variant of the "two-truths" gag, done a fourth way (Hero=clip mask, WhatIDo=color flood, Footer=opacity crossfade).
2. **Connect links** — email/phone/LinkedIn/GitHub, each with a **context-aware cursor label**: `onCursor('click','MESSAGE')`, `'CALL'`, `'SERIOUS'`, `'BUGS'`. Hover flips text to `#eb5939`.
**Why it works.** The `500ms` crossfade is the calmest beat on the site — a good decompression after the loud accordions. The bespoke cursor verbs ("SERIOUS", "BUGS") are a delightful micro-detail.
**Ceiling.** No form, no big closing statement/marquee, no "back to top." It just… ends.

---

### DEAD-CODE components (studied for technique, not shipped)

**`TechStack.jsx` — the abandoned scroll-scrub marquee (most important reference for us).**
```jsx
<section className="relative h-[200vh]">
  <div className="sticky top-0 h-screen …">      // ← PIN via sticky + tall parent
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x1 = useTransform(scrollYProgress, [0,1], ["0%", "-50%"]); // row →
  const x2 = useTransform(scrollYProgress, [0,1], ["-50%", "0%"]); // row ←
  <motion.div style={{ x: x1 }}> … duplicated tech cards … </motion.div>
```
Two rows of duplicated logos (`[...tech, ...tech]`, one `.reverse()`) slide in **opposite directions, scrubbed by scroll progress** (not time), inside a **pinned** viewport, with edge fade masks (`w-32` gradient overlays). The heading uses `whileInView={{opacity:1,y:0}} viewport={{once:true}} duration 0.8`.
**This is the only place the author touched pinning + scrub + `whileInView`** — and it was cut (and references an undefined `gradient-text` class + off-palette blue/purple + light-mode classes). **Takeaway:** the author *reached for* scroll-driven motion, found Framer's `useScroll`/`useTransform`/`sticky` fiddly enough to abandon, and shipped a site with none. We should own this space with a proper engine.

**`Contact.jsx` — `MaskedLink`.** Per-link version of the Hero spotlight: each `<a>` is its own `containerRef` with the same `mousemove`/`scroll` refs and `clipPath: circle(${maskSize}px …)`, `maskSize 200`, `ease "backOut" @ 0.1s`, `onCursor('hover')`. Confirms the spotlight is the author's One Big Idea, generalized to list items. Not mounted.

**`Background.jsx` — canvas particle network.** Vanilla `requestAnimationFrame` loop: ~`min(innerWidth*0.1, 100)` particles, velocity bounce off edges, lines drawn when `distance < 150`. Blue palette (`rgba(100–150, 100–150, 255,…)`) — off-brand, hence unused. A competent but generic "constellation" background.

---

## Cursor System — `contexts/CursorContext.jsx` + `components/CustomCursor.jsx`

**Sharing.** `CursorProvider` exposes `{ isHovered, cursorText, onCursor }`. `onCursor(hoverState, text='')` overloads a single `isHovered` field as a **string state-enum** (`false | true | 'hidden' | 'click' | 'contactClick' | 'row' | 'hover'`) plus a label. Any component calls `onCursor(...)` from its hover handlers; `CustomCursor` reads the context.

**Tracking.** `CustomCursor` listens to `window` `mousemove` and `setMousePosition({x,y})` on every move (a React `setState` per move ⇒ re-render each frame). The dot is a `fixed z-[999] rounded-full pointer-events-none` `motion.div`.

**Trail / physics.** Position is animated as a **spring**: `type:'spring', mass:0.1, stiffness:800, damping:30`. That's a *stiff, low-mass* spring → the dot snaps to the cursor with a barely-perceptible lag (premium but not floaty). No true multi-element trail.

**Context-aware variants** (from the `variants` map):
| State | Size | Color | Notes |
|---|---|---|---|
| `default` | 20×20 | `#eb5939` | resting orange dot, offset `-10` |
| `hover` (bool `true`) | 20×20 | — | **opacity 0** → hides so the spotlight mask can be the visual (Hero/About) |
| `hidden` (`'hidden'`) | — | — | `display:none`, `duration 0` (nav, CV, project links) |
| `click` (`'click'`) | **65×65** | `#050505` | big black puck, offset `-27`, shows label text ("CLICK") |
| `contactClick` | 65×65 | `#ffffff` | white puck (variant defined but not wired to any caller) |
| `row` | 20×20 | `#050505` | black dot for orange rows (defined; not wired) |

The `animate` prop is a long ternary decoding the enum. Label text renders inside the puck: `initial {opacity:0} → animate {opacity:1}`, `duration 0.2, delay 0.1`.

**Touch handling.** There is **none beyond `cursor:none`**. No `pointer:coarse`/`hover:none` media query, no touch fallback. On phones the custom dot never appears (no `mousemove`) and every hover-gated reveal is inert. `body{cursor:none}` is globally set in `index.css` (plus on `a,button,input,textarea,select`).

**Why it works.** One context, one element, cheap to reason about; the size/color jumps (20→65px, orange→black→white) give strong, legible mode feedback; hiding the dot during the spotlight is a clever way to avoid a double cursor.
**Ceilings.** `setState` per `mousemove` re-renders `CustomCursor` every frame (should use `motionValue`/`useSpring` or `gsap.quickTo` to avoid React churn). The enum-as-string with a mega-ternary is brittle (two variants are dead). No magnetic pull, no scale-on-press, no blend-mode difference cursor, no per-target morph beyond size/color.

---

## Type & Color System (exact values)

### Typography
- **Font:** single family — **Inter** (`@import` Google Fonts, weights `300;400;500;600;700;800;900`), stack `'Inter', system-ui, -apple-system, sans-serif`. `text-rendering: optimizeLegibility`, `-webkit-font-smoothing: antialiased`.
- **"Mono":** labels use Tailwind's `font-mono` = the **default system monospace stack** (ui-monospace/Menlo/Consolas…). **No dedicated mono webfont is loaded** — the mono texture is the OS font.
- **Scale & roles:**
  - Display `h1` (Hero): `text-6xl` → `md:text-[8vw]`, `font-black` (900), `uppercase`, `tracking-tighter`, `leading-[0.9]`.
  - Section headline rows (Experience/Projects titles): `text-3xl md:text-5xl font-black tracking-tighter uppercase`.
  - About statement: `text-xl md:text-5xl font-medium tracking-tight`.
  - Eyebrows / section labels / meta: `text-xs`–`text-sm font-mono tracking-widest` (also `tracking-[0.2em]`/`[0.3em]`) `uppercase text-gray-500`.
  - Body: `text-base md:text-lg` / `text-lg md:text-2xl`, `text-gray-300/400`.
- **Hierarchy logic:** extreme weight + case contrast (mono-caps micro-labels vs `font-black` giant caps), *tight* tracking on display (`tracking-tighter`) vs *wide* tracking on labels (`tracking-widest`). Generous vertical rhythm: sections `py-20`, rows `py-10 md:py-16`, gutters `px-4 md:px-20`, `max-w-7xl mx-auto`.

### Color (exact hexes)
| Role | Value | Usage |
|---|---|---|
| **Base / canvas** | `#050505` | body bg, all section bgs (`bg-[#050505]`) |
| Loader bg | `#000000` | `bg-black` overlay (slightly darker than base) |
| **Ink / primary text** | `#f3f4f6` (gray-100) | body text, links |
| Pure white | `#ffffff` | Hero `text-white` headline, contactClick cursor |
| **Accent** | `#eb5939` | spotlight mask fill, hover floods, selection, link hover, loader ring, scrollbar-hover |
| Accent (stray) | `#FF5722` | **Header nav hover only** — inconsistent, should be unified to `#eb5939` |
| Muted text/borders | Tailwind grays: `gray-400 #9ca3af`, `gray-500 #6b7280`, `gray-600 #4b5563`, `gray-700 #374151`, `gray-800 #1f2937` (hairline borders), `#333` (loader track) |

`::selection` = `#eb5939` bg / `#fff` text. Scrollbar: `6px`, track `#050505`, thumb `#333` → hover `#eb5939`. `html { scroll-behavior: smooth }`.

**Palette philosophy:** a strict **base / ink / accent** triad (black / off-white / orange-red) with grays only as hairlines and muted meta. The accent does *all* the emotional work (reveal, flood, focus). This 3-role discipline is worth keeping as a *structure* — but our exact hexes must change (see mandate).

---

## Responsive, A11y & Perf

### Responsive
- **One breakpoint does the work:** Tailwind `md` (768px). Below it: `flex-col` stacks (Experience header, Footer connect), `px-4` gutters, `text-6xl` hero.
- **Animation complexity does not scale down** — but the *hover-gated* effects simply never fire on touch (no `:hover`), so mobile silently loses: the Hero/About spotlight joke, the accordion "CLICK" cursor, all quip reveals, and the custom cursor itself. Some affordances are `hidden md:block` (quips, Experience chevrons), meaning **mobile users can't even see that Experience rows open**.
- Net: the phone experience is a static brutalist page; the "wow" is desktop-only by omission, not by design.

### Accessibility (weak)
- **No `prefers-reduced-motion` anywhere** (verified by grep). Infinite hero bob, per-frame cursor spring, curtain, floods all run unconditionally.
- **Non-semantic interactives:** accordion rows are `<div onClick>` (no `role`, no `aria-expanded`, no `tabindex`, no keyboard); nav items are `<span onClick>`. **None are keyboard-operable or screen-reader-announced.**
- `cursor: none` globally: if the JS cursor fails or the user relies on the native pointer, there's **no visible cursor**. No focus-visible styling to compensate.
- Positives: real landmarks (`<main>`, `<footer>`, `<section id>`), sensible heading order (`h1`→`h2`→`h3`), `<a>` for real links with `rel="noreferrer"`, `alt` on tech images (in dead code).

### Performance
- **`setState`-per-`mousemove` in 4+ places:** `CustomCursor`, `Hero`, `About`, every `Contact/MaskedLink`. Each re-renders on every pointer move; the spotlight components **also read `getBoundingClientRect()` on every `scroll`** (layout thrash, unthrottled, no `rAF`).
- Loader **blocks scroll** (`body overflow hidden`) and **forces a click** after a random ~1–5s fill — poor perceived perf / interaction latency, no skip.
- **Dead weight shipped in deps:** `react-router-dom` (no routes), `react-snowfall` (unused); `TechStack`/`Background`/`Contact`/`ThemeContext` are unmounted code.
- Framer Motion is the only real animation cost and it's used lightly; the site is otherwise cheap. The canvas particle field (dead) would have been the heaviest thing had it shipped.

---

## What Makes It Work (transferable principles — KEEP these)

1. **A single, ownable interaction idea.** The spotlight/"two-truths" reveal is *the* thing. One strong idea, repeated, beats ten weak ones. (We keep the *principle*; we must escalate the *execution*.)
2. **Motion serves content, not decoration.** The mask hides a *punchline*; the accordion hides *substance*; hovering is rewarded with meaning. Every animation reveals information.
3. **Ruthless 3-role color.** base/ink/accent, grays only as hairlines. The accent is reserved for reveal/focus, so it always reads as "the important thing."
4. **Extreme type contrast = instant hierarchy.** `font-mono` micro-caps vs `font-black` giant caps, tight vs wide tracking. Cheap, loud, brutalist.
5. **Snappy timings.** `0.1s` masks, `0.3–0.4s` UI, stiff cursor spring. It feels *reactive*. Reserve the slow beats (0.8–1.0s loader/fade) for genuine transitions.
6. **The threshold ritual.** The "Start" gate makes entry deliberate and primes attention — worth keeping in spirit (but make it fast, skippable, and reduced-motion-aware).
7. **Cursor as a UI channel.** Size/color/label changes (20↔65px, "CLICK"/"CALL"/"BUGS") communicate affordance and personality with one element.
8. **Consistent structural grid.** `max-w-7xl`, `px-4 md:px-20`, hairline `border-gray-800` dividers, `py-20` rhythm — the brutalist "spec sheet" skeleton.

---

## Weaknesses / Ceilings (where the reference is thin — BEAT these)

1. **No scroll-driven motion in the shipped site.** The one scrub/pin effect (`TechStack`) was cut. Zero parallax, pinning, scrubbed timelines, or scene transitions. This is the headline gap.
2. **One trick, repeated 3–4 ways.** Hero clip-mask ≈ About clip-mask ≈ WhatIDo color-flood ≈ Footer opacity-crossfade. No *escalation* or novelty as you descend.
3. **Everything is hover/click-gated ⇒ mobile gets almost nothing.** No touch fallback; the personality is desktop-only.
4. **No text animation.** No line/word/char reveals, no kinetic type, no marquee in the live build. Display type just appears.
5. **No entrance choreography.** Sections don't reveal on scroll; there's no stagger, no `whileInView` in the shipped tree.
6. **A11y is an afterthought.** No reduced-motion, non-semantic clickables, `cursor:none` with no fallback, no keyboard path.
7. **Perf smells.** Per-frame `setState`, unthrottled `scroll` + `getBoundingClientRect`, forced random loader gate, dead deps.
8. **Thin content moments.** Projects has no visuals; Footer just ends; no memorable closing statement; the loader ring is generic.
9. **Inconsistencies/rot.** `#FF5722` vs `#eb5939`; undefined `gradient-text`; unused `ThemeContext`, router, snowfall; two dead cursor variants.
10. **Native smooth scroll only.** `scroll-behavior: smooth` + `scrollIntoView` — no inertia/lerp, so nothing feels "buttery"; and it can't be linked to animation progress.

---

## Opportunities to Surpass (higher-ceiling motion — what to BUILD)

These are concrete, brutalism-preserving upgrades a stronger scroll engine unlocks:

1. **Scrub-linked pinned scenes (the big one).** Pin the hero (or an intro panel) and *scrub* a sequence: oversized type scales/erodes, the accent spotlight blooms across the whole viewport, a counter/word-swap advances — all tied to scroll position, not a hover. Turns the reference's static hero into a controllable film strip.
2. **Clip-path / mask **wipe** section transitions.** Generalize the reference's `circle()` reveal into full-section wipes: as you scroll from About→Work, an accent panel clips across and hands off to the next scene (a "curtain" per section instead of only the loader).
3. **Kinetic type via SplitText.** Line/word/char reveals: brutalist headlines that stagger in with `y`/`clip` and skew, and a **scroll-velocity-reactive marquee** (skew/scale proportional to scroll speed) — the alive-type moment the reference lacks entirely.
4. **Horizontal-scroll panel** for Projects/Work: pin a section and translate a track of full-bleed project cards sideways on vertical scroll — now with real **thumbnails/video previews** that scale/parallax, fixing the "no visuals" gap and adding a signature moment.
5. **Magnetic + distortion interactions.** Magnetic buttons/links (element eases toward cursor), a **difference/blend cursor** that inverts type it passes over, cursor scale-on-press, and optional WebGL/SVG **displacement** on hover of project media — a richer version of the reference's size/color-only cursor.
6. **Inertia smooth-scroll (Lenis).** Lerped scrolling that makes every scrub/pin feel premium, plus scroll-snapping between brutalist "slides." The reference has none.
7. **Scroll-progress instrumentation as decoration.** A brutalist side rail / index counter / section ticker driven by scroll progress — turns navigation into motion.
8. **Reveal-on-enter with stagger** for every section (batched `whileInView`/`ScrollTrigger.batch`), so the page *builds* as you descend instead of popping.
9. **Reduced-motion as a first-class variant** (not an afterthought): swap scrubs/pins for instant states, keep the layout and the joke, drop the churn — something the reference never attempts.
10. **Escalating variety of the "two-truths" gag** so it doesn't repeat: mask (hero) → glitch/RGB-split (about) → magnetic flood (services) → horizontal reveal (work) → typographic collapse (outro).

---

## Recommendations for the Planning Agent

### A. Animation-library verdict — **GSAP 3 + ScrollTrigger + @gsap/react (`useGSAP`) + Lenis. Adopt it.**
The brief asked whether GSAP+ScrollTrigger is genuinely the stronger choice *given what the reference struggles with*. It is — and the reference's own code is the argument:

- **The reference author reached for scroll motion and abandoned it.** `TechStack.jsx` used Framer's `useScroll`/`useTransform` + CSS `sticky` to fake a pin, then cut it. Framer Motion has **no real pin/snap primitive**; you hand-wire every transform and fake pinning with tall wrappers. **ScrollTrigger** gives first-class `pin`, `scrub`, `snap`, `start/end`, and `toggleActions`, and lets **one timeline choreograph many elements against scroll** — exactly the "moments" the reference lacks.
- **Sequencing.** GSAP **timelines** compose complex, ordered scenes far more legibly than nesting Framer variants/`AnimatePresence`. For scrubbed multi-element scenes this is a categorical win.
- **Kinetic type.** GSAP **SplitText** (now free in GSAP 3.12+/2024) makes line/word/char reveals trivial; Framer has no built-in text splitter.
- **Smoothness.** **Lenis** + `ScrollTrigger.update()` + `gsap.ticker` integrate cleanly to give lerped, premium scrolling that Framer + native scroll can't match.
- **Cursor/interaction.** `gsap.quickTo()` drives a magnetic/inertial cursor **without React re-renders** — directly fixing the reference's `setState`-per-`mousemove` perf smell.
- **React 19 fit.** `@gsap/react`'s `useGSAP()` scopes animations and auto-reverts on cleanup, safe under StrictMode double-invoke.

**Honest trade-offs to record:** GSAP is **imperative** (less declarative than Framer; more ref-wiring and manual cleanup discipline). If the team wants a mostly-declarative codebase, a *small* amount of Framer/CSS for simple enter/hover is fine — **but standardize on GSAP as the primary engine** so scroll, timeline, split-text, and cursor all share one system. Do **not** ship both as co-equal engines. (Confirm the current free-plugin status of SplitText/ScrollSmoother at build time.)

**Verdict: use GSAP 3 + ScrollTrigger + @gsap/react + Lenis as the single motion system.** Keep the reference's *interaction idioms* (spotlight reveal, color flood, context cursor, threshold intro) but **re-implement them in GSAP** and push each past the reference's ceiling with pinning, scrub, wipes, kinetic type, and a horizontal work section.

### B. Palette mandate — **CHOOSE A NEW 3-COLOR SYSTEM. Do not reuse the reference's.**
The reference is **`#050505` base / `#f3f4f6` ink / `#eb5939` accent**, Inter-only. **Our build MUST diverge.** Requirements for the new system:
- **Keep the 3-role discipline** (base / ink / accent) and the brutalist ethos, but pick **different hexes** — do not ship any of `#050505`, `#f3f4f6`, `#eb5939` (or the stray `#FF5722`).
- Consider inverting or shifting the mood: e.g. a bone/paper light base with near-black ink and an electric non-orange accent (acid lime, ultramarine, hot magenta, or safety-yellow), **or** a different dark base (deep ink-blue/oxblood) with a cold accent. Decision is the planner's — the mandate is *distinct from the reference and internally strict (one accent doing the reveal/focus work)*.
- Enforce **AA contrast** for body text (the reference's gray-on-black meta is borderline) and define the accent's on-color explicitly.
- **Different type pairing, ideally.** Move off Inter-only. A stronger brutalist pairing: an oversized **grotesque/display** (e.g. a condensed or neo-grotesk display face) for the giant caps + a **true monospace webfont** for labels (the reference faked mono with the system stack). Optionally a serif/anti-design display for contrast. Load real weights; keep the mono/caps-vs-black-caps hierarchy that works.

### C. Structural mandates for the build
1. **Ship the scroll layer the reference cut:** at least one pinned+scrubbed scene, one clip-path section wipe, kinetic split-type headline, and a horizontal Projects track with real media.
2. **Reduced-motion is a required variant**, not a stretch goal: gate every scrub/pin/loop behind `prefers-reduced-motion` with an instant-state fallback.
3. **Fix the a11y floor:** accordions/nav as real `<button>`/`<a>` with `aria-expanded`/focus-visible; keep `cursor:none` only alongside a keyboard-visible focus system and a `pointer:coarse` touch fallback so **mobile still gets the payoff** (tap-to-reveal or auto-reveal the "two-truths" content).
4. **Perf hygiene:** drive cursor + spotlight with GSAP `quickTo`/quickSetter and `ScrollTrigger` (no `setState`-per-`mousemove`, no unthrottled `getBoundingClientRect` on scroll). Drop dead deps (router/snowfall) from our stack.
5. **Escalate, don't repeat:** give each section a *distinct* motion signature rather than reusing one mask three times.

---

### Appendix — verified quick facts
- Deps (reference `package.json`): `framer-motion ^12.4.11`, `react/react-dom ^19.0.0`, `react-icons ^5.5.0`, `react-router-dom ^7.3.0` (unused routes), `react-snowfall ^2.4.0` (unused), `tailwindcss ^4.0.12` + `@tailwindcss/vite`. Build: Vite `^6.2.0`.
- Tailwind v4 **CSS-based** (no `tailwind.config.js`, no `@theme` block found); colors are inline arbitrary values (`bg-[#050505]`, `text-[#eb5939]`).
- `prefers-reduced-motion`: **0 occurrences** in `src/`.
- Mounted components: Loader, Header, Hero, About, WhatIDo, Experience, Projects, Footer, CustomCursor. **Unmounted:** TechStack, Background, Contact, ThemeContext.
