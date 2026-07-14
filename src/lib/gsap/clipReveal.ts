import { gsap } from 'gsap';
import { EASE } from './easings';

export type WipeDir = 'up' | 'down' | 'left' | 'right';

/** clip-path that hides a panel just off the given entry edge. */
const HIDDEN: Record<WipeDir, string> = {
  up: 'inset(100% 0% 0% 0%)', // hidden below → rises up
  down: 'inset(0% 0% 100% 0%)', // hidden above → drops down
  right: 'inset(0% 100% 0% 0%)', // hidden left → sweeps right
  left: 'inset(0% 0% 0% 100%)', // hidden right → sweeps left
};

/** clip-path that clears the panel out the far edge (for a curtain exit). */
const EXIT: Record<WipeDir, string> = {
  up: 'inset(0% 0% 100% 0%)',
  down: 'inset(100% 0% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
  left: 'inset(0% 100% 0% 0%)',
};

const FULL = 'inset(0% 0% 0% 0%)';

interface WipeOptions extends gsap.TweenVars {
  direction?: WipeDir;
}

/** Animate a panel IN — from clipped-away to fully covering. */
export function wipeIn(el: gsap.TweenTarget, opts: WipeOptions = {}): gsap.core.Tween {
  const { direction = 'up', duration = 0.7, ease = EASE.powerInOut, ...rest } = opts;
  return gsap.fromTo(
    el,
    { clipPath: HIDDEN[direction] },
    { clipPath: FULL, duration, ease, ...rest },
  );
}

/** Animate a panel OUT — from covering to cleared out the far edge. */
export function wipeOut(el: gsap.TweenTarget, opts: WipeOptions = {}): gsap.core.Tween {
  const { direction = 'up', duration = 0.7, ease = EASE.powerInOut, ...rest } = opts;
  return gsap.to(el, { clipPath: EXIT[direction], duration, ease, ...rest });
}

export const clipHidden = (d: WipeDir): string => HIDDEN[d];
export const clipFull = FULL;
