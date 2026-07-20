import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useLenis } from '../../../hooks/useLenis';
import { useRegisterActiveSection } from '../../../hooks/useRegisterActiveSection';
import { useCursorTarget } from '../../../hooks/useCursorTarget';
import { AccentWipe } from '../../primitives/AccentWipe/AccentWipe';
import { SplitReveal } from '../../primitives/AnimatedText/SplitReveal';
import { Magnetic } from '../../primitives/Magnetic/Magnetic';
import { wipeIn, wipeOut } from '../../../lib/gsap/clipReveal';
import { content, labels } from '../../../site.config';
import styles from './Closing.module.css';

const { brand, vision, contact } = content;

/** Compact display handle from a profile URL (strip scheme + www + trailing /),
 *  so the shown value always tracks the real link in the config. */
const handle = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '');

interface ContactRowProps {
  href: string;
  label: string;
  value: string;
  cursorLabel: string;
  external?: boolean;
}

function ContactRow({ href, label, value, cursorLabel, external }: ContactRowProps) {
  const cursor = useCursorTarget('click', cursorLabel);
  return (
    <li className={styles.contactItem}>
      <Magnetic strength={0.25}>
        <a
          href={href}
          className={styles.contactLink}
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
          {...cursor}
        >
          <span className={styles.contactLabel}>{label}</span>
          <span className={styles.contactValue}>{value}</span>
        </a>
      </Magnetic>
    </li>
  );
}

export function Closing() {
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const rootRef = useRef<HTMLElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const backCursor = useCursorTarget('click', 'TOP');

  useRegisterActiveSection(rootRef, 'closing');

  useGSAP(
    () => {
      const root = rootRef.current;
      const curtain = curtainRef.current;
      if (!root || !curtain || reduced) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 80%', once: true } });
      tl.add(wipeIn(curtain, { direction: 'up', duration: 0.6 })).add(
        wipeOut(curtain, { direction: 'up', duration: 0.6 }),
        '+=0.05',
      );
    },
    { dependencies: [reduced], scope: rootRef },
  );

  const backToTop = () => {
    const inst = lenis?.current;
    if (inst) inst.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const year = new Date().getFullYear();

  return (
    <footer ref={rootRef} id="closing" className={styles.closing} aria-label={labels.sections.contact}>
      <AccentWipe ref={curtainRef} className={styles.curtain} />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{labels.closing.eyebrow}</p>

        <h2 className={styles.tagline}>
          <SplitReveal as="span" splitBy="words" stagger={0.05} y={120} className={styles.taglineText}>
            {brand.tagline}
          </SplitReveal>
        </h2>

        <p className={styles.vision}>{vision}</p>

        <ul className={styles.contacts}>
          <ContactRow href={`mailto:${contact.email}`} label={labels.closing.contacts.email} value={contact.email} cursorLabel="MESSAGE" />
          <ContactRow href={`tel:${contact.phone.replace(/\s+/g, '')}`} label={labels.closing.contacts.phone} value={contact.phone} cursorLabel="CALL" />
          <ContactRow href={contact.linkedin} label={labels.closing.contacts.linkedin} value={handle(contact.linkedin)} cursorLabel="CONNECT" external />
          <ContactRow href={contact.github} label={labels.closing.contacts.github} value={handle(contact.github)} cursorLabel="SOURCE" external />
        </ul>

        <div className={styles.footRow}>
          <button type="button" className={styles.backTop} onClick={backToTop} {...backCursor}>
            ↑ {labels.closing.backToTop}
          </button>
          <p className={styles.meta}>
            {contact.location} · © {year} {brand.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
