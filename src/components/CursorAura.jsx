import { useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const SIZE = 480;

/**
 * A soft light that trails the pointer plus a contextual label over media.
 * Purely decorative and never captures pointer events. Disabled for touch
 * devices and reduced-motion users.
 */
export default function CursorAura() {
  const auraRef = useRef(null);
  const badgeRef = useRef(null);
  const [label, setLabel] = useState('');
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const aura = auraRef.current;
    const badge = badgeRef.current;
    if (!aura || prefersReducedMotion) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let scale = 1;
    let targetScale = 1;
    let rafId = 0;
    let active = false;

    const loop = () => {
      x += (targetX - x) * 0.13;
      y += (targetY - y) * 0.13;
      scale += (targetScale - scale) * 0.1;

      aura.style.transform = `translate3d(${x - SIZE / 2}px, ${y - SIZE / 2}px, 0) scale(${scale.toFixed(3)})`;
      if (badge) {
        badge.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(loop);
    };

    const onPointerMove = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!active) {
        active = true;
        aura.classList.add('is-active');
      }
    };

    const onPointerOver = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const interactive = target.closest('a, button, input, textarea, select, [role="button"]');
      targetScale = interactive ? 1.45 : 1;

      const labelled = target.closest('[data-cursor]');
      setLabel(labelled ? labelled.getAttribute('data-cursor') || '' : '');
    };

    const hide = () => {
      active = false;
      aura.classList.remove('is-active');
      setLabel('');
    };

    document.body.classList.add('cursor-enhanced');
    rafId = requestAnimationFrame(loop);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerover', onPointerOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);

    return () => {
      cancelAnimationFrame(rafId);
      document.body.classList.remove('cursor-enhanced');
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerover', onPointerOver);
      document.documentElement.removeEventListener('mouseleave', hide);
      window.removeEventListener('blur', hide);
    };
  }, [prefersReducedMotion]);

  return (
    <>
      <div ref={auraRef} className="cursor-aura" aria-hidden="true" />
      <div
        ref={badgeRef}
        className={`cursor-badge${label ? ' is-visible' : ''}`}
        aria-hidden="true"
      >
        <span className="cursor-badge__dot" />
        <span className="cursor-badge__label">{label || 'View'}</span>
      </div>
    </>
  );
}
