import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useIsCoarsePointer } from '../../../hooks/useIsCoarsePointer';
import { useRegisterActiveSection } from '../../../hooks/useRegisterActiveSection';
import { RollingText } from '../../primitives/RollingText/RollingText';
import { SectionLabel } from '../../primitives/Section/SectionLabel';
import { content } from '../../../data/content';
import { cx } from '../../../lib/utils/cx';
import styles from './Skills.module.css';

const { skills } = content;
const GROUPS = [skills.frontend, skills.backend, skills.tools];
const CATEGORIES = GROUPS.map((g) => g.label.toUpperCase());
const ALL = GROUPS.flatMap((g) => g.items);

export function Skills() {
  const reduced = useReducedMotion();
  const coarse = useIsCoarsePointer();
  const rootRef = useRef<HTMLElement>(null);
  const rowARef = useRef<HTMLDivElement>(null);
  const rowBRef = useRef<HTMLDivElement>(null);
  const [cat, setCat] = useState(0);
  const horizontal = !reduced && !coarse;

  useRegisterActiveSection(rootRef, 'skills');

  useGSAP(
    () => {
      if (!horizontal) return;
      const root = rootRef.current;
      const a = rowARef.current;
      const b = rowBRef.current;
      if (!root || !a || !b) return;

      gsap.set(a, { xPercent: 0 });
      gsap.set(b, { xPercent: -28 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            setCat(p < 0.34 ? 0 : p < 0.67 ? 1 : 2);
          },
        },
      });
      tl.to(a, { xPercent: -28, ease: 'none' }, 0).to(b, { xPercent: 0, ease: 'none' }, 0);
    },
    { dependencies: [horizontal], scope: rootRef },
  );

  const rowA = [...ALL, ...ALL];
  const rowB = [...ALL].reverse().concat([...ALL].reverse());

  const learning = (
    <p className={styles.learning}>
      NOW LEARNING <span className={styles.arrow}>→</span>{' '}
      <span className={styles.learnItem}>{skills.learning.join(', ')}</span>
    </p>
  );

  if (!horizontal) {
    return (
      <section ref={rootRef} id="skills" className={styles.skills} aria-label="Tech Stack">
        <div className={styles.inner}>
          <SectionLabel index={5}>Tech Stack</SectionLabel>
          {GROUPS.map((g) => (
            <div key={g.label} className={styles.group}>
              <h3 className={styles.groupLabel}>{g.label}</h3>
              <ul className={styles.grid}>
                {g.items.map((t) => (
                  <li key={t} className={styles.token}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {learning}
        </div>
      </section>
    );
  }

  return (
    <section ref={rootRef} id="skills" className={cx(styles.skills, styles.pinned)} aria-label="Tech Stack">
      <div className={styles.stage}>
        <div ref={rowARef} className={styles.row} aria-hidden="true">
          {rowA.map((t, i) => (
            <span key={`a-${t}-${i}`} className={styles.rowItem}>
              {t}
            </span>
          ))}
        </div>
        <div ref={rowBRef} className={cx(styles.row, styles.rowAlt)} aria-hidden="true">
          {rowB.map((t, i) => (
            <span key={`b-${t}-${i}`} className={styles.rowItem}>
              {t}
            </span>
          ))}
        </div>
        <div className={styles.center}>
          <RollingText values={CATEGORIES} index={cat} className={styles.category} />
        </div>
        {learning}
        {/* SR-only real list of the stack */}
        <ul className="sr-only">
          {ALL.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
