/**
 * UOS platform abstraction (Mission 10X).
 * Feature code must use this layer — never scatter UA checks or native
 * bridge calls across components. Only exposes capabilities that exist.
 */

export type UosPlatform = 'web' | 'pwa';
export type UosOs = 'ios' | 'android' | 'other';

export function getPlatform(): UosPlatform {
  if (typeof window === 'undefined') return 'web';
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone ? 'pwa' : 'web';
}

export function getOs(): UosOs {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'other';
}

/** Capacitor native shell is a future packaging step — not present today. */
export function hasNativeBridge(): boolean {
  return typeof (window as Window & { Capacitor?: unknown }).Capacitor !== 'undefined';
}

export function supportsShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export async function shareLink(url: string, title: string): Promise<boolean> {
  if (!supportsShare()) return false;
  try {
    await navigator.share({ url, title });
    return true;
  } catch {
    return false;
  }
}

export function openExternal(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
