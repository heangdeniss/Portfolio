import { useEffect, useRef } from 'react';
import { gsap } from '../lib/animations';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, [data-cursor]';

/**
 * Dual cursor: a tiny amber dot that tracks the pointer almost instantly and a
 * spring-damped ring that trails behind. The ring expands and reveals context
 * labels (VIEW / DRAG / GITHUB) over media and interactive surfaces.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return undefined;

    document.body.classList.add('cursor-custom');

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    gsap.set(ring, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    gsap.set(dot, { x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.48, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.48, ease: 'power3.out' });

    let visible = false;
    let currentTarget = null;

    const show = () => {
      if (visible) return;
      visible = true;
      gsap.to([dot, ring], { autoAlpha: 1, duration: 0.28, ease: 'power2.out' });
    };

    const hide = () => {
      visible = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2, ease: 'power2.out' });
    };

    const onPointerMove = (event) => {
      show();
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
    };

    const resetTarget = () => {
      currentTarget = null;
      ring.classList.remove('is-hovering', 'has-label');
      label.textContent = '';
    };

    const onPointerOver = (event) => {
      if (!(event.target instanceof Element)) return;

      const target = event.target.closest(INTERACTIVE_SELECTOR);
      if (target === currentTarget) return;

      currentTarget = target;

      if (!target) {
        resetTarget();
        return;
      }

      ring.classList.add('is-hovering');
      const contextLabel = target.closest('[data-cursor]')?.getAttribute('data-cursor') || '';

      if (contextLabel) {
        label.textContent = contextLabel;
        ring.classList.add('has-label');
      } else {
        label.textContent = '';
        ring.classList.remove('has-label');
      }
    };

    const onPointerDown = () => ring.classList.add('is-pressed');
    const onPointerUp = () => ring.classList.remove('is-pressed');

    const onLeave = () => {
      hide();
      resetTarget();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerover', onPointerOver, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);
    document.addEventListener('visibilitychange', onLeave);

    return () => {
      document.body.classList.remove('cursor-custom');
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerover', onPointerOver);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      document.removeEventListener('visibilitychange', onLeave);
      gsap.killTweensOf([dot, ring]);
      gsap.set([dot, ring], { clearProps: 'all' });
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span ref={labelRef} className="cursor-ring__label" />
      </div>
    </>
  );
}
