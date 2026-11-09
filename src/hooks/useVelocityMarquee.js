import { useEffect, useRef } from 'react';
import { gsap } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import usePrefersReducedMotion from './usePrefersReducedMotion';

/**
 * Scroll-velocity-reactive marquee.
 * Rest speed is constant; Lenis velocity accelerates it and flips direction
 * when the user scrolls upward. Uses GSAP's ticker so it shares one rAF loop
 * with Lenis and ScrollTrigger.
 *
 * direction: -1 for leftward, 1 for rightward.
 */
export default function useVelocityMarquee({
  baseSpeed = 55,
  factor = 720,
  direction = -1,
} = {}) {
  const trackRef = useRef(null);
  const { velocityRef } = useExperience();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion) return undefined;

    let halfWidth = track.scrollWidth / 2 || 1;
    let x = direction === -1 ? 0 : -halfWidth;
    let onScreen = true;

    const measure = () => {
      halfWidth = track.scrollWidth / 2 || 1;
    };

    const wrap = () => {
      if (x <= -halfWidth) x += halfWidth;
      if (x >= 0) x -= halfWidth;
    };

    const tick = (time, deltaTime) => {
      // Offscreen marquees are fully parked: no transform writes, no layout
      // reads. The same flag pauses any legacy CSS fallback animation.
      if (!onScreen || document.hidden) return;

      const delta = Math.min(Math.max(deltaTime, 0), 50) / 1000;

      const velocity = velocityRef.current || 0;
      const speed = baseSpeed + velocity * factor;
      x += direction * speed * delta;
      wrap();
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    };

    const viewport = track.closest('.marquee, .ribbon') ?? track;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        track.style.animationPlayState = onScreen ? '' : 'paused';
        viewport.classList.toggle('is-motion-paused', !onScreen);
      },
      { rootMargin: '120px 0px' },
    );

    const resizeObserver = new ResizeObserver(measure);
    visibilityObserver.observe(viewport);
    resizeObserver.observe(track);
    measure();
    gsap.ticker.add(tick);

    return () => {
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      gsap.ticker.remove(tick);
      viewport.classList.remove('is-motion-paused');
      track.style.animationPlayState = '';
      track.style.transform = '';
    };
  }, [baseSpeed, factor, direction, velocityRef, prefersReducedMotion]);

  return trackRef;
}
