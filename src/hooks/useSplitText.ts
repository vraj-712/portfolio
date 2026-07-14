import { useEffect, useLayoutEffect, useRef } from 'react';
import { splitText } from '../lib/gsap/splitText';
import type { SplitResult, SplitType } from '../lib/gsap/splitText';

interface UseSplitTextOptions {
  type: SplitType;
  /** Create animations against the freshly-split units. Return a cleanup that
   *  reverts them (called before every re-split and on unmount). */
  onSplit: (result: SplitResult) => (() => void) | void;
  /** When false, no split happens — the element keeps its plain text (used for
   *  the reduced-motion path where the caller renders the final state). */
  enabled?: boolean;
}

/** Splits an element's text and (re)creates its animation after fonts load and on
 *  every meaningful resize — so kinetic type never measures against fallback-font
 *  metrics or stale line-wraps (PLAN_REVIEW R1). */
export function useSplitText(
  ref: React.RefObject<HTMLElement | null>,
  options: UseSplitTextOptions,
): void {
  const { type } = options;
  const enabled = options.enabled ?? true;
  const onSplitRef = useRef(options.onSplit);
  useLayoutEffect(() => {
    onSplitRef.current = options.onSplit;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let cancelled = false;
    let split: SplitResult | null = null;
    let cleanupAnim: (() => void) | void;
    let ro: ResizeObserver | null = null;
    let lastWidth = 0;

    const doSplit = () => {
      if (cancelled || !el) return;
      if (typeof cleanupAnim === 'function') cleanupAnim();
      if (split) split.revert();
      split = splitText(el, type);
      cleanupAnim = onSplitRef.current(split);
    };

    const start = () => {
      if (cancelled || !el) return;
      lastWidth = el.offsetWidth;
      doSplit();
      ro = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect.width ?? 0;
        if (Math.abs(w - lastWidth) < 1) return;
        lastWidth = w;
        doSplit();
      });
      ro.observe(el);
    };

    if (document.fonts && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(() => start());
    } else {
      start();
    }

    return () => {
      cancelled = true;
      ro?.disconnect();
      if (typeof cleanupAnim === 'function') cleanupAnim();
      if (split) split.revert();
    };
  }, [ref, type, enabled]);
}
