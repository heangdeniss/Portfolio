import { useEffect, useRef } from 'react';
import { gsap } from '../lib/animations';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

/*
 * Every magnetic control used to attach its own window scroll + resize
 * listener. On a page with dozens of buttons that meant dozens of callbacks
 * per scroll frame. One shared listener fans out to the registered
 * invalidators, and it is removed as soon as the last control unmounts.
 */
const invalidators = new Set();
let globalListenersBound = false;

const onGlobalScroll = () => {
  invalidators.forEach((invalidate) => invalidate());
};

function subscribeInvalidate(invalidate) {
  invalidators.add(invalidate);

  if (!globalListenersBound) {
    window.addEventListener('scroll', onGlobalScroll, { passive: true });
    window.addEventListener('resize', onGlobalScroll, { passive: true });
    globalListenersBound = true;
  }

  return () => {
    invalidators.delete(invalidate);

    if (invalidators.size === 0 && globalListenersBound) {
      window.removeEventListener('scroll', onGlobalScroll);
      window.removeEventListener('resize', onGlobalScroll);
      globalListenersBound = false;
    }
  };
}

/**
 * Magnetic wrapper for links, buttons and pill-shaped navigation.
 * Caches bounding geometry on pointerenter to avoid layout reads during move,
 * pulls toward the cursor within ±maxOffset (default ±6px), and springs back
 * with elastic physics on leave.
 */
export default function MagneticButton({
  as: Tag = 'a',
  strength = 0.28,
  maxOffset = 6,
  className = '',
  children,
  ...props
}) {
  const ref = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    let cachedRect = null;

    const refreshRect = () => {
      cachedRect = element.getBoundingClientRect();
    };

    const onPointerEnter = () => {
      refreshRect();
    };

    const onPointerMove = (event) => {
      const rect = cachedRect || element.getBoundingClientRect();
      cachedRect = rect;
      if (!rect.width || !rect.height) return;

      const relativeX = event.clientX - rect.left - rect.width / 2;
      const relativeY = event.clientY - rect.top - rect.height / 2;

      const targetX = Math.max(-maxOffset, Math.min(maxOffset, relativeX * strength));
      const targetY = Math.max(-maxOffset, Math.min(maxOffset, relativeY * strength));

      gsap.to(element, {
        x: targetX,
        y: targetY,
        duration: 0.26,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    const reset = () => {
      cachedRect = null;
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.72,
        ease: 'elastic.out(1, 0.45)',
        overwrite: 'auto',
      });
    };

    const invalidateRect = () => {
      cachedRect = null;
    };

    element.addEventListener('pointerenter', onPointerEnter, { passive: true });
    element.addEventListener('pointermove', onPointerMove, { passive: true });
    element.addEventListener('pointerleave', reset);
    element.addEventListener('blur', reset);
    const unsubscribe = subscribeInvalidate(invalidateRect);

    return () => {
      element.removeEventListener('pointerenter', onPointerEnter);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerleave', reset);
      element.removeEventListener('blur', reset);
      unsubscribe();
      gsap.killTweensOf(element);
      gsap.set(element, { x: 0, y: 0 });
    };
  }, [strength, maxOffset, prefersReducedMotion]);

  const buttonType = Tag === 'button' && !props.type ? { type: 'button' } : {};

  return (
    <Tag ref={ref} className={`magnetic ${className}`.trim()} {...buttonType} {...props}>
      {children}
    </Tag>
  );
}
