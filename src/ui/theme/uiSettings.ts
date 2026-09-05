export type UiAppearance = 'light' | 'dark' | 'system';
export type BilingualOrder = 'en-first' | 'ar-first';
export type UiDensity = 'comfortable' | 'compact';
export type UiMotion = 'system' | 'reduced';
export type FontScale = 'default' | 'large';
export type SidebarDefault = 'expanded' | 'collapsed';

export type UiSettings = {
  appearance: UiAppearance;
  bilingualOrder: BilingualOrder;
  density: UiDensity;
  motion: UiMotion;
  fontScale: FontScale;
  sidebarDefault: SidebarDefault;
};

export const UI_SETTINGS_KEY = 'uos:ui-settings:v1';

export const DEFAULT_UI_SETTINGS: UiSettings = {
  appearance: 'system',
  bilingualOrder: 'en-first',
  density: 'comfortable',
  motion: 'system',
  fontScale: 'default',
  sidebarDefault: 'expanded',
};

const isAppearance = (value: unknown): value is UiAppearance => value === 'light' || value === 'dark' || value === 'system';
const isBilingualOrder = (value: unknown): value is BilingualOrder => value === 'en-first' || value === 'ar-first';
const isDensity = (value: unknown): value is UiDensity => value === 'comfortable' || value === 'compact';
const isMotion = (value: unknown): value is UiMotion => value === 'system' || value === 'reduced';
const isFontScale = (value: unknown): value is FontScale => value === 'default' || value === 'large';
const isSidebarDefault = (value: unknown): value is SidebarDefault => value === 'expanded' || value === 'collapsed';

export function isUiSettings(value: unknown): value is UiSettings {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return isAppearance(candidate.appearance)
    && isBilingualOrder(candidate.bilingualOrder)
    && isDensity(candidate.density)
    && isMotion(candidate.motion)
    && isFontScale(candidate.fontScale)
    && isSidebarDefault(candidate.sidebarDefault);
}

export function resolveThemeMode(appearance: UiAppearance, prefersDark: boolean): 'light' | 'dark' {
  return appearance === 'system' ? (prefersDark ? 'dark' : 'light') : appearance;
}

export function parseUiSettings(raw: string | null): UiSettings {
  if (!raw) return { ...DEFAULT_UI_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isUiSettings(parsed) ? parsed : { ...DEFAULT_UI_SETTINGS };
  } catch {
    return { ...DEFAULT_UI_SETTINGS };
  }
}

export function loadUiSettings(): UiSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_UI_SETTINGS };
  try {
    return parseUiSettings(window.localStorage.getItem(UI_SETTINGS_KEY));
  } catch {
    return { ...DEFAULT_UI_SETTINGS };
  }
}

export function saveUiSettings(settings: UiSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

export function clearUiSettings(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(UI_SETTINGS_KEY);
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

export function applyUiSettingsToDocument(
  settings: UiSettings,
  prefersDark = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false),
): 'light' | 'dark' {
  const mode = resolveThemeMode(settings.appearance, prefersDark);
  if (typeof document === 'undefined') return mode;

  const root = document.documentElement;
  root.dataset.theme = mode;
  root.dataset.appearance = settings.appearance;
  root.dataset.bilingualOrder = settings.bilingualOrder;
  root.dataset.density = settings.density;
  root.dataset.fontScale = settings.fontScale;
  root.dataset.motion = settings.motion;
  root.dataset.sidebarDefault = settings.sidebarDefault;
  const isArabicFirst = settings.bilingualOrder === 'ar-first';
  root.lang = isArabicFirst ? 'ar' : 'en';
  root.dir = isArabicFirst ? 'rtl' : 'ltr';
  root.style.colorScheme = mode;

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]') ?? document.createElement('meta');
  meta.setAttribute('name', 'theme-color');
  meta.setAttribute('content', mode === 'dark' ? '#07080b' : '#f6f1e6');
  if (!meta.parentNode) document.head.appendChild(meta);
  return mode;
}

export function applyThemeMode(appearance: UiAppearance): 'light' | 'dark' {
  return applyUiSettingsToDocument({ ...loadUiSettings(), appearance });
}
