import { useEffect } from 'react';

/**
 * Gives elements marked with [data-magnetic] a subtle pull toward the pointer.
 * The effect is desktop-only and disabled for reduced-motion users.
 */
export default function useMagnetic(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let active = null;
    let rafId = 0;
    let pointerX = 0;
    let pointerY = 0;

    const update = () => {
      rafId = 0;
      if (!active) return;

      const rect = active.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const offsetX = (pointerX - rect.left) / rect.width - 0.5;
      const offsetY = (pointerY - rect.top) / rect.height - 0.5;

      active.style.setProperty('--magnet-x', `${(offsetX * 16).toFixed(2)}px`);
      active.style.setProperty('--magnet-y', `${(offsetY * 12).toFixed(2)}px`);
    };

    const reset = () => {
      if (!active) return;
      active.style.setProperty('--magnet-x', '0px');
      active.style.setProperty('--magnet-y', '0px');
      active = null;
    };

    const onPointerMove = (event) => {
      const found = event.target instanceof Element
        ? event.target.closest('[data-magnetic]')
        : null;

      if (found !== active) {
        reset();
        active = found;
      }

      if (!active) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', reset);
    document.documentElement.addEventListener('mouseleave', reset);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', reset);
      document.documentElement.removeEventListener('mouseleave', reset);
      reset();
    };
  }, [enabled]);
}
