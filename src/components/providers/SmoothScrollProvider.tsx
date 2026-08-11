import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SmoothScrollContext } from '../../context/SmoothScrollContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useSettings } from '../../hooks/useSettings';

interface Props {
  children: ReactNode;
}

/** Lenis inertial scroll ↔ GSAP ScrollTrigger, driven by gsap.ticker.
 *  Disabled under prefers-reduced-motion or when the Settings toggle is off
 *  (native scroll). Exposed as a stable ref so consumers read the instance in
 *  handlers without re-rendering. */
export function SmoothScrollProvider({ children }: Props) {
  const lenisRef = useRef<Lenis | null>(null);
  const { settings } = useSettings();
  // Read the LIVE hook, not the imperative module mirror in lib/utils/env. That
  // mirror is written by an effect in SettingsProvider, our own ancestor, and
  // React runs child effects before parent effects — so reading it here saw the
  // previous value and left this provider inverted by one step: reduce-motion ON
  // kept Lenis running, and turning it back OFF destroyed Lenis for good.
  // The hook re-renders us from a subscription, i.e. after the parent has written.
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!settings.smoothScroll || reduced) return;

    const instance = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = instance;

    const onScroll = () => ScrollTrigger.update();
    instance.on('scroll', onScroll);

    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      instance.off('scroll', onScroll);
      gsap.ticker.remove(raf);
      // Restore GSAP's default. Leaving lagSmoothing at 0 for the rest of the
      // session means every time-based tween jumps the full elapsed gap after a
      // tab switch or a long main-thread stall, instead of being clamped.
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      lenisRef.current = null;
    };
  }, [settings.smoothScroll, reduced]);

  return (
    <SmoothScrollContext.Provider value={lenisRef}>{children}</SmoothScrollContext.Provider>
  );
}
