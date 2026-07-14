import { useEffect, useState } from 'react';

const QUERY = '(pointer: coarse)';

/** Live-updating coarse-pointer (touch) flag. */
export function useIsCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setCoarse(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return coarse;
}
