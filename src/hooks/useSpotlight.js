import { useEffect } from 'react';

const SPOTLIGHT_SELECTOR = [
  '.hero__glass-card',
  '.about__intro-card',
  '.about__card',
  '.skill-bento-card',
  '.timeline-card',
  '.project-card',
  '.contact-interactive-card',
  '.contact-form',
  '.skills-methods-panel',
].join(', ');

/**
 * Tracks the pointer over glass cards and exposes --spot-x / --spot-y so CSS
 * can paint a soft light that follows the cursor across each surface.
 */
export default function useSpotlight(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    const onPointerMove = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const card = target.closest(SPOTLIGHT_SELECTOR);
      if (!card) return;

      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
    };

    document.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
    };
  }, [enabled]);
}
