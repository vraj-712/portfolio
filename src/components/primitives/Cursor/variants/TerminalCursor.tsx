import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { CursorViewProps } from './types';
import styles from './TerminalCursor.module.css';

/** Terminal — a design-tool crosshair: full-viewport guide lines + a marker box
 *  + a live x,y readout. Snaps instantly to the pointer (no smoothing) for a
 *  precise, CAD feel. */
export function TerminalCursor({ variant, label }: CursorViewProps) {
  const vRef = useRef<HTMLSpanElement>(null);
  const hRef = useRef<HTMLSpanElement>(null);
  const mRef = useRef<HTMLSpanElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const v = vRef.current;
      const h = hRef.current;
      const m = mRef.current;
      if (!v || !h || !m) return;

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      gsap.set(v, { xPercent: -50, x: cx });
      gsap.set(h, { yPercent: -50, y: cy });
      gsap.set(m, { xPercent: -50, yPercent: -50, x: cx, y: cy });

      const setVx = gsap.quickSetter(v, 'x', 'px');
      const setHy = gsap.quickSetter(h, 'y', 'px');
      const setMx = gsap.quickSetter(m, 'x', 'px');
      const setMy = gsap.quickSetter(m, 'y', 'px');

      const onMove = (e: PointerEvent) => {
        setVx(e.clientX);
        setHy(e.clientY);
        setMx(e.clientX);
        setMy(e.clientY);
        if (coordRef.current) {
          coordRef.current.textContent = `${Math.round(e.clientX)},${Math.round(e.clientY)}`;
        }
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    },
    { dependencies: [] },
  );

  return (
    <>
      <span ref={vRef} className={styles.vline} aria-hidden="true" />
      <span ref={hRef} className={styles.hline} aria-hidden="true" />
      <span ref={mRef} className={styles.marker} data-variant={variant} aria-hidden="true">
        <span ref={coordRef} className={styles.coords} />
        {label && <span className={styles.label}>{label}</span>}
      </span>
    </>
  );
}
