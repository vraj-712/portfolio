import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { EASE } from '../../../lib/gsap/easings';
import { cx } from '../../../lib/utils/cx';
import styles from './RollingText.module.css';

interface RollingTextProps {
  values: string[];
  index: number;
  duration?: number;
  className?: string;
}

/** Vertical roller that flips between values as `index` changes. */
export function RollingText({ values, index, duration = 0.45, className }: RollingTextProps) {
  const reduced = useReducedMotion();
  const colRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const col = colRef.current;
      if (!col) return;
      const first = col.children[0] as HTMLElement | undefined;
      const h = first?.offsetHeight ?? 0;
      gsap.to(col, {
        y: -index * h,
        duration: reduced ? 0 : duration,
        ease: EASE.powerOut,
        overwrite: true,
      });
    },
    { dependencies: [index, reduced], scope: colRef },
  );

  const clamped = Math.max(0, Math.min(index, values.length - 1));

  return (
    <span className={cx(styles.mask, className)}>
      <span className="sr-only">{values[clamped]}</span>
      <span ref={colRef} className={styles.col} aria-hidden="true">
        {values.map((v, i) => (
          <span key={i} className={styles.item}>
            {v}
          </span>
        ))}
      </span>
    </span>
  );
}
