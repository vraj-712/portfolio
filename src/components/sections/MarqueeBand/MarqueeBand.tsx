import { Marquee } from '../../primitives/Marquee/Marquee';
import { content } from '../../../data/content';
import styles from './MarqueeBand.module.css';

export function MarqueeBand() {
  const items = content.marqueeWords.map((w, i) => (
    <span key={`${w}-${i}`} className={styles.word}>
      {w}
    </span>
  ));

  return (
    <section id="marquee" className={styles.band} aria-label="Keywords">
      <Marquee items={items} speed={28} ariaLabel="Skills and strengths ticker" />
    </section>
  );
}
