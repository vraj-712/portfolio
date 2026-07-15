import { useEffect, useState } from 'react';
import { getReduceMotion, subscribeReduceMotion } from '../settings/motionFlag';

const QUERY = '(prefers-reduced-motion: reduce)';

/** Live reduced-motion flag: OS `prefers-reduced-motion` OR the Settings toggle. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () => (typeof window !== 'undefined' && window.matchMedia(QUERY).matches) || getReduceMotion(),
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setReduced(mq.matches || getReduceMotion());
    update();
    mq.addEventListener('change', update);
    const unsub = subscribeReduceMotion(update);
    return () => {
      mq.removeEventListener('change', update);
      unsub();
    };
  }, []);

  return reduced;
}
