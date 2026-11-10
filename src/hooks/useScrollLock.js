import { useEffect } from 'react';

let lockCount = 0;

export function isScrollLocked() {
  return lockCount > 0;
}

/**
 * Shared body-scroll lock for nested overlays (dossier + lightbox).
 * A module-level counter prevents one overlay from unlocking the page while
 * another is still open. Also pauses Lenis and marks documentElement so
 * visibility/refresh handlers do not restart Lenis while a modal is open.
 */
export default function useScrollLock(locked, lenisRef) {
  useEffect(() => {
    if (!locked) return undefined;

    lockCount += 1;
    const lenis = lenisRef?.current;

    if (lockCount === 1) {
      document.documentElement.dataset.scrollLocked = 'true';
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount === 0) {
        delete document.documentElement.dataset.scrollLocked;
        document.body.style.overflow = '';
        if (!document.documentElement.classList.contains('intro-active')) {
          lenis?.start();
        }
      }
    };
  }, [locked, lenisRef]);
}
