import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { CursorViewProps } from './types';
import styles from '../Cursor.module.css';

/** Precision (default) — a crisp inertial dot that swells into a ring/label by
 *  context. This is the original brutalist cursor. */
export function PrecisionCursor({ variant, label, reduced }: CursorViewProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      gsap.set(root, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      const dur = reduced ? 0 : 0.5;
      const xTo = gsap.quickTo(root, 'x', { duration: dur, ease: 'power3' });
      const yTo = gsap.quickTo(root, 'y', { duration: dur, ease: 'power3' });
      const onMove = (e: PointerEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    },
    { dependencies: [reduced] },
  );

  return (
    <div ref={rootRef} className={styles.cursor} data-variant={variant} aria-hidden="true">
      <span className={styles.dot} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
