import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useActiveSection } from '../../../hooks/useActiveSection';
import { useLenis } from '../../../hooks/useLenis';
import { useCursorTarget } from '../../../hooks/useCursorTarget';
import { Magnetic } from '../../primitives/Magnetic/Magnetic';
import { content } from '../../../data/content';
import { cx } from '../../../lib/utils/cx';
import styles from './Header.module.css';

const { nav, contact } = content;

export function Header() {
  const activeId = useActiveSection();
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
    const inst = lenis?.current;
    if (inst) inst.scrollTo(`#${id}`, { offset: -80 });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mobile menu: focus management + trap + Esc
  useEffect(() => {
    if (!menuOpen) return;
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
  }, [menuOpen]);

  return (
    <header className={cx(styles.bar, scrolled && styles.scrolled)}>
      <div className={styles.row}>
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

      {menuOpen && (
        <div
          ref={sheetRef}
          id="mobile-menu"
          className={styles.sheet}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <nav aria-label="Mobile">
            <ul className={styles.sheetList}>
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={styles.sheetLink}
                    onClick={(e) => {
                      e.preventDefault();
                      jump(item.id);
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={contact.resume}
                  className={styles.sheetLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                >
                  Résumé ↗
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
