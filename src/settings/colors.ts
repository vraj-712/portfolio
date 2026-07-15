/* Color math: hex parsing, mixing, WCAG contrast, and derivation of the full
   token set from the three editable roles (base / ink / accent). */

interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const n = Number.parseInt(h || '000000', 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const to = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Linear interpolation between two hex colors (t: 0 = a, 1 = b). */
export function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  });
}

function channelLum(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLum(r) + 0.7152 * channelLum(g) + 0.0722 * channelLum(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

export function isDark(hex: string): boolean {
  return relativeLuminance(hex) < 0.32;
}

/** The only legible text color to place ON a given background (paper-white or ink). */
export function bestOn(bg: string): string {
  const light = '#F7F4EC';
  const dark = '#111110';
  return contrastRatio(bg, light) >= contrastRatio(bg, dark) ? light : dark;
}

/** Derive the full --color-* token set from the three editable roles.
 *  Works for both light and dark triads (elevated surfaces shift toward ink). */
export function deriveColors(
  base: string,
  ink: string,
  accent: string,
): Record<string, string> {
  return {
    '--color-base': base,
    '--color-base-2': mix(base, ink, 0.06),
    '--color-base-3': mix(base, ink, 0.13),
    '--color-ink': ink,
    '--color-ink-muted': mix(ink, base, 0.34),
    '--color-accent': accent,
    '--color-accent-press': mix(accent, ink, 0.28),
    '--color-on-accent': bestOn(accent),
    '--color-line': ink,
    '--color-line-soft': mix(ink, base, 0.72),
  };
}
