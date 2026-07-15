import { createContext } from 'react';
import type { PaletteId, Settings } from '../settings/types';

export interface SettingsContextValue {
  settings: Settings;
  isOpen: boolean;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  applyPreset: (id: PaletteId) => void;
  reset: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
