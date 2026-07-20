import { Marquee } from '../../primitives/Marquee/Marquee';
import { content, labels } from '../../../site.config';
import styles from './MarqueeBand.module.css';

export function MarqueeBand() {
  const items = content.marqueeWords.map((w, i) => (
    <span key={`${w}-${i}`} className={styles.word}>
      {w}
    </span>
  ));

  return (
    <section id="marquee" className={styles.band} aria-label={labels.sections.marquee}>
      <Marquee items={items} speed={28} ariaLabel="Skills and strengths ticker" />
    </section>
  );
}
