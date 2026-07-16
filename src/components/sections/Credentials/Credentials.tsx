import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Section } from '../../primitives/Section/Section';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useCursorTarget } from '../../../hooks/useCursorTarget';
import { getMotionProfile } from '../../../settings/motionProfile';
import { content } from '../../../data/content';
import { cx } from '../../../lib/utils/cx';
import styles from './Credentials.module.css';

const { certificates, courses } = content;
const pad = (n: number) => String(n).padStart(2, '0');

function CertCard({ index, title, issuer }: { index: number; title: string; issuer: string }) {
  const cursor = useCursorTarget('hover');
  return (
    <article className={styles.cert} data-cred {...cursor}>
      <span className={styles.flood} aria-hidden="true" />
      <span className={styles.certIndex}>{pad(index)}</span>
      <h3 className={styles.certTitle}>{title}</h3>
      <p className={styles.certIssuer}>{issuer}</p>
    </article>
  );
}

function CourseRow({ index, title, url }: { index: number; title: string; url?: string }) {
  const linkCursor = useCursorTarget('click', 'VERIFY');
  const plainCursor = useCursorTarget('hover');

  const inner = (
    <>
      <span className={styles.flood} aria-hidden="true" />
      <span className={styles.courseIndex}>{pad(index)}</span>
      <span className={styles.courseTitle}>{title}</span>
      {url ? (
        <span className={styles.verify} aria-hidden="true">
          Verify ↗
        </span>
      ) : (
        <span className={styles.noVerify} aria-hidden="true">
          —
        </span>
      )}
    </>
  );

  if (!url) {
    return (
      <div className={cx(styles.course, styles.courseMuted)} data-cred {...plainCursor}>
        {inner}
      </div>
    );
  }
  return (
    <a
      className={styles.course}
      data-cred
      href={url}
      target="_blank"
      rel="noreferrer"
      {...linkCursor}
    >
      {inner}
      <span className="sr-only">(opens verification in a new tab)</span>
    </a>
  );
}

export function Credentials() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  // Brutalist entrance: each card/row hard-wipes in from the left, staggered.
  // Flavour follows the active Mode, read at reveal time.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reduced) return;
      const items = root.querySelectorAll('[data-cred]');
      if (items.length === 0) return;

      gsap.set(items, { clipPath: 'inset(0 100% 0 0)' });
      const st = ScrollTrigger.create({
        trigger: root,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          const p = getMotionProfile();
          gsap.to(items, {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.7 * p.durScale,
            ease: p.ease,
            stagger: Math.max(0.05, p.stagger),
          });
        },
        // already scrolled past on load/refresh → just show them
        onRefresh: (self) => {
          if (self.progress > 0) gsap.set(items, { clipPath: 'inset(0 0% 0 0)' });
        },
      });
      return () => st.kill();
    },
    { dependencies: [reduced], scope: rootRef },
  );

  return (
    <Section id="credentials" index={6} label="Credentials" className={styles.credentials}>
      <div ref={rootRef}>
        <div className={styles.block}>
          <p className={styles.blockLabel}>Certificates</p>
          <div className={styles.certs}>
            {certificates.map((c, i) => (
              <CertCard key={c.title} index={i + 1} title={c.title} issuer={c.issuer} />
            ))}
          </div>
        </div>

        <div className={styles.block}>
          <p className={styles.blockLabel}>Courses</p>
          <div className={styles.courses}>
            {courses.map((c, i) => (
              <CourseRow key={c.title} index={i + 1} title={c.title} url={c.url} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
