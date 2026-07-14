import { forwardRef } from 'react';
import { cx } from '../../../lib/utils/cx';
import styles from './AccentWipe.module.css';

interface AccentWipeProps {
  className?: string;
  color?: string; // CSS custom-property value; defaults to accent
}

/** A full-cover accent panel. Parents ref it and drive it with wipeIn/wipeOut
 *  (lib/gsap/clipReveal) inside their timelines. */
export const AccentWipe = forwardRef<HTMLDivElement, AccentWipeProps>(
  function AccentWipe({ className, color }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cx(styles.panel, className)}
        style={color ? { background: color } : undefined}
      />
    );
  },
);
