import { useEffect, useRef, useState, type ElementType } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRegisterActiveSection } from '../../../hooks/useRegisterActiveSection';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useLenis } from '../../../hooks/useLenis';
import { useSettings } from '../../../hooks/useSettings';
import { useIsCompact } from '../../../hooks/useIsCompact';
import { RollingText } from '../../primitives/RollingText/RollingText';
import { MagneticButton } from '../../primitives/Magnetic/MagneticButton';
import { HeroField } from './HeroField';
import { HeroMobile } from './HeroMobile';
import { EASE } from '../../../lib/gsap/easings';
import { content, labels } from '../../../site.config';
import { cx } from '../../../lib/utils/cx';
import { CITY, STATS, SOCIALS, pad, istTime, bloomShapeAt } from './heroShared';
import styles from './Hero.module.css';

const { brand } = content;

interface HeroContentProps {
  accent?: boolean;
  facet: number;
  time: string;
  onNav: (id: string) => void;
}

function HeroContent({ accent, facet, time, onNav }: HeroContentProps) {
  // The accent layer is a purely-visual, aria-hidden duplicate; only the base
  // layer is the real heading. Rendering the duplicate as a <div> (identical
  // styling — .name resets margin) keeps a single <h1> on the page. The
  // [data-hero-name] attribute stays on both so the reveal still targets them.
  const NameTag: ElementType = accent ? 'div' : 'h1';
  return (
    <div className={styles.inner}>
      <div className={styles.metaTop}>
        <p className={styles.status}>
          <span className={styles.statusDot} aria-hidden="true" />
          {labels.hero.status}
        </p>
        <p className={styles.place}>
          <span>
            {CITY}, IN
          </span>
          <span className={styles.time}>
            {time}
            <span className={styles.tz}> {labels.hero.clock}</span>
          </span>
        </p>
      </div>

      <div className={styles.center}>
        <p className={cx(styles.eyebrow, accent && styles.eyebrowAccent)}>{brand.taglineParts[0]}</p>
        <NameTag
          className={styles.name}
          data-hero-name
          {...(accent ? {} : { 'aria-label': brand.name })}
        >
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
        </NameTag>
        <p className={styles.role}>
          <span className={styles.roleStatic}>{brand.role} —&nbsp;</span>
          <RollingText values={brand.roleFacets} index={facet} className={styles.roleRoll} />
        </p>

        <div className={styles.ctas}>
          <MagneticButton
            variant="solid"
            cursorLabel="WORK"
            className={styles.ctaPrimary}
            onClick={() => onNav('projects')}
          >
            {labels.hero.ctaPrimary} <span aria-hidden="true">↓</span>
          </MagneticButton>
          <MagneticButton
            variant="outline"
            cursorLabel="SAY HI"
            className={styles.ctaGhost}
            onClick={() => onNav('closing')}
          >
            {labels.hero.ctaSecondary}
          </MagneticButton>
        </div>
      </div>

      <div className={styles.metaBottom}>
        <ul className={styles.stats}>
          {STATS.map((s) => (
            <li key={s.label}>
              <span className={styles.statNum}>{pad(s.n)}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </li>
          ))}
        </ul>
        <ul className={styles.socials}>
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.full}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HeroDesktop({ started = true }: { started?: boolean }) {
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const { settings } = useSettings();
  const theme = settings.cursorTheme;
  // read live inside the pin's onUpdate so the bloom shape follows the Mode
  // without rebuilding the (pinned) ScrollTrigger
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const rootRef = useRef<HTMLElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const [facet, setFacet] = useState(0);
  const [time, setTime] = useState(istTime);

  useRegisterActiveSection(rootRef, 'hero');

  // live IST clock — a small sign of life, updates once a second
  useEffect(() => {
    const id = window.setInterval(() => setTime(istTime()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const onNav = (id: string) => {
    const inst = lenis?.current;
    if (inst) inst.scrollTo(`#${id}`, { offset: -80 });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Pin/scrub + initial states. The base name starts hidden so its entrance can
  // play AFTER the intro curtain lifts (see the entrance effect below).
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const baseLines = root.querySelectorAll('[data-base] [data-hero-line]');
      const names = root.querySelectorAll<HTMLElement>('[data-hero-name]');

      gsap.set(baseLines, { yPercent: 120, autoAlpha: 0 });
      const bloom = bloomRef.current;
      if (bloom) bloom.style.clipPath = bloomShapeAt(themeRef.current, 0);

      setFacet(0);
      if (reduced) return;

      // Pin + scrub bloom only on a real desktop (fine pointer, wide). On touch
      // or narrow screens the hero flows naturally (see the CSS breakpoint) with
      // no pin. gsap.matchMedia auto-reverts on resize / pointer change, so the
      // JS (pin) and CSS (layout) stay in lockstep via the same media condition.
      const mm = gsap.matchMedia();
      mm.add('(min-width: 641px) and (pointer: fine)', () => {
        gsap.set(names, { scale: 1.06, transformOrigin: 'left center' });
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
              // bloom shape follows the *current* Mode, read live
              if (bloom) bloom.style.clipPath = bloomShapeAt(themeRef.current, p);
            },
          },
        });
        tl.to(names, { scale: 1, letterSpacing: '-0.04em', ease: 'none' }, 0);
      });
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
      <HeroField />
      <div className={styles.layer} data-base>
        <HeroContent facet={facet} time={time} onNav={onNav} />
      </div>
      {/* accent duplicate revealed by the scroll bloom — inert so its duplicated
          buttons/links never take focus or clicks */}
      <div ref={bloomRef} className={cx(styles.layer, styles.bloom)} aria-hidden="true" inert>
        <HeroContent accent facet={facet} time={time} onNav={onNav} />
      </div>
    </section>
  );
}

/** Renders the pinned, cursor-reactive desktop hero on a real desktop, and a
 *  purpose-built compact hero on touch / small screens. The breakpoint matches
 *  the desktop pin's matchMedia condition, so the two never conflict. */
export function Hero({ started = true }: { started?: boolean }) {
  const compact = useIsCompact();
  return compact ? <HeroMobile started={started} /> : <HeroDesktop started={started} />;
}
