import { useContext, useRef, type ReactNode, type Ref } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ActiveSectionContext } from '../../../context/ActiveSectionContext';
import { cx } from '../../../lib/utils/cx';
import { SectionLabel } from './SectionLabel';
import styles from './Section.module.css';

interface SectionProps {
  id: string;
  index?: number;
  label?: string;
  as?: 'section' | 'header' | 'footer';
  registerActive?: boolean;
  bleed?: boolean; // full-bleed: skip the centered container
  labelAlign?: 'left' | 'right';
  className?: string;
  children: ReactNode;
}

/** Semantic section wrapper. Registers itself as the active section (ScrollTrigger
 *  onToggle → ActiveSectionContext) for nav/rail highlighting. */
export function Section({
  id,
  index,
  label,
  as = 'section',
  registerActive = true,
  bleed = false,
  labelAlign = 'left',
  className,
  children,
}: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const active = useContext(ActiveSectionContext);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !registerActive || !active) return;
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) active.setActiveId(id);
        },
      });
      return () => st.kill();
    },
    { dependencies: [id, registerActive], scope: ref },
  );

  const Tag = as;
  const inner = (
    <>
      {label && (
        <SectionLabel index={index} align={labelAlign} id={`${id}-label`}>
          {label}
        </SectionLabel>
      )}
      {children}
    </>
  );

  return (
    <Tag
      id={id}
      ref={ref as Ref<HTMLElement>}
      className={cx(styles.section, className)}
      aria-label={label || undefined}
    >
      {bleed ? inner : <div className={styles.inner}>{inner}</div>}
    </Tag>
  );
}
