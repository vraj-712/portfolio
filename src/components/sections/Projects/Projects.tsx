import { useRef } from 'react';
import { gsap } from 'gsap';
import type { ScrollTrigger as ScrollTriggerInstance } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useIsCoarsePointer } from '../../../hooks/useIsCoarsePointer';
import { useLenis } from '../../../hooks/useLenis';
import { useRegisterActiveSection } from '../../../hooks/useRegisterActiveSection';
import { AccentWipe } from '../../primitives/AccentWipe/AccentWipe';
import { wipeIn, wipeOut } from '../../../lib/gsap/clipReveal';
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
  const curtainRef = useRef<HTMLDivElement>(null);
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

  /* Scene hand-off curtain — ANIMATION_STUDY opportunity #2.
   *
   * The accent panel sweeps across as Work arrives and clears straight out
   * again: a curtain, not a cover. It is deliberately the ONLY section
   * transition on the page. A curtain at every boundary would be seven accent
   * flashes on one scroll, which is decoration — the styling law rations accent
   * to one point of emphasis. Work earns it because it is the biggest scene
   * change on the page: the layout pivots from vertical flow to a pinned
   * horizontal track.
   *
   * Direction 'right' foreshadows that pivot — the curtain travels the same
   * axis the track is about to.
   *
   * The panel lives inside .projects (absolute inset:0) rather than fixed to
   * the viewport. While the section is pinned the two are the same rectangle,
   * and this way the curtain cannot outlive its section or overlap the one
   * after it. It is pointer-events:none and aria-hidden, so it never blocks
   * input or reaches the accessibility tree.
   */
  useGSAP(
    () => {
      const root = rootRef.current;
      const curtain = curtainRef.current;
      // Reduced motion gets no curtain at all. The panel's resting clip-path is
      // fully cleared, so skipping it leaves nothing covering the section —
      // there is no end state to strand.
      if (!root || !curtain || reduced) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 85%', once: true },
      });
      tl.add(wipeIn(curtain, { direction: 'right', duration: 0.55 })).add(
        wipeOut(curtain, { direction: 'right', duration: 0.55 }),
        '+=0.04',
      );
    },
    { revertOnUpdate: true, dependencies: [reduced], scope: rootRef },
  );

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
      <AccentWipe ref={curtainRef} className={styles.curtain} />
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
