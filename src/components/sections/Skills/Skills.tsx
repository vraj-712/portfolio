import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useIsCoarsePointer } from '../../../hooks/useIsCoarsePointer';
import { useRegisterActiveSection } from '../../../hooks/useRegisterActiveSection';
import { RollingText } from '../../primitives/RollingText/RollingText';
import { SectionLabel } from '../../primitives/Section/SectionLabel';
import { EASE } from '../../../lib/gsap/easings';
import { content } from '../../../data/content';
import { cx } from '../../../lib/utils/cx';
import styles from './Skills.module.css';

const { skills } = content;
const GROUPS = skills.groups;
const CATEGORIES = GROUPS.map((g) => g.label.toUpperCase());
const ALL = GROUPS.flatMap((g) => g.items);

// full-background marquee rows
const BG_ROWS = 7;
const rowWords = (i: number) => {
  const base = i % 2 === 0 ? ALL : [...ALL].reverse();
  return [...base, ...base];
};

export function Skills() {
  const reduced = useReducedMotion();
  const coarse = useIsCoarsePointer();
  const rootRef = useRef<HTMLElement>(null);
  const tokensRef = useRef<HTMLDivElement>(null);
  const [cat, setCat] = useState(0);
  const horizontal = !reduced && !coarse;

  useRegisterActiveSection(rootRef, 'skills');

  useGSAP(
    () => {
      if (!horizontal) return;
      const root = rootRef.current;
      if (!root) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // split the pin evenly across however many categories exist
            const i = Math.floor(self.progress * GROUPS.length);
            setCat(Math.max(0, Math.min(GROUPS.length - 1, i)));
          },
        },
      });

      // slide every background row (alternating directions) across the pin
      root.querySelectorAll<HTMLElement>('[data-marquee-row]').forEach((row, i) => {
        const amt = 22 + (i % 3) * 8;
        const from = i % 2 === 0 ? 0 : -amt;
        const to = i % 2 === 0 ? -amt : 0;
        gsap.set(row, { xPercent: from });
        tl.to(row, { xPercent: to, ease: 'none' }, 0);
      });
    },
    { dependencies: [horizontal], scope: rootRef },
  );

  // Animate the active-category chips in whenever the category flips.
  useGSAP(
    () => {
      if (!horizontal || reduced) return;
      const active = tokensRef.current?.querySelector('[data-tokens="on"]');
      if (!active) return;
      gsap.fromTo(
        active.children,
        { yPercent: 70, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, stagger: 0.03, duration: 0.4, ease: EASE.powerOut, overwrite: true },
      );
    },
    { dependencies: [cat, horizontal], scope: tokensRef },
  );

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
      {/* full-background sliding marquee */}
      <div className={styles.bg} aria-hidden="true">
        {Array.from({ length: BG_ROWS }, (_, i) => (
          <div key={i} data-marquee-row className={cx(styles.bgRow, i % 2 === 1 && styles.bgRowAlt)}>
            {rowWords(i).map((t, j) => (
              <span key={`${i}-${t}-${j}`} className={styles.bgItem}>
                {t}
              </span>
            ))}
          </div>
        ))}
      </div>

      <p className={styles.eyebrow} aria-hidden="true">
        <span className={styles.eyebrowIndex}>05</span> Tech Stack
      </p>

      <div className={styles.center}>
        <div className={styles.panel}>
          <p className={styles.counter} aria-hidden="true">
            {String(cat + 1).padStart(2, '0')} / {String(GROUPS.length).padStart(2, '0')}
          </p>
          <RollingText values={CATEGORIES} index={cat} className={styles.category} />
          {/* every category's chips share one grid cell, so the box reserves the
              tallest set and never resizes as the category flips */}
          <div ref={tokensRef} className={styles.tokensWrap} aria-hidden="true">
            {GROUPS.map((g, i) => (
              <ul
                key={g.label}
                data-tokens={i === cat ? 'on' : undefined}
                className={cx(styles.tokens, i === cat && styles.tokensOn)}
              >
                {g.items.map((t) => (
                  <li key={t} className={styles.activeToken}>
                    {t}
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <div className={styles.dots} aria-hidden="true">
            {GROUPS.map((g, i) => (
              <span key={g.label} className={cx(styles.dot, i === cat && styles.dotOn)} />
            ))}
          </div>
        </div>
      </div>

      {learning}

      <ul className="sr-only">
        {GROUPS.map((g) => (
          <li key={g.label}>
            {g.label}: {g.items.join(', ')}
          </li>
        ))}
      </ul>
    </section>
  );
}
