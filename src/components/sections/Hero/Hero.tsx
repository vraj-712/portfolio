import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRegisterActiveSection } from '../../../hooks/useRegisterActiveSection';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { RollingText } from '../../primitives/RollingText/RollingText';
import { EASE } from '../../../lib/gsap/easings';
import { content } from '../../../data/content';
import { cx } from '../../../lib/utils/cx';
import styles from './Hero.module.css';

const { brand } = content;

function HeroContent({ accent, facet }: { accent?: boolean; facet: number }) {
  return (
    <div className={styles.inner}>
      <p className={cx(styles.eyebrow, accent && styles.eyebrowAccent)}>{brand.taglineParts[0]}</p>
      <h1 className={styles.name} data-hero-name aria-label={brand.name}>
        <span className={styles.lineOuter}>
          <span className={styles.lineInner} data-hero-line>
            {brand.firstName}
          </span>
        </span>
        <span className={cx(styles.lineOuter, styles.lineOffset)}>
          <span className={styles.lineInner} data-hero-line>
            {brand.lastName}
          </span>
        </span>
      </h1>
      <p className={styles.role}>
        <span className={styles.roleStatic}>{brand.role} —&nbsp;</span>
        <RollingText values={brand.roleFacets} index={facet} className={styles.roleRoll} />
      </p>
    </div>
  );
}

export function Hero({ started = true }: { started?: boolean }) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const [facet, setFacet] = useState(0);

  useRegisterActiveSection(rootRef, 'hero');

  // Pin/scrub + initial states. The base name starts hidden so its entrance can
  // play AFTER the intro curtain lifts (see the entrance effect below).
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const baseLines = root.querySelectorAll('[data-base] [data-hero-line]');
      const names = root.querySelectorAll<HTMLElement>('[data-hero-name]');

      gsap.set(baseLines, { yPercent: 120, autoAlpha: 0 });

      if (reduced) {
        setFacet(0);
        gsap.set(bloomRef.current, { clipPath: 'circle(0% at 50% 52%)' });
        return;
      }

      gsap.set(names, { scale: 1.06, transformOrigin: 'left center' });
      gsap.set(bloomRef.current, { clipPath: 'circle(0% at 50% 52%)' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=90%',
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            setFacet(p < 0.34 ? 0 : p < 0.67 ? 1 : 2);
          },
        },
      });
      tl.to(names, { scale: 1, letterSpacing: '-0.04em', ease: 'none' }, 0).to(
        bloomRef.current,
        { clipPath: 'circle(135% at 50% 52%)', ease: 'none' },
        0,
      );
    },
    { dependencies: [reduced], scope: rootRef },
  );

  // Entrance — clip-reveal the base name, but only once the intro has handed off
  // (or immediately under reduced motion), so the animation is actually seen.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const baseLines = root.querySelectorAll('[data-base] [data-hero-line]');
      if (reduced) {
        gsap.set(baseLines, { yPercent: 0, autoAlpha: 1 });
        return;
      }
      if (!started) return;
      gsap.to(baseLines, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.9,
        ease: EASE.expoOut,
        stagger: 0.1,
      });
    },
    { dependencies: [reduced, started], scope: rootRef },
  );

  return (
    <section ref={rootRef} id="hero" className={styles.hero} aria-label="Intro">
      <div className={styles.layer} data-base>
        <HeroContent facet={facet} />
      </div>
      <div ref={bloomRef} className={cx(styles.layer, styles.bloom)} aria-hidden="true">
        <HeroContent accent facet={facet} />
      </div>
      <div className={styles.scrollHint} aria-hidden="true">
        <span>SCROLL</span>
        <span className={styles.arrow}>↓</span>
      </div>
    </section>
  );
}
