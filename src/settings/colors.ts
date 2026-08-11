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

/** WCAG floors the derived tokens must clear. */
const AA_BODY = 4.5; // normal-weight body text (1.4.3)
const AA_UI = 3; // UI component boundaries + graphical objects (1.4.11)

/** How far the softest shades are *allowed* to wash out, before contrast clamps
 *  them back. These are the design intent; the solver below only ever pulls a
 *  value back toward ink, never past these ceilings. */
const MUTED_CEILING = 0.34;
const LINE_SOFT_CEILING = 0.72;

/** The softest point on the ink→base ramp that still clears `target` against
 *  `against`, capped at `ceiling`.
 *
 *  Base and ink are both user-editable, so a fixed mix factor cannot hold: the
 *  same 0.34 that reads at 5.5:1 on a near-black canvas collapses to 4.2:1 on a
 *  bone one. Solving instead makes the factor base-relative — light triads get
 *  pulled toward ink until they pass, dark triads keep the full ceiling.
 *
 *  Along the ramp each channel moves monotonically from ink to base, so relative
 *  luminance does too; the mix therefore only approaches `against` as t grows
 *  (both surfaces we solve against, --color-base and --color-base-3, sit at or
 *  past the far end of the searched span). Contrast is monotonically decreasing
 *  over [0, ceiling], which makes the bisection exact.
 *
 *  Returns 0 — pure ink, no muting — when the triad is too low-contrast for any
 *  point on the ramp to pass. That is the most legible answer available, and it
 *  degrades by losing hierarchy rather than by losing readability. */
function softestMixClearing(
  ink: string,
  base: string,
  against: string,
  target: number,
  ceiling: number,
): number {
  if (contrastRatio(ink, against) < target) return 0;
  if (contrastRatio(mix(ink, base, ceiling), against) >= target) return ceiling;
  let lo = 0;
  let hi = ceiling;
  // 24 halvings resolve far finer than the 8-bit quantisation of the result.
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    if (contrastRatio(mix(ink, base, mid), against) >= target) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Derive the full --color-* token set from the three editable roles.
 *  Works for both light and dark triads (elevated surfaces shift toward ink).
 *  The two softest tokens are contrast-solved rather than fixed, so the set
 *  stays AA-legible for any triad the Settings pickers can produce. */
export function deriveColors(
  base: string,
  ink: string,
  accent: string,
): Record<string, string> {
  const base3 = mix(base, ink, 0.13);
  // Muted text is measured against the DEEPEST surface it sits on, not the
  // canvas — e.g. ProjectCard's .phTag over the .ph placeholder's --color-base-3.
  const mutedT = softestMixClearing(ink, base, base3, AA_BODY, MUTED_CEILING);
  // Hairlines are load-bearing UI boundaries (ExperienceMobile's .techPill
  // border, the ScrollProgress track), so they answer to the 3:1 non-text floor
  // against the canvas — not to the decorative uses they also serve.
  const lineT = softestMixClearing(ink, base, base, AA_UI, LINE_SOFT_CEILING);

  return {
    '--color-base': base,
    '--color-base-2': mix(base, ink, 0.06),
    '--color-base-3': base3,
    '--color-ink': ink,
    '--color-ink-muted': mix(ink, base, mutedT),
    '--color-accent': accent,
    '--color-accent-press': mix(accent, ink, 0.28),
    '--color-on-accent': bestOn(accent),
    '--color-line': ink,
    '--color-line-soft': mix(ink, base, lineT),
  };
}
