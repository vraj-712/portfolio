---
name: gsap-motion-patterns
description: Correct GSAP 3 + @gsap/react + Lenis patterns for this codebase — useGSAP scoping, ScrollTrigger pinning and refresh, the volatile-value ref pattern, reduced-motion end states, and the failure modes to check for. Read before touching any animation code.
---

# GSAP motion patterns

Motion in this project is structural, not decorative. Sections pin, tracks scrub, type splits and
reveals on scroll. That means an animation bug does not look like a rough transition — it looks like
missing content or a page that will not scroll.

Stack: GSAP 3.15, `@gsap/react` 2.1 (`useGSAP`), ScrollTrigger, Lenis 1.3 for smooth scroll.

---

## 1. `useGSAP` is the only entry point

```tsx
const rootRef = useRef<HTMLElement>(null);

useGSAP(() => {
  gsap.from('.thing', { y: 40, opacity: 0, duration: DUR.base, ease: EASE.expoOut });
}, { scope: rootRef });
```

`useGSAP` creates a `gsap.context()` scoped to `rootRef` and **reverts it on unmount**. Reverting
kills every tween, timeline and ScrollTrigger created inside the callback, and restores inline
styles. That is the entire cleanup story — which is why nothing may animate outside it.

- Always pass `scope`. Without it, selector strings resolve against the whole document, so a
  component animates another component's elements.
- A bare `useEffect` + `gsap.to()` **leaks**. On a page with pinned triggers, a leak means the old
  trigger keeps responding to scroll after the element is gone.
- `useGSAP` reverts **GSAP objects only**. A raw `addEventListener`, `ResizeObserver`, or
  `setTimeout` inside the callback still needs its own cleanup — return a function or use the
  `contextSafe` helper.

Plugins register once in `src/lib/gsap/register.ts` via `registerGsap()`, which is idempotent and
StrictMode-safe. Never call `gsap.registerPlugin` from a component.

---

## 2. The volatile-value ref pattern

The problem: a pinned ScrollTrigger is expensive to build and re-measures the document. If a value
the animation reads is in the dependency array, every change to that value tears down and rebuilds
the pin — which fights Lenis, can strand the pinned element, and jumps the scroll position.

The fix: read the value through a ref, and keep the dependency array empty.

```tsx
// ✅ correct — ref assigned in an effect, read inside the tween callback
const themeRef = useRef(theme);
useEffect(() => { themeRef.current = theme; }, [theme]);

useGSAP(() => {
  ScrollTrigger.create({
    trigger: rootRef.current,
    pin: true,
    onUpdate: (self) => {
      applyBloom(bloomRef.current, self.progress, themeRef.current); // fresh value, no rebuild
    },
  });
}, { scope: rootRef });
```

```tsx
// ❌ wrong — react-hooks/refs errors: "Cannot access refs during render"
const themeRef = useRef(theme);
themeRef.current = theme;
```

```tsx
// ❌ wrong — rebuilds the pin on every theme change
useGSAP(() => { ... }, { scope: rootRef, dependencies: [theme] });
```

The render-phase assignment is the tempting shortcut and it is a lint error under `react-hooks` v7.
Under concurrent rendering a render can be thrown away, so a value written during render may not
correspond to the committed tree. The effect form is correct because it runs after commit.

---

## 3. ScrollTrigger discipline

**Create once, refresh after layout changes.** Anything that changes document height invalidates
every trigger's start/end:

- fonts finishing loading (`document.fonts.ready` → `ScrollTrigger.refresh()`, done in `App.tsx`)
- the intro gate dismissing (`introDone` → `refresh()`, done in `App.tsx`)
- an accordion opening or closing
- an image decoding at an unknown intrinsic size

Follow the existing `App.tsx` pattern rather than adding a competing refresh mechanism.

**`invalidateOnRefresh: true`** on any trigger whose `start`/`end` is a function of measured size —
otherwise the recomputed refresh reuses stale numbers.

**Breakpoint-conditional animation uses `gsap.matchMedia()`**, not a one-time `window.innerWidth`
read:

