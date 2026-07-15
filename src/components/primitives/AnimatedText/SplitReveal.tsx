import { useRef, type ElementType, type Ref } from 'react';
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

      ScrollTrigger.refresh();
      return () => ctx.revert();
    },
  });

  const Tag = as;
  return (
    <Tag
      ref={ref as Ref<HTMLElement>}
      className={className}
      style={reduced ? undefined : { visibility: 'hidden' }}
    >
      {children}
    </Tag>
  );
}
