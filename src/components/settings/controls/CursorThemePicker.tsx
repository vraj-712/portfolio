import type { CursorThemeId } from '../../../settings/types';
import { CURSOR_THEMES } from '../../../data/cursorThemes';
import { cx } from '../../../lib/utils/cx';
import s from './CursorThemePicker.module.css';

interface CursorThemePickerProps {
  value: CursorThemeId;
  onChange: (id: CursorThemeId) => void;
}

/** Radio-group of Modes. Each option carries a small static preview glyph of its
 *  cursor so the choice reads visually, not just by name. */
export function CursorThemePicker({ value, onChange }: CursorThemePickerProps) {
  return (
    <div className={s.grid} role="radiogroup" aria-label="Cursor mode">
      {CURSOR_THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={value === t.id}
          className={cx(s.btn, value === t.id && s.on)}
          onClick={() => onChange(t.id)}
        >
          <span className={cx(s.preview, s[t.id])} aria-hidden="true" />
          <span className={s.meta}>
            <span className={s.name}>{t.name}</span>
            <span className={s.blurb}>{t.blurb}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
