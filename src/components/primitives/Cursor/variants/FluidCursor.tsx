import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { CursorViewProps } from './types';
import styles from './FluidCursor.module.css';

/** Fluid — a crisp core leads the pointer while a soft accent blob lags behind
 *  with high inertia, reading as a liquid drop. Blob swells by context. */
export function FluidCursor({ variant, label, reduced }: CursorViewProps) {
  const blobRef = useRef<HTMLSpanElement>(null);
  const coreRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const blob = blobRef.current;
      const core = coreRef.current;
      if (!blob || !core) return;

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      gsap.set([blob, core], { xPercent: -50, yPercent: -50, x: cx, y: cy });

      const blobDur = reduced ? 0 : 0.55;
      const coreDur = reduced ? 0 : 0.12;
      const bx = gsap.quickTo(blob, 'x', { duration: blobDur, ease: 'power3' });
      const by = gsap.quickTo(blob, 'y', { duration: blobDur, ease: 'power3' });
      const kx = gsap.quickTo(core, 'x', { duration: coreDur, ease: 'power3' });
      const ky = gsap.quickTo(core, 'y', { duration: coreDur, ease: 'power3' });

      const onMove = (e: PointerEvent) => {
        bx(e.clientX);
        by(e.clientY);
        kx(e.clientX);
        ky(e.clientY);
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    },
    { dependencies: [reduced] },
  );

  return (
    <>
      <span ref={blobRef} className={styles.blob} data-variant={variant} aria-hidden="true">
        <span className={styles.label}>{label}</span>
      </span>
      <span ref={coreRef} className={styles.core} data-variant={variant} aria-hidden="true" />
    </>
  );
}
