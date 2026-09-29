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

## Status — 2026-09-29

All nine findings are now resolved: eight fixed or closed (1, 2, 3, 4, 5, 6, 7, 9) and one
(8, scroll snapping) **assessed and deliberately declined** — shipping it would have fought Lenis.
Finding 2 was **corrected** before being fixed; it was wrong as first written.

All fixes are verified by `npm run verify` at **15/15** against both the dev server and a
production `vite build` + `vite preview`.

---

## Findings summary

| # | Severity | Finding | Anchor |
|---|---|---|---|
| 1 | ~~**P0**~~ **FIXED** | Crossing the compact breakpoint at runtime unmounted the entire app | `PinHost.tsx` + `ErrorBoundary.tsx`, merged `a12ba0b` |
| 2 | ~~P1~~ **CORRECTED + FIXED** | Expertise *did* have hover motion; the real gap was that it was hover-only, so touch got nothing | `Expertise.tsx` scan-line flood |
| 3 | ~~P1~~ **CLOSED — by design** | All 8 projects ship `links: {}` | Owner decision: every project is internal or client work |
| 4 | ~~P2~~ **FIXED** | Hero role line read "FULL STACK DEVELOPER — FULL STACK" | `Hero.tsx` buckets + `content.ts` facets |
| 5 | ~~P2~~ **FIXED** | `README.md` was the stock Vite starter template | `README.md` rewritten |
| 6 | ~~P2~~ **FIXED** | Tennant cover was a 1.6MB PNG with no `srcSet` | WebP pair; dead PNG deleted |
| 7 | ~~Gap~~ **FIXED** | `AccentWipe` was built but used in exactly one place | Scene hand-off curtain on Work (`Projects.tsx`) |
| 8 | **ASSESSED — not shipped** | Scroll snapping would fight Lenis; deliberately declined | See §8 |
| 9 | ~~P1~~ **FIXED** | 14px horizontal overflow at 360px — found by the harness, not by eye | `Skills.module.css` `.learning` |

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
3. **Make split targets React leaves** — ✅ **done**. `SplitReveal` now renders an empty element
   and writes its text in a layout effect, so React owns no children under a node GSAP rewrites.
   No observable behaviour change: the bug was latent because `About` and `Closing` never unmount.
   Verified by absence of regression (split spans, sr-only original, reduced-motion plain text and
   prerendered HTML all intact), not by a behavioural delta.

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

## 2. CORRECTED — Expertise was hover-only, not motionless

> **This finding was wrong as originally written, and the error is kept here on purpose.**
> The original text said Expertise had "no hover state, no entrance choreography, no accent
> moment". That was judged from a *static screenshot*. Reading the code and driving the page
> proved otherwise: `.flood` wipes an accent panel across the row on `:hover`
> (`inset(0 100% 0 0)` to `inset(0)`) with the index, title and blurb flipping to
> `--color-on-accent`, and the rows already enter on a staggered `Reveal`.
>
> Lesson for future audits in this repo: a screenshot cannot see a hover state. Interaction
> findings must be driven, not looked at.

### The real gap

The flood is the section's entire interaction and it is gated on `:hover`, which **never fires on
a touch device**. So on a phone the section was inert — the exact failure `ANIMATION_STUDY.md`
names as the reference portfolio's worst trait ("the personality is desktop-only by omission, not
by design"), and what mandate C.3 requires we not repeat.

### Fix — a scan line on coarse pointers

On coarse pointers only, a `ScrollTrigger` per row toggles a `.flooded` class while the row
straddles the viewport midline (`start: 'top 50%'`, `end: 'bottom 50%'`). Rows are contiguous, so
exactly one is lit at any scroll position — which matches `:hover` semantics and honours the
styling law's "one point of emphasis per section". An earlier wider band lit two rows at once and
read as decoration.

Two decisions worth keeping:

- **Toggle a class; do not tween `clip-path` from JS.** The CSS already owns the wipe *and* the
  text-colour flip in one rule, so they cannot fall out of step. Animating the flood from JS while
  the text stayed `--color-ink` would put ink on accent at roughly 1.6:1.
- **Fine pointers get no trigger at all**, so desktop hover is provably unchanged — verified:
  nothing lit without hover, and hovering row 2 lights only row 2.

Measured on touch at 390x844: rows light in sequence 1 through 7 as you scroll, **maximum 1 lit at
a time**, no flood/text mismatch at any sample. Reduced motion skips the trigger entirely; the row
rests un-flooded, which is the legible state, so there is no end-state to strand.

---

## 3. CLOSED (by design) — the work section has no outbound links

All eight entries in `config/content.ts` ship `links: {}`, so `ProjectLinks { live?, source? }` is
never populated and no card renders a live or source affordance.

**Resolved as intended, 2026-09-29, by owner decision.** Every project is internal tooling
(Pivotal) or client work (Kavra, Ablefinder, BuildChain, Rocket, Tennant Metals, SportsGrid,
MyUnify) with no public URL or repository to link to. There is nothing to fix.

The `ProjectLinks` type and `ProjectCard`'s rendering path are deliberately kept, so a future
project with a public URL needs only a data edit. Recorded here so this stops reading as
unfinished work.

---

## 4-6. P2 — Copy and asset polish — **ALL FIXED**

- **Hero role duplication.** ✅ Two causes. `Hero.tsx` hardcoded three scroll buckets
  (`p < 0.34 ? 0 : p < 0.67 ? 1 : 2`), so the facet count was not editable from the config; it now
  derives from `brand.roleFacets.length`, matching how the Skills pin already worked. The
  redundant `'FULL STACK'` facet was then removed. Hero now reads "FULL STACK DEVELOPER — NEXT.JS".
  Note this second part is *branding copy*, not a defect fix — adding a third specialism restores
  a three-way rotation and the bucketing handles it automatically.
