import { cx } from '../../../lib/utils/cx';
import s from './controls.module.css';

interface Option<T extends string> {
  value: T;
  label: string;
}

/* Generic over the value union so callers never have to cast back. Typed as
   plain `string` this forced `v as ThemeMode` at the call site, which would
   happily launder a typo'd option into an invalid setting. */
interface Props<T extends string> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}

export function SegmentedControl<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <div className={s.field}>
      <span className={s.fieldLabel}>{label}</span>
      <div role="radiogroup" aria-label={label} className={s.segment}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className={cx(s.seg, value === o.value && s.segOn)}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
