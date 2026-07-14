import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useMagnetic } from '../../../hooks/useMagnetic';
import { useCursorTarget } from '../../../hooks/useCursorTarget';
import { cx } from '../../../lib/utils/cx';
import styles from './MagneticButton.module.css';

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number;
  cursorLabel?: string;
  variant?: 'solid' | 'outline';
  children: ReactNode;
}

export function MagneticButton({
  strength = 0.4,
  cursorLabel = '',
  variant = 'solid',
  className,
  children,
  ...rest
}: MagneticButtonProps) {
  const ref = useMagnetic<HTMLButtonElement>({ strength });
  const cursorProps = useCursorTarget('click', cursorLabel);

  return (
    <button
      ref={ref}
      className={cx(styles.btn, styles[variant], className)}
      {...cursorProps}
      {...rest}
    >
      <span className={styles.inner}>{children}</span>
    </button>
  );
}
