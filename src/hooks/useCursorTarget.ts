import { useMemo } from 'react';
import { useCursor } from './useCursor';
import { useIsCoarsePointer } from './useIsCoarsePointer';
import type { CursorVariant } from '../context/CursorContext';

/** Returns mouse-enter/leave handlers that set the cursor variant + label.
 *  No-ops on coarse pointers (touch), where the custom cursor is disabled. */
export function useCursorTarget(variant: CursorVariant, label = '') {
  const { setCursor, reset } = useCursor();
  const coarse = useIsCoarsePointer();

  return useMemo(() => {
    if (coarse) return {} as const;
    return {
      onMouseEnter: () => setCursor(variant, label),
      onMouseLeave: () => reset(),
    };
  }, [coarse, variant, label, setCursor, reset]);
}
