import { useId, useState } from 'react';
import { contrastRatio } from '../../../settings/colors';
import { cx } from '../../../lib/utils/cx';
import s from './controls.module.css';

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const expand = (h: string): string =>
  h.length === 4
    ? '#' +
      h
        .slice(1)
        .split('')
        .map((c) => c + c)
        .join('')
    : h;

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** show a live WCAG contrast badge against this color */
  contrastAgainst?: string;
}

export function ColorControl({ label, value, onChange, contrastAgainst }: Props) {
  const id = useId();
  const [text, setText] = useState(value);
  // sync local text with the prop when it changes externally (preset / derive)
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }

  const commit = (v: string) => {
    if (HEX.test(v)) onChange(expand(v));
    else setText(value);
  };

  const ratio = contrastAgainst ? contrastRatio(value, contrastAgainst) : null;
  const pass = ratio != null ? ratio >= 4.5 : null;
  const swatch = HEX.test(value) ? expand(value) : '#000000';

  return (
    <div className={s.field}>
      <div className={s.fieldHead}>
        <label htmlFor={id} className={s.fieldLabel}>
          {label}
        </label>
        {ratio != null && (
          <span className={cx(s.badge, pass ? s.badgeGood : s.badgeBad)}>
            {ratio.toFixed(1)}:1 {pass ? 'AA' : 'low'}
          </span>
        )}
      </div>
      <div className={s.colorRow}>
        <input
          id={id}
          type="color"
          value={swatch}
          onChange={(e) => onChange(e.target.value)}
          className={s.colorInput}
          aria-label={label}
        />
        <input
          type="text"
          value={text}
          spellCheck={false}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => commit(text)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit(text);
          }}
          className={s.hexInput}
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}
