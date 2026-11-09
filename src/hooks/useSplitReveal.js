import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import usePrefersReducedMotion from './usePrefersReducedMotion';

/**
 * Masked-line reveal. Mark each line's inner span with [data-split-line].
 * Lines rise from yPercent 110 / rotateZ 2deg to 0 with power4.out.
 *
 * play  - gate the animation (e.g. wait for the preloader)
 * scroll - attach a ScrollTrigger instead of playing immediately
 *
 * ScrollTrigger is created only after the preloader has handed the page back
 * to Lenis. An IntersectionObserver runs alongside it as a safety net so a
 * line can never get stranded behind its overflow mask if a refresh happens
 * mid-intro or during a layout shift.
 */
export default function useSplitReveal({
  play = true,
  scroll = false,
  stagger = 0.06,
  duration = 1.15,
  delay = 0,
  start = 'top 85%',
} = {}) {
  const ref = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { introComplete } = useExperience();
  const hasPlayed = useRef(false);
  const triggerRef = useRef(null);
  const observerRef = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const lines = el.querySelectorAll('[data-split-line]');
    if (!lines.length) return;

    if (prefersReducedMotion) {
      gsap.set(lines, { yPercent: 0, rotateZ: 0 });
      hasPlayed.current = true;
      return;
    }

    if (!hasPlayed.current) {
      gsap.set(lines, { yPercent: 110, rotateZ: 2 });
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!play || prefersReducedMotion || !introComplete) return undefined;

    const el = ref.current;
    if (!el) return undefined;

    const lines = el.querySelectorAll('[data-split-line]');
    if (!lines.length) return undefined;

    const reveal = () => {
      if (hasPlayed.current) return;
      hasPlayed.current = true;

      gsap.to(lines, {
        yPercent: 0,
        rotateZ: 0,
        duration,
        ease: 'power4.out',
        stagger,
        delay,
        overwrite: true,
      });
    };

    if (scroll) {
      triggerRef.current = ScrollTrigger.create({
        trigger: el,
        start,
        once: true,
        onEnter: reveal,
        invalidateOnRefresh: true,
      });

      if (typeof IntersectionObserver !== 'undefined') {
        observerRef.current = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) reveal();
          },
          { threshold: 0.01, rootMargin: '0px 0px -10% 0px' },
        );
        observerRef.current.observe(el);
      }
    } else {
      reveal();
    }

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      triggerRef.current?.kill();
      triggerRef.current = null;
    };
  }, [play, introComplete, scroll, stagger, duration, delay, start, prefersReducedMotion]);

  return ref;
}
