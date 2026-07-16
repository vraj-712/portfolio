import { useRef, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Section } from '../../primitives/Section/Section';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { getMotionProfile } from '../../../settings/motionProfile';
import { content } from '../../../data/content';
import styles from './ExperienceMobile.module.css';

const pad = (n: number) => String(n).padStart(2, '0');

/** Touch Experience: each role is a card that parks under the header while the
 *  next one slides up over it — the outgoing card scales back and dims, so the
 *  roles read as a peeling deck instead of one cramped timeline. */
export function ExperienceMobile() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reduced) return;
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', root);

      cards.forEach((card, i) => {
        const next = cards[i + 1];

        // peel: scrub this card back as the NEXT one climbs over it
        if (next) {
          gsap.to(card, {
            scale: 0.9,
            opacity: 0.35,
            ease: 'none',
            transformOrigin: 'center top',
            scrollTrigger: {
              trigger: next,
              start: 'top bottom',
              end: 'top top+=140',
              scrub: 0.4,
            },
          });
        }

        // each card's body lifts in the first time it comes up
        const body = card.querySelectorAll('[data-line]');
        if (body.length === 0) return;
        gsap.from(body, {
          y: 18,
          autoAlpha: 0,
          duration: 0.5 * getMotionProfile().durScale,
          ease: getMotionProfile().ease,
          stagger: Math.max(0.04, getMotionProfile().stagger),
          scrollTrigger: { trigger: card, start: 'top 85%', once: true },
        });
      });
    },
    { dependencies: [reduced], scope: rootRef },
  );

  return (
    <Section id="experience" index={3} label="Experience" className={styles.experience}>
      <div ref={rootRef} className={styles.stack}>
        {content.experience.map((job, i) => (
          <article
            key={`${job.company}-${job.period}`}
            data-card
            className={styles.card}
            style={{ '--i': i } as CSSProperties}
          >
            <div className={styles.head} data-line>
              <span className={styles.index}>{pad(i + 1)}</span>
              <p className={styles.period}>{job.period}</p>
            </div>

            <h3 className={styles.role} data-line>
              {job.role}
            </h3>
            <p className={styles.company} data-line>
              {job.company}
              {job.clients && job.clients.length > 0 && (
                <span className={styles.client}> — {job.clients.join(', ')}</span>
              )}
            </p>
            <p className={styles.summary} data-line>
              {job.summary}
            </p>

            <ul className={styles.bullets}>
              {job.bullets.map((b) => (
                <li key={b} className={styles.bullet} data-line>
                  {b}
                </li>
              ))}
            </ul>

            <ul className={styles.tech} data-line>
              {job.tech.map((t) => (
                <li key={t} className={styles.techPill}>
                  {t}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}