```tsx
useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 821px)', () => {
    ScrollTrigger.create({ /* desktop pin */ });
  });
  return () => mm.revert();
}, { scope: rootRef });
```

**Pins inside transformed ancestors drift.** If a pinned element's parent chain has a `transform`,
`filter`, or `will-change: transform`, the pin's fixed positioning is relative to that ancestor, not
the viewport. Check the chain before debugging the trigger itself.

---

## 4. Reduced motion

`useReducedMotion()` ORs the OS `prefers-reduced-motion: reduce` query with the Settings-panel
toggle, and updates live via both a `matchMedia` listener and a subscription.

**The rule: short-circuit to the END state, never the start state, never hidden.**

```tsx
useGSAP(() => {
  if (reduced) {
    gsap.set('.reveal', { opacity: 1, y: 0, clipPath: 'inset(0 0 0 0)' }); // finished pose
    return;
  }
  gsap.from('.reveal', { opacity: 0, y: 32, ... });
}, { scope: rootRef, dependencies: [reduced] });
```

The failure mode to hunt for is an early `return` that skips the animation **without** setting the
end state — when the element's resting CSS is `opacity: 0` (because the animation was going to fade
it in), a reduced-motion visitor gets a blank section. Check every branch: *if this path is taken,
is the content visible?*

Note that `reduced` **is** a legitimate dependency — the whole animation strategy changes, so a
rebuild is correct. It is volatile *values inside* a stable animation that use the ref pattern.

---

## 5. Lenis owns scroll

Lenis runs the scroll loop; the native scroller is driven by it. Consequences:

- Never call `window.scrollTo`, never set `scrollTop`, never rely on `scroll-behavior: smooth` for
  programmatic movement. Two scrollers fighting produces jitter that is very hard to trace.
- Anchor navigation goes through the Lenis instance from `SmoothScrollContext` (`lenis.scrollTo`).
- ScrollTrigger must be driven from Lenis's frame loop, not its own — check `SmoothScrollProvider`
  wires `lenis.on('scroll', ScrollTrigger.update)` and drives `lenis.raf` from `gsap.ticker`.
- Locking scroll (modal open) is `lenis.stop()` / `lenis.start()`, not `overflow: hidden` on body.

---

## 6. Pointer and touch

`useIsCoarsePointer()` gates everything pointer-driven:

- the custom cursor (`Cursor.tsx` and its variants)
- magnetic hover (`useMagnetic`)
- the pinned horizontal Projects track — touch gets a vertical stack instead

Check it **before** wiring a `mousemove` listener, not inside the handler. And remember a device can
change class mid-session (a tablet with a keyboard attached, a rotated phone) — the hook is live, so
the component must handle unmounting its animation cleanly when it flips.

---

## 7. Tokens, not literals

Import `DUR` and `EASE` from `src/lib/gsap/easings.ts`. Never write `duration: 0.45` or
`ease: 'power4.out'` inline. Those values mirror `--dur-*` and `--ease-*` in `theme.css`; a literal
breaks the mirror silently.

---

## 8. Review checklist

- [ ] Every animation inside a `useGSAP` with a `scope`
- [ ] No `gsap.registerPlugin` outside `register.ts`
- [ ] No volatile user-driven value in a `useGSAP` dependency array feeding a pinned trigger
- [ ] Every ref used for the volatile pattern is assigned in an effect, not during render
- [ ] Every reduced-motion branch sets the end state before returning
- [ ] Raw DOM listeners inside `useGSAP` have explicit cleanup
- [ ] `ScrollTrigger.refresh()` after anything that changes document height
- [ ] `invalidateOnRefresh` on size-dependent triggers
- [ ] `gsap.matchMedia()` for breakpoint-conditional motion, reverted on cleanup
- [ ] No `window.scrollTo`; anchors go through Lenis
- [ ] `useIsCoarsePointer()` checked before pointer-driven motion
- [ ] `DUR` / `EASE` imported, not inlined
- [ ] Array indices in timeline building are guarded (`noUncheckedIndexedAccess`)
