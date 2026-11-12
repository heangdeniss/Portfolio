import { useEffect } from 'react';

const SPOTLIGHT_SELECTOR = [
  '.hero__glass-card',
  '.about__intro-card',
  '.about__card',
  '.skill-bento-card',
  '.timeline-card',
  '.project-card',
  '.showcase__detail',
  '.contact-interactive-card',
  '.contact-form',
].join(', ');

const TILT_3D_SELECTOR = [
  '.about__intro-card',
  '.about__card',
  '.skill-bento-card',
  '.project-card',
  '.showcase__detail',
].join(', ');

/**
 * Tracks the pointer over glass cards, exposes --mouse-x / --mouse-y (and
 * --spot-x / --spot-y) for radial specular glare + glowing border shaders,
 * and drives smooth spring-interpolated 3D perspective transforms
 * (perspective(1000px) rotateX(...) rotateY(...) translateZ(...)) on cards
 * in About Me, Technical Expertise (Stack), and Featured Projects.
 */
export default function useSpotlight(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const states = new Map();
    let activeCard = null;
    let activeRect = null;
    let lastScrollTime = 0;
    let rafId = 0;
    let pointerRafId = 0;
    let pendingPointer = null;

    const getOrCreateState = (card) => {
      let state = states.get(card);
      if (!state) {
        const isLarge =
          card.classList.contains('about__intro-card') ||
          card.classList.contains('showcase__detail');
        state = {
          rx: 0,
          ry: 0,
          tz: 0,
          vx: 0,
          vy: 0,
          vz: 0,
          targetRx: 0,
          targetRy: 0,
          targetTz: 0,
          glare: 0,
          targetGlare: 0,
          maxTilt: isLarge ? 4.2 : 6.8,
          maxLift: isLarge ? 6 : 10,
        };
        states.set(card, state);
      }
      return state;
    };

    const stepSprings = () => {
      rafId = 0;
      let keepRunning = false;

      states.forEach((st, card) => {
        if (!card.isConnected) {
          states.delete(card);
          return;
        }

        const stiffness = 0.14;
        const damping = 0.76;

        st.vx = (st.vx + (st.targetRx - st.rx) * stiffness) * damping;
        st.vy = (st.vy + (st.targetRy - st.ry) * stiffness) * damping;
        st.vz = (st.vz + (st.targetTz - st.tz) * stiffness) * damping;

        st.rx += st.vx;
        st.ry += st.vy;
        st.tz += st.vz;
        st.glare += (st.targetGlare - st.glare) * 0.16;

        card.style.setProperty('--card-rx', `${st.rx.toFixed(2)}deg`);
        card.style.setProperty('--card-ry', `${st.ry.toFixed(2)}deg`);
        card.style.setProperty('--card-tz', `${st.tz.toFixed(2)}px`);
        card.style.setProperty('--card-glare-opacity', st.glare.toFixed(3));

        const unsettled =
          Math.abs(st.targetRx - st.rx) > 0.02 ||
          Math.abs(st.targetRy - st.ry) > 0.02 ||
          Math.abs(st.targetTz - st.tz) > 0.05 ||
          Math.abs(st.vx) > 0.02 ||
          Math.abs(st.vy) > 0.02 ||
          Math.abs(st.targetGlare - st.glare) > 0.01;

        if (unsettled) {
          keepRunning = true;
        } else if (st.targetTz === 0 && st.targetGlare === 0) {
          card.classList.remove('is-3d-tilting');
          card.style.removeProperty('--card-rx');
          card.style.removeProperty('--card-ry');
          card.style.removeProperty('--card-tz');
          card.style.removeProperty('--card-glare-opacity');
          states.delete(card);
        }
      });

      if (keepRunning) {
        rafId = window.requestAnimationFrame(stepSprings);
      }
    };

    const ensureLoop = () => {
      if (!rafId && !reducedMotion) {
        rafId = window.requestAnimationFrame(stepSprings);
      }
    };

    const releaseCard = (card) => {
      if (!card) return;
      const st = states.get(card);
      if (st) {
        st.targetRx = 0;
        st.targetRy = 0;
        st.targetTz = 0;
        st.targetGlare = 0;
        ensureLoop();
      }
    };

    const onScroll = () => {
      lastScrollTime = performance.now();
      activeRect = null;
      if (activeCard) {
        releaseCard(activeCard);
        activeCard = null;
      }
    };

    const onResize = () => {
      activeRect = null;
    };

    const flushPointer = () => {
      pointerRafId = 0;
      const event = pendingPointer;
      pendingPointer = null;
      if (!event) return;

      // Never read layout or trigger 3D card tilts while the page is actively scrolling
      if (performance.now() - lastScrollTime < 140) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const card = target.closest(SPOTLIGHT_SELECTOR);
      if (activeCard !== card) {
        if (activeCard) releaseCard(activeCard);
        activeCard = card;
        activeRect = card ? card.getBoundingClientRect() : null;
      }

      if (!card || !activeRect || !activeRect.width || !activeRect.height) return;

      const localX = event.clientX - activeRect.left;
      const localY = event.clientY - activeRect.top;

      card.style.setProperty('--spot-x', `${localX.toFixed(1)}px`);
      card.style.setProperty('--spot-y', `${localY.toFixed(1)}px`);
      card.style.setProperty('--mouse-x', `${localX.toFixed(1)}px`);
      card.style.setProperty('--mouse-y', `${localY.toFixed(1)}px`);

      if (!reducedMotion && card.matches(TILT_3D_SELECTOR)) {
        const nx = (localX / activeRect.width - 0.5) * 2;
        const ny = (localY / activeRect.height - 0.5) * 2;
        const st = getOrCreateState(card);
        card.classList.add('is-3d-tilting');
        st.targetRx = -ny * st.maxTilt;
        st.targetRy = nx * st.maxTilt;
        st.targetTz = st.maxLift;
        st.targetGlare = 1;
        ensureLoop();
      }
    };

    const onPointerMove = (event) => {
      // Coalesce high-frequency pointer events into one style write per frame.
      pendingPointer = {
        target: event.target,
        clientX: event.clientX,
        clientY: event.clientY,
      };
      if (!pointerRafId) {
        pointerRafId = window.requestAnimationFrame(flushPointer);
      }
    };

    const onPointerLeaveWindow = () => {
      if (activeCard) {
        releaseCard(activeCard);
        activeCard = null;
        activeRect = null;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', onPointerLeaveWindow);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      if (pointerRafId) window.cancelAnimationFrame(pointerRafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', onPointerLeaveWindow);
    };
  }, [enabled]);
}
