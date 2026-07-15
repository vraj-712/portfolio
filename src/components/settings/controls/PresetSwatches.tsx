import { cx } from '../../../lib/utils/cx';
import type { Palette } from '../../../data/settingsSchema';
import type { PaletteId } from '../../../settings/types';
import s from './controls.module.css';

interface Props {
  palettes: Palette[];
  activeId: PaletteId | null;
  onSelect: (id: PaletteId) => void;
}

export function PresetSwatches({ palettes, activeId, onSelect }: Props) {
  return (
    <div className={s.swatches}>
      {palettes.map((p) => (
        <button
          key={p.id}
          type="button"
          className={cx(s.swatch, activeId === p.id && s.swatchOn)}
          onClick={() => onSelect(p.id)}
          aria-pressed={activeId === p.id}
          title={p.name}
        >
          {/* inline colors are data-driven previews, not theme tokens */}
          <span className={s.swatchColors} aria-hidden="true">
            <span style={{ background: p.base }} />
            <span style={{ background: p.ink }} />
            <span style={{ background: p.accent }} />
          </span>
          <span className={s.swatchName}>{p.name}</span>
        </button>
      ))}
    </div>
  );
}
