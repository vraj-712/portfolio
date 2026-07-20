import type { ReactNode } from 'react';
import { cx } from '../../../lib/utils/cx';
import styles from './Section.module.css';

interface SectionLabelProps {
  index?: number;
  align?: 'left' | 'right';
  id?: string;
  children: ReactNode;
  className?: string;
}

// Rendered as <h2>: this is each section's title, giving a logical h1 → h2 → h3
// hierarchy. `.label` (class) fully controls styling (inline-flex, mono, own
// size/weight) so the heading element adds no visual change.
export function SectionLabel({ index, align = 'left', id, children, className }: SectionLabelProps) {
  return (
    <h2 id={id} className={cx(styles.label, align === 'right' && styles.labelRight, className)}>
      {index !== undefined && (
        <span className={styles.labelIndex}>{String(index).padStart(2, '0')}</span>
      )}
      <span>{children}</span>
    </h2>
  );
}
