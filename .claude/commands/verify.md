---
description: Run the full quality gate — typecheck, lint, build, and a browser check of the rendered site.
---

Verify the current working tree is genuinely shippable. Report real numbers, not impressions.

## 1. Static gate

```bash
npx tsc -b        # must be 0 errors
npx eslint .      # must be 0 errors, 0 warnings
npm run build     # tsc -b → vite build → Playwright prerender
```

If Chrome is unavailable, fall back to `npm run build:nossg` and **say so** — the prerendered
`dist/index.html` will not have been verified.

## 2. Browser gate

Follow `.claude/skills/visual-verification/SKILL.md`. Serve the build:

```bash
npm run preview
```

Check the matrix and collect the numbers:

| Configuration | Collect |
|---|---|
| Desktop 1440×900 | console errors, page errors, failed requests, horizontal overflow, section count |
| Mobile 390×844 (touch) | same, plus: résumé button hidden in the top bar, menu opens and closes on Escape |
| Desktop + reduced motion | same, plus: every revealed element ends at `opacity: 1` / `visibility: visible` |
| 360px wide | horizontal overflow must be 0 |

Then scroll to the bottom and back to the top and confirm nothing is left pinned or stranded.

## 3. Diff review

```bash
git status --short
git diff
```

Look for what you did not mean to change: debug statements, formatting sweeps, `dist/` edits.

## 4. Report

```
tsc -b            0 errors
eslint .          0 problems
build             ok (full / nossg)
desktop           console 0 · overflow 0px · 8/8 sections
mobile            console 0 · overflow 0px · Esc closes menu ✓
reduced-motion    all reveals visible ✓
```

State any check you could not run and why. An honest gap beats an unverified claim.
