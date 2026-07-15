import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SmoothScrollContext } from '../../context/SmoothScrollContext';
import { prefersReducedMotion } from '../../lib/utils/env';
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

  useEffect(() => {
    if (!settings.smoothScroll || prefersReducedMotion()) return;

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
      instance.destroy();
      lenisRef.current = null;
    };
  }, [settings.smoothScroll, settings.reduceMotion]);

  return (
    <SmoothScrollContext.Provider value={lenisRef}>{children}</SmoothScrollContext.Provider>
  );
}
