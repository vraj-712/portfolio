/* Data for the Settings panel — palettes and font pairings. Data-driven so adding
   a preset is a data edit, not new markup (mirrors content.ts). */
import type { FontPairId, PaletteId } from '../settings/types';

export interface Palette {
  id: PaletteId;
  name: string;
  base: string;
  ink: string;
  accent: string;
}

/** Curated triads. Light and dark; accents chosen to read well on their base. */
export const PALETTES: Palette[] = [
  { id: 'bone-ultramarine', name: 'Bone · Ultramarine', base: '#ECE7DA', ink: '#111110', accent: '#1F1BEB' },
  { id: 'paper-crimson', name: 'Paper · Crimson', base: '#F1ECE3', ink: '#16110F', accent: '#C01432' },
  { id: 'bone-forest', name: 'Bone · Forest', base: '#E9E7DC', ink: '#10130E', accent: '#17663A' },
  { id: 'mono-ink', name: 'Mono · Ink', base: '#ECEAE3', ink: '#111110', accent: '#111110' },
  { id: 'midnight-cyan', name: 'Midnight · Cyan', base: '#0C0F12', ink: '#E9EEF0', accent: '#29E0D4' },
  { id: 'oxblood-cream', name: 'Oxblood · Ember', base: '#17100F', ink: '#F0E7DD', accent: '#FF6B4A' },
];

export interface FontPair {
  label: string;
  display: string;
  body: string;
  mono: string;
}

/** Zero-install pairings: the bundled Bricolage/Space Mono + system stacks.
 *  (Extra Fontsource faces can be added later via a lazy loader per pair.) */
export const FONT_PAIRS: Record<FontPairId, FontPair> = {
  'bricolage-mono': {
    label: 'Bricolage × Mono',
    display: "'Bricolage Grotesque Variable', system-ui, sans-serif",
    body: "'Bricolage Grotesque Variable', system-ui, sans-serif",
    mono: "'Space Mono', ui-monospace, monospace",
  },
  'serif-mono': {
    label: 'Serif × Mono',
    display: "Georgia, 'Times New Roman', ui-serif, serif",
    body: "Georgia, ui-serif, serif",
    mono: "'Space Mono', ui-monospace, monospace",
  },
  'system-sans': {
    label: 'System Sans',
    display: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Menlo, monospace",
  },
  'all-mono': {
    label: 'All Mono',
    display: "'Space Mono', ui-monospace, monospace",
    body: "'Space Mono', ui-monospace, monospace",
    mono: "'Space Mono', ui-monospace, monospace",
  },
};
