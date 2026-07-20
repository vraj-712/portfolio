/* =============================================================================
   THEME — the visual identity the site boots with. This is the single source
   for the default palette: it feeds DEFAULT_SETTINGS (runtime), the "primary"
   preset in the Settings panel, and (kept in sync by hand) theme.css's :root.

   Colors are hex. `mode` must agree with `colorBase` (dark base → 'dark').
   The Settings panel can still change any of this at runtime; a refresh
   restores exactly what's set here.
   ============================================================================= */

import type { ThemeConfig } from './types';

export const theme: ThemeConfig = {
  paletteId: 'midnight-cyan',
  paletteName: 'Midnight · Cyan',
  mode: 'dark',

  colorBase: '#0C0F12', // page canvas
  colorInk: '#E9EEF0', // text / borders
  colorAccent: '#29E0D4', // reveal / focus / emphasis

  fontPair: 'bricolage-mono',
  cursorTheme: 'precision',

  typeScale: 1,
  spacing: 1,
  radius: 0,
  borderWidth: 2,
  hardShadows: true,
  reduceMotion: false,
  motionSpeed: 1,
  smoothScroll: true,
};
