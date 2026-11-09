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
 * written straight to the four decorative surfaces as transform/rotate/translate
 * values, and only while they are near the viewport.
 */
export default function useVelocitySurfaces() {
  const { velocityRef } = useExperience();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const groups = [];

    document.querySelectorAll('.marquee').forEach((marquee) => {
      const track = marquee.querySelector('.marquee__track');
      const targets = [
        {
          el: marquee,
          write: (value) => {
            marquee.style.rotate = value ? `${(value * -1.1).toFixed(3)}deg` : '';
          },
        },
      ];

      if (track) {
        targets.push({
          el: track,
          write: (value) => {
            track.style.translate = value ? `0 ${(value * -6).toFixed(2)}px` : '';
          },
        });
      }

      groups.push({ host: marquee, targets, visible: true });
    });

    document.querySelectorAll('.ribbon').forEach((ribbon) => {
      const targets = [...ribbon.querySelectorAll('.ribbon__band')].map((band) => ({
        el: band,
        write: (value) => {
          band.style.transform = value ? `skewY(${(value * -0.7).toFixed(3)}deg)` : '';
        },
      }));

      if (targets.length) groups.push({ host: ribbon, targets, visible: true });
    });

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

    if (!groups.length) return undefined;

    const groupByHost = new Map(groups.map((group) => [group.host, group]));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const group = groupByHost.get(entry.target);
          if (group) group.visible = entry.isIntersecting;
        });
      },
      { rootMargin: '120px 0px' },
    );

    groups.forEach((group) => observer.observe(group.host));

    let current = 0;
    let written = 0;

    const tick = (time, deltaTime) => {
      if (document.hidden) return;

      const delta = Math.min(Math.max(deltaTime, 0), 50) / 1000;
      const target = velocityRef.current || 0;
      // Frame-rate independent easing toward the live Lenis velocity.
      current += (target - current) * (1 - Math.exp(-delta * 12));

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
      observer.disconnect();
      gsap.ticker.remove(tick);
      groups.forEach((group) => {
        group.targets.forEach(({ write }) => write(0));
      });
    };
  }, [prefersReducedMotion, velocityRef]);
}
