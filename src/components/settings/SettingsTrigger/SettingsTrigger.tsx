import { useSettings } from '../../../hooks/useSettings';
import { useCursorTarget } from '../../../hooks/useCursorTarget';
import { cx } from '../../../lib/utils/cx';
import s from './SettingsTrigger.module.css';

export function SettingsTrigger() {
  const { isOpen, toggle } = useSettings();
  const cursor = useCursorTarget('click', 'THEME');

  return (
    <button
      type="button"
      className={cx(s.trigger, isOpen && s.hidden)}
      onClick={toggle}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label="Customize site appearance"
      {...cursor}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="9" cy="6" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="8" cy="18" r="2.4" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
}
