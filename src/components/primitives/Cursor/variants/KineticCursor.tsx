import { useRef, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { CursorViewProps } from './types';
import styles from './KineticCursor.module.css';

const TRAIL = 5;

/** Kinetic — a ring that follows with a slight overshoot (bouncy) trailed by a
 *  short comet of accent dots that lag progressively. Trail is dropped under
 *  reduced motion. */
export function KineticCursor({ variant, label, reduced }: CursorViewProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const scope = scopeRef.current;
      const ring = ringRef.current;
      if (!scope || !ring) return;

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      gsap.set(ring, { xPercent: -50, yPercent: -50, x: cx, y: cy });

      const rDur = reduced ? 0 : 0.3;
      const rx = gsap.quickTo(ring, 'x', { duration: rDur, ease: 'back.out(1.4)' });
      const ry = gsap.quickTo(ring, 'y', { duration: rDur, ease: 'back.out(1.4)' });

      const trails = gsap.utils.toArray<HTMLElement>('[data-trail]', scope);
      const tset = trails.map((t, i) => {
        gsap.set(t, { xPercent: -50, yPercent: -50, x: cx, y: cy });
        const d = reduced ? 0 : 0.14 + i * 0.07;
        return {
          x: gsap.quickTo(t, 'x', { duration: d, ease: 'power2' }),
          y: gsap.quickTo(t, 'y', { duration: d, ease: 'power2' }),
        };
      });

      const onMove = (e: PointerEvent) => {
        rx(e.clientX);
        ry(e.clientY);
        for (const s of tset) {
          s.x(e.clientX);
          s.y(e.clientY);
        }
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    },
    { dependencies: [reduced], scope: scopeRef },
  );

  return (
    <div ref={scopeRef} style={{ display: 'contents' }}>
      {!reduced &&
        Array.from({ length: TRAIL }, (_, i) => (
          <span
            key={i}
            data-trail
            className={styles.trail}
            style={{ '--i': i } as CSSProperties}
            aria-hidden="true"
          />
        ))}
      <span ref={ringRef} className={styles.ring} data-variant={variant} aria-hidden="true">
        <span className={styles.label}>{label}</span>
      </span>
    </div>
  );
}
