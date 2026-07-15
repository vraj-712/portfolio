import { useEffect } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Traps focus within `ref` while `active`, restores focus on close, and calls
 *  `onEscape` on Esc. Reused by dialogs/drawers (settings panel, menus). */
export function useFocusTrap(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
  onEscape: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    const prevFocused = document.activeElement as HTMLElement | null;
    const list = () => Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
    list()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = list();
      const first = items[0];
      const last = items[items.length - 1];
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
    return () => {
      document.removeEventListener('keydown', onKey);
      prevFocused?.focus?.();
    };
  }, [ref, active, onEscape]);
}
