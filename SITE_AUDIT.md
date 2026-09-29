# SITE AUDIT — vraj-portfolio

> Live audit of the **built** site, 2026-09-29. Companion to `ANIMATION_STUDY.md`: that document
> studied the *reference* portfolio and set the mandate; this one measures what we actually shipped
> against it.
>
> Method: full source read, `grep` sweeps over the motion layer, and live inspection in Chrome via
> Playwright at 1512×900 and 390×844 — against **both** the dev server and a production
> `vite build` + `vite preview`.
>
> Stance: every finding below was reproduced, not inferred. Line references are exact. Where
> something is unverified it says so.

---

## Findings summary

| # | Severity | Finding | Anchor |
|---|---|---|---|
| 1 | ~~**P0**~~ **FIXED** | Crossing the compact breakpoint at runtime unmounted the entire app | `PinHost.tsx` + `ErrorBoundary.tsx`, merged `a12ba0b` |
| 2 | P1 | Expertise section has no motion signature at all | `sections/Expertise/` |
| 3 | P1 | All 8 projects ship `links: {}` — no clickable affordance in the work section | `config/content.ts:198-287` |
| 4 | P2 | Hero role line reads "FULL STACK DEVELOPER — FULL STACK" | `config/content.ts:13-14` |
| 5 | P2 | `README.md` is still the stock Vite starter template | `README.md` |
| 6 | P2 | One project cover is a PNG with no `srcSet` while 8 others ship WebP pairs | `config/content.ts:284` |
| 7 | Gap | `AccentWipe` primitive is built but used in exactly one place | `Closing.tsx:81` |
| 8 | Gap | No scroll snapping anywhere, despite three pinned scenes | — |
| 9 | P1 | 14px horizontal overflow at 360px width — found by the new harness, not by eye | open |

---

## 1. P0 — Runtime breakpoint crossing white-screens the site  — **FIXED**

> **Resolved** in `a12ba0b`. Two commits: `PinHost` (cause) and `ErrorBoundary` (safety net).
> Verification went 10/15 to 14/15, and rendered output is unchanged — document height and all
> nine section offsets are identical to the pre-fix build at 1440x900. The analysis below is kept
> because the failure mode generalises to any future pinned section.

### Symptom
The entire page goes blank. `document.getElementById('root').children.length` drops to **0** — the
whole React tree unmounts. No visible error, no fallback, no content.

### Reproduction
1. Load the site at ≥ 641px with a fine pointer (a normal desktop window).
2. Resize the window below 640px.
3. Page is blank.

Reproduces in **both** directions (narrow→wide and wide→narrow), and — critically — **in a
production build**, not just dev. Verified against `npm run build:nossg` served by `vite preview`,
so this is not a StrictMode double-invoke artifact.

```
NotFoundError: Failed to execute 'insertBefore' on 'Node':
The node before which the new node is to be inserted is not a child of this node.
    at insertOrAppendPlacementNode
    at commitPlacement
    at commitMutationEffectsOnFiber

[warning] An error occurred in the <ExperienceMobile> component.
          Consider adding an error boundary to your tree.
```

### Root cause — verified by DOM inspection

**ScrollTrigger's pin-spacer detaches sections from the parent React reconciles against.**

`pin: true` wraps the pinned element in a `.pin-spacer` div that React knows nothing about. Measured
live at 1440x900, `<main>`'s actual children are:

```
DIV.pin-spacer      <- wraps section#hero
SECTION#marquee
SECTION#about
SECTION#expertise
SECTION#experience
DIV.pin-spacer      <- wraps section#projects
DIV.pin-spacer      <- wraps section#skills
SECTION#credentials
FOOTER#closing
```

React's fiber tree still models `section#projects` as a direct child of `<main>`. When
`useIsCompact()` flips, React swaps the Experience branch and places the new node with
`main.insertBefore(newNode, section#projects)` — but `section#projects` is now a child of a
`.pin-spacer`, not of `main`. Hence the exact error text: *"the node before which the new node is to
be inserted is not a child of this node."*

The three pins are `Hero.tsx:179`, `Projects.tsx:73` and `Skills.tsx:47`.

**Why a `key` on the branch swap does NOT fix this.** An earlier draft of this audit proposed keying
`Experience.tsx:103` / `Hero.tsx:238` to force unmount-then-mount. That is wrong: React still has to
*place* the newly mounted node in `<main>`, using the same stale sibling reference. Removal has the
same problem in reverse (`removeChild` against a node that moved). The fix has to address the DOM
divergence itself, not the reconciliation strategy.

