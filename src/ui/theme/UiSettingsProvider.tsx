import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_UI_SETTINGS,
  UI_SETTINGS_KEY,
  applyUiSettingsToDocument,
  clearUiSettings,
  loadUiSettings,
  parseUiSettings,
  resolveThemeMode,
  saveUiSettings,
  type UiAppearance,
  type UiSettings,
} from './uiSettings';

export type UiSettingsContextValue = UiSettings & {
  resolvedTheme: 'light' | 'dark';
  setAppearance: (value: UiAppearance) => void;
  setSetting: <K extends keyof UiSettings>(key: K, value: UiSettings[K]) => void;
  resetSettings: () => void;
};

export const UiSettingsContext = createContext<UiSettingsContextValue | undefined>(undefined);

function systemPrefersDark() {
  return typeof window !== 'undefined' && (window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
}

export function UiSettingsProvider({ children }: { children: React.ReactNode }) {
  const initialSettings = useMemo(() => loadUiSettings(), []);
  const [settings, setSettings] = useState<UiSettings>(initialSettings);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    resolveThemeMode(initialSettings.appearance, systemPrefersDark()),
  );
  const skipNextPersistence = useRef(false);

  useEffect(() => {
    setResolvedTheme(applyUiSettingsToDocument(settings, systemPrefersDark()));
    if (skipNextPersistence.current) {
      skipNextPersistence.current = false;
      return;
    }
    saveUiSettings(settings);
  }, [settings]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;

    const onChange = () => {
      if (settings.appearance !== 'system') return;
      setResolvedTheme(applyUiSettingsToDocument(settings, media.matches));
    };
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, [settings]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== UI_SETTINGS_KEY) return;
      skipNextPersistence.current = true;
      setSettings(event.newValue === null ? { ...DEFAULT_UI_SETTINGS } : parseUiSettings(event.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<UiSettingsContextValue>(() => ({
    ...settings,
    resolvedTheme,
    setAppearance: (appearance) => setSettings((current) => ({ ...current, appearance })),
    setSetting: (key, nextValue) => setSettings((current) => ({ ...current, [key]: nextValue })),
    resetSettings: () => {
      skipNextPersistence.current = true;
      clearUiSettings();
      setSettings({ ...DEFAULT_UI_SETTINGS });
    },
  }), [resolvedTheme, settings]);

  return <UiSettingsContext.Provider value={value}>{children}</UiSettingsContext.Provider>;
}
