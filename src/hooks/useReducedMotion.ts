import { useContext, useEffect, useState } from 'react';
import { UiSettingsContext } from '../ui/theme/UiSettingsProvider';

/**
 * useReducedMotion hook
 * 
 * Accurately detects if the user has requested reduced motion either via:
 * 1. The OS/browser media query `(prefers-reduced-motion: reduce)`
 * 2. The in-app UiSettingsContext motion setting (`motion: 'reduced'`)
 * 
 * Returns boolean `true` if animations should be disabled/minimized.
 */
export function useReducedMotion(): boolean {
  const settingsContext = useContext(UiSettingsContext);
  const settingMotion = settingsContext?.motion;

  const [systemReducedMotion, setSystemReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Compatibility for legacy environments
      const legacyQuery = mediaQuery as unknown as {
        addListener?: (cb: (e: MediaQueryListEvent) => void) => void;
        removeListener?: (cb: (e: MediaQueryListEvent) => void) => void;
      };
      if (typeof legacyQuery.addListener === 'function') {
        legacyQuery.addListener(handleChange);
        return () => legacyQuery.removeListener?.(handleChange);
      }
    }
  }, []);

  if (settingMotion === 'reduced') return true;
  return systemReducedMotion;
}

export default useReducedMotion;