- **`README.md`** ✅ rewritten: quick start, command table, what is genuinely unusual
  (contrast-solved palette, cursor Modes, the token law), architecture, rebranding guide, and the
  `npm run verify` workflow.
- **Tennant cover.** ✅ Bigger than the audit first implied: the PNG was **1,582 KB**, roughly 29x
  the comparable WebP. Regenerated with `sharp` at the same dimensions as every other cover
  (640x427 / 1280x853) to **29 KB / 82 KB**, and the now-unreferenced PNG was deleted — `public/`
  is copied wholesale, so it had still been shipping. `dist/` went **3.7 MB to 2.1 MB (-43%)**.
  The `// TODO real media` marker is deliberately kept: a format change does not make the image
  final.

---

## 7. FIXED — a scene hand-off curtain on Work

`AccentWipe` existed as a primitive but was used once, as a closing curtain (`Closing.tsx:81`).
`ANIMATION_STUDY.md` opportunity #2 asked for it to be generalised into section transitions.

Shipped on **one** boundary only: entering Work. The accent panel sweeps across and clears
straight out — a curtain, not a cover. Measured across the crossing: **62 distinct clip-path
states**, fully covering for **3 of 70 sampled frames**.

Deliberate constraints:

- **One boundary, not seven.** A curtain at every section would be seven accent flashes on one
  scroll, which is decoration. The styling law rations accent to one point of emphasis. Work earns
  it because it is the biggest scene change on the page — vertical flow pivots to a pinned
  horizontal track. The curtain travels `right` to foreshadow that pivot.
- **Scoped to the section, not fixed to the viewport.** The panel is `absolute; inset: 0` inside
  `.projects`, which is `overflow: hidden`. While pinned the two are the same rectangle, so it
  reads full-screen, but it can never outlive its section or overlap the next one.
- `pointer-events: none` and `aria-hidden`, so it never blocks input or reaches the a11y tree.
- Reduced motion gets no curtain; the panel's resting clip-path is already cleared, so there is no
  end state to strand. Verified: resting `inset(0% 0% 100%)`, cards at opacity 1.

---

## 8. ASSESSED — scroll snapping, deliberately NOT shipped

`ANIMATION_STUDY.md` opportunity #6 asked for snapping between the pinned scenes. **Declined, on
evidence.**

`SmoothScrollProvider` wires Lenis to ScrollTrigger one way only: `lenis.on('scroll', ScrollTrigger.update)`
plus `lenis.raf` on the GSAP ticker. There is **no `ScrollTrigger.scrollerProxy()`** — verified,
zero occurrences in `src/`. ScrollTrigger therefore *reads* scroll position but has no sanctioned
way to *drive* it.

ScrollTrigger's built-in `snap` drives scroll itself, via the scroller's own `scrollTo`. With Lenis
simultaneously animating that same scroll position toward its own target, the two would compete —
precisely the failure `.claude/skills/gsap-motion-patterns` §5 names: *"Two scrollers fighting
produces jitter that is very hard to trace."*

This is not theoretical. Every programmatic scroll in the codebase already routes through Lenis —
`Header.tsx:56`, `Hero.tsx:146`, `HeroMobile.tsx:147`, `ScrollProgress.tsx:46`, `Closing.tsx:73`,
`Projects.tsx:48` — with a native `window.scrollTo` only ever as the fallback for when Lenis is
off. Snapping would be the single feature to bypass that rule.

**What shipping it correctly would require** (a real piece of work, not a flag):

1. A `ScrollTrigger.scrollerProxy()` wiring `scrollTop` through Lenis, or
2. A custom snap that computes the nearest stop on scroll-end and calls `lenis.scrollTo(target)`,
   with care not to trap a user mid-section.

Worth noting the ceiling is lower than the opportunity implies: the pinned scenes are 900-4800px
apart, so page-level snapping on a long reading page risks yanking the reader more than it helps.
A better-targeted version would snap *within* the Skills carousel to its five category stops —
still a Lenis-native implementation, but a bounded and clearly useful one.

Recorded here rather than left open, so the next person does not reach for `snap: true` and spend
an afternoon on the jitter.

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
- **Production bundle (post-fixes):** `index.js` ~443 kB (gzip ~139 KiB); `index.css` ~73 KiB
  (gzip ~12 KiB). Total `dist/` **2.1 MB**, down from 3.7 MB once the dead PNG was removed.
- **Console on a clean desktop load:** zero errors, zero warnings.
- **`getVelocity()` call sites:** 1 (`Marquee.tsx:58`).
- **`loading=`/`decoding=` attributes:** 1 element (`ProjectCard.tsx:106-107`). All 9 covers now ship a 640w/1280w WebP `srcSet`.
- **Error boundaries:** 1 (`ErrorBoundary.tsx`, wrapping `<main>`). Was 0 at audit time.
- **Scroll-snap usage:** 0 (every `snap` grep hit is the `--dur-snappy` token).
- **`prefers-reduced-motion` handling:** present, via `useReducedMotion()` + `settings/motionFlag.ts`.

### Not verified
- Behaviour on a physical touch device (tested via viewport emulation only).
- Whether the SSG prerender step (`scripts/prerender.mjs`, Playwright-driven) is affected by the P0
  crash — it snapshots at a single viewport, so it most likely is not, but this was not tested.
- Lighthouse / Core Web Vitals scores.
