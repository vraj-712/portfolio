import type { ReactNode } from 'react';
import { registerGsap } from '../../lib/gsap/register';
import { SmoothScrollProvider } from './SmoothScrollProvider';
import { CursorProvider } from './CursorProvider';
import { ActiveSectionProvider } from './ActiveSectionProvider';

// Register GSAP plugins once at module load, before any animation runs.
registerGsap();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SmoothScrollProvider>
      <CursorProvider>
        <ActiveSectionProvider>{children}</ActiveSectionProvider>
      </CursorProvider>
    </SmoothScrollProvider>
  );
}
