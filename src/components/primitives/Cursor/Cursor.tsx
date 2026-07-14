import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCursor } from '../../../hooks/useCursor';
import { useIsCoarsePointer } from '../../../hooks/useIsCoarsePointer';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import styles from './Cursor.module.css';

/** Inertial, context-aware custom cursor. Position driven by gsap.quickTo
 *  (zero per-frame React state); variant/label come from CursorContext.
 *  Rendered only on fine pointers. */
export function Cursor() {
  const coarse = useIsCoarsePointer();
  const reduced = useReducedMotion();
  const { variant, label } = useCursor();
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (coarse) return;
      const root = rootRef.current;
      if (!root) return;

      document.documentElement.classList.add('has-custom-cursor');
      gsap.set(root, { x: window.innerWidth / 2, y: window.innerHeight / 2 });

      const dur = reduced ? 0 : 0.5;
      const xTo = gsap.quickTo(root, 'x', { duration: dur, ease: 'power3' });
      const yTo = gsap.quickTo(root, 'y', { duration: dur, ease: 'power3' });

      const onMove = (e: PointerEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      window.addEventListener('pointermove', onMove, { passive: true });

      return () => {
        window.removeEventListener('pointermove', onMove);
        document.documentElement.classList.remove('has-custom-cursor');
      };
    },
    { dependencies: [coarse, reduced] },
  );

  if (coarse) return null;

  return (
    <div ref={rootRef} className={styles.cursor} data-variant={variant} aria-hidden="true">
      <span className={styles.dot} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
