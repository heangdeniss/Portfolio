import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import { isScrollLocked } from '../hooks/useScrollLock';
import { motion } from '../data/motion';

const EXPO_EASE = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

function measureHeaderOffset() {
  const headerEl =
    document.querySelector('.header__inner') || document.querySelector('.header');
  if (!headerEl) return 80;
  const rect = headerEl.getBoundingClientRect();
  const offset = Math.max(72, Math.min(92, Math.round(rect.bottom + 14)));
  document.documentElement.style.setProperty('--header-offset', `${offset}px`);
  return 80;
}

function getTargetOffset(target, headerOffset = 80) {
  if (!target || target.id === 'hero' || target.id === 'main-content') {
    return 0;
  }
  return -headerOffset;
}

function resolveHashTarget(hash) {
  if (!hash || hash === '#') return null;
  try {
    return document.querySelector(hash);
  } catch {
    return null;
  }
}

function focusTargetSection(target) {
  if (!(target instanceof HTMLElement)) return;
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
}

/**
 * Lenis + GSAP unified ticker integration.
 * - One rAF loop (GSAP ticker) drives Lenis, ScrollTrigger and all GSAP tweens.
 * - Zero document.documentElement style mutations during scroll (all telemetry
 *   lives in refs so Chromium never recalculates document styles on scroll ticks).
 * - Fast, responsive inertial physics: lerp 0.135, wheelMultiplier 1.12, touchMultiplier 1.5.
 */
