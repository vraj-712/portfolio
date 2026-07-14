import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { CursorContext } from '../../context/CursorContext';
import type { CursorVariant } from '../../context/CursorContext';

interface CursorState {
  variant: CursorVariant;
  label: string;
}

const DEFAULT: CursorState = { variant: 'default', label: '' };

export function CursorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CursorState>(DEFAULT);

  const setCursor = useCallback((variant: CursorVariant, label = '') => {
    setState({ variant, label });
  }, []);

  const reset = useCallback(() => setState(DEFAULT), []);

  const value = useMemo(
    () => ({ ...state, setCursor, reset }),
    [state, setCursor, reset],
  );

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}
