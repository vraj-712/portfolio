import { useId } from 'react';
import { cx } from '../../../lib/utils/cx';
import s from './controls.module.css';

interface Props {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}

export function ToggleControl({ label, checked, onChange, hint }: Props) {
  const id = useId();
  return (
    <div className={s.row}>
      <label htmlFor={id} className={s.rowLabel}>
        {label}
        {hint && <span className={s.hint}>{hint}</span>}
      </label>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        className={cx(s.switch, checked && s.switchOn)}
        onClick={() => onChange(!checked)}
      >
        <span className={s.knob} />
      </button>
    </div>
  );
}
