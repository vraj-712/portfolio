import { useRef } from 'react';
import { gsap } from 'gsap';
import type { ScrollTrigger as ScrollTriggerInstance } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useIsCoarsePointer } from '../../../hooks/useIsCoarsePointer';
import { useLenis } from '../../../hooks/useLenis';
import { useRegisterActiveSection } from '../../../hooks/useRegisterActiveSection';
import { ProjectCard } from '../../primitives/ProjectCard/ProjectCard';
import { SectionLabel } from '../../primitives/Section/SectionLabel';
import { content, labels } from '../../../site.config';
import { cx } from '../../../lib/utils/cx';
import styles from './Projects.module.css';

const { projects } = content;

export function Projects() {
  const reduced = useReducedMotion();
  const coarse = useIsCoarsePointer();
  const lenis = useLenis();
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTriggerInstance | null>(null);
  const horizontal = !reduced && !coarse;

  /* Keyboard reachability for the pinned track.
     The track moves horizontally as a transform driven by VERTICAL scroll, and
     .projects is overflow:hidden with no scrollable axis — so the browser's own
     "scroll the focused element into view" has nothing to act on, and a card's
     links can take focus while sitting off-canvas, invisible.
     Both rects live under the same transform, so their difference is the
     element's offset in the track's untransformed space; the trigger maps that
     1:1 onto scroll distance, so start + offset is the scroll position that
     brings it into view. */
  const revealFocused = (e: React.FocusEvent<HTMLDivElement>) => {
    const st = stRef.current;
    const track = trackRef.current;
    if (!horizontal || !st || !track) return;

    const x = e.target.getBoundingClientRect().left - track.getBoundingClientRect().left;
    const target = st.start + Math.max(0, x - window.innerWidth * 0.2);
    if (Math.abs(window.scrollY - target) < 8) return;

    const inst = lenis?.current;
    if (inst) inst.scrollTo(target, { immediate: reduced });
    // Lenis is null exactly when smooth scroll is off or motion is reduced, so
    // an instant jump is the right fallback here rather than a smooth one.
    else window.scrollTo({ top: target, behavior: 'auto' });
  };

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
      const trail = () => Math.round(window.innerWidth * 0.25);
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + trail());

      const tween = gsap.to(track, {
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
      // kept so focus handling can map a card position back to a scroll position
      stRef.current = tween.scrollTrigger ?? null;
    },
    { revertOnUpdate: true, dependencies: [horizontal], scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      id="projects"
      className={cx(styles.projects, horizontal && styles.horizontal)}
      aria-label={labels.sections.work}
    >
      <div className={styles.head}>
        <SectionLabel index={4}>{labels.sections.work}</SectionLabel>
      </div>
      <div ref={trackRef} className={styles.track} onFocusCapture={revealFocused}>
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} total={projects.length} distort={horizontal} />
        ))}
      </div>
    </section>
  );
}
