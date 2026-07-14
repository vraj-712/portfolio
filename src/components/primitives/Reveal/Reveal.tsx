import { useRef, type ElementType, type ReactNode, type Ref } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { EASE } from '../../../lib/gsap/easings';

type RevealVariant = 'fade' | 'up' | 'clip' | 'scale';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  variant?: RevealVariant;
  delay?: number;
  stagger?: number; // stagger direct children instead of the container
  start?: string;
  className?: string;
}

const FROM: Record<RevealVariant, gsap.TweenVars> = {
  fade: { autoAlpha: 0 },
  up: { autoAlpha: 0, y: 44 },
  clip: { autoAlpha: 0, clipPath: 'inset(0% 0% 100% 0%)' },
  scale: { autoAlpha: 0, scale: 0.92 },
};

const TO: Record<RevealVariant, gsap.TweenVars> = {
  fade: {},
  up: { y: 0 },
  clip: { clipPath: 'inset(0% 0% 0% 0%)' },
  scale: { scale: 1 },
};

/** Scroll-triggered entrance reveal. useGSAP applies the initial state in a
 *  layout effect, so there is no flash. Reduced-motion → no animation (visible). */
export function Reveal({
  children,
  as = 'div',
  variant = 'up',
  delay = 0,
  stagger,
  start = 'top 85%',
  className,
}: RevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;
      const targets: Element[] | Element = stagger ? Array.from(el.children) : el;

      gsap.fromTo(
        targets,
        FROM[variant],
        {
          ...TO[variant],
          autoAlpha: 1,
          duration: 0.7,
          ease: EASE.powerOut,
          delay,
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: el, start, toggleActions: 'play none none none' },
        },
      );
    },
    { dependencies: [reduced, variant], scope: ref },
  );

  const Tag = as;
  return (
    <Tag ref={ref as Ref<HTMLElement>} className={className}>
      {children}
    </Tag>
  );
}
