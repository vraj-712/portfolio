import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { IntroVariantProps } from './types';
import styles from '../Intro.module.css';

// no name here — the hero introduces the person, this just boots the system
const LINES = [
  '> init portfolio',
  '> loading fonts ............ ok',
  '> mounting sections ........ ok',
  '> cursor modes ............. ok',
  '> ready',
];

/** Terminal — a boot log types itself out line by line, steps() all the way. */
export function TerminalIntro({ reduced, onReady }: IntroVariantProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      if (reduced) {
        gsap.set(root.querySelectorAll('[data-line]'), { clipPath: 'inset(0 0% 0 0)' });
        onReady();
        return;
      }
      const lines = gsap.utils.toArray<HTMLElement>('[data-line]', root);
      const tl = gsap.timeline({ onComplete: onReady });

      lines.forEach((line) => {
        const chars = (line.textContent ?? '').length || 12;
        tl.fromTo(
          line,
          { clipPath: 'inset(0 100% 0 0)' },
          // stepping the clip across the line reads as a typewriter
          { clipPath: 'inset(0 0% 0 0)', duration: 0.36, ease: `steps(${chars})` },
          // a beat between lines, like a real boot log
          '>+0.02',
        );
      });
      tl.to({}, { duration: 0.35 });
    },
    { dependencies: [reduced], scope: ref },
  );

  return (
    <div ref={ref} className={styles.term} aria-hidden="true">
      {LINES.map((l) => (
        <p key={l} data-line className={styles.termLine}>{l}</p>
      ))}
      <span className={styles.caret} />
    </div>
  );
}
