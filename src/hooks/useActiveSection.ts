import { useContext } from 'react';
import { ActiveSectionContext } from '../context/ActiveSectionContext';

/** The id of the section currently in view (for nav / rail highlighting). */
export function useActiveSection(): string {
  const ctx = useContext(ActiveSectionContext);
  return ctx?.activeId ?? '';
}
