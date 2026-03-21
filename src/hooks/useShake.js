import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { STORAGE_KEYS } from '../constants.js';

export function useShake(onShake) {
  const [enabled, setEnabled] = useLocalStorage(STORAGE_KEYS.SETTINGS + '-shake', true);
  const lastShake = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
      const now = Date.now();
      if (magnitude > 25 && now - lastShake.current > 500) {
        lastShake.current = now;
        onShake?.();
      }
    };

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().then((perm) => {
        if (perm === 'granted') {
          window.addEventListener('devicemotion', handleMotion);
        }
      }).catch(() => {});
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled, onShake]);

  return { shakeEnabled: enabled, setShakeEnabled: setEnabled };
}
