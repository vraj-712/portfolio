import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useActiveSection } from '../../../hooks/useActiveSection';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useLenis } from '../../../hooks/useLenis';
import { cx } from '../../../lib/utils/cx';
import styles from './ScrollProgress.module.css';

interface ScrollProgressProps {
  sections: ReadonlyArray<{ id: string; label: string }>;
}

export function ScrollProgress({ sections }: ScrollProgressProps) {
  const activeId = useActiveSection();
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const barRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const bar = barRef.current;
    if (!bar || reduced) return;
    gsap.fromTo(
      bar,
      { scaleY: 0 },
      { scaleY: 1, ease: 'none', transformOrigin: 'top center', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } },
    );
  }, { dependencies: [reduced] });

  const jump = (id: string) => {
    const inst = lenis?.current;
    if (inst) inst.scrollTo(`#${id}`, { offset: 0 });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={styles.rail} aria-label="Section progress">
      <span className={styles.line}>
        <span ref={barRef} className={styles.bar} />
      </span>
      <ul className={styles.list}>
        {sections.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={cx(styles.dot, activeId === s.id && styles.active)}
              onClick={() => jump(s.id)}
              aria-label={`Go to ${s.label}`}
              aria-current={activeId === s.id ? 'true' : undefined}
            >
              <span className={styles.dotLabel}>{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
