import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { STORAGE_KEYS, HAPTIC_PATTERNS } from '../constants.js';

export function useHaptics() {
  const [enabled, setEnabled] = useLocalStorage(STORAGE_KEYS.SETTINGS + '-haptics', true);

  const vibrate = useCallback((pattern) => {
    if (!enabled || !navigator.vibrate) return;
    navigator.vibrate(pattern || HAPTIC_PATTERNS.tap);
  }, [enabled]);

  return { vibrate, hapticsEnabled: enabled, setHapticsEnabled: setEnabled, HAPTIC_PATTERNS };
}
