import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useLenis } from '../../../hooks/useLenis';
import { EASE } from '../../../lib/gsap/easings';
import { content } from '../../../data/content';
import styles from './Intro.module.css';

const { brand } = content;
const LETTERS = Array.from(brand.name);

export function Intro({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    lenis?.current?.start();
    document.body.style.overflow = '';
    ScrollTrigger.refresh();
    onDone();
  };

  const skip = () => {
    if (doneRef.current) return;
    const root = rootRef.current;
    tlRef.current?.kill();
    if (reduced || !root) {
      finish();
      return;
    }
    gsap.to(root, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 0.5,
      ease: 'power4.inOut',
      onComplete: finish,
    });
  };

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      document.body.style.overflow = 'hidden';
      lenis?.current?.stop();
      // provider effect (ancestor) may run after this child effect — ensure the
      // lenis instance is stopped once it exists
      requestAnimationFrame(() => lenis?.current?.stop());
      skipRef.current?.focus();

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          skip();
        }
      };
      window.addEventListener('keydown', onKey);

      if (reduced) {
        if (counterRef.current) counterRef.current.textContent = '100';
        const t = window.setTimeout(finish, 150);
        return () => {
          window.clearTimeout(t);
          window.removeEventListener('keydown', onKey);
        };
      }

      const units = root.querySelectorAll('[data-intro-unit]');
      const proxy = { v: 0 };
      const tl = gsap.timeline({ onComplete: finish });
      tlRef.current = tl;
      tl.to(
        proxy,
        {
          v: 100,
          duration: 1.1,
          ease: 'power2.out',
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(Math.round(proxy.v)).padStart(3, '0');
            }
          },
        },
        0,
      )
        .from(
          units,
          { yPercent: 120, autoAlpha: 0, stagger: 0.045, duration: 0.7, ease: EASE.expoOut },
          0.1,
        )
        .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'power4.inOut' }, '+=0.15');

      // hard-cap safety net
      const cap = window.setTimeout(finish, 3200);

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
      onClick={skip}
    >
      <div className={styles.inner}>
        <span ref={counterRef} className={styles.counter}>
          000
        </span>
        <p className={styles.name} aria-label={brand.name}>
          {LETTERS.map((ch, i) =>
            ch === ' ' ? (
              <span key={i} className={styles.space} aria-hidden="true" />
            ) : (
              <span key={i} className={styles.unit} aria-hidden="true">
                <span data-intro-unit className={styles.unitInner}>
                  {ch}
                </span>
              </span>
            ),
          )}
        </p>
      </div>
      <button
        ref={skipRef}
        type="button"
        className={styles.skip}
        onClick={(e) => {
          e.stopPropagation();
          skip();
        }}
      >
        Skip ↵
      </button>
    </div>
  );
}
