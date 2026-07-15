import { useId } from 'react';
import s from './controls.module.css';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

export function SliderControl({ label, value, min, max, step, onChange, format }: Props) {
  const id = useId();
  return (
    <div className={s.field}>
      <div className={s.fieldHead}>
        <label htmlFor={id} className={s.fieldLabel}>
          {label}
        </label>
        <span className={s.value}>{format ? format(value) : value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={s.range}
      />
    </div>
  );
}
