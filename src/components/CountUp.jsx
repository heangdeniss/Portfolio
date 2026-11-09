import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

/**
 * Counts from zero to the target value when the metric enters the viewport.
 * The tween is gated by the preloader and uses ScrollTrigger with an
 * IntersectionObserver safety net, matching the split-line reveals.
 */
export default function CountUp({
  end,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.6,
}) {
  const ref = useRef(null);
  const startedRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { introComplete } = useExperience();

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const format = (value) => `${prefix}${value.toFixed(decimals)}${suffix}`;

    if (prefersReducedMotion) {
      element.textContent = format(end);
      return undefined;
    }

    if (!introComplete) {
      startedRef.current = false;
      element.textContent = format(0);
      return undefined;
    }

    startedRef.current = false;
    element.textContent = format(0);

    const counter = { value: 0 };
    let tween;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      tween = gsap.to(counter, {
        value: end,
        duration,
        ease: 'power3.out',
        onUpdate: () => {
          element.textContent = format(counter.value);
        },
      });
    };

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top bottom',
      once: true,
      onEnter: start,
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
      },
      { threshold: 0.15 },
    );
    observer.observe(element);

    return () => {
      trigger.kill();
      observer.disconnect();
      tween?.kill();
    };
  }, [end, decimals, prefix, suffix, duration, introComplete, prefersReducedMotion]);

  const initialValue = prefersReducedMotion ? end : 0;

  return (
    <span ref={ref} className="countup">
      {prefix}
      {initialValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}
