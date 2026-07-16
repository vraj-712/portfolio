import { useEffect, useState } from 'react';

/** True when a section should use its compact/touch variant. This is the exact
 *  complement of the desktop pinned hero's `(min-width: 641px) and (pointer: fine)`
 *  matchMedia condition, so the component choice and the pin/layout always agree. */
const QUERY = '(max-width: 640px), (pointer: coarse)';

export function useIsCompact(): boolean {
  const [compact, setCompact] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return compact;
}
