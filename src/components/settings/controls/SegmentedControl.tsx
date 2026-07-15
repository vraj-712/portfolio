import { cx } from '../../../lib/utils/cx';
import s from './controls.module.css';

interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
}

export function SegmentedControl({ label, value, options, onChange }: Props) {
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