export default function SmoothScrollProvider({ children }) {
  const {
    introComplete,
    lenisRef,
    velocityRef,
    progressRef,
    scrollYRef,
    prefersReducedMotion,
  } = useExperience();
  const headerOffsetRef = useRef(80);
  const initialHashHandledRef = useRef(false);

  /* Measure header height & keep --header-offset in sync across all modes */
  useEffect(() => {
    const updateOffset = () => {
      headerOffsetRef.current = measureHeaderOffset();
    };

    updateOffset();

    const headerEl =
      document.querySelector('.header__inner') || document.querySelector('.header');
    let resizeObserver = null;
    if (headerEl && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(updateOffset);
      resizeObserver.observe(headerEl);
    }

    window.addEventListener('resize', updateOffset, { passive: true });
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateOffset);
    };
  }, []);

  /* Reduced-motion native scroll & accessible anchor navigation */
  useEffect(() => {
    if (!prefersReducedMotion) return undefined;

    lenisRef.current = null;
    velocityRef.current = 0;
    scrollYRef.current = window.scrollY || 0;

    const scrollToHashTarget = (hash, pushHistory = false) => {
      const target = resolveHashTarget(hash);
      if (!target) return false;

      const offset = getTargetOffset(target, headerOffsetRef.current);
      const top = Math.max(
        0,
        window.scrollY + target.getBoundingClientRect().top + offset,
      );

      if (pushHistory && window.location.hash !== hash) {
        window.history.pushState(null, '', hash);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }

      window.scrollTo({ top, behavior: 'auto' });
      focusTargetSection(target);
      return true;
    };

    const onClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor =
        event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!anchor) return;
      if (anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target !== '_self') return;

      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;

      if (scrollToHashTarget(hash, true)) {
        event.preventDefault();
      }
    };

    const onHashChange = () => {
      if (window.location.hash) {
        scrollToHashTarget(window.location.hash, false);
      }
    };

    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHashChange);

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [prefersReducedMotion, lenisRef, velocityRef, scrollYRef]);

  /* Smooth scroll (Lenis + single unified GSAP ticker) */
  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const lenis = new Lenis({
      lerp: motion.scrollLerp || 0.135,
      smoothWheel: true,
      wheelMultiplier: 1.12,
      touchMultiplier: 1.5,
      syncTouch: false,
      stopInertiaOnNavigate: true,
      allowNestedScroll: true,
      prevent: (node) => Boolean(node?.hasAttribute?.('data-lenis-prevent')),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      infinite: false,
      autoRaf: false,
    });

    lenisRef.current = lenis;

    const onScroll = ({ scroll, velocity, progress }) => {
      const normalized = Math.max(
        -1,
        Math.min(1, velocity / motion.velocityNormalizer),
      );
      scrollYRef.current = scroll;
      velocityRef.current = normalized;
      progressRef.current = progress;
    };

    const tick = (time) => {
      lenis.raf(time * 1000);

      // Smoothly decay velocity to 0 when scrolling stops or is paused so
      // velocity-driven shaders and surfaces always settle cleanly.
      if (!lenis.isScrolling || lenis.isStopped || document.hidden) {
        if (velocityRef.current !== 0) {
          velocityRef.current *= 0.82;
          if (Math.abs(velocityRef.current) < 0.001) {
            velocityRef.current = 0;
          }
        }
      }
    };

    lenis.on('scroll', onScroll);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let refreshTimer = 0;
    const scheduleRefresh = (delay = 90) => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        headerOffsetRef.current = measureHeaderOffset();
        lenis.resize();
        ScrollTrigger.refresh();
      }, delay);
    };

    const navigateToHash = (hash, { pushHistory = false, immediate = false } = {}) => {
      const target = resolveHashTarget(hash);
      if (!target) return false;

      // Temporarily ungate content-visibility so target measurements are exact
      document.documentElement.classList.add('is-anchor-scrolling');
      headerOffsetRef.current = measureHeaderOffset();
      lenis.resize();
      const offset = getTargetOffset(target, headerOffsetRef.current);

      if (pushHistory && window.location.hash !== hash) {
        window.history.pushState(null, '', hash);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }

      lenis.scrollTo(target, {
        offset,
        duration: immediate ? 0 : 1.0,
        immediate,
        easing: EXPO_EASE,
        onComplete: () => {
          document.documentElement.classList.remove('is-anchor-scrolling');
          focusTargetSection(target);
        },
      });

      if (immediate) {
        document.documentElement.classList.remove('is-anchor-scrolling');
        focusTargetSection(target);
      }

      return true;
    };

    const onClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor =
        event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!anchor) return;
      if (anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target !== '_self') return;

      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;

      if (navigateToHash(hash, { pushHistory: true })) {
        event.preventDefault();
      }
    };

    const onHashChange = () => {
      if (window.location.hash) {
        navigateToHash(window.location.hash, { pushHistory: false });
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        velocityRef.current = 0;
        return;
      }
      if (!isScrollLocked() && !document.documentElement.classList.contains('intro-active')) {
        lenis.start();
      }
      scheduleRefresh(60);
    };

    const onImageLoad = (event) => {
      if (event.target instanceof HTMLImageElement) {
        scheduleRefresh(120);
      }
    };

    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('load', () => scheduleRefresh(60), { once: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('load', onImageLoad, true);

    document.fonts?.ready.then(() => scheduleRefresh(40)).catch(() => {});

    const mainEl = document.getElementById('main-content');
    let lastMainHeight = mainEl?.offsetHeight || 0;
    let mainResizeObserver = null;
    if (mainEl && 'ResizeObserver' in window) {
      mainResizeObserver = new ResizeObserver(() => {
        const nextHeight = mainEl.offsetHeight;
        if (Math.abs(nextHeight - lastMainHeight) > 2) {
          lastMainHeight = nextHeight;
          scheduleRefresh(80);
        }
      });
      mainResizeObserver.observe(mainEl);
    }

    return () => {
      window.clearTimeout(refreshTimer);
      mainResizeObserver?.disconnect();
      document.documentElement.classList.remove('is-anchor-scrolling');
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHashChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('load', onImageLoad, true);
      lenis.off('scroll', onScroll);
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
      velocityRef.current = 0;
      progressRef.current = 0;
    };
  }, [prefersReducedMotion, lenisRef, velocityRef, progressRef, scrollYRef]);

  /* Start Lenis & resolve initial deep link once intro completes */
  useEffect(() => {
    const lenis = lenisRef.current;

    if (!introComplete) {
      lenis?.stop();
      return undefined;
    }

    if (lenis && !isScrollLocked()) {
      lenis.start();
    }

    const timers = [];

    timers.push(
      window.setTimeout(() => {
        headerOffsetRef.current = measureHeaderOffset();
        lenis?.resize();
        ScrollTrigger.refresh();

        const hash = window.location.hash;
        if (hash && hash !== '#' && !initialHashHandledRef.current) {
          initialHashHandledRef.current = true;
          const target = resolveHashTarget(hash);

          if (target) {
            const offset = getTargetOffset(target, headerOffsetRef.current);
            if (lenis) {
              lenis.scrollTo(target, {
                offset,
                duration: 1.0,
                easing: EXPO_EASE,
                onComplete: () => focusTargetSection(target),
              });
            } else {
              const top = Math.max(
                0,
                window.scrollY + target.getBoundingClientRect().top + offset,
              );
              window.scrollTo({ top, behavior: 'auto' });
              focusTargetSection(target);
            }
          }
        }
      }, 120),
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [introComplete, lenisRef, prefersReducedMotion]);

  return children;
}
