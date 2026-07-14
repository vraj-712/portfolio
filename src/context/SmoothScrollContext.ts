import { createContext } from 'react';
import type { RefObject } from 'react';
import type Lenis from 'lenis';

export type LenisRef = RefObject<Lenis | null>;

export const SmoothScrollContext = createContext<LenisRef | null>(null);
