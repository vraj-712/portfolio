/* Cursor "Modes" — the single source of truth for each theme's identity and its
   GSAP-facing motion profile. Data-driven (mirrors settingsSchema.ts) so adding a
   Mode is a data edit. The CSS-facing skin tokens live in theme.css keyed by
   [data-cursor-theme]; the JS-facing motion lives here. */
import type { CursorThemeId } from '../settings/types';

/** GSAP-facing motion profile carried by each Mode. Read by reveal code via
 *  getMotionProfile()/useMotionProfile(). Reduced-motion always overrides this. */
export interface MotionProfile {
  ease: string; // gsap ease string, e.g. 'power4.out' | 'steps(6)' | 'back.out(1.6)'
  revealY: number; // entrance travel (px)
  stagger: number; // seconds between staggered items
  durScale: number; // multiplier on base durations
  rotate: number; // deg of playful rotation on reveals (0 = none)
  blur: number; // px blur-up on entrance (fluid only)
  loopScale: number; // × marquee loop duration (<1 faster, >1 slower)
  loopEase: string; // marquee loop ease ('none', or 'steps(n)' for a ticker)
}

export interface CursorTheme {
  id: CursorThemeId;
  name: string;
  blurb: string;
  motion: MotionProfile;
}

/* Keyed by id, so the compiler enforces that every Mode has a definition.
   `satisfies` keeps the literal key types while still checking completeness:
   adding a value to CursorThemeId without an entry here is now a compile error.
   It used to compile and surface as a TypeError at the first reveal instead. */
const DEFS = {
  precision: {
    name: 'Precision',
    blurb: 'Sharp · brutalist',
    motion: { ease: 'power4.out', revealY: 32, stagger: 0.08, durScale: 1, rotate: 0, blur: 0, loopScale: 1, loopEase: 'none' },
  },
  fluid: {
    name: 'Fluid',
    blurb: 'Soft · premium',
    motion: { ease: 'power2.out', revealY: 60, stagger: 0.12, durScale: 1.35, rotate: 0, blur: 12, loopScale: 1.6, loopEase: 'none' },
  },
  terminal: {
    name: 'Terminal',
    blurb: 'Technical · retro',
    motion: { ease: 'steps(6)', revealY: 18, stagger: 0.05, durScale: 0.8, rotate: 0, blur: 0, loopScale: 1, loopEase: 'steps(30)' },
  },
  kinetic: {
    name: 'Kinetic',
    blurb: 'Playful · bouncy',
    motion: { ease: 'back.out(1.6)', revealY: 44, stagger: 0.06, durScale: 1.1, rotate: 6, blur: 0, loopScale: 0.55, loopEase: 'none' },
  },
  off: {
    name: 'Off',
    blurb: 'Native cursor',
    motion: { ease: 'power4.out', revealY: 32, stagger: 0.08, durScale: 1, rotate: 0, blur: 0, loopScale: 1, loopEase: 'none' },
  },
} satisfies Record<CursorThemeId, Omit<CursorTheme, 'id'>>;

/** Picker order — object key order, i.e. the declaration order above. */
export const CURSOR_THEMES: CursorTheme[] = (Object.keys(DEFS) as (keyof typeof DEFS)[]).map(
  (id) => ({ id, ...DEFS[id] }),
);

/** Total lookup. A Record over a finite union has no optional member, so this
 *  needs no cast and cannot return undefined. */
export function cursorMotion(id: CursorThemeId): MotionProfile {
  return DEFS[id].motion;
}
