/* Tiny cross-cutting store for the settings-driven "reduce motion" flag, so both
   React hooks (useReducedMotion) and imperative GSAP code (env.ts) share one truth
   without prop-drilling into GSAP callbacks. */

type Listener = () => void;

let reduceMotion = false;
const listeners = new Set<Listener>();

export const getReduceMotion = (): boolean => reduceMotion;

export function setReduceMotion(value: boolean): void {
  if (value === reduceMotion) return;
  reduceMotion = value;
  listeners.forEach((l) => l());
}

export function subscribeReduceMotion(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
