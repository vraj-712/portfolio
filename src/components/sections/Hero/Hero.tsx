import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRegisterActiveSection } from '../../../hooks/useRegisterActiveSection';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useLenis } from '../../../hooks/useLenis';
import { useSettings } from '../../../hooks/useSettings';
import { RollingText } from '../../primitives/RollingText/RollingText';
import { MagneticButton } from '../../primitives/Magnetic/MagneticButton';
import { HeroField } from './HeroField';
import { EASE } from '../../../lib/gsap/easings';
import { content } from '../../../data/content';
import { cx } from '../../../lib/utils/cx';
import styles from './Hero.module.css';

const { brand, skills, projects, experience, contact } = content;

const CITY = brand.location.split(',')[0] ?? brand.location;
const STATS = [
  { n: projects.length, label: 'Projects' },
  {
    n: skills.frontend.items.length + skills.backend.items.length + skills.tools.items.length,
    label: 'Technologies',
  },
  { n: experience.length, label: 'Roles' },
] as const;

const SOCIALS = [
  { label: 'GH', full: 'GitHub', href: contact.github },
  { label: 'LI', full: 'LinkedIn', href: contact.linkedin },
  { label: 'EM', full: 'Email', href: `mailto:${contact.email}` },
] as const;

const pad = (n: number) => String(n).padStart(2, '0');

/** Local time in Ahmedabad (IST), independent of the visitor's timezone. */
function istTime(): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    return '';
  }
}

interface HeroContentProps {
  accent?: boolean;
  facet: number;
  time: string;
  onNav: (id: string) => void;
}

function HeroContent({ accent, facet, time, onNav }: HeroContentProps) {
  return (
    <div className={styles.inner}>
      <div className={styles.metaTop}>
        <p className={styles.status}>
          <span className={styles.statusDot} aria-hidden="true" />
          Available for work
        </p>
        <p className={styles.place}>
          <span>
            {CITY}, IN
          </span>
          <span className={styles.time}>
            {time}
            <span className={styles.tz}> IST</span>
          </span>
        </p>
      </div>

      <div className={styles.center}>
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

        <div className={styles.ctas}>
          <MagneticButton
            variant="solid"
            cursorLabel="WORK"
            className={styles.ctaPrimary}
            onClick={() => onNav('projects')}
          >
            View Work <span aria-hidden="true">↓</span>
          </MagneticButton>
          <MagneticButton
            variant="outline"
            cursorLabel="SAY HI"
            className={styles.ctaGhost}
            onClick={() => onNav('closing')}
          >
            Get in touch
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

/** The accent bloom's reveal shape is a Mode signature, computed per scroll
 *  progress (0 = hidden → 1 = full): a hard rectangular wipe for Terminal, a
 *  corner bloom for Kinetic, a centred circle otherwise. Driven imperatively so
 *  the pinned ScrollTrigger is never rebuilt when the Mode changes. */
function bloomShapeAt(theme: string, p: number): string {
  switch (theme) {
    case 'terminal':
      return `inset(0 ${(1 - p) * 100}% 0 0)`;
    case 'kinetic':
      return `circle(${p * 165}% at 12% 88%)`;
    default:
      return `circle(${p * 135}% at 50% 52%)`;
  }
}

export function Hero({ started = true }: { started?: boolean }) {
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

      if (reduced) {
        setFacet(0);
        return;
      }

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
