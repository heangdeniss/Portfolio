import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const CIPHER_DIGITS = '0123456789';

/**
 * Counts from zero to the target value when the metric enters the viewport,
 * paired with a monospace cryptographic digit-scramble phase before locking
 * into the final value.
 */
export default function CountUp({
  end,
  decimals = 0,
  padStart = 0,
  prefix = '',
  suffix = '',
  duration = 1.65,
  scramble = true,
}) {
  const ref = useRef(null);
  const startedRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { introComplete } = useExperience();

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const formatExact = (value) => {
      const fixed = value.toFixed(decimals);
      const padded = padStart > 0 ? fixed.padStart(padStart, '0') : fixed;
      return `${prefix}${padded}${suffix}`;
    };

    const formatScrambled = (value, progress, tickIndex) => {
      if (!scramble || progress >= 0.78) {
        return formatExact(value);
      }

      const fixed = value.toFixed(decimals);
      const padded = padStart > 0 ? fixed.padStart(padStart, '0') : fixed;
      const chars = padded.split('');

      // Lock leading digits progressively from left to right while trailing digits scramble
      const digitIndices = [];
      for (let i = 0; i < chars.length; i += 1) {
        if (chars[i] >= '0' && chars[i] <= '9') {
          digitIndices.push(i);
        }
      }

      const lockCount = Math.floor((progress / 0.78) * digitIndices.length);
      for (let d = lockCount; d < digitIndices.length; d += 1) {
        const idx = digitIndices[d];
        const cipherIdx = (tickIndex * 7 + d * 13 + Math.floor(progress * 97)) % CIPHER_DIGITS.length;
        chars[idx] = CIPHER_DIGITS[cipherIdx];
      }

      return `${prefix}${chars.join('')}${suffix}`;
    };

    const hostCard = element.closest('.hero__signal, .showcase__meta-stat');

    if (prefersReducedMotion) {
      element.textContent = formatExact(end);
      hostCard?.classList.add('is-counted');
      return undefined;
    }

    if (!introComplete) {
      startedRef.current = false;
      element.textContent = formatExact(0);
      hostCard?.classList.remove('is-counted');
      return undefined;
    }

    startedRef.current = false;
    element.textContent = formatExact(0);
    hostCard?.classList.remove('is-counted');

    const counter = { value: 0 };
    let tween;
    let tickCount = 0;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      hostCard?.classList.add('is-counted');
      element.classList.add('is-scrambling');

      tween = gsap.to(counter, {
        value: end,
        duration,
        ease: 'expo.out',
        onUpdate: () => {
          tickCount += 1;
          const progress = tween ? tween.progress() : 1;
          if (progress >= 0.78) {
            element.classList.remove('is-scrambling');
          }
          element.textContent = formatScrambled(counter.value, progress, tickCount);
        },
        onComplete: () => {
          element.classList.remove('is-scrambling');
          element.textContent = formatExact(end);
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
      element.classList.remove('is-scrambling');
    };
  }, [end, decimals, padStart, prefix, suffix, duration, scramble, introComplete, prefersReducedMotion]);

  const initialValue = prefersReducedMotion ? end : 0;
  const initialFormatted =
    padStart > 0
      ? initialValue.toFixed(decimals).padStart(padStart, '0')
      : initialValue.toFixed(decimals);

  return (
    <span ref={ref} className="countup">
      {prefix}
      {initialFormatted}
      {suffix}
    </span>
  );
}
