import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
};

const getSnapshot = () => navigator.onLine;

/**
 * Есть ли сеть — по событиям браузера online/offline.
 * useSyncExternalStore, а не useState + useEffect: значение читается при рендере
 * и не может разойтись с реальным состоянием между подпиской и первым событием.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
