import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { IntroVariantProps } from './types';
import styles from '../Intro.module.css';

// not the name — the hero owns that reveal
const LETTERS = Array.from('PORTFOLIO');
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&*/<>';
const rand = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? '#';

/** Split-flap — each letter riffles through glyphs and locks into place,
 *  left to right, with a progress bar underneath. */
export function SplitFlapIntro({ reduced, onReady }: IntroVariantProps) {
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const cells = gsap.utils.toArray<HTMLElement>('[data-cell]', root);

      if (reduced) {
        cells.forEach((c) => { c.textContent = c.dataset.final ?? ''; });
        if (barRef.current) gsap.set(barRef.current, { scaleX: 1 });
        onReady();
        return;
      }

      const tl = gsap.timeline({ onComplete: onReady });
      cells.forEach((cell, i) => {
        const final = cell.dataset.final ?? '';
        const spin = { t: 0 };
        // each cell riffles a little longer than the last → locks left to right
        tl.to(spin, {
          t: 1,
          duration: 0.65 + i * 0.12,
          ease: 'none',
          onUpdate: () => { cell.textContent = rand(); },
          onComplete: () => { cell.textContent = final; },
        }, 0);
      });
      if (barRef.current) {
        tl.fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1.65, ease: 'power2.out' }, 0);
      }
      // hold on the locked word
      tl.to({}, { duration: 0.45 });
    },
    { dependencies: [reduced], scope: ref },
  );

  return (
    <div ref={ref} className={styles.inner}>
      <p className={styles.flapName} aria-hidden="true">
        {LETTERS.map((ch, i) => (
          <span key={i} data-cell data-final={ch} className={styles.flapCell}>{ch}</span>
        ))}
      </p>
      <span className={styles.bar} aria-hidden="true">
        <span ref={barRef} className={styles.barFill} />
      </span>
    </div>
  );
}
