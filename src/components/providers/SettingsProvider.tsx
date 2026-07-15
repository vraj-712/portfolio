import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SettingsContext } from '../../context/SettingsContext';
import { DEFAULT_SETTINGS } from '../../settings/types';
import type { PaletteId, Settings } from '../../settings/types';
import { applySettings } from '../../settings/applySettings';
import { setReduceMotion } from '../../settings/motionFlag';
import { isDark } from '../../settings/colors';
import { PALETTES } from '../../data/settingsSchema';

const LIGHT_PRESET = { id: 'bone-ultramarine' as PaletteId, base: '#ECE7DA', ink: '#111110', accent: '#1F1BEB' };
const DARK_PRESET = { id: 'midnight-cyan' as PaletteId, base: '#0C0F12', ink: '#E9EEF0', accent: '#29E0D4' };

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);

  const setSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value } as Settings;
      if (key === 'themeMode') {
        const p = value === 'dark' ? DARK_PRESET : LIGHT_PRESET;
        next.colorBase = p.base;
        next.colorInk = p.ink;
        next.colorAccent = p.accent;
        next.paletteId = p.id;
      } else if (key === 'colorBase' || key === 'colorInk' || key === 'colorAccent') {
        next.paletteId = null;
        if (key === 'colorBase') next.themeMode = isDark(String(value)) ? 'dark' : 'light';
      }
      return next;
    });
  }, []);

  const applyPreset = useCallback((id: PaletteId) => {
    const p = PALETTES.find((x) => x.id === id);
    if (!p) return;
    setSettings((prev) => ({
      ...prev,
      paletteId: p.id,
      colorBase: p.base,
      colorInk: p.ink,
      colorAccent: p.accent,
      themeMode: isDark(p.base) ? 'dark' : 'light',
    }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  // Apply on every change (cheap CSS-var writes + shared flags).
  useEffect(() => {
    applySettings(settings);
    setReduceMotion(settings.reduceMotion);
    gsap.globalTimeline.timeScale(settings.motionSpeed);
  }, [settings]);

  // Layout-affecting changes → recompute ScrollTrigger positions (debounced).
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 240);
    return () => window.clearTimeout(t);
  }, [settings.typeScale, settings.spacing, settings.radius, settings.borderWidth, settings.fontPair]);

  const value = useMemo(
    () => ({ settings, isOpen, setSetting, applyPreset, reset, open, close, toggle }),
    [settings, isOpen, setSetting, applyPreset, reset, open, close, toggle],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
