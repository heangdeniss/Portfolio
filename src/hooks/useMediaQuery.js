import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribes to a CSS media query without an effect-driven state sync.
 */
export default function useMediaQuery(query) {
  const subscribe = useCallback(
    (onStoreChange) => {
      if (!window.matchMedia) return () => {};

      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onStoreChange);
      return () => mediaQuery.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => (window.matchMedia ? window.matchMedia(query).matches : false),
    [query],
  );

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
