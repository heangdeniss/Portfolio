import { useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

/**
 * Counts from zero to the target value once the element scrolls into view.
 * Reduced-motion users see the final value immediately.
 */
export default function CountUp({
  end,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1500,
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(prefersReducedMotion ? end : 0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const el = ref.current;
    if (!el) return undefined;

    let rafId = 0;

    const animate = () => {
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(end * eased);

        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        }
      };

      rafId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [end, duration, prefersReducedMotion]);

  return (
    <span ref={ref}>
      {prefix}
      {(prefersReducedMotion ? end : value).toFixed(decimals)}
      {suffix}
    </span>
  );
}
