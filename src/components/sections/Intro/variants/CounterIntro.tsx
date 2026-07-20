import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { EASE } from '../../../../lib/gsap/easings';
import { labels } from '../../../../site.config';
import type { IntroVariantProps } from './types';
import styles from '../Intro.module.css';

// deliberately NOT the name — the hero owns the brand moment, the loader is
// just the system coming up
const WORD = Array.from(labels.loader.label);

/** Counter — accent 000→100 while LOADING clips up letter by letter. */
export function CounterIntro({ reduced, onReady }: IntroVariantProps) {
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
      const units = root.querySelectorAll('[data-unit]');
      const proxy = { v: 0 };
      const tl = gsap.timeline({ onComplete: onReady });
      tl.to(proxy, {
        v: 100,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = String(Math.round(proxy.v)).padStart(3, '0');
          }
          if (barRef.current) barRef.current.style.transform = `scaleX(${proxy.v / 100})`;
        },
      }, 0)
        .from(units, { yPercent: 120, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: EASE.expoOut }, 0.1)
        // hold on 100 so the count actually lands before the curtain lifts
        .to({}, { duration: 0.4 });
    },
    { dependencies: [reduced], scope: ref },
  );

  return (
    <div ref={ref} className={styles.inner}>
      <span ref={counterRef} className={styles.counter}>000</span>
      <p className={styles.name} aria-hidden="true">
        {WORD.map((ch, i) => (
          <span key={i} className={styles.unit}>
            <span data-unit className={styles.unitInner}>{ch}</span>
          </span>
        ))}
      </p>
      <span className={styles.bar} aria-hidden="true">
        <span ref={barRef} className={styles.barFill} />
      </span>
    </div>
  );
}
