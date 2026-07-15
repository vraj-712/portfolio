/* Imperative environment checks for non-React (GSAP) code paths.
   React components should prefer the useReducedMotion / useIsCoarsePointer hooks. */
import { getReduceMotion } from '../../settings/motionFlag';

const mm = (q: string): boolean =>
  typeof window !== 'undefined' && window.matchMedia(q).matches;

export const prefersReducedMotion = (): boolean =>
  mm('(prefers-reduced-motion: reduce)') || getReduceMotion();

export const isCoarsePointer = (): boolean => mm('(pointer: coarse)');

export const isFinePointer = (): boolean =>
  mm('(hover: hover) and (pointer: fine)');
