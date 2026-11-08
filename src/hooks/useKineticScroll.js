import { useEffect } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Damped scroll engine inspired by studio sites: the page keeps native
 * scrolling, but scroll speed is smoothed frame-by-frame so motion trails the
 * wheel instead of snapping. Exposes `--scroll-velocity` (-1..1) for skew/rotation
 * and nudges `[data-scroll-parallax]` media inside their masked frames.
 */
export default function useKineticScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const root = document.documentElement;
    const targets = Array.from(document.querySelectorAll('[data-scroll-parallax]')).map((el) => ({
      el,
      frame: el.parentElement || el,
    }));

    let rafId = 0;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let velocity = 0;

    const applyParallax = () => {
      const viewportHeight = window.innerHeight;
      const visible = [];

      // Read first, write second so one frame never interleaves layout reads with style writes.
      for (const target of targets) {
        const rect = target.frame.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > viewportHeight + 120) continue;
        visible.push({ el: target.el, rect });
      }

      for (const { el, rect } of visible) {
        const travel = viewportHeight / 2 + rect.height / 2;
        const progress = clamp(
          (rect.top + rect.height / 2 - viewportHeight / 2) / Math.max(travel, 1),
          -1,
          1,
        );
        const amplitude = clamp(rect.height * 0.03, 4, 12);
        el.style.setProperty('--parallax-y', `${(-progress * amplitude).toFixed(2)}px`);
      }
    };

    const applyVelocity = () => {
      root.style.setProperty('--scroll-velocity', velocity.toFixed(3));
      root.style.setProperty('--scroll-energy', Math.abs(velocity).toFixed(3));
    };

    const step = (now) => {
      const y = window.scrollY;
      const dt = clamp(now - lastTime, 8, 64);
      const target = clamp((y - lastY) / dt / 2.4, -1, 1);

      lastY = y;
      lastTime = now;
      velocity += (target - velocity) * 0.16;

      applyVelocity();
      applyParallax();

      if (Math.abs(velocity) > 0.0015 || Math.abs(target) > 0.0015) {
        rafId = requestAnimationFrame(step);
      } else {
        velocity = 0;
        applyVelocity();
        rafId = 0;
      }
    };

    const kick = () => {
      if (rafId) return;
      lastTime = performance.now();
      rafId = requestAnimationFrame(step);
    };

    applyParallax();
    applyVelocity();

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);

    return () => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
      cancelAnimationFrame(rafId);
      root.style.setProperty('--scroll-velocity', '0');
      root.style.setProperty('--scroll-energy', '0');
      targets.forEach(({ el }) => el.style.removeProperty('--parallax-y'));
    };
  }, [enabled]);
}
