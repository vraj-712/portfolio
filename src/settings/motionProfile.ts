/* Cross-cutting store for the active Mode's motion profile — the JS-side twin of
   theme.css's [data-cursor-theme] skin tokens. Lets imperative GSAP code (and React
   reveal hooks) read the current easing/distance/stagger without prop-drilling, exactly
   like motionFlag.ts does for reduce-motion. Reduced-motion still overrides at call sites. */
import type { MotionProfile } from '../data/cursorThemes';
import { CURSOR_PROFILES } from '../data/cursorThemes';

type Listener = () => void;

let current: MotionProfile = CURSOR_PROFILES.precision;
const listeners = new Set<Listener>();

export const getMotionProfile = (): MotionProfile => current;

export function setMotionProfile(next: MotionProfile): void {
  if (next === current) return;
  current = next;
  listeners.forEach((l) => l());
}

export function subscribeMotionProfile(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
