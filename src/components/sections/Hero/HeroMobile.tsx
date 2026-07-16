import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRegisterActiveSection } from '../../../hooks/useRegisterActiveSection';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useLenis } from '../../../hooks/useLenis';
import { useSettings } from '../../../hooks/useSettings';
import { RollingText } from '../../primitives/RollingText/RollingText';
import { MagneticButton } from '../../primitives/Magnetic/MagneticButton';
import { getMotionProfile } from '../../../settings/motionProfile';
import { content } from '../../../data/content';
import { cx } from '../../../lib/utils/cx';
import { CITY, STATS, SOCIALS, pad, istTime, bloomShapeAt } from './heroShared';
import styles from './HeroMobile.module.css';

const { brand } = content;

interface MobileContentProps {
  facet: number;
  time: string;
  onNav: (id: string) => void;
}

function MobileContent({ facet, time, onNav }: MobileContentProps) {
  return (
    <div className={styles.inner}>
      <header className={styles.top}>
        <p className={styles.status} data-rise>
          <span className={styles.statusDot} aria-hidden="true" />
          Available for work
        </p>
        <p className={styles.place} data-rise>
          <span>{CITY}, IN</span>
          <span className={styles.time}>
            {time}
            <span className={styles.tz}> IST</span>
          </span>
        </p>
      </header>

      <div className={styles.headline}>
        <p className={styles.eyebrow} data-rise>
          {brand.taglineParts[0]}
        </p>
        <h1 className={styles.name} aria-label={brand.name}>
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
        <p className={styles.role} data-rise>
          <span className={styles.roleStatic}>{brand.role} —&nbsp;</span>
          <RollingText values={brand.roleFacets} index={facet} className={styles.roleRoll} />
        </p>
      </div>

      <div className={styles.ctas}>
        <MagneticButton
          variant="solid"
          className={styles.ctaPrimary}
          onClick={() => onNav('projects')}
          data-rise
        >
          View Work <span aria-hidden="true">↓</span>
        </MagneticButton>
        <MagneticButton
          variant="outline"
          className={styles.ctaGhost}
          onClick={() => onNav('closing')}
          data-rise
        >
          Get in touch
        </MagneticButton>
      </div>

      <footer className={styles.foot}>
        <ul className={styles.stats}>
          {STATS.map((s) => (
            <li key={s.label} data-rise>
              <span className={styles.statNum}>{pad(s.n)}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </li>
          ))}
        </ul>
        <ul className={styles.socials}>
          {SOCIALS.map((s) => (
            <li key={s.label} data-rise>
              <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.full}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}

/** Purpose-built hero for touch / small screens: a compact flowing column with
 *  its own staggered entrance, an auto-rolling role, a uniform dot backdrop, and
 *  the signature accent bloom — scrubbed to scroll (no pin, so the page still
 *  scrolls naturally on a phone). */
export function HeroMobile({ started = true }: { started?: boolean }) {
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const { settings } = useSettings();
  // read live so the bloom shape follows the Mode without rebuilding the trigger
  const themeRef = useRef(settings.cursorTheme);
  themeRef.current = settings.cursorTheme;
  const rootRef = useRef<HTMLElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const [facet, setFacet] = useState(0);
  const [time, setTime] = useState(istTime);

  useRegisterActiveSection(rootRef, 'hero');

  // live IST clock
  useEffect(() => {
    const id = window.setInterval(() => setTime(istTime()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // auto-cycle the role — there's no scroll pin to drive it on touch
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(
      () => setFacet((f) => (f + 1) % brand.roleFacets.length),
      2600,
    );
    return () => window.clearInterval(id);
  }, [reduced]);

  const onNav = (id: string) => {
    const inst = lenis?.current;
    if (inst) inst.scrollTo(`#${id}`, { offset: -80 });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // staggered entrance (base layer only); flavour follows the Mode
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const lines = root.querySelectorAll('[data-base] [data-hero-line]');
      const rise = root.querySelectorAll('[data-base] [data-rise]');

      if (reduced) return; // elements are visible by default

      gsap.set(lines, { yPercent: 115, autoAlpha: 0 });
      gsap.set(rise, { y: 22, autoAlpha: 0 });
      if (!started) return;

      const p = getMotionProfile();
      const tl = gsap.timeline();
      tl.to(
        lines,
        { yPercent: 0, autoAlpha: 1, duration: 0.75, ease: p.ease, stagger: 0.1 },
        0.05,
      ).to(
        rise,
        { y: 0, autoAlpha: 1, duration: 0.55, ease: p.ease, stagger: Math.max(0.05, p.stagger) },
        0.2,
      );
    },
    { dependencies: [reduced, started], scope: rootRef },
  );

  // accent bloom, scrubbed to the hero's own scroll (no pin on touch)
  useGSAP(
    () => {
      const root = rootRef.current;
      const bloom = bloomRef.current;
      if (!root || !bloom) return;

      bloom.style.clipPath = bloomShapeAt(themeRef.current, 0);
      if (reduced) return;

      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
        onUpdate: (self) => {
          bloom.style.clipPath = bloomShapeAt(themeRef.current, self.progress);
        },
      });
    },
    { dependencies: [reduced], scope: rootRef },
  );

  return (
    <section ref={rootRef} id="hero" className={styles.hero} aria-label="Intro">
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.layer} data-base>
        <MobileContent facet={facet} time={time} onNav={onNav} />
      </div>

      {/* accent duplicate revealed by the scroll bloom — inert so its duplicated
          buttons/links never take focus or clicks */}
      <div ref={bloomRef} className={cx(styles.layer, styles.bloom)} aria-hidden="true" inert>
        <MobileContent facet={facet} time={time} onNav={onNav} />
      </div>
    </section>
  );
}
