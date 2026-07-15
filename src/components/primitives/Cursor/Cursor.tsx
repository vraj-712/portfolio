import { useEffect } from 'react';
import { useCursor } from '../../../hooks/useCursor';
import { useIsCoarsePointer } from '../../../hooks/useIsCoarsePointer';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useSettings } from '../../../hooks/useSettings';
import { PrecisionCursor } from './variants/PrecisionCursor';
import { FluidCursor } from './variants/FluidCursor';
import { TerminalCursor } from './variants/TerminalCursor';
import { KineticCursor } from './variants/KineticCursor';

/** Context-aware custom cursor. Renders the visual for the active Mode
 *  (settings.cursorTheme); `off` falls back to the native cursor. Never renders
 *  on coarse pointers. */
export function Cursor() {
  const coarse = useIsCoarsePointer();
  const reduced = useReducedMotion();
  const { settings } = useSettings();
  const { variant, label } = useCursor();
  const theme = settings.cursorTheme;
  const enabled = !coarse && theme !== 'off';

  // Hide the native cursor only while a custom one is active. Plain effect so it
  // toggles reliably when the Mode switches to/from Off.
  useEffect(() => {
    if (!enabled) return;
    const el = document.documentElement;
    el.classList.add('has-custom-cursor');
    return () => el.classList.remove('has-custom-cursor');
  }, [enabled]);

  if (!enabled) return null;

  const props = { variant, label, reduced };
  switch (theme) {
    case 'fluid':
      return <FluidCursor {...props} />;
    case 'terminal':
      return <TerminalCursor {...props} />;
    case 'kinetic':
      return <KineticCursor {...props} />;
    default:
      return <PrecisionCursor {...props} />;
  }
}
