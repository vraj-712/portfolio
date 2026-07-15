import { useRef } from 'react';
import { useSettings } from '../../../hooks/useSettings';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { PALETTES, FONT_PAIRS } from '../../../data/settingsSchema';
import type { FontPairId, ThemeMode } from '../../../settings/types';
import { ToggleControl } from '../controls/ToggleControl';
import { SliderControl } from '../controls/SliderControl';
import { SegmentedControl } from '../controls/SegmentedControl';
import { ColorControl } from '../controls/ColorControl';
import { PresetSwatches } from '../controls/PresetSwatches';
import { CursorThemePicker } from '../controls/CursorThemePicker';
import { cx } from '../../../lib/utils/cx';
import s from './SettingsPanel.module.css';

const FONT_OPTIONS = (Object.keys(FONT_PAIRS) as FontPairId[]).map((id) => ({
  id,
  label: FONT_PAIRS[id].label,
  display: FONT_PAIRS[id].display,
}));

const pct = (v: number) => `${Math.round(v * 100)}%`;

export function SettingsPanel() {
  const { settings, isOpen, setSetting, applyPreset, reset, close } = useSettings();
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, isOpen, close);

  return (
    <>
      <div
        className={cx(s.backdrop, isOpen && s.backdropOpen)}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        className={cx(s.panel, isOpen && s.open)}
        role="dialog"
        aria-modal="true"
        aria-label="Site settings"
        aria-hidden={!isOpen}
        inert={isOpen ? undefined : true}
      >
        <header className={s.head}>
          <div>
            <p className={s.kicker}>Playground</p>
            <h2 className={s.title}>Customize</h2>
          </div>
          <button type="button" className={s.close} onClick={close} aria-label="Close settings">
            ✕
          </button>
        </header>

        <div className={s.body} data-lenis-prevent>
          <p className={s.note}>Temporary — refresh the page to restore the original design.</p>

          <section className={s.group}>
            <h3 className={s.groupTitle}>Theme</h3>
            <SegmentedControl
              label="Mode"
              value={settings.themeMode}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
              onChange={(v) => setSetting('themeMode', v as ThemeMode)}
            />
            <p className={s.subLabel}>Palettes</p>
            <PresetSwatches palettes={PALETTES} activeId={settings.paletteId} onSelect={applyPreset} />
            <div className={s.gap} />
            <ColorControl
              label="Accent"
              value={settings.colorAccent}
              onChange={(v) => setSetting('colorAccent', v)}
              contrastAgainst={settings.colorBase}
            />
            <ColorControl
              label="Ink"
              value={settings.colorInk}
              onChange={(v) => setSetting('colorInk', v)}
              contrastAgainst={settings.colorBase}
            />
            <ColorControl label="Base" value={settings.colorBase} onChange={(v) => setSetting('colorBase', v)} />
          </section>

          <section className={s.group}>
            <h3 className={s.groupTitle}>Type</h3>
            <span className={s.subLabel}>Font pairing</span>
            <div className={s.fontGrid}>
              {FONT_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={cx(s.fontBtn, settings.fontPair === o.id && s.fontBtnOn)}
                  onClick={() => setSetting('fontPair', o.id)}
                  aria-pressed={settings.fontPair === o.id}
                >
                  <span className={s.fontPreview} style={{ fontFamily: o.display }}>
                    Aa
                  </span>
                  <span className={s.fontName}>{o.label}</span>
                </button>
              ))}
            </div>
            <div className={s.gap} />
            <SliderControl
              label="Type scale"
              value={settings.typeScale}
              min={0.85}
              max={1.3}
              step={0.01}
              onChange={(v) => setSetting('typeScale', v)}
              format={pct}
            />
          </section>

          <section className={s.group}>
            <h3 className={s.groupTitle}>Layout</h3>
            <SliderControl
              label="Density"
              value={settings.spacing}
              min={0.8}
              max={1.3}
              step={0.01}
              onChange={(v) => setSetting('spacing', v)}
              format={pct}
            />
          </section>

          <section className={s.group}>
            <h3 className={s.groupTitle}>Shape</h3>
            <SliderControl
              label="Corner radius"
              value={settings.radius}
              min={0}
              max={28}
              step={1}
              onChange={(v) => setSetting('radius', v)}
              format={(v) => `${v}px`}
            />
            <SliderControl
              label="Border width"
              value={settings.borderWidth}
              min={1}
              max={5}
              step={1}
              onChange={(v) => setSetting('borderWidth', v)}
              format={(v) => `${v}px`}
            />
            <ToggleControl
              label="Hard shadows"
              checked={settings.hardShadows}
              onChange={(v) => setSetting('hardShadows', v)}
            />
          </section>

          <section className={s.group}>
            <h3 className={s.groupTitle}>Motion</h3>
            <ToggleControl
              label="Reduce motion"
              checked={settings.reduceMotion}
              onChange={(v) => setSetting('reduceMotion', v)}
            />
            <SliderControl
              label="Animation speed"
              value={settings.motionSpeed}
              min={0.5}
              max={2}
              step={0.1}
              onChange={(v) => setSetting('motionSpeed', v)}
              format={(v) => `${v.toFixed(1)}×`}
            />
            <ToggleControl
              label="Smooth scroll"
              checked={settings.smoothScroll}
              onChange={(v) => setSetting('smoothScroll', v)}
            />
          </section>

          <section className={s.group}>
            <h3 className={s.groupTitle}>Cursor</h3>
            <p className={s.subLabel}>Cursor + motion + skin — desktop only</p>
            <CursorThemePicker
              value={settings.cursorTheme}
              onChange={(v) => setSetting('cursorTheme', v)}
            />
          </section>

          <button type="button" className={s.reset} onClick={reset}>
            ↺ Reset to defaults
          </button>
        </div>
      </aside>
    </>
  );
}