**Contributing factor — no error boundary.**
`grep -rn 'ErrorBoundary\|componentDidCatch\|getDerivedStateFromError' src` returns **zero hits**,
so a throw anywhere takes down the whole tree instead of degrading one section.

**Latent second instance of the same class of bug.** `lib/gsap/splitText.ts:34` runs
`el.textContent = ''` and rebuilds children imperatively on elements whose children React rendered
(`About.tsx:30`, `Closing.tsx:86`). This is not what fires here — it mutates *inside* an element
rather than the sibling chain of `<main>` — but it is the same rule being broken and is worth fixing
on its own merits.

### Blast radius
- **Affected:** desktop users resizing a window across 640px; anyone opening responsive devtools
  (i.e. most engineers and recruiters who inspect the site); 2-in-1 tablets where attaching or
  detaching a keyboard flips `pointer` between `coarse` and `fine`.
- **Not affected:** real phones. `useIsCompact()`'s query is
  `(max-width: 640px), (pointer: coarse)`, and `pointer: coarse` stays true through rotation, so the
  value never flips. A cold load at any single viewport size is also fine — it is only the
  *transition* that breaks.

### Fix order

1. **Add an error boundary.** Does not fix the cause, but converts a blank page into one degraded
   section. Independently valuable and lands first.
2. **Stop `<main>`'s direct children from being pin-wrapped.** Pin an inner wrapper rather than the
   section element itself, so each `<main>` child stays a stable React-owned node and the
   `.pin-spacer` lives *inside* it. This removes the divergence React trips over.
3. **Make split targets React leaves** (`lib/gsap/splitText.ts`) so GSAP never writes into
   React-owned children — closes the latent second instance.

Each step is verified in a browser against the matrix in
`.claude/skills/visual-verification/SKILL.md`, plus the new breakpoint-crossing check below.

### Regression check — now automated

The existing matrix checks fixed viewports; this bug only appears on a *transition*, so no
single-viewport check could ever have caught it. `scripts/verify.mjs` now covers it:

```bash
npm run dev                          # or: npm run build && npm run preview
npm run verify -- http://localhost:5173
```

The harness runs the whole `visual-verification` matrix — static viewports, reduced-motion end
states, horizontal overflow, console/page-error/failed-request counts — plus the runtime breakpoint
transition in both directions. It exits non-zero, so it works as a pre-merge gate.

Two notes for anyone extending it:

- **Count sections by id, not by DOM position.** `main > section` is structure-dependent: the
  pin-spacer re-parents pinned sections, so that selector reports 6 on desktop and 9 on mobile for
  an identical page.
- **Do not symlink `node_modules` into a worktree.** `worktree-flow` suggests it, but Vite's
  `server.fs.allow` then returns 403 for every font file outside the worktree root, which shows up
  as five phantom "failed request" errors. Run a real install — and note that `npm install` in a
  bun project drops a competing `package-lock.json` (now gitignored).

---

## 2. P1 — Expertise has no motion signature

`sections/Expertise/` renders eight rows of `number · title · blurb` separated by hairlines, over
**1571px** of scroll. No hover state, no entrance choreography, no accent moment, no media.

It sits between a strong About (split-line lead, accent-marked phrase, education card) and a strong
Experience (scrubbed timeline spine with markers), so the drop in energy is conspicuous.

`ANIMATION_STUDY.md` mandate C.5 was *"escalate, don't repeat: give each section a distinct motion
signature."* Expertise is currently the section with no signature at all.

---

## 3. P1 — The work section has no outbound links

All eight entries in `config/content.ts` ship `links: {}`, so the `ProjectLinks { live?, source? }`
type is never populated and no card renders a live or source affordance. Confirmed visually in the
pinned track: title, year, blurb and tags render, but nothing is clickable.

This may be correct and unavoidable — Pivotal is internal tooling, and Kavra / Ablefinder /
BuildChain / Tennant are client work. **This is a content decision, not a bug.** Flagged because the
practical effect is that a visitor cannot navigate anywhere from the work section.

---

## 4-6. P2 — Copy and asset polish

- **Hero role duplication.** `brand.role` is `'Full Stack Developer'` and `brand.roleFacets[0]` is
  `'FULL STACK'`, so when the rotator rests on its first facet the hero reads
  "FULL STACK DEVELOPER — FULL STACK". Observed live.
