import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Section } from '../../primitives/Section/Section';
import { Reveal } from '../../primitives/Reveal/Reveal';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useIsCompact } from '../../../hooks/useIsCompact';
import { ExperienceMobile } from './ExperienceMobile';
import { EASE } from '../../../lib/gsap/easings';
import { content, labels } from '../../../site.config';
import styles from './Experience.module.css';

function ExperienceDesktop() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const line = lineRef.current;
      if (!root || !line) return;

      if (reduced) {
        gsap.set(line, { scaleY: 1 });
        return;
      }

      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top center',
          scrollTrigger: { trigger: root, start: 'top 72%', end: 'bottom 72%', scrub: true },
        },
      );

      root.querySelectorAll<HTMLElement>('[data-marker]').forEach((m) => {
        gsap.fromTo(
          m,
          { scale: 0 },
          {
            scale: 1,
            duration: 0.4,
            ease: EASE.backOut,
            scrollTrigger: { trigger: m, start: 'top 68%' },
          },
        );
      });
    },
    { dependencies: [reduced], scope: rootRef },
  );

  return (
    <Section id="experience" index={3} label={labels.sections.experience} className={styles.experience}>
      <div ref={rootRef} className={styles.timeline}>
        <span ref={lineRef} className={styles.line} aria-hidden="true" />
        {content.experience.map((job) => (
          <article key={`${job.company}-${job.period}`} className={styles.item}>
            <span data-marker className={styles.marker} aria-hidden="true" />
            <div className={styles.content}>
              <p className={styles.period}>
                {job.period} · {job.location}
              </p>
              <h3 className={styles.role}>{job.role}</h3>
              <p className={styles.company}>
                {job.company}
                {job.clients && job.clients.length > 0 && (
                  <span className={styles.client}> — {job.clients.join(', ')}</span>
                )}
              </p>
              <p className={styles.summary}>{job.summary}</p>

              <Reveal as="ul" className={styles.bullets} stagger={0.05} variant="up" start="top 85%">
                {job.bullets.map((b) => (
                  <li key={b} className={styles.bullet}>
                    {b}
                  </li>
                ))}
              </Reveal>

              <ul className={styles.tech}>
                {job.tech.map((t) => (
                  <li key={t} className={styles.techPill}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

/** Scroll-drawn timeline on desktop; a sticky peeling card deck on touch/small
 *  screens (a squeezed timeline ran 3+ screens tall on a phone). */
export function Experience() {
  const compact = useIsCompact();
  return compact ? <ExperienceMobile /> : <ExperienceDesktop />;
}
