import { useId, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useCursorTarget } from '../../../hooks/useCursorTarget';
import { EASE } from '../../../lib/gsap/easings';
import styles from './AccordionRow.module.css';

interface AccordionRowProps {
  index: number;
  title: string;
  meta?: string;
  defaultOpen?: boolean;
  cursorLabel?: string;
  children: ReactNode;
}

export function AccordionRow({
  index,
  title,
  meta,
  defaultOpen = false,
  cursorLabel = 'OPEN',
  children,
}: AccordionRowProps) {
  const [open, setOpen] = useState(defaultOpen);
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const cursorProps = useCursorTarget('click', cursorLabel);
  const rid = useId();

  useGSAP(
    () => {
      const body = bodyRef.current;
      if (!body) return;
      if (reduced) {
        gsap.set(body, { height: open ? 'auto' : 0 });
        return;
      }
      if (open) {
        gsap.set(body, { height: 'auto' });
        gsap.from(body, { height: 0, duration: 0.45, ease: EASE.powerOut });
      } else {
        gsap.to(body, { height: 0, duration: 0.35, ease: EASE.powerInOut });
      }
    },
    { dependencies: [open, reduced], scope: rootRef },
  );

  return (
    <div ref={rootRef} className={styles.row} data-open={open}>
      <h3 className={styles.heading}>
        <button
          type="button"
          id={`${rid}-btn`}
          className={styles.trigger}
          aria-expanded={open}
          aria-controls={`${rid}-region`}
          onClick={() => setOpen((o) => !o)}
          {...cursorProps}
        >
          <span className={styles.flood} aria-hidden="true" />
          <span className={styles.index}>{String(index).padStart(2, '0')}</span>
          <span className={styles.title}>{title}</span>
          {meta && <span className={styles.meta}>{meta}</span>}
          <span className={styles.icon} aria-hidden="true" />
        </button>
      </h3>
      <div
        ref={bodyRef}
        id={`${rid}-region`}
        role="region"
        aria-labelledby={`${rid}-btn`}
        className={styles.body}
      >
        <div className={styles.bodyInner}>{children}</div>
      </div>
    </div>
  );
}
