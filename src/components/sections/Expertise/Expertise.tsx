import { Section } from '../../primitives/Section/Section';
import { Reveal } from '../../primitives/Reveal/Reveal';
import { useCursorTarget } from '../../../hooks/useCursorTarget';
import { content, labels } from '../../../site.config';
import styles from './Expertise.module.css';

function ExpertiseRow({ index, title, blurb }: { index: number; title: string; blurb: string }) {
  const cursor = useCursorTarget('hover');
  return (
    <article className={styles.row} {...cursor}>
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
  return (
    <Section id="expertise" index={2} label={labels.sections.expertise} className={styles.expertise}>
      <Reveal className={styles.rows} stagger={0.06} variant="up" start="top 82%">
        {content.expertise.map((item, i) => (
          <ExpertiseRow key={item.title} index={i + 1} title={item.title} blurb={item.blurb} />
        ))}
      </Reveal>
    </Section>
  );
}
