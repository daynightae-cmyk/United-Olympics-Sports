import { createContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_UI_SETTINGS,
  applyThemeMode,
  loadUiSettings,
  resolveThemeMode,
  saveUiSettings,
  type UiAppearance,
  type UiSettings,
} from "./uiSettings";

export type UiSettingsContextValue = UiSettings & {
  resolvedTheme: "light" | "dark";
  setAppearance: (value: UiAppearance) => void;
  setSetting: <K extends keyof UiSettings>(key: K, value: UiSettings[K]) => void;
  resetSettings: () => void;
};

export const UiSettingsContext = createContext<UiSettingsContextValue | undefined>(undefined);

function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function UiSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UiSettings>(() => loadUiSettings());
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    resolveThemeMode(loadUiSettings().appearance, getSystemPrefersDark())
  );

  useEffect(() => {
    const nextTheme = resolveThemeMode(settings.appearance, getSystemPrefersDark());
    setResolvedTheme(nextTheme);
    applyThemeMode(settings.appearance);
    saveUiSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (settings.appearance !== "system") return;
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;

    const onChange = () => {
      const nextTheme = resolveThemeMode("system", media.matches);
      setResolvedTheme(nextTheme);
      applyThemeMode("system");
    };

    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, [settings.appearance]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "uos:ui-settings:v1" || !event.newValue) return;
      try {
        const next = JSON.parse(event.newValue) as UiSettings;
        if (next && typeof next === "object") {
          setSettings((current) => ({ ...current, ...next }));
        }
      } catch {
        setSettings(DEFAULT_UI_SETTINGS);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<UiSettingsContextValue>(
    () => ({
      ...settings,
      resolvedTheme,
      setAppearance: (appearance: UiAppearance) =>
        setSettings((current) => ({ ...current, appearance })),
      setSetting: <K extends keyof UiSettings>(key: K, value: UiSettings[K]) => {
        setSettings((current) => ({ ...current, [key]: value }));
      },
      resetSettings: () => {
        setSettings(DEFAULT_UI_SETTINGS);
      },
    }),
    [resolvedTheme, settings]
  );

  return <UiSettingsContext.Provider value={value}>{children}</UiSettingsContext.Provider>;
}
