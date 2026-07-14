import { Section } from '../../primitives/Section/Section';
import { Reveal } from '../../primitives/Reveal/Reveal';
import { AccordionRow } from '../../primitives/AccordionRow/AccordionRow';
import { content } from '../../../data/content';
import styles from './Expertise.module.css';

export function Expertise() {
  return (
    <Section id="expertise" index={2} label="Areas of Expertise" className={styles.expertise}>
      <Reveal className={styles.rows} stagger={0.07} variant="up" start="top 82%">
        {content.expertise.map((item, i) => (
          <AccordionRow key={item.title} index={i + 1} title={item.title} cursorLabel="OPEN">
            <p>{item.blurb}</p>
          </AccordionRow>
        ))}
      </Reveal>
    </Section>
  );
}
