import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useIsCoarsePointer } from '../../../hooks/useIsCoarsePointer';
import { useRegisterActiveSection } from '../../../hooks/useRegisterActiveSection';
import { ProjectCard } from '../../primitives/ProjectCard/ProjectCard';
import { SectionLabel } from '../../primitives/Section/SectionLabel';
import { content } from '../../../data/content';
import { cx } from '../../../lib/utils/cx';
import styles from './Projects.module.css';

const { projects } = content;

export function Projects() {
  const reduced = useReducedMotion();
  const coarse = useIsCoarsePointer();
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const horizontal = !reduced && !coarse;

  useRegisterActiveSection(rootRef, 'projects');

  useGSAP(
    () => {
      if (!horizontal) return;
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;

      // Extra trailing translation so the last card scrolls fully into view with
      // breathing room AND dwells there before the section unpins. (Flex trailing
      // padding / spacers are excluded from scrollWidth, so we add it explicitly.)
      const trail = () => Math.round(window.innerWidth * 0.4);
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + trail());

      gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => '+=' + dist(),
          pin: true,
          pinType: 'fixed',
          scrub: 0.3,
          invalidateOnRefresh: true,
        },
      });
    },
    { dependencies: [horizontal], scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      id="projects"
      className={cx(styles.projects, horizontal && styles.horizontal)}
      aria-label="Selected Work"
    >
      <div className={styles.head}>
        <SectionLabel index={4}>Selected Work</SectionLabel>
        <h2 className={styles.title}>WORK</h2>
      </div>
      <div ref={trackRef} className={styles.track}>
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} total={projects.length} distort={horizontal} />
        ))}
      </div>
    </section>
  );
}