- **`README.md`** is unmodified `create-vite` boilerplate ("This template provides a minimal setup
  to get React working in Vite with HMR…"). It is the first thing a GitHub visitor reads, and it
  describes a template rather than this project.
- **`config/content.ts:284`** — Tennant Metals uses `/media/cover-tennant.png` with no `srcSet`,
  while the other eight projects each ship a 640w/1280w WebP pair.

---

## Verified strengths — do not regress these

Recorded so future work knows what is already solved and does not "fix" it.

| Area | State |
|---|---|
| **Pointer perf** | Every pointer-driven effect uses `gsap.quickTo`/`quickSetter` with `{ passive: true }` listeners. **Zero** `setState`-per-mousemove in the codebase — the exact smell `ANIMATION_STUDY.md` flagged in the reference (4+ occurrences there). |
| **Marquee** | Already scroll-velocity reactive: `Marquee.tsx:58` reads `self.getVelocity()` and drives both `skewX` (clamped ±14) and `loop.timeScale()` (clamped 1–6), with a `delayedCall` decay back to rest. |
| **Images** | `ProjectCard.tsx:106-107` sets `loading="lazy"` + `decoding="async"`; responsive `srcSet` on 8 of 9 covers. |
| **Pinned-track a11y** | `Projects.tsx:35` `revealFocused` maps a focused card back to a scroll position through Lenis — solving keyboard reachability inside an `overflow: hidden` horizontal track, which the reference never attempted. |
| **Reduced motion** | Honoured per-component with end-state fallbacks (e.g. `Marquee` renders a static legible row; `ScrollProgress` swaps time-based scrub smoothing for `scrub: true`). |
| **Contrast** | `settings/colors.ts` bisection-solves `--color-ink-muted` (AA 4.5:1) and `--color-line-soft` (3:1) for *any* user-dialled triad, not just the shipped palette. |
| **Variety** | Four intro variants chosen at random per visit (`Intro.tsx:41`, `CounterIntro` forced on compact); four cursor variants; five Modes re-skinning CSS and GSAP together. |
| **Best moment** | Skills — a pinned, scrubbed category carousel over a giant blurred word-wall. |

---

## Opportunities — where the motion ceiling is still unclaimed

1. **Give Expertise a signature.** Highest payoff per unit effort on the page. Options: per-row
   accent flood on hover with a scrubbed index counter, or pin the section and scrub the eight rows
   as a single "index" scene.
2. **Generalise `AccentWipe` into section transitions.** The primitive exists and is used once, as a
   closing curtain (`Closing.tsx:81`). Using it to wipe *between* sections is opportunity #2 of
   `ANIMATION_STUDY.md` — the last structural mandate that never landed.
3. **Duotone project media, resolving to full colour on hover/focus.** Doubles as a palette fix: the
   real screenshots (orange MyUnify, blue BuildChain) currently fight the cyan accent. A duotone
   rest state folds them into the token palette and converts the hover into a reveal.
4. **Scroll snapping between the pinned scenes.** There is no `snap` anywhere in the codebase — Hero
   (`Hero.tsx:179`), Projects (`Projects.tsx:73`) and Skills (`Skills.tsx:47`) all pin, which is
   exactly the structure snapping wants. Opportunity #6 of `ANIMATION_STUDY.md`.
5. **Morphing nav underline** that travels between items rather than hard-cutting to the active one.

---

## Appendix — verified quick facts

Measured live at 1512×900 unless noted.

- **Document height:** 16184px desktop; 13693px at 390×844.
- **Section offsets / heights:** about 1862 / 1287 · expertise 3149 / 1571 · experience 4720 / 1842 ·
  projects 6562 / 900 · skills 11391 / 900 · credentials 13641 / 1289 · closing 14930 / 1254.
- **Projects pin** consumes ~3900px of scroll between its start and the Skills section.
- **Pinned triggers — exactly three:** `Hero.tsx:179` (scrub 0.6), `Projects.tsx:73` (scrub 0.3),
  `Skills.tsx:47` (scrub true).
- **Production bundle:** `index.js` 443.05 kB (gzip **144.12 kB**); `index.css` 74.72 kB
  (gzip 13.07 kB). Build time 336ms.
- **Console on a clean desktop load:** zero errors, zero warnings.
- **`getVelocity()` call sites:** 1 (`Marquee.tsx:58`).
- **`loading=`/`decoding=` attributes:** 1 element (`ProjectCard.tsx:106-107`).
- **Error boundaries:** 0.
- **Scroll-snap usage:** 0 (every `snap` grep hit is the `--dur-snappy` token).
- **`prefers-reduced-motion` handling:** present, via `useReducedMotion()` + `settings/motionFlag.ts`.

### Not verified
- Behaviour on a physical touch device (tested via viewport emulation only).
- Whether the SSG prerender step (`scripts/prerender.mjs`, Playwright-driven) is affected by the P0
  crash — it snapshots at a single viewport, so it most likely is not, but this was not tested.
- Lighthouse / Core Web Vitals scores.
