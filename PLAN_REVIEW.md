# PLAN REVIEW — Vraj Patel Portfolio (Stage 3 adversarial review)

> Reviews `PROJECT_PLAN.md` (865 lines) against `ANIMATION_STUDY.md`, the profile content,
> and the **actual** boilerplate + installed package registry. Empirical checks were run in-repo
> (commands shown). This review overrides the plan where they conflict (plan §*End*: "Committed
> values are final unless the review stage overrides them").

---

## Verdict — **GO-WITH-CHANGES**

The plan is strong, buildable, and honestly divergent from the reference. The motion architecture (one GSAP engine, `useGSAP` scoping, `quickTo` cursor, matchMedia reduced-motion gate, two tiny contexts) is correct and idiomatic. Every hard requirement is *placed*. But six items are **blocking**: they either break the build (`tsc -b` under strict), break a headline signature at runtime (kinetic type on font-load/resize; projects pin length), miss accessibility (intro scroll-lock traps keyboard/SR), or violate the explicit DRY-primitives mandate. All are cheap, concrete fixes. Fix R1–R6, apply the punch-list, build.

---

## Empirical findings (verified in-repo)

| Claim under test | Command | Result |
|---|---|---|
| Latest gsap version | `npm view gsap version` / `dist-tags` | **3.15.0** (`latest`). Plan says "3.13" — stale but directionally right. |
| **SplitText free in public gsap?** | `npm pack gsap@3.15.0` → `tar -tzf … \| grep -i SplitText` | **YES.** `package/dist/SplitText.js` + `SplitText.min.js` ship in the **free** npm tarball. GSAP was fully open-sourced (Webflow, 2025); the tarball also now ships **DrawSVGPlugin.js, MorphSVGPlugin.js, ScrambleTextPlugin.js, InertiaPlugin, MotionPathPlugin, Flip, Draggable** — *all* formerly-Club plugins are free. `import { SplitText } from 'gsap/SplitText'` resolves. The custom-splitter fallback is now **insurance, not a hard requirement**. |
| SplitText modern API | `grep -oiE "autoSplit\|onSplit\|aria" dist/SplitText.js` | `autoSplit` (3), `onSplit` (8), **`aria` (22)**. SplitText 3.15 supports `autoSplit:true` (auto re-split on resize/reflow), `onSplit` (re-create animations after split), and `aria:'auto'` (writes `aria-label` on the container, `aria-hidden` on the pieces — SR text handled automatically). **This directly satisfies the "re-split on resize + after fonts" requirement — but the plan doesn't use it (see R1).** |
| **DrawSVGPlugin** license | same tarball listing | **Free now** (`DrawSVGPlugin.js` ships). Plan's §6.6 "drawSVG-style **scaleY**" avoids the plugin anyway — still the right call (lighter, no SVG path needed). No change; note they *could* use real DrawSVG if desired. |
| **`innerText` counter needs TextPlugin?** | `grep -c innerText dist/gsap.js` (core) = **0**; `grep dist/TextPlugin.js` = only `textContent`/`.text` | **NO plugin needed.** gsap **core** has no `innerText` handler by name — it tweens `innerText` via its **generic numeric-property fallback** (`parseFloat` the current string, write back each tick). TextPlugin is for `text:` (typewriter via `textContent`), unrelated. `snap` is core. So `gsap.to(el,{innerText:100,snap:{innerText:1}})` **works with core only** — *but* it renders "0…100" unpadded and reflows each tick (see R4 for the "000" format fix). |
| **Fontsource names** | `npm pack @fontsource-variable/bricolage-grotesque@5.2.10`, `@fontsource/space-mono@5.2.9` | Both names **correct & exist**. space-mono ships `400.css`, `700.css`, `400-italic.css`, `index.css` — **all three plan imports valid**. bricolage-variable ships `index.css`(main)/`opsz.css`/`standard.css`/`wdth.css`/`wght.css`. Bare import → `index.css` (typically **`wght` axis only**) — see REC-2 if opsz/wdth are actually used. |
| lenis package name/version | `npm view lenis version` / `@studio-freight/lenis` | **`lenis@1.3.25`** (current). `@studio-freight/lenis@1.0.42` is the deprecated old name. Plan correctly uses **`lenis`**. Integration pattern (`lenis.on('scroll',ScrollTrigger.update)` + `gsap.ticker.add(t=>lenis.raf(t*1000))` + `lagSmoothing(0)`) is the **canonical current pattern** — correct for 1.3.x. Do NOT set `autoRaf:true` (would double-drive against the ticker); plan doesn't — good. |
| **`registerPlugin(useGSAP)` valid?** | `grep -n register @gsap/react/dist/index.js` → `useGSAP.register = core => {…}` (line 57) | **VALID — the plan is correct here.** `useGSAP` exposes a `.register` method, which is exactly what `gsap.registerPlugin()` invokes on each argument (it wires useGSAP to the same gsap instance, preventing multi-instance bugs). `@gsap/react@2.1.2` present. **No change** — clear this concern. |
| Boilerplate TS flags | Read `tsconfig.app.json` | Plan §0 is **accurate**: `erasableSyntaxOnly:true`, `verbatimModuleSyntax:true`, `noUnusedLocals/Parameters:true`, `noFallthroughCasesInSwitch:true`; `strict` **absent**. One extra: `lib:["ES2023","DOM"]` — **no `DOM.Iterable`** (see REC-8). `target es2023`. |
| React / toolchain versions | Read `package.json` | **react/react-dom ^19.2.7** (plan's "React 19" ✅). Also **TypeScript ~6.0.2** and **Vite ^8.1.1** — well ahead of the plan's implicit assumptions but compatible; no action, just be aware `tsc -b` is TS6. `bun.lock` present (plan's "bun" ✅). |
| Entry points | Read `main.tsx`, `App.tsx`, `index.html` | `main.tsx` imports **`./index.css`**; `App.tsx` imports **`./App.css`** and renders the Vite starter. Plan never says to **remove** these — punch-list P0. `index.html` `<title>` still "vraj-portfolio" and lacks `lang`-fine/meta — punch-list P0. |

---

## REQUIRED changes before build (blocking)

### R1 — `useSplitText` MUST re-split after fonts load and on resize (kinetic type breaks otherwise)
**Problem.** Plan §2 + §7.3 define `useSplitText(ref,{type,deps})` that splits once. Nothing waits for `document.fonts.ready` or re-splits on resize. **Why it breaks:** SplitText measures line-wrap positions from current font metrics — if it runs before Bricolage swaps in (`font-display:swap`), lines break at *fallback-font* boundaries and never correct; on viewport resize/rotate the frozen line groups are wrong. This corrupts the About line-mask reveal, the hero name, and the closing tagline — three of the nine signatures.
**Fix (exact).** Primary path uses the SplitText 3.15 features I verified present:
```ts
// inside useSplitText, after document.fonts.ready
const split = SplitText.create(ref.current!, {
  type, autoSplit: true, aria: 'auto',          // re-split on resize; SR text auto-managed
  onSplit: (self) => {                            // (re)create the tween on every (re)split
    return gsap.from(self[type], { yPercent: 110, stagger, ease, /* + ScrollTrigger */ });
  },
});
```
Gate creation on `document.fonts.ready.then(...)` (or the `useGSAP` body after a `fonts.ready` await) and call `ScrollTrigger.refresh()` afterward. The **custom fallback** must replicate this contract: `ResizeObserver` + `document.fonts.ready` → re-run splitter, keep an SR-only original + `aria-hidden` on the visual pieces, and re-fire the animation. The hook's returned `{lines,words,chars,revert}` shape stays. Without this, the plan's §2 claim of correct kinetic type is unmet.

### R2 — Intro scroll-lock must not trap keyboard/SR users, and must refresh ScrollTrigger on exit
**Problem.** §6.0 locks scroll (Lenis `stop()`) behind a `z-overlay:100` overlay while the *entire page remains in the DOM and focusable underneath*. **Why it breaks:** a keyboard/SR user can Tab "under" the curtain into hidden content; nothing moves focus to Skip; and when the Intro **unmounts**, page layout settles but the hero/projects/skills pins were computed against the pre-unmount layout → stale trigger positions.
**Fix (exact).** On Intro mount: (1) move focus to the **Skip** `<button>`; (2) set `inert` (or `aria-hidden="true"` + `tabindex=-1` sweep) on the app root behind the overlay; (3) dismiss on **click / Enter / Space / Esc**; (4) under reduced-motion never lock scroll >200ms (plan already says this — keep). On exit/unmount: **`ScrollTrigger.refresh()`** (and again after `document.fonts.ready`). Restore focus to `<main>`/first heading. This keeps the plan's "fast, skippable, reduced-motion-aware" promise for *all* input modes.

### R3 — Projects pin length must equal horizontal travel, not `scrollWidth` (dead scroll on a signature)
**Problem.** §6.7: `end:()=>'+='+track.scrollWidth` while `x:()=>-(track.scrollWidth-innerWidth)`. **Why it breaks:** the pin runs for `scrollWidth` px but the track only travels `scrollWidth - innerWidth` px, so after the last card lands the section stays pinned & static for ~one viewport of scroll — exactly the "scroll-jacked" feel the study warns against, on the media signature.
**Fix (exact).**
```ts
end: () => '+=' + (track.scrollWidth - window.innerWidth),
```
Match the pin distance to the travel. Consider `snap: 1 / (projects.length - 1)` for card-to-card settle (see REC-1 pacing).

### R4 — Counter format: use a proxy + `onUpdate`, not a raw `innerText` tween
**Problem.** §6.0 commits `gsap.to(counter,{innerText:100,snap:{innerText:1}})`. It *works* with core (verified — no TextPlugin), **but** renders "0,1,…,100" — **not** the zero-padded "000 → 100" the same section specifies — and writes `innerText` every tick (forces reflow + is `text-transform`-sensitive).
**Fix (exact).**
```ts
const o = { v: 0 };
gsap.to(o, { v: 100, duration: 1.1, ease: 'power2.out',
  onUpdate: () => { counter.textContent = String(Math.round(o.v)).padStart(3, '0'); } });
```
Reduced-motion: `counter.textContent = '100'` (or hide the counter), no tween. Keeps the design's padded counter and avoids per-tick reflow ambiguity.

### R5 — Hoist the clip/inset accent-wipe into ONE primitive (explicit DRY-mandate violation)
**Problem.** The same clip-path inset "accent wipe" is hand-rolled in **§6.0 intro curtain**, **§6.5 expertise flood**, **§6.9 closing curtain** (and conceptually the §6.2 hero bloom). The user's hard requirement says "**DRY primitives**"; the §7.2 inventory has Cursor/Magnetic/Section/SplitReveal/Marquee/Reveal/Accordion/ProjectCard/SectionLabel/ScrollProgress but **no** shared clip-reveal. Review task item 4 names this exact gap.
**Fix (exact).** Add to §7.2 a primitive:
```ts
// useClipReveal / <AccentWipe>
interface AccentWipeProps {
  direction?: 'up' | 'down' | 'left' | 'right' | 'circle';
  origin?: 'top' | 'bottom' | 'center' | { x: number; y: number };
  trigger?: 'inview' | 'scrub' | 'timeline';  // timeline → returns a tween for composition
  color?: string;                              // default var(--color-accent)
  onComplete?: () => void;
}
```
Use it for intro curtain (`direction:'up'`), expertise flood (`direction:'left'`), closing curtain (`direction:'right'`/inset). Hero circle bloom and About `background-size` word-fill may stay bespoke but should consume the same tokened easing/duration. This removes ~3 copies of near-identical clip logic.

### R6 — `strict` + `noUncheckedIndexedAccess` will fail `tsc -b` at concrete spots
**Problem.** §12 Step 0 enables `strict:true` + `noUncheckedIndexedAccess:true`. Under the latter, **numeric index access returns `T | undefined`**, and the build script is `tsc -b && vite build` — so this is a hard compile gate.
**Fix (exact), spot by spot:**
- `taglineParts: [string, string, string]` is a **tuple** → `taglineParts[0]` is `string` (tuples are exempt for known indices). **Keep it a tuple.** ✅
- `roleFacets: string[]`, `projects: Project[]`, `experience: ExperienceItem[]`, `marqueeWords`, `expertise`, skill `items` — iterate with `.map`/`.forEach` (element is non-undefined in the callback). Any **direct** numeric index (hero role step `roleFacets[i]`, projects counter `projects[active]`/"01/03", `experience[0]`) needs a guard or `?? fallback` or a `const facet = roleFacets[i]; if (!facet) return;`.
- **Every `useGSAP` effect** must guard `scope.current`/`ref.current` (they're `T | null`) before `querySelectorAll` — or use `gsap.utils.toArray<HTMLElement>(selector, scope.current!)` after a null check. Prefer `gsap.utils.selector(scope)` + guard.
- **`verbatimModuleSyntax`:** consumers of `content.ts` must split value vs type: `import { content } from '../data/content'` **and** `import type { Project, SiteContent } from '../data/content'` (or inline `import { content, type Project }`). No plain `import { Project }`.
- **No `enum`** (already handled — `CursorVariant`/`SplitBy` are unions). ✅
- `ctx.conditions!` (matchMedia) non-null assertion — fine under strict.

---

## RECOMMENDED improvements (non-blocking)

- **REC-1 — Pacing / total scroll length.** Add up the pinned scrub distance: hero `+=120%` (1.2vh) + projects `≈ scrollWidth-innerWidth` (~2–3vh for 3 full-bleed cards) + skills `+=150%` (1.5vh) ≈ **5+ viewport-heights of scrubbing** on top of the normal-flow sections and Lenis inertia. That risks "too long / scroll-jacked." Trim: **hero → `+=90%`**, **skills → `+=120%`**, projects fixed by R3; add `ScrollTrigger.snap` on projects (card-to-card) and optionally section snapping. The study explicitly warns against the reference's motion being "cut for friction" — don't overcorrect into fatigue.
- **REC-2 — Fontsource axes.** Bare `@fontsource-variable/bricolage-grotesque` (=`index.css`) typically exposes **`wght` only**. §4 wants `font-optical-sizing:auto` (opsz) and `wdth 75–100`. If those are actually used, import `@fontsource-variable/bricolage-grotesque/standard.css` (or add `/opsz.css` + `/wdth.css`); there is **no `full.css`** in this package. If only weight is used (the type map is almost entirely weights), the bare import is fine and `font-optical-sizing:auto` simply no-ops.
- **REC-3 — Hero role "word-swap" ≠ SplitText.** §6.2 says role facets swap "via SplitText." SplitText splits **one** string into pieces; swapping between **three different** strings ("FULL STACK"→"REACT NATIVE"→"PRODUCT-MINDED") is a stacked-span flip. Implement as 3 absolutely-stacked spans animated at timeline labels (`yPercent`/clip), not SplitText.
- **REC-4 — `RollingText` primitive.** Referenced in §6.8 (skills category flip) but absent from the §7.2 inventory. Add it or implement inline; keep it in the DRY ledger.
- **REC-5 — Grid-break device.** The brutalist requirement list includes **grid-break**; the plan implies it (full-bleed marquee, horizontal track, oversized type) but never names a deliberate asymmetry. Commit at least one: hero name bleeding past the gutter, or the About right-column intentionally offset off-grid.
- **REC-6 — Marquee auto-motion (WCAG 2.2.2).** Auto-scrolling keyword text runs indefinitely. The reduced-motion static path covers the sensitive case (accepted as sufficient), but consider pause-on-hover/focus for the non-reduced case.
- **REC-7 — State: memoize `ActiveSectionContext` value.** Writes are infrequent (once per crossing) and both consumers (Header underline, ScrollProgress rail) *need* the re-render — so Context is the right tool, no store needed. Just wrap `{activeId,setActiveId}` in `useMemo` (setActiveId from useState is already stable). If consumer count grows, split read/write contexts. Cursor is correctly free of per-frame React state (quickTo) — good.
- **REC-8 — `lib` lacks `DOM.Iterable`.** Spreading/`for..of` over `NodeListOf<Element>` won't typecheck. Prefer `gsap.utils.toArray()` (returns real arrays) over `[...el.querySelectorAll()]`, or add `"DOM.Iterable"` to `tsconfig.app.json` `lib`.
- **REC-9 — Lenis ticker cleanup handle.** Store the ticker fn in a const so cleanup removes the *same* reference under StrictMode double-invoke: `const raf = (t:number)=>lenis.raf(t*1000); gsap.ticker.add(raf); return ()=>{gsap.ticker.remove(raf); lenis.destroy();}`.
- **REC-10 — Intro timing reconcile.** counter 1.1s + curtain 0.7s ≈ 1.8–2.0s exceeds the stated "~1.4s hard cap"; clarify the cap = *when exit begins*, then +0.7s curtain.
- **REC-11 — Cursor-target boilerplate.** Many components repeat `onMouseEnter=()=>setCursor(v,l)` / `onMouseLeave=reset`. A tiny `useCursorTarget(variant,label)` returning `{onMouseEnter,onMouseLeave}` (auto-disabled on coarse pointer) removes the repetition.
- **REC-12 — DrawSVG is free now.** If a *true* stroke-draw is ever wanted for the §6.6 timeline line, DrawSVGPlugin ships free in 3.15. The current `scaleY` approach is fine and lighter — keep unless a dashed/partial stroke is desired.

---

## Requirement coverage table

| # | User hard requirement | Satisfied? | Where / note |
|---|---|---|---|
| 1 | Strict 3-color CSS-var theme | ✅ | §3.1 — 3 roles (base/ink/accent), grays as hairlines only. base-2/-3, ink-muted, accent-press are *derived tints/shades*, not new hues — within spirit. |
| 2 | Oversized fluid type | ✅ | §3.3 clamp scale `--fs-100…900` (76→208px hero). |
| 3 | Thick borders / hard shadows / underline-highlight / marquee / grid-break | ⚠️ mostly | Borders §3.4; hard shadows (offset, **0 blur** ✅); underline §6.1; marquee §6.3. **Grid-break not explicitly named — REC-5.** |
| 4 | Context-aware magnetic trailing cursor + touch disable | ✅ | §6/§8 quickTo trailing cursor, context labels, coarse-pointer disable (§11). |
| 5 | Scroll reveals + clip/mask wipes + parallax | ✅ | Reveal batch (§7), clip wipes (intro/expertise/closing/hero), media parallax (§6.7). |
| 6 | Magnetic buttons + hover-distort + animated underlines | ✅ | MagneticButton (§7.2), project skew-distort (§6.7), header/link underlines (§6.1). |
| 7 | Intentional section transitions | ✅ | Intro→hero curtain, closing curtain, distinct per-section entrances. (Could add 1 mid-page wipe — optional.) |
| 8 | Reduced-motion for EVERY animation | ✅ | §2 single `gsap.matchMedia` gate; every §6 section names a fallback; Lenis off; marquees static. |
| 9 | Exactly ONE real animation lib | ✅ | GSAP only (no Framer). Lenis = smooth-scroll, @gsap/react = GSAP ecosystem. |
| 10 | DRY primitives | ⚠️ | Magnetic/Split/Reveal/Section all centralized ✅; **clip-wipe duplicated 3× — R5.** |
| 11 | Lightweight state | ✅ | §8 two memoized contexts; heavy data kept out of React (quickTo/ScrollTrigger). |
| 12 | CSS Modules + theme.css | ✅ | §7 each component `*.module.css`; §3 single `theme.css`; no hardcoded hex rule. |
| 13 | Mobile-first responsive | ✅ | Fluid clamp scale + coarse-pointer branches per §6. Write base=mobile, `min-width` up (punch-list P1). |
| 14 | Semantic / ARIA / alt / focus | ✅ | §11 landmarks, `<button aria-expanded>`, real `<a>`, focus-visible ring, skip-link, alt text. **Plus R2 intro fix.** |
| 15 | Placeholder content in ONE data file | ✅ | §9 `src/data/content.ts`, `// TODO` on email/phone/links/media. |

**Net:** all 15 satisfied; #3 and #10 need the noted fixes (REC-5 grid-break; R5 clip-wipe DRY).

---

## Punch-list for the implementation agent (ordered; apply against PLAN + this review)

**P0 — before writing sections**
1. Delete boilerplate: remove `src/App.css`, `src/index.css`, `src/assets/*` starter, and the `./App.css`/`./index.css` imports in `main.tsx`/`App.tsx`. Replace `App.tsx` body with `<AppProviders>` shell.
2. `tsconfig.app.json`: add `"strict": true`, `"noUncheckedIndexedAccess": true`; consider adding `"DOM.Iterable"` to `lib` (REC-8).
3. `index.html`: set a real `<title>`, add `<meta name="description">`; keep `lang="en"`.
4. `bun add gsap @gsap/react lenis @fontsource-variable/bricolage-grotesque @fontsource/space-mono` (all verified). SplitText is **already in `gsap`** — no extra install.

**P1 — spine + engine**
5. `register.ts`: `gsap.registerPlugin(ScrollTrigger, useGSAP)` — **keep as written (verified valid).**
6. `SmoothScrollProvider`: canonical Lenis↔ScrollTrigger wiring; **named ticker fn for cleanup** (REC-9); Lenis off under reduced-motion.
7. `splitText.ts` + `useSplitText`: **R1** — SplitText 3.15 `SplitText.create(el,{type,autoSplit:true,aria:'auto',onSplit})` gated on `document.fonts.ready`; custom fallback replicates re-split (ResizeObserver + fonts.ready) + SR-only original. Then `ScrollTrigger.refresh()`.
8. Fonts: import per §4 (all paths verified). If opsz/wdth actually used, import `standard.css` not bare index (REC-2).

**P2 — primitives**
9. Add **`useClipReveal`/`<AccentWipe>`** primitive (**R5**); refactor intro/expertise/closing to use it.
10. Add **`RollingText`** to inventory (REC-4).
11. `useCursorTarget` helper (REC-11, optional). Memoize both context values (REC-7).

**P3 — sections (apply per-section fixes)**
12. **Intro (§6.0):** counter via proxy+`onUpdate`+`padStart` (**R4**); focus→Skip, `inert` background, Enter/Esc/Space/click dismiss, `ScrollTrigger.refresh()` on exit + after fonts (**R2**); reconcile ~1.4s cap (REC-10).
13. **Hero (§6.2):** role facets = 3 stacked spans flipped at timeline labels, not SplitText (REC-3); trim `end:'+=90%'` (REC-1); name grid-break (REC-5).
14. **Projects (§6.7):** `end:()=>'+='+(track.scrollWidth-window.innerWidth)` (**R3**); optional `snap` card-to-card.
15. **Skills (§6.8):** trim `end:'+=120%'` (REC-1); RollingText from P2.
16. **Marquee (§6.3):** pause-on-hover/focus (REC-6, optional).
17. **All sections:** guard `scope.current`/`ref.current`, iterate arrays via `.map`, guard any direct numeric index; split value/type imports from `content.ts` (**R6**). Every §6 effect must ship its reduced-motion branch (matchMedia) and its coarse-pointer branch.

**P4 — polish/verify**
18. `ScrollTrigger.refresh()` after `document.fonts.ready` **and** after Intro unmount.
19. axe + keyboard pass (accordion Enter/Space, mobile-menu focus-trap + Esc + focus-return + `inert`), reduced-motion pass, coarse-pointer pass. Grep for stray hex (token discipline). Lighthouse.

---

*End of review. Verdict: GO-WITH-CHANGES. Blocking items R1–R6; the rest is polish.*
