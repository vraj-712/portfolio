import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useActiveSection } from '../../../hooks/useActiveSection';
import { useLenis } from '../../../hooks/useLenis';
import { useCursorTarget } from '../../../hooks/useCursorTarget';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { Magnetic } from '../../primitives/Magnetic/Magnetic';
import { content } from '../../../data/content';
import { cx } from '../../../lib/utils/cx';
import { EASE } from '../../../lib/gsap/easings';
import styles from './Header.module.css';

const { nav, contact } = content;

export function Header() {
  const activeId = useActiveSection();
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // the sheet outlives `menuOpen` by one exit animation, so it needs its own
  // mount flag — set during render on open so it appears in the same commit
  const [sheetMounted, setSheetMounted] = useState(false);
  if (menuOpen && !sheetMounted) setSheetMounted(true);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const linkCursor = useCursorTarget('hover');
  const resumeCursor = useCursorTarget('click', 'RESUME');

  useGSAP(() => {
    ScrollTrigger.create({
      start: 80,
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    });
  }, []);

  const jump = (id: string) => {
    setMenuOpen(false);
    // The scroll-lock effect only releases Lenis on cleanup, which runs after
    // this handler returns — scrolling now would be swallowed while it's still
    // stopped, so hand off to the next frame.
    requestAnimationFrame(() => {
      const inst = lenis?.current;
      if (inst) inst.scrollTo(`#${id}`, { offset: -80 });
      else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  // Sheet open/close motion. Deliberately NOT useGSAP: it reverts the context
  // before re-running on a dep change, which would snap the sheet back to its
  // hidden `from` state and eat the exit animation.
  useEffect(() => {
    if (!sheetMounted) return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const rows = sheet.querySelectorAll<HTMLElement>('[data-row]');
    const HIDDEN = 'inset(0% 0% 100% 0%)';

    if (menuOpen) {
      if (reduced) {
        gsap.set(sheet, { clipPath: 'inset(0% 0% 0% 0%)' });
        gsap.set(rows, { yPercent: 0, autoAlpha: 1 });
        return;
      }
      const tl = gsap
        .timeline()
        .fromTo(
          sheet,
          { clipPath: HIDDEN },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: EASE.expoOut },
        )
        .fromTo(
          rows,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.55, ease: EASE.expoOut, stagger: 0.045 },
          0.1,
        );
      return () => { tl.kill(); };
    }

    if (reduced) {
      setSheetMounted(false);
      return;
    }
    const tl = gsap
      .timeline({ onComplete: () => setSheetMounted(false) })
      .to(rows, { yPercent: -110, duration: 0.25, ease: 'power2.in', stagger: 0.03 })
      .to(sheet, { clipPath: HIDDEN, duration: 0.35, ease: 'power3.in' }, 0.12);
    return () => { tl.kill(); };
  }, [menuOpen, sheetMounted, reduced]);

  // Lock the page behind the open sheet — without this the body scrolls under
  // it — and flag the root so decoupled fixed UI (the settings trigger) can
  // step aside for the full-screen sheet.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.dataset.menuOpen = 'true';
    lenis?.current?.stop();
    return () => {
      document.body.style.overflow = prev;
      delete document.documentElement.dataset.menuOpen;
      lenis?.current?.start();
    };
  }, [menuOpen, lenis]);

  // Mobile menu: focus management + trap + Esc
  useEffect(() => {
    if (!menuOpen || !sheetMounted) return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const focusables = sheet.querySelectorAll<HTMLElement>('a, button');
    focusables[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        burgerRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, sheetMounted]);

  return (
    <header className={cx(styles.bar, scrolled && styles.scrolled)}>
      <div className={cx(styles.row, menuOpen && styles.rowOpen)}>
        <a
          href="#hero"
          className={styles.logo}
          onClick={(e) => {
            e.preventDefault();
            jump('hero');
          }}
          {...linkCursor}
        >
          VP<span className={styles.logoDot}>.</span>
        </a>

        <nav className={styles.navDesktop} aria-label="Primary">
          <ul className={styles.navList}>
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={cx(styles.link, activeId === item.id && styles.linkActive)}
                  aria-current={activeId === item.id ? 'true' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    jump(item.id);
                  }}
                  {...linkCursor}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Magnetic strength={0.35} className={styles.resumeWrap}>
            <a
              href={contact.resume}
              className={styles.resume}
              target="_blank"
              rel="noreferrer"
              {...resumeCursor}
            >
              Résumé ↗
            </a>
          </Magnetic>
          <button
            ref={burgerRef}
            type="button"
            className={styles.burger}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={cx(styles.burgerLine, menuOpen && styles.burgerLineOpen)} />
            <span className={cx(styles.burgerLine, menuOpen && styles.burgerLineOpen)} />
          </button>
        </div>
      </div>

      {sheetMounted && (
        <div
          ref={sheetRef}
          id="mobile-menu"
          className={styles.sheet}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className={styles.sheetInner}>
            <nav className={styles.sheetNav} aria-label="Mobile">
              <ul className={styles.sheetList}>
                {nav.map((item, i) => (
                  <li key={item.id} className={styles.sheetItem}>
                    <a
                      href={`#${item.id}`}
                      data-row
                      className={cx(
                        styles.sheetLink,
                        activeId === item.id && styles.sheetLinkActive,
                      )}
                      aria-current={activeId === item.id ? 'true' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        jump(item.id);
                      }}
                    >
                      <span className={styles.sheetIndex}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.sheetLabel}>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.sheetFoot}>
              <a
                href={contact.resume}
                data-row
                className={styles.sheetResume}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                <span>Résumé</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
