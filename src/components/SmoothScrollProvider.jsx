import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';

const VELOCITY_NORMALIZER = 80;

/**
 * Lenis + GSAP ticker integration.
 * - One rAF loop (GSAP ticker) drives Lenis, ScrollTrigger and all GSAP tweens.
 * - Lenis velocity is mirrored into a ref so decorative surfaces and WebGL
 *   canvases can read it without re-rendering React or recalculating styles.
 */
export default function SmoothScrollProvider({ children }) {
  const { introComplete, lenisRef, velocityRef, progressRef, prefersReducedMotion } =
    useExperience();

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      infinite: false,
      autoRaf: false,
    });

    lenisRef.current = lenis;

    const onScroll = ({ velocity, progress }) => {
      const normalized = Math.max(-1, Math.min(1, velocity / VELOCITY_NORMALIZER));
      velocityRef.current = normalized;
      progressRef.current = progress;
    };

    const tick = (time) => {
      lenis.raf(time * 1000);
    };

    lenis.on('scroll', onScroll);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;

      const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!anchor) return;

      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, {
        offset: -92,
        duration: 1.45,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
    };

    document.addEventListener('click', onClick);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      document.removeEventListener('click', onClick);
      lenis.off('scroll', onScroll);
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
      velocityRef.current = 0;
      progressRef.current = 0;
    };
  }, [prefersReducedMotion, lenisRef, velocityRef, progressRef]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (introComplete) {
      lenis.start();
      const timer = window.setTimeout(() => ScrollTrigger.refresh(), 320);
      return () => window.clearTimeout(timer);
    }

    lenis.stop();
    return undefined;
  }, [introComplete, lenisRef]);

  return children;
}
