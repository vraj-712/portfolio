import type { ReactNode } from 'react';
import { useMagnetic } from '../../../hooks/useMagnetic';

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  disabled?: boolean;
  className?: string;
}

/** Wraps children in an inline-block span that magnetically eases toward the cursor. */
export function Magnetic({ children, strength, disabled, className }: MagneticProps) {
  const ref = useMagnetic<HTMLSpanElement>({ strength, disabled });
  return (
    <span ref={ref} className={className} style={{ display: 'inline-block', willChange: 'transform' }}>
      {children}
    </span>
  );
}
