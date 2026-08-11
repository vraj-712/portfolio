---
name: visual-verification
description: How to verify a visual or motion change in a real browser for vraj-portfolio — the matrix of viewports and settings to check, what to measure, and what counts as evidence. Read before claiming any rendered change works.
---

# Visual verification

There is no test suite. For anything that changes what the page looks like or how it moves, the
browser **is** the test. "The build passed" is not evidence that a visual change is correct.

Tooling available: Playwright (`playwright@1.61.1`, already a devDependency, drives system Chrome),
the `chrome-devtools` MCP server from the ECC plugin, and `mcp__playwright__*` browser tools.

---

## 1. Get it running

```bash
npm run dev      # http://localhost:5173
```

For a production-shaped check (prerendered DOM, minified CSS, real font loading):

```bash
npm run build && npm run preview
```

The prerender step in `npm run build` launches headless Chrome itself. If Chrome is unavailable,
`npm run build:nossg` skips it — but then you have not verified the prerendered output, so say so.

---

## 2. The matrix

Every visual change is checked at **minimum** across these. A motion or layout change is checked
across all of them.

| Configuration | Why it matters |
|---|---|
| Desktop 1440×900 | The primary design target |
| Mobile 390×844, touch emulated | Switches `useIsCompact()` and `useIsCoarsePointer()` — different components mount |
| Desktop + `prefers-reduced-motion: reduce` | The stranded-end-state failure mode lives here |
| 360px width | The narrowest supported viewport; where horizontal overflow appears |

Additional configurations when the change touches the relevant system:

- **Settings panel extremes** — `--fs-scale` and `--space-scale` at maximum (layout overflow),
  `--dur-scale` at both ends, hard shadows off, each cursor Mode
- **Very wide (2560px)** — checks `--page-max` framing and `--page-inset` offsetting of fixed chrome
- **Keyboard only** — tab through the whole page

---

## 3. What to measure

Do not rely on a screenshot alone. Screenshots miss console errors, and they cannot tell you that an
element is at `opacity: 0.99` versus `1`.

**Always collect:**

```js
// console errors and page errors — must be 0
// failed network requests (ignore favicon noise) — must be 0

// horizontal overflow, at the top and after a full scroll — must be 0
document.documentElement.scrollWidth - document.documentElement.clientWidth

// every section present
document.querySelectorAll('main > section').length
```

**For a motion change, assert the end state explicitly.** This is the highest-value check in this
codebase:

```js
// after scrolling past the section, every revealed element must be visible
[...document.querySelectorAll('[data-reveal]')].map(el => {
  const s = getComputedStyle(el);
  return { opacity: s.opacity, visibility: s.visibility, clipPath: s.clipPath, transform: s.transform };
});
// nothing may be opacity 0, visibility hidden, or clipped
```

Run that same assertion **with reduced motion on**. A reduced-motion visitor must land on the same
end state, immediately.

**For an interaction change**, drive it and assert the resulting state — `aria-expanded` flipping,
focus landing where it should, `Escape` closing a modal and returning focus to the trigger.

---

## 4. Scroll-specific checks

The site is scroll-driven, so scroll behaviour is the thing most likely to break:

- Scroll to the bottom and back to the top. Nothing should be left pinned, and total document height
  should return to the same value.
- Resize the window mid-page and confirm pinned sections re-measure rather than drift.
- Open an accordion (which changes document height) and confirm downstream triggers still fire at
  the right place — this is what `ScrollTrigger.refresh()` exists for.
- Toggle a cursor Mode while a pinned section is on screen. The pin must not rebuild or jump; that
  is what the volatile-value ref pattern protects.

---

## 5. What counts as evidence

Report what you actually observed, with the numbers:

```
desktop 1440×900   console 0 · pageerrors 0 · failed req 0 · overflow 0px · 8/8 sections
mobile 390×844     console 0 · pageerrors 0 · overflow 0px · resume button hidden ✓ · menu Esc closes ✓
reduced-motion     console 0 · all [data-reveal] opacity 1, visibility visible ✓
```

Not "looks fine". If you could not check something, say which and why — an honest gap is useful;
an unverified claim is not.

Screenshots are supporting evidence for layout and typography judgements, and they are the only way
to catch things no assertion anticipates. Take them, look at them, and describe what you see.

---

## 6. Checklist

- [ ] Dev or preview server running, correct build mode for the claim being made
- [ ] Desktop 1440×900 checked
- [ ] Mobile 390×844 with touch emulation checked
- [ ] Reduced-motion checked, end states asserted
- [ ] 360px checked for horizontal overflow
- [ ] Console errors, page errors, failed requests all 0
- [ ] Scroll to bottom and back; nothing stranded or stuck pinned
- [ ] Keyboard path works; focus visible throughout
- [ ] Settings extremes checked if the change touches the token or motion layer
- [ ] Observations reported with numbers, gaps stated honestly
