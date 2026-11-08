import { useEffect, useRef } from 'react';

/**
 * Gives an element a subtle 3D tilt that follows the pointer and exposes
 * glare coordinates through CSS custom properties (--glare-x / --glare-y).
 */
export default function usePointerTilt(maxTilt = 4) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const target = { x: 0, y: 0, glareX: 50, glareY: 50 };
    const current = { x: 0, y: 0, glareX: 50, glareY: 50 };
    let rafId = 0;
    let running = false;

    const render = () => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      current.glareX += (target.glareX - current.glareX) * 0.12;
      current.glareY += (target.glareY - current.glareY) * 0.12;

      el.style.setProperty('--tilt-x', `${current.x.toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${current.y.toFixed(2)}deg`);
      el.style.setProperty('--glare-x', `${current.glareX.toFixed(2)}%`);
      el.style.setProperty('--glare-y', `${current.glareY.toFixed(2)}%`);

      const settled =
        Math.abs(target.x - current.x) < 0.01 &&
        Math.abs(target.y - current.y) < 0.01 &&
        Math.abs(target.glareX - current.glareX) < 0.05 &&
        Math.abs(target.glareY - current.glareY) < 0.05;

      if (settled) {
        running = false;
        rafId = 0;
        return;
      }

      rafId = requestAnimationFrame(render);
    };

    const kick = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(render);
    };

    const onPointerMove = (event) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      target.x = (0.5 - py) * 2 * maxTilt;
      target.y = (px - 0.5) * 2 * maxTilt;
      target.glareX = px * 100;
      target.glareY = py * 100;
      kick();
    };

    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
      target.glareX = 50;
      target.glareY = 50;
      kick();
    };

    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerleave', onPointerLeave);

    return () => {
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
      cancelAnimationFrame(rafId);
    };
  }, [maxTilt]);

  return ref;
}
