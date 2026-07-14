import { useMemo, useState, type ReactNode } from 'react';
import { ActiveSectionContext } from '../../context/ActiveSectionContext';

export function ActiveSectionProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState('');
  const value = useMemo(() => ({ activeId, setActiveId }), [activeId]);
  return (
    <ActiveSectionContext.Provider value={value}>{children}</ActiveSectionContext.Provider>
  );
}
