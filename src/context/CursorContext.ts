import { createContext } from 'react';

/** Discrete cursor modes (string-literal union — no TS enum, per erasableSyntaxOnly). */
export type CursorVariant =
  | 'default'
  | 'hover'
  | 'view'
  | 'drag'
  | 'click'
  | 'text'
  | 'hidden';

export interface CursorContextValue {
  variant: CursorVariant;
  label: string;
  setCursor: (variant: CursorVariant, label?: string) => void;
  reset: () => void;
}

export const CursorContext = createContext<CursorContextValue | null>(null);
