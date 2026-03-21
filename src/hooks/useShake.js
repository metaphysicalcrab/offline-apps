import { useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { STORAGE_KEYS } from '../constants.js';

export function useShake(onShake) {
  const [enabled, setEnabled] = useLocalStorage(STORAGE_KEYS.SETTINGS + '-shake', true);
  const lastShake = useRef(0);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;
  const listenerAdded = useRef(false);

  useEffect(() => {
    if (!enabled) {
      listenerAdded.current = false;
      return;
    }

    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
      const now = Date.now();
      if (magnitude > 25 && now - lastShake.current > 500) {
        lastShake.current = now;
        onShakeRef.current?.();
      }
    };

    // On iOS 13+, permission must be requested from a user gesture.
    // We add the listener directly here (works on Android and pre-iOS 13).
    // iOS permission is requested separately via requestShakePermission().
    if (!listenerAdded.current) {
      if (typeof DeviceMotionEvent !== 'undefined' &&
          typeof DeviceMotionEvent.requestPermission === 'function') {
        // iOS — don't call requestPermission here (needs user gesture).
        // It will be requested when user enables shake in settings.
      } else {
        window.addEventListener('devicemotion', handleMotion);
        listenerAdded.current = true;
      }
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      listenerAdded.current = false;
    };
  }, [enabled]);

  // Call this from a click handler to request iOS motion permission
  const requestShakePermission = useCallback(() => {
    if (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().then((perm) => {
        if (perm === 'granted') {
          const handleMotion = (e) => {
            const acc = e.accelerationIncludingGravity;
            if (!acc) return;
            const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
            const now = Date.now();
            if (magnitude > 25 && now - lastShake.current > 500) {
              lastShake.current = now;
              onShakeRef.current?.();
            }
          };
          window.addEventListener('devicemotion', handleMotion);
          listenerAdded.current = true;
        }
      }).catch(() => {});
    }
  }, []);

  return { shakeEnabled: enabled, setShakeEnabled: setEnabled, requestShakePermission };
}
