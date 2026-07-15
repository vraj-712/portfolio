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

export function SectionLabel({ index, align = 'left', id, children, className }: SectionLabelProps) {
  return (
    <p id={id} className={cx(styles.label, align === 'right' && styles.labelRight, className)}>
      {index !== undefined && (
        <span className={styles.labelIndex}>{String(index).padStart(2, '0')}</span>
      )}
      <span>{children}</span>
    </p>
  );
}
