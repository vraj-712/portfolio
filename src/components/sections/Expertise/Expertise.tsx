import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Section } from '../../primitives/Section/Section';
import { Reveal } from '../../primitives/Reveal/Reveal';
import { useCursorTarget } from '../../../hooks/useCursorTarget';
import { useIsCoarsePointer } from '../../../hooks/useIsCoarsePointer';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { content, labels } from '../../../site.config';
import styles from './Expertise.module.css';

function ExpertiseRow({ index, title, blurb }: { index: number; title: string; blurb: string }) {
  const cursor = useCursorTarget('hover');
  return (
    <article className={styles.row} data-exp-row {...cursor}>
      <span className={styles.flood} aria-hidden="true" />
      <span className={styles.index}>{String(index).padStart(2, '0')}</span>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.blurb}>{blurb}</p>
      </div>
    </article>
  );
}

export function Expertise() {
  const coarse = useIsCoarsePointer();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  /* Touch equivalent of the hover flood.
   *
   * The accent flood is this section's whole interaction, and it is gated on
   * :hover — which never fires on a touch device, so the section was inert on
   * a phone. ANIMATION_STUDY mandate C.3 is explicit that mobile must still get
   * the payoff rather than silently losing it.
   *
   * So on coarse pointers the row floods as it passes through the middle of the
   * viewport: scrolling reads the list. Fine pointers are left entirely alone —
   * this adds no trigger there, so the CSS hover behaviour is unchanged.
   *
   * Toggling a class (rather than tweening clip-path) is deliberate: the CSS
   * already owns the wipe AND the text-colour flip as one rule, so the two can
   * never fall out of step. Animating clip-path from JS would flood the row
   * while the text stayed ink-coloured — ink on accent is about 1.6:1.
   */
  useGSAP(
    () => {
      if (!coarse || reduced) return;
      const root = rootRef.current;
      // CSS-module lookups are `string | undefined` under noUncheckedIndexedAccess.
      // If the class ever gets renamed away, do nothing rather than toggle
      // "undefined" onto every row.
      const flooded = styles.flooded;
      if (!root || !flooded) return;

      const triggers = gsap.utils.toArray<HTMLElement>('[data-exp-row]', root).map((row) =>
        ScrollTrigger.create({
          trigger: row,
          // A single scan line, not a band. The rows are contiguous, so exactly
          // one of them straddles the viewport midline at any scroll position —
          // which keeps this to one lit row at a time, matching :hover and the
          // styling law's "one point of emphasis per section". A wider band lit
          // two rows at once and read as decoration rather than emphasis.
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => row.classList.toggle(flooded, self.isActive),
        }),
      );

      return () => {
        triggers.forEach((t) => t.kill());
        // leave no row stuck lit if the pointer type flips mid-session
        root.querySelectorAll("[data-exp-row]").forEach((r) => r.classList.remove(flooded));
      };
    },
    { revertOnUpdate: true, dependencies: [coarse, reduced], scope: rootRef },
  );

  return (
    <Section id="expertise" index={2} label={labels.sections.expertise} className={styles.expertise}>
      <div ref={rootRef}>
        <Reveal className={styles.rows} stagger={0.06} variant="up" start="top 82%">
          {content.expertise.map((item, i) => (
            <ExpertiseRow key={item.title} index={i + 1} title={item.title} blurb={item.blurb} />
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
