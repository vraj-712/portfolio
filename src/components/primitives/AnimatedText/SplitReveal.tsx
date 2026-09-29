import { useLayoutEffect, useRef, type ElementType, type Ref } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSplitText } from '../../../hooks/useSplitText';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { textReveal } from '../../../lib/gsap/reveal';
import type { SplitType } from '../../../lib/gsap/splitText';

interface SplitRevealProps {
  as?: ElementType;
  children: string; // plain text (kept as SR-only original when split)
  splitBy?: SplitType;
  stagger?: number;
  duration?: number;
  ease?: string;
  y?: number; // initial yPercent
  skew?: number; // initial skewY (deg)
  trigger?: 'inview' | 'mount' | 'scrub';
  start?: string;
  className?: string;
}

/** Kinetic type: splits text and reveals the units with the active Mode's motion
 *  (ease/duration/skew read at reveal time, so switching Mode re-flavours reveals
 *  that haven't fired yet). Explicit props still win. Reduced-motion → plain text. */
export function SplitReveal({
  as = 'span',
  children,
  splitBy = 'words',
  stagger,
  duration,
  ease,
  y = 110,
  skew,
  trigger = 'inview',
  start = 'top 80%',
  className,
}: SplitRevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // React must NOT own the children of a node GSAP rewrites. splitText() clears
  // this element and rebuilds its subtree, and revert() replaces the text node
  // again — so if React rendered {children} here, its fiber would keep pointing
  // at a text node that is no longer in the document, and the next
  // reconciliation touching this subtree (an unmount, say) would throw
  // NotFoundError. That is the same class of bug as the pin-spacer desync
  // documented in SITE_AUDIT.md, and it is latent only because About and
  // Closing never unmount today.
  //
  // Rendering an empty element and writing the text imperatively keeps this
  // subtree entirely GSAP's, and keeps React's model of it accurate: no
  // children. A layout effect runs before useSplitText's passive effect, so the
  // text is always in place before the first split.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Already split from this exact text — leave the split subtree alone.
    if (el.getAttribute('data-split-original') === children) return;
    el.removeAttribute('data-split-original');
    el.textContent = children;
  }, [children]);

  useSplitText(ref, {
    type: splitBy,
    enabled: !reduced,
    onSplit: (res) => {
      const el = ref.current;
      if (!el) return;
      el.style.visibility = 'visible';
      const units = res[splitBy];
      if (units.length === 0) return;

      const revealed = { yPercent: 0, autoAlpha: 1, skewY: 0 };
      const play = () => {
        const rv = textReveal();
        return gsap.to(units, {
          ...revealed,
          duration: (duration ?? 0.7) * rv.durScale,
          ease: ease ?? rv.ease,
          stagger: stagger ?? rv.stagger,
        });
      };

      const ctx = gsap.context(() => {
        gsap.set(units, { yPercent: y, autoAlpha: 0, skewY: skew ?? textReveal().skew });

        if (trigger === 'mount') {
          play();
          return;
        }
        if (trigger === 'scrub') {
          const rv = textReveal();
          gsap.to(units, {
            ...revealed,
            ease: ease ?? rv.ease,
            stagger: stagger ?? rv.stagger,
            scrollTrigger: { trigger: el, start, scrub: true, end: 'top 45%' },
          });
          return;
        }
        // inview: build once; read the profile live when it enters, so a Mode
        // switch before the reveal changes its feel without a rebuild/flash.
        ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: () => play(),
          // already scrolled past on load/refresh → just show it, no animation
          onRefresh: (self) => {
            if (self.progress > 0) gsap.set(units, revealed);
          },
        });
      }, el);

      // No ScrollTrigger.refresh() here. ScrollTrigger.create() already refreshes
      // the trigger it just built (which is what fires the onRefresh above), and a
      // global refresh from a per-instance ResizeObserver re-measures every pin on
      // the page mid-gesture. Document-height changes are refreshed centrally in
      // App.tsx (fonts.ready, intro dismissal); a window resize is covered by
      // ScrollTrigger's own debounced autoRefreshEvents pass, which lands after the
      // re-split.
      return () => ctx.revert();
    },
  });

  const Tag = as;
  return (
    <Tag
      ref={ref as Ref<HTMLElement>}
      className={className}
      style={reduced ? undefined : { visibility: 'hidden' }}
      // No children: the layout effect above writes the text. See the comment
      // there — anything React renders into this node, GSAP would destroy.
    />
  );
}
