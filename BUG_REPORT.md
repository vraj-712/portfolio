# BUG REPORT — Stage 5 (automated browser testing)

Tested the running dev build with headless Chrome (Playwright) at three configurations —
**desktop 1440×900**, **desktop 1440×900 with `prefers-reduced-motion: reduce`**, and
**mobile 390×844 (touch)** — capturing console errors, page errors, failed requests,
horizontal-overflow measurements, interaction state, and screenshots of every section.

> Note: the Playwright **MCP** server disconnected mid-session, so testing was done with a
> locally-installed Playwright (`playwright@1.61.1`) driving system Chrome. Screenshots are in
> the session scratchpad (`shots/`).

---

## PASS — verified working

| Check | Desktop | Reduced-motion | Mobile |
|---|---|---|---|
| Console errors | **0** | **0** | **0** |
| Page/runtime errors | **0** | **0** | **0** |
| Failed requests (non-favicon) | **0** | **0** | **0** |
| Horizontal overflow (top / after full scroll) | **0px** | **0px** | **0px** |
| All 8 sections present in DOM | ✅ | ✅ | ✅ |
| Intro gate auto-dismisses | ✅ (~1.4s) | ✅ (fast, ~150ms) | ✅ |
| Custom cursor active (`has-custom-cursor`) | ✅ | ✅ | n/a (disabled on touch, correct) |
| Kinetic type ends VISIBLE (not stuck hidden) | ✅ | ✅ (opacity 1 / visible) | ✅ |
| Accordion toggles (`aria-expanded` false→true) | ✅ | — | ✅ (tap) |
| Mobile menu opens + closes on **Esc** | — | — | ✅ |
| Projects → vertical stack on touch (no pin) | — | — | ✅ |
| Closing curtain wipes IN then OUT and CLEARS | ✅ (`clip-path: inset(0 0 100%)`, tagline visible) | ✅ | ✅ |

Visual review of screenshots confirms: hero (kinetic name + accent bloom + rolling role),
marquee band, about (line reveal + highlighted word + education card + chips), expertise
accordion, experience timeline, projects horizontal media track, skills pinned dual-marquee
with flipping category, and the closing curtain + collapsing tagline all render correctly and
on-palette (bone / ink / ultramarine).

---

## BUGS

### BUG-1 (medium) — Résumé button visible on mobile header
**Where:** `Header` at ≤820px. **Observed:** the top-bar `Résumé` button renders next to the
hamburger on mobile (it should be hidden there — it already appears inside the mobile menu sheet).
**Cause:** `<Magnetic>` sets an inline `style={{ display: 'inline-block' }}`, which overrides the
`.resumeWrap { display: none }` media-query rule (inline style beats a normal class rule).
**Fix:** make the mobile hide `display: none !important` so it beats the inline style.

### BUG-2 (low) — About lead: last line's descenders clipped
**Where:** `About` lead statement (`SplitReveal` split by lines). **Observed:** the final line
("…ecosystem.") has its descenders (y/p/g) clipped by the split-line `overflow: hidden`, because
`.lead` uses a very tight `line-height: 1.05`.
**Fix:** give `.split__line` a small `padding-bottom` + negative `margin-bottom` (descender room
without changing layout spacing) and relax `.lead` line-height to ~1.14.

---

## MINOR / COSMETIC (accepted)

- **Reduced-motion progress rail** renders the accent bar at full height (progress not animated).
  Harmless; the rail is decorative and the reduced-motion path intentionally skips the scrub.
- **Skills ghost marquee rows** are intentionally very low-contrast (texture behind the accent
  category word). Reads as subtle texture; acceptable by design.

---

## Fix plan (Stage 6)
1. BUG-1 → `Header.module.css`: `.navDesktop, .resumeWrap { display: none !important; }` in the
   `max-width: 820px` query.
2. BUG-2 → `global.css`: pad `.split__line`; `About.module.css`: `.lead` line-height 1.14.
3. Re-run the mobile + about checks to confirm.

---

## Stage 6 — Resolution (both fixed & re-verified)

- **BUG-1 FIXED** — mobile (390px) re-test: résumé link `display:none` (`mobileResumeVisible:false`),
  hamburger visible; screenshot `mobile-hero2.png` shows only the burger in the top bar.
- **BUG-2 FIXED** — About lead re-test (`desktop-about2.png`): descenders on "web,", "mobile,",
  "JavaScript" now have room; no glyph clipping.
- Post-fix full check: **`tsc -b` 0 errors · `eslint .` 0 problems · `vite build` success.**

No further bugs outstanding. Build is clean and release-ready (placeholder content + `// TODO`
contact/media to be swapped for final copy).
