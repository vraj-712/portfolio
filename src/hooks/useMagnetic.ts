import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { isCoarsePointer, prefersReducedMotion } from '../lib/utils/env';

interface UseMagneticOptions {
  strength?: number; // pull factor 0..1
  radius?: number; // reserved (hover-based variant)
  disabled?: boolean;
}

/** Attaches a magnetic pull to an element: while hovered, it eases toward the
 *  cursor via gsap.quickTo (no React state). Auto-disabled on coarse pointers
 *  and reduced-motion. */
export function useMagnetic<T extends HTMLElement>(opts: UseMagneticOptions = {}) {
  const ref = useRef<T>(null);
  const { strength = 0.35, disabled = false } = opts;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || disabled || isCoarsePointer() || prefersReducedMotion()) return;

      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        xTo(dx * strength);
        yTo(dy * strength);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    },
    { dependencies: [strength, disabled] },
  );

  return ref;
}
