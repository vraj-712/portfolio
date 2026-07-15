import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCursor } from '../../../hooks/useCursor';
import { useIsCoarsePointer } from '../../../hooks/useIsCoarsePointer';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useSettings } from '../../../hooks/useSettings';
import styles from './Cursor.module.css';

/** Inertial, context-aware custom cursor. Position driven by gsap.quickTo
 *  (zero per-frame React state); variant/label come from CursorContext.
 *  Rendered only on fine pointers. */
export function Cursor() {
  const coarse = useIsCoarsePointer();
  const reduced = useReducedMotion();
  const { settings } = useSettings();
  const { variant, label } = useCursor();
  const rootRef = useRef<HTMLDivElement>(null);
  const enabled = !coarse && settings.customCursor;

  // Manage the cursor:none body class with a plain effect so it reliably toggles
  // when the custom cursor is switched off (not tied to useGSAP's revert timing).
  useEffect(() => {
    if (!enabled) return;
    const el = document.documentElement;
    el.classList.add('has-custom-cursor');
    return () => el.classList.remove('has-custom-cursor');
  }, [enabled]);

  useGSAP(
    () => {
      if (!enabled) return;
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

      return () => {
        window.removeEventListener('pointermove', onMove);
      };
    },
    { dependencies: [enabled, reduced] },
  );

  if (!enabled) return null;

  return (
    <div ref={rootRef} className={styles.cursor} data-variant={variant} aria-hidden="true">
      <span className={styles.dot} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
