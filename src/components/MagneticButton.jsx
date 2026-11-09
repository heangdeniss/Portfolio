import { useEffect, useRef } from 'react';
import { gsap } from '../lib/animations';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

/**
 * Magnetic wrapper for links, buttons and pill-shaped navigation.
 * Uses GSAP quickTo so pointer movement stays on the compositor and the
 * element springs back with a damped ease on leave.
 */
export default function MagneticButton({
  as: Tag = 'a',
  strength = 0.32,
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

    const xTo = gsap.quickTo(element, 'x', { duration: 0.55, ease: 'power3.out' });
    const yTo = gsap.quickTo(element, 'y', { duration: 0.55, ease: 'power3.out' });

    const onPointerMove = (event) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const relativeX = event.clientX - rect.left - rect.width / 2;
      const relativeY = event.clientY - rect.top - rect.height / 2;
      xTo(relativeX * strength);
      yTo(relativeY * strength);
    };

    const reset = () => {
      xTo(0);
      yTo(0);
    };

    element.addEventListener('pointermove', onPointerMove, { passive: true });
    element.addEventListener('pointerleave', reset);
    element.addEventListener('blur', reset);

    return () => {
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerleave', reset);
      element.removeEventListener('blur', reset);
      gsap.killTweensOf(element);
      gsap.set(element, { x: 0, y: 0 });
    };
  }, [strength, prefersReducedMotion]);

  const buttonType = Tag === 'button' && !props.type ? { type: 'button' } : {};

  return (
    <Tag ref={ref} className={`magnetic ${className}`.trim()} {...buttonType} {...props}>
      {children}
    </Tag>
  );
}
