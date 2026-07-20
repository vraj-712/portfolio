/* Settings model for the runtime customization panel. Temporary state only —
   never persisted, so a refresh restores the site-config defaults. */

import { theme } from '../config/theme';

export type ThemeMode = 'light' | 'dark';

export type FontPairId = 'bricolage-mono' | 'serif-mono' | 'system-sans' | 'all-mono';

export type PaletteId =
  | 'bone-ultramarine'
  | 'paper-crimson'
  | 'bone-forest'
  | 'mono-ink'
  | 'midnight-cyan'
  | 'oxblood-cream';

/** Cursor "Mode": each id re-skins the cursor, the motion profile, and section
 *  skins site-wide. `off` = native system cursor. */
export type CursorThemeId = 'precision' | 'fluid' | 'terminal' | 'kinetic' | 'off';

export interface Settings {
  themeMode: ThemeMode;
  paletteId: PaletteId | null; // null = custom (a color was hand-edited)
  colorBase: string;
  colorInk: string;
  colorAccent: string;
  fontPair: FontPairId;
  typeScale: number; // 0.85 – 1.3  → --fs-scale
  spacing: number; // 0.8 – 1.3   → --space-scale
  radius: number; // 0 – 28px     → --radius
  borderWidth: number; // 1 – 5px  → --bw
  hardShadows: boolean;
  reduceMotion: boolean;
  motionSpeed: number; // 0.5 – 2  (1 = default)
  smoothScroll: boolean;
  cursorTheme: CursorThemeId;
}

// The boot defaults come straight from the site config's theme block — the one
// place a rebrand sets the default look (src/config/theme.ts).
export const DEFAULT_SETTINGS: Settings = {
  themeMode: theme.mode,
  paletteId: theme.paletteId,
  colorBase: theme.colorBase,
  colorInk: theme.colorInk,
  colorAccent: theme.colorAccent,
  fontPair: theme.fontPair,
  typeScale: theme.typeScale,
  spacing: theme.spacing,
  radius: theme.radius,
  borderWidth: theme.borderWidth,
  hardShadows: theme.hardShadows,
  reduceMotion: theme.reduceMotion,
  motionSpeed: theme.motionSpeed,
  smoothScroll: theme.smoothScroll,
  cursorTheme: theme.cursorTheme,
};
