import { useRef, useState, type JSX } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useIsCompact } from '../../../hooks/useIsCompact';
import { useLenis } from '../../../hooks/useLenis';
import { CounterIntro } from './variants/CounterIntro';
import { TerminalIntro } from './variants/TerminalIntro';
import { SplitFlapIntro } from './variants/SplitFlapIntro';
import { GridIntro } from './variants/GridIntro';
import type { IntroVariantProps } from './variants/types';
import { labels } from '../../../site.config';
import styles from './Intro.module.css';

type IntroVariant = (p: IntroVariantProps) => JSX.Element;

/** One is chosen at random per visit, so the loader varies. */
const VARIANTS: IntroVariant[] = [
  CounterIntro,
  TerminalIntro,
  SplitFlapIntro,
  GridIntro,
];

/** Loader shell: owns the curtain, skip, scroll-lock, a11y and the exit wipe.
 *  The chosen variant only plays its content and calls onReady(). */
export function Intro({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const compact = useIsCompact();
  const lenis = useLenis();
  const rootRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef(false);
  const exitingRef = useRef(false);

  // Pick once per mount (lazy initialiser — keeps the random draw out of the
  // render body). Small screens always get the plain counter: the busier
  // variants are built for room the phone doesn't have.
  const [Variant] = useState<IntroVariant>(() =>
    compact ? CounterIntro : (VARIANTS[Math.floor(Math.random() * VARIANTS.length)] ?? CounterIntro),
  );

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    lenis?.current?.start();
    document.body.style.overflow = '';
    ScrollTrigger.refresh();
    onDone();
  };

  /** Wipe the curtain away and hand off. Safe to call twice (skip + onReady). */
  const exit = () => {
    if (exitingRef.current || doneRef.current) return;
    exitingRef.current = true;
    const root = rootRef.current;
    if (reduced || !root) {
      finish();
      return;
    }
    gsap.to(root, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 0.6,
      ease: 'power4.inOut',
      onComplete: finish,
    });
  };

  useGSAP(
    () => {
      document.body.style.overflow = 'hidden';
      lenis?.current?.stop();
      // the provider effect (ancestor) may run after this child effect — make
      // sure the instance is stopped once it exists
      requestAnimationFrame(() => lenis?.current?.stop());
      skipRef.current?.focus();

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          exit();
        }
      };
      window.addEventListener('keydown', onKey);

      // hard-cap safety net — never trap the visitor behind the curtain.
      // Must stay clear of the longest variant (~2.9s) so it only ever fires
      // when a timeline has genuinely stalled.
      const cap = window.setTimeout(exit, 6000);

      return () => {
        window.clearTimeout(cap);
        window.removeEventListener('keydown', onKey);
      };
    },
    { dependencies: [reduced], scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className={styles.intro}
      role="dialog"
      aria-modal="true"
      aria-label="Site intro"
      onClick={exit}
    >
      <Variant reduced={reduced} onReady={exit} />
      <button
        ref={skipRef}
        type="button"
        className={styles.skip}
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        {labels.loader.skip} ↵
      </button>
    </div>
  );
}
