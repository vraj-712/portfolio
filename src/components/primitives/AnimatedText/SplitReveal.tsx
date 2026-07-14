import { useRef, type ElementType, type Ref } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSplitText } from '../../../hooks/useSplitText';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { EASE } from '../../../lib/gsap/easings';
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

/** Kinetic type: splits text and reveals the units. Re-splits after fonts load
 *  and on resize (via useSplitText → PLAN_REVIEW R1). Reduced-motion → plain text. */
export function SplitReveal({
  as = 'span',
  children,
  splitBy = 'words',
  stagger = 0.06,
  duration = 0.7,
  ease = EASE.expoOut,
  y = 110,
  skew = 0,
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

      const ctx = gsap.context(() => {
        gsap.fromTo(
          units,
          { yPercent: y, autoAlpha: 0, skewY: skew },
          {
            yPercent: 0,
            autoAlpha: 1,
            skewY: 0,
            duration,
            ease,
            stagger,
            scrollTrigger:
              trigger === 'mount'
                ? undefined
                : {
                    trigger: el,
                    start,
                    ...(trigger === 'scrub'
                      ? { scrub: true, end: 'top 45%' }
                      : { toggleActions: 'play none none none' }),
                  },
          },
        );
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
