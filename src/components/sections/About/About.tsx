import { Section } from '../../primitives/Section/Section';
import { SplitReveal } from '../../primitives/AnimatedText/SplitReveal';
import { Reveal } from '../../primitives/Reveal/Reveal';
import { content } from '../../../data/content';
import styles from './About.module.css';

const { about } = content;
/** The one word the philosophy turns on — accent-highlighted in the quote. */
const HIGHLIGHT = 'shipping';

function Philosophy() {
  const idx = about.philosophy.indexOf(HIGHLIGHT);
  if (idx === -1) return <blockquote className={styles.philosophy}>{about.philosophy}</blockquote>;
  const before = about.philosophy.slice(0, idx);
  const after = about.philosophy.slice(idx + HIGHLIGHT.length);
  return (
    <blockquote className={styles.philosophy}>
      {before}
      <mark className={styles.mark}>{HIGHLIGHT}</mark>
      {after}
    </blockquote>
  );
}

export function About() {
  return (
    <Section id="about" index={1} label="About" className={styles.about}>
      <div className={styles.grid}>
        <div className={styles.main}>
          <SplitReveal as="p" splitBy="lines" className={styles.lead} y={110} stagger={0.09}>
            {about.lead}
          </SplitReveal>
          <Reveal variant="up" delay={0.1}>
            <Philosophy />
          </Reveal>
        </div>

        <aside className={styles.side}>
          <Reveal variant="up" className={styles.card}>
            <p className={styles.cardLabel}>Education</p>
            {about.education.map((ed) => (
              <div key={`${ed.degree}-${ed.period}`} className={styles.eduItem}>
                <p className={styles.degree}>
                  {ed.degree} — {ed.field}
                </p>
                <p className={styles.school}>{ed.school}</p>
                <p className={styles.eduMeta}>
                  {ed.period} · {ed.location}
                </p>
              </div>
            ))}
          </Reveal>

          <div>
            <p className={styles.sideLabel}>Interests</p>
            <Reveal as="ul" className={styles.chips} stagger={0.05} variant="up">
              {about.interests.map((it) => (
                <li key={it} className={styles.chip}>
                  {it}
                </li>
              ))}
            </Reveal>
          </div>

          <div>
            <p className={styles.sideLabel}>Strengths</p>
            <Reveal as="ul" className={styles.chips} stagger={0.05} variant="up">
              {about.strengths.map((s) => (
                <li key={s} className={styles.chipGhost}>
                  {s}
                </li>
              ))}
            </Reveal>
          </div>
        </aside>
      </div>
    </Section>
  );
}
