import { useEffect } from 'react';
import { gsap } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import usePrefersReducedMotion from './usePrefersReducedMotion';

/**
 * Scroll-velocity decoration without document-wide style invalidation.
 *
 * The old implementation rewrote --scroll-velocity / --scroll-energy on <html>
 * every Lenis tick. Because custom properties inherit, that forced Chromium to
 * recalculate style for the whole document on every frame. Here the velocity is
 * written straight to the decorative surfaces as transform/rotate/translate
 * values, and only while they are near the viewport.
 */
export default function useVelocitySurfaces() {
  const { velocityRef, scrollYRef } = useExperience();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const groups = [];

    const watermark = document.querySelector('.footer__watermark');
    if (watermark) {
      groups.push({
        host: watermark.closest('.footer') ?? watermark,
        targets: [
          {
            el: watermark,
            write: (value) => {
              watermark.style.transform = value ? `skewX(${(value * -1.6).toFixed(3)}deg)` : '';
            },
          },
        ],
        visible: true,
      });
    }

    const progress = document.querySelector('.scroll-progress');
    if (progress) {
      groups.push({
        host: progress,
        targets: [
          {
            el: progress,
            write: (value) => {
              progress.style.setProperty('--progress-glow', Math.abs(value).toFixed(3));
            },
          },
        ],
        visible: true,
      });
    }

    document.querySelectorAll('.vault__panel').forEach((panel) => {
      groups.push({
        host: panel,
        targets: [
          {
            el: panel,
            write: (value) => {
              panel.style.setProperty('--vault-velocity', value.toFixed(3));
            },
          },
        ],
        visible: true,
      });
    });

    const heroOrbits = document.querySelector('.hero__orbits');
    if (heroOrbits) {
      groups.push({
        host: heroOrbits.closest('#hero') ?? heroOrbits,
        targets: [
          {
            el: heroOrbits,
            write: (value) => {
              const abs = Math.abs(value);
              const scrollY = scrollYRef?.current || 0;
              const scrollDeg = Math.min(28, scrollY * 0.032);
              const totalDeg = value * 8.5 + scrollDeg;
              heroOrbits.style.rotate =
                Math.abs(totalDeg) > 0.05 ? `${totalDeg.toFixed(2)}deg` : '';
              heroOrbits.style.translate =
                scrollY > 1 ? `0 ${(scrollY * -0.055).toFixed(1)}px` : '';
              heroOrbits.style.scale =
                abs > 0.002 || scrollY > 2
                  ? `${(1 + abs * 0.045 + Math.min(0.06, scrollY * 0.00006)).toFixed(4)}`
                  : '';
            },
          },
        ],
        visible: true,
      });
    }

    const ghostSections = [...document.querySelectorAll('.section[data-ghost]')].map(
      (section) => ({
        el: section,
        top: section.offsetTop,
        height: section.offsetHeight || 700,
        visible: false,
      }),
    );

    const measureGhostSections = () => {
      ghostSections.forEach((item) => {
        item.top = item.el.offsetTop;
        item.height = item.el.offsetHeight || 700;
      });
    };

    window.addEventListener('resize', measureGhostSections, { passive: true });

    const groupByHost = new Map(groups.map((group) => [group.host, group]));
    const ghostByEl = new Map(ghostSections.map((item) => [item.el, item]));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const group = groupByHost.get(entry.target);
          if (group) group.visible = entry.isIntersecting;

          const ghost = ghostByEl.get(entry.target);
          if (ghost) {
            ghost.visible = entry.isIntersecting;
            if (entry.isIntersecting) {
              ghost.top = ghost.el.offsetTop;
              ghost.height = ghost.el.offsetHeight || 700;
              ghost.el.classList.add('is-ghost-visible');
            }
          }
        });
      },
      { rootMargin: '120px 0px' },
    );

    groups.forEach((group) => observer.observe(group.host));
    ghostSections.forEach((item) => observer.observe(item.el));

    let current = 0;
    let written = 0;
    let lastGhostScrollY = -1;

    const updateGhostParallax = (scrollY, velocity) => {
      const viewportH = window.innerHeight || 900;
      ghostSections.forEach((item) => {
        if (!item.visible) return;
        const progress =
          (scrollY + viewportH * 0.58 - item.top) /
          Math.max(1, item.height + viewportH * 0.45);
        const clamped = Math.max(-0.25, Math.min(1.25, progress));
        const centered = clamped - 0.5;
        const driftX = centered * -92 + velocity * -24;
        const driftY = centered * 20;
        const sheenPos = Math.max(0, Math.min(100, Math.round(15 + clamped * 75)));

        item.el.style.setProperty('--ghost-x', `${driftX.toFixed(1)}px`);
        item.el.style.setProperty('--ghost-y', `${driftY.toFixed(1)}px`);
        item.el.style.setProperty('--ghost-sheen', `${sheenPos}%`);
      });
    };

    const tick = (time, deltaTime) => {
      if (document.hidden) return;

      const delta = Math.min(Math.max(deltaTime, 0), 50) / 1000;
      const target = velocityRef.current || 0;
      const scrollY = scrollYRef?.current || 0;
      // Frame-rate independent easing toward the live Lenis velocity.
      current += (target - current) * (1 - Math.exp(-delta * 12));

      if (Math.abs(scrollY - lastGhostScrollY) > 0.4 || Math.abs(current) > 0.002) {
        lastGhostScrollY = scrollY;
        updateGhostParallax(scrollY, current);
      }

      if (Math.abs(current) < 0.0004 && Math.abs(written) < 0.0004) {
        if (written !== 0) {
          groups.forEach((group) => {
            group.targets.forEach(({ write }) => write(0));
          });
          written = 0;
        }
        return;
      }

      if (Math.abs(current - written) < 0.0004) return;
      written = current;

      groups.forEach((group) => {
        if (!group.visible) return;
        group.targets.forEach(({ write }) => write(current));
      });
    };

    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener('resize', measureGhostSections);
      observer.disconnect();
      gsap.ticker.remove(tick);
      groups.forEach((group) => {
        group.targets.forEach(({ write }) => write(0));
      });
    };
  }, [prefersReducedMotion, scrollYRef, velocityRef]);
}
