/* Settings model for the runtime customization panel. Temporary state only —
   never persisted, so a refresh restores theme.css defaults. */

export type ThemeMode = 'light' | 'dark';

export type FontPairId = 'bricolage-mono' | 'serif-mono' | 'system-sans' | 'all-mono';

export type PaletteId =
  | 'bone-ultramarine'
  | 'paper-crimson'
  | 'bone-forest'
  | 'mono-ink'
  | 'midnight-cyan'
  | 'oxblood-cream';

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
  customCursor: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  themeMode: 'light',
  paletteId: 'bone-ultramarine',
  colorBase: '#ECE7DA',
  colorInk: '#111110',
  colorAccent: '#1F1BEB',
  fontPair: 'bricolage-mono',
  typeScale: 1,
  spacing: 1,
  radius: 0,
  borderWidth: 2,
  hardShadows: true,
  reduceMotion: false,
  motionSpeed: 1,
  smoothScroll: true,
  customCursor: true,
};
