import { createContext } from 'react';

export interface ActiveSectionValue {
  activeId: string;
  setActiveId: (id: string) => void;
}

export const ActiveSectionContext = createContext<ActiveSectionValue | null>(null);
