import { useContext } from 'react';
import { SmoothScrollContext } from '../context/SmoothScrollContext';

/** Stable ref to the active Lenis instance (read `.current` in handlers/effects).
 *  Null when outside the provider; `.current` is null under reduced motion. */
export function useLenis() {
  return useContext(SmoothScrollContext);
}
