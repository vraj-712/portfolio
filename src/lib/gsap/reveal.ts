import { getMotionProfile } from '../../settings/motionProfile';
import { prefersReducedMotion } from '../utils/env';

export interface TextRevealVars {
  ease: string;
  stagger: number;
  durScale: number;
  skew: number; // deg — kinetic adds a playful skew
}

/** Reveal parameters for the active Mode, read at reveal time so switching Mode
 *  affects content that hasn't animated in yet. Reduced-motion collapses to an
 *  instant, no-skew reveal. */
export function textReveal(): TextRevealVars {
  if (prefersReducedMotion()) return { ease: 'none', stagger: 0, durScale: 1, skew: 0 };
  const p = getMotionProfile();
  return { ease: p.ease, stagger: p.stagger, durScale: p.durScale, skew: p.rotate };
}
