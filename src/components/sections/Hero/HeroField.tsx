import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useIsCoarsePointer } from '../../../hooks/useIsCoarsePointer';
import styles from './HeroField.module.css';

const COLS = 12;
const ROWS = 7;
const CELLS = Array.from({ length: COLS * ROWS });

const RADIUS = 190; // px of cursor influence
const PULL = 0.5; // how far a dot leans toward the cursor (fraction of its distance)
const GROW = 1.9; // extra scale at the cursor's centre

/** Interactive dot grid behind the hero. Dots lean toward and swell near the
 *  cursor. Static (no listeners) under reduced motion or on touch. */
export function HeroField() {
  const reduced = useReducedMotion();
  const coarse = useIsCoarsePointer();
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduced || coarse) return;
      const root = rootRef.current;
      if (!root) return;

      const dots = gsap.utils.toArray<HTMLElement>('[data-dot]', root);
      const setters = dots.map((d) => ({
        x: gsap.quickTo(d, 'x', { duration: 0.5, ease: 'power3' }),
        y: gsap.quickTo(d, 'y', { duration: 0.5, ease: 'power3' }),
        s: gsap.quickTo(d, 'scale', { duration: 0.5, ease: 'power3' }),
      }));

      // dots only translate (transform), so their rest-centres are stable once
      // measured — cache them and recompute on resize instead of per-move.
      let centres: Array<{ cx: number; cy: number }> = [];
      const measure = () => {
        centres = dots.map((d) => {
          const r = d.getBoundingClientRect();
          return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        });
      };
      measure();
      // re-measure once more after fonts/layout settle
      const settle = requestAnimationFrame(measure);

      let mx = -9999;
      let my = -9999;
      let raf = 0;
      const apply = () => {
        raf = 0;
        for (let i = 0; i < dots.length; i++) {
          const c = centres[i];
          const set = setters[i];
          if (!c || !set) continue;
          const dx = mx - c.cx;
          const dy = my - c.cy;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS) {
            const f = 1 - dist / RADIUS;
            set.x(dx * PULL * f);
            set.y(dy * PULL * f);
            set.s(1 + f * GROW);
          } else {
            set.x(0);
            set.y(0);
            set.s(1);
          }
        }
      };
      const schedule = () => {
        if (!raf) raf = requestAnimationFrame(apply);
      };
      const onMove = (e: PointerEvent) => {
        mx = e.clientX;
        my = e.clientY;
        schedule();
      };
      const onLeave = () => {
        mx = -9999;
        my = -9999;
        schedule();
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerleave', onLeave);
      window.addEventListener('resize', measure);
      return () => {
        cancelAnimationFrame(settle);
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('resize', measure);
      };
    },
    { dependencies: [reduced, coarse], scope: rootRef },
  );

  return (
    <div ref={rootRef} className={styles.field} aria-hidden="true">
      {CELLS.map((_, i) => (
        <span key={i} data-dot className={styles.dot} />
      ))}
    </div>
  );
}
