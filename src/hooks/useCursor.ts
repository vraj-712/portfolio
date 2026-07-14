import { useContext } from 'react';
import { CursorContext } from '../context/CursorContext';

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error('useCursor must be used within <CursorProvider>');
  return ctx;
}
