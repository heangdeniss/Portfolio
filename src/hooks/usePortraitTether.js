import { useEffect } from 'react';

/*
 * A small spring-damper tether simulation for the hero portrait.
 *
 * The portrait is treated as a point mass whose wire is anchored at the
 * original top-centre of its slot. Gravity pulls it down, the wire behaves
 * like a one-sided elastic spring once it runs out of slack, and a damped
 * angular spring lets the frame swing around its attachment point.
 */

const GRAVITY = 9.8 * 140; // 9.8 m/s² scaled to the portrait's pixel space.
const FIXED_STEP = 1 / 120;
const MAX_FRAME = 0.2;
const MAX_STEPS = 24;

const TETHER_STIFFNESS = 220;
const TETHER_DAMPING = 6;
const AIR_DRAG = 0.14;
const INITIAL_SIDEWAYS_VELOCITY = 64;

const HANG_TIME = 1.75;
const RETURN_STIFFNESS = 92;
const RETURN_DAMPING = 19.5;

const ANGLE_STIFFNESS = 58;
const ANGLE_DAMPING = 9;
const MAX_ANGLE = 6.5;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function usePortraitTether({ active, delay = 0, dropRef, wireRef }) {
  useEffect(() => {
    if (!active) return undefined;

    const drop = dropRef.current;
    const wire = wireRef.current;
    if (!drop || !wire) return undefined;

    const wireHalo = wire.querySelector('.hero__portrait-wire-halo');
    const wireCore = wire.querySelector('.hero__portrait-wire-core');
    const wireAnchor = wire.querySelector('.hero__portrait-wire-anchor');
    const wireClamp = wire.querySelector('.hero__portrait-wire-clamp');
    if (!wireHalo || !wireCore || !wireAnchor || !wireClamp) return undefined;

    const width = drop.offsetWidth || 400;
    const height = drop.offsetHeight || width;
    const anchorX = width / 2;
    const restLength = clamp(width * 0.4, 140, 168);

    wire.setAttribute('viewBox', `0 0 ${width} ${height}`);
    wireHalo.setAttribute('d', '');
    wireCore.setAttribute('d', '');

    let x = 0;
    let y = 0;
    let vx = INITIAL_SIDEWAYS_VELOCITY;
    let vy = 0;
    let angle = 0;
    let angularVelocity = 0;
    let bowDirection = 1;
    let phase = 'idle';
    let elapsed = 0;
    let tautAt = null;
    let lastTime = 0;
    let accumulator = 0;
    let frameId = 0;
    let delayId = 0;
    let resetFrameId = 0;
    let cancelled = false;
    let locked = false;

    const applyTransform = () => {
      drop.style.transform =
        `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) ` +
        `rotate(${angle.toFixed(2)}deg)`;
    };

    const drawWire = () => {
      const tipX = anchorX + x;
      const tipY = y;
      const dx = tipX - anchorX;
      const dy = tipY;
      const distance = Math.hypot(dx, dy);

      if (distance < 1.4) {
        wire.classList.remove('is-active');
        return;
      }

      wire.classList.add('is-active');

      const slack = Math.max(0, restLength - distance);
      const sag = phase === 'drop' ? Math.min(32, Math.pow(slack, 0.6) * 3.6) : 0;
      const targetBow = Math.abs(x) > 1.5 ? Math.sign(x) : bowDirection;
      bowDirection += (targetBow - bowDirection) * 0.08;

      // A perpendicular offset gives the slack wire its catenary-like belly.
      const nx = dy / distance;
      const ny = -dx / distance;
      const bendX = nx * sag * bowDirection;
      const bendY = ny * sag * bowDirection;

      const c1x = anchorX + dx * 0.33 + bendX;
      const c1y = dy * 0.33 + bendY;
      const c2x = anchorX + dx * 0.67 + bendX;
      const c2y = dy * 0.67 + bendY;
      const path =
        `M ${anchorX.toFixed(2)} 0 C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ` +
        `${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${tipX.toFixed(2)} ${tipY.toFixed(2)}`;

      wireHalo.setAttribute('d', path);
      wireCore.setAttribute('d', path);
      wireAnchor.setAttribute('transform', `translate(${anchorX} 0)`);
      wireClamp.setAttribute(
        'transform',
        `translate(${tipX.toFixed(2)} ${tipY.toFixed(2)}) rotate(${(
          (Math.atan2(dx, dy) * 180) /
          Math.PI
        ).toFixed(2)})`,
      );
    };

    const lock = () => {
      if (locked) return;
      locked = true;
      phase = 'done';
      cancelAnimationFrame(frameId);
      frameId = 0;

      wire.classList.remove('is-active');
      wireHalo.setAttribute('d', '');
      wireCore.setAttribute('d', '');
      drop.classList.remove('is-tethering');

      // Hold the exact zero transform for one frame, then hand styling back
      // to CSS so the final layout is completely untouched.
      drop.style.transform = 'translate3d(0px, 0px, 0px) rotate(0deg)';
      resetFrameId = requestAnimationFrame(() => {
        if (cancelled) return;
        drop.style.transform = '';
      });
    };

    const simulate = (dt) => {
      elapsed += dt;
      const distance = Math.hypot(x, y);

      if (phase === 'drop') {
        let ax = 0;
        let ay = GRAVITY;

        if (distance > restLength) {
          const nx = x / distance;
          const ny = y / distance;
          const radialVelocity = vx * nx + vy * ny;
          const tension = Math.max(
            0,
            TETHER_STIFFNESS * (distance - restLength) + TETHER_DAMPING * radialVelocity,
          );

          ax -= nx * tension;
          ay -= ny * tension;

          if (tautAt === null) tautAt = elapsed;
        }

        ax -= vx * AIR_DRAG;
        ay -= vy * AIR_DRAG;

        vx += ax * dt;
        vy += ay * dt;
        x += vx * dt;
        y += vy * dt;

        if (tautAt !== null && elapsed - tautAt > HANG_TIME) {
          phase = 'return';
        }
      } else if (phase === 'return') {
        const ax = -RETURN_STIFFNESS * x - RETURN_DAMPING * vx;
        const ay = -RETURN_STIFFNESS * y - RETURN_DAMPING * vy;

        vx += ax * dt;
        vy += ay * dt;
        x += vx * dt;
        y += vy * dt;

        if (Math.hypot(x, y) < 0.45 && Math.hypot(vx, vy) < 4) {
          lock();
          return;
        }
      }

      const targetAngle =
        phase === 'return'
          ? 0
          : clamp(
              (Math.atan2(x, Math.max(y, 24)) * 180 * 0.55) / Math.PI,
              -MAX_ANGLE,
              MAX_ANGLE,
            );

      angularVelocity +=
        (-ANGLE_STIFFNESS * (angle - targetAngle) - ANGLE_DAMPING * angularVelocity) * dt;
      angle += angularVelocity * dt;
    };

    const frame = (time) => {
      if (cancelled || locked) return;
      if (!lastTime) lastTime = time;

      const delta = Math.min((time - lastTime) / 1000, MAX_FRAME);
      lastTime = time;
      accumulator += delta;

      let steps = 0;
      while (accumulator >= FIXED_STEP && steps < MAX_STEPS && !locked) {
        simulate(FIXED_STEP);
        accumulator -= FIXED_STEP;
        steps += 1;
      }

      if (locked) return;

      applyTransform();
      drawWire();
      frameId = requestAnimationFrame(frame);
    };

    applyTransform();

    delayId = window.setTimeout(() => {
      if (cancelled) return;
      phase = 'drop';
      drop.classList.add('is-tethering');
      frameId = requestAnimationFrame(frame);
    }, delay * 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(delayId);
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(resetFrameId);
      drop.classList.remove('is-tethering');
      drop.style.transform = '';
      wire.classList.remove('is-active');
      wireHalo.setAttribute('d', '');
      wireCore.setAttribute('d', '');
    };
  }, [active, delay, dropRef, wireRef]);
}
