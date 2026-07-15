import type { Settings } from './types';
import { deriveColors } from './colors';
import { FONT_PAIRS } from '../data/settingsSchema';

/** Push the current settings onto <html> via CSS-variable overrides + attributes.
 *  Cheap: a style recalc + paint, no React re-render of the site. Resetting is just
 *  applySettings(DEFAULT_SETTINGS) — the values mirror theme.css. */
export function applySettings(s: Settings): void {
  const root = document.documentElement;

  const colors = deriveColors(s.colorBase, s.colorInk, s.colorAccent);
  for (const [k, v] of Object.entries(colors)) root.style.setProperty(k, v);

  const fonts = FONT_PAIRS[s.fontPair];
  root.style.setProperty('--font-display', fonts.display);
  root.style.setProperty('--font-body', fonts.body);
  root.style.setProperty('--font-mono', fonts.mono);

  root.style.setProperty('--fs-scale', String(s.typeScale));
  root.style.setProperty('--space-scale', String(s.spacing));
  root.style.setProperty('--dur-scale', String(1 / s.motionSpeed));
  root.style.setProperty('--radius', `${s.radius}px`);
  root.style.setProperty('--bw', `${s.borderWidth}px`);

  root.classList.toggle('no-hard-shadows', !s.hardShadows);
  root.toggleAttribute('data-reduce-motion', s.reduceMotion);

  // Mode: one attribute drives all [data-cursor-theme] CSS skin overrides.
  root.setAttribute('data-cursor-theme', s.cursorTheme);
}
