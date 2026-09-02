export type UiAppearance = "light" | "dark" | "system";
export type BilingualOrder = "en-first" | "ar-first";
export type UiDensity = "comfortable" | "compact";
export type UiMotion = "system" | "reduced";
export type FontScale = "default" | "large";
export type SidebarDefault = "expanded" | "collapsed";

export type UiSettings = {
  appearance: UiAppearance;
  bilingualOrder: BilingualOrder;
  density: UiDensity;
  motion: UiMotion;
  fontScale: FontScale;
  sidebarDefault: SidebarDefault;
};

export const UI_SETTINGS_KEY = "uos:ui-settings:v1";

export const DEFAULT_UI_SETTINGS: UiSettings = {
  appearance: "system",
  bilingualOrder: "en-first",
  density: "comfortable",
  motion: "system",
  fontScale: "default",
  sidebarDefault: "expanded",
};

const isAppearance = (value: unknown): value is UiAppearance =>
  value === "light" || value === "dark" || value === "system";
const isBilingualOrder = (value: unknown): value is BilingualOrder =>
  value === "en-first" || value === "ar-first";
const isDensity = (value: unknown): value is UiDensity =>
  value === "comfortable" || value === "compact";
const isMotion = (value: unknown): value is UiMotion => value === "system" || value === "reduced";
const isFontScale = (value: unknown): value is FontScale =>
  value === "default" || value === "large";
const isSidebarDefault = (value: unknown): value is SidebarDefault =>
  value === "expanded" || value === "collapsed";

export function isUiSettings(value: unknown): value is UiSettings {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    isAppearance(candidate.appearance) &&
    isBilingualOrder(candidate.bilingualOrder) &&
    isDensity(candidate.density) &&
    isMotion(candidate.motion) &&
    isFontScale(candidate.fontScale) &&
    isSidebarDefault(candidate.sidebarDefault)
  );
}

export function resolveThemeMode(appearance: UiAppearance, prefersDark: boolean): "light" | "dark" {
  if (appearance === "system") return prefersDark ? "dark" : "light";
  return appearance === "dark" ? "dark" : "light";
}

export function parseUiSettings(raw: string | null): UiSettings {
  if (!raw) return DEFAULT_UI_SETTINGS;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isUiSettings(parsed)) {
      return DEFAULT_UI_SETTINGS;
    }
    return parsed;
  } catch {
    return DEFAULT_UI_SETTINGS;
  }
}

export function loadUiSettings(): UiSettings {
  if (typeof window === "undefined") return DEFAULT_UI_SETTINGS;
  try {
    const raw = window.localStorage.getItem(UI_SETTINGS_KEY);
    return parseUiSettings(raw);
  } catch {
    return DEFAULT_UI_SETTINGS;
  }
}

export function saveUiSettings(settings: UiSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota and privacy exceptions.
  }
}

export function applyThemeMode(appearance: UiAppearance): "light" | "dark" {
  if (typeof document === "undefined") {
    return "light";
  }

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  const mode = resolveThemeMode(appearance, prefersDark);
  const root = document.documentElement;
  root.setAttribute("data-theme", mode);
  root.setAttribute("data-appearance", appearance);
  root.style.colorScheme = mode;

  const meta = document.querySelector('meta[name="theme-color"]') ?? document.createElement("meta");
  meta.setAttribute("name", "theme-color");
  meta.setAttribute("content", mode === "dark" ? "#07080b" : "#f6f1e6");
  if (!meta.parentNode) {
    document.head.appendChild(meta);
  }

  return mode;
}
