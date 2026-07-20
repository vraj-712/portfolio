import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { EASE } from '../../../../lib/gsap/easings';
import { labels } from '../../../../site.config';
import type { IntroVariantProps } from './types';
import styles from '../Intro.module.css';

const COLS = 14;
const ROWS = 8;
const CELLS = Array.from({ length: COLS * ROWS });

/** Grid — accent blocks flood the screen cell by cell behind a counter plate,
 *  then the grid clears away. No name — the hero owns that. */
export function GridIntro({ reduced, onReady }: IntroVariantProps) {
  const ref = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      if (reduced) {
        if (counterRef.current) counterRef.current.textContent = '100';
        if (barRef.current) barRef.current.style.transform = 'scaleX(1)';
        onReady();
        return;
      }
      const blocks = gsap.utils.toArray<HTMLElement>('[data-block]', root);
      const proxy = { v: 0 };
      const tl = gsap.timeline({ onComplete: onReady });

      gsap.set(blocks, { scale: 0, transformOrigin: 'center' });
      tl.to(proxy, {
        v: 100,
        duration: 1.3,
        ease: 'power2.out',
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = String(Math.round(proxy.v)).padStart(3, '0');
          }
          if (barRef.current) barRef.current.style.transform = `scaleX(${proxy.v / 100})`;
        },
      }, 0)
        .to(blocks, {
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
          stagger: { amount: 0.7, from: 'start', grid: [ROWS, COLS] },
        }, 0)
        .from(root.querySelector('[data-plate]'), {
          autoAlpha: 0,
          scale: 0.9,
          duration: 0.5,
          ease: EASE.backOut,
        }, 0.6)
        // let the flooded grid sit for a beat before it clears
        .to(blocks, {
          scale: 0,
          duration: 0.3,
          ease: 'power2.in',
          stagger: { amount: 0.5, from: 'end', grid: [ROWS, COLS] },
        }, '>0.2');
    },
    { dependencies: [reduced], scope: ref },
  );

  return (
    <div ref={ref} className={styles.grid} aria-hidden="true">
      <div className={styles.gridCells}>
        {CELLS.map((_, i) => (
          <span key={i} data-block className={styles.gridBlock} />
        ))}
      </div>
      <div data-plate className={styles.plate}>
        <span className={styles.plateLabel}>{labels.loader.label}</span>
        <span ref={counterRef} className={styles.plateNum}>000</span>
        <span className={styles.plateBar}>
          <span ref={barRef} className={styles.plateBarFill} />
        </span>
      </div>
    </div>
  );
}
