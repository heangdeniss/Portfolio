import { useEffect, useRef } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const PARTICLE_COLORS = [
  '245, 158, 11',
  '99, 102, 241',
  '6, 182, 212',
  '139, 92, 246',
];

export default function AmbientBackground() {
  const canvasRef = useRef(null);
  const ambientRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ambient = ambientRef.current;
    if (!canvas || prefersReducedMotion) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles = [];
    let rafId = 0;
    let running = true;
    let previousTime = performance.now();
    const mouse = { x: -9999, y: -9999 };

    const random = (min, max) => Math.random() * (max - min) + min;

    const createParticles = () => {
      const count = Math.round(Math.min(78, Math.max(22, (width * height) / 28000)));
      particles = Array.from({ length: count }, () => ({
        x: random(0, width),
        y: random(0, height),
        vx: random(-0.16, 0.16),
        vy: random(-0.16, 0.16),
        radius: random(0.7, 1.9),
        alpha: random(0.18, 0.5),
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
    };

    const draw = (delta) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;

        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const mouseDistance = Math.hypot(dx, dy);

        if (mouseDistance < 170 && mouseDistance > 0.01) {
          const push = (1 - mouseDistance / 170) * 0.9;
          particle.x += (dx / mouseDistance) * push;
          particle.y += (dy / mouseDistance) * push;
        }

        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;
      }

      ctx.lineWidth = 0.6;

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];

        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);

          if (distance < 118) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${a.color}, ${(1 - distance / 118) * 0.13})`;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        if (mouse.x > -1000) {
          const distance = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (distance < 175) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(245, 158, 11, ${(1 - distance / 175) * 0.2})`;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];
        ctx.beginPath();
        ctx.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        if (particle.radius > 1.4) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${particle.color}, ${particle.alpha * 0.12})`;
          ctx.arc(particle.x, particle.y, particle.radius * 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (time) => {
      if (!running) return;
      const delta = Math.min((time - previousTime) / 16.667, 2);
      previousTime = time;
      draw(delta);
      rafId = requestAnimationFrame(loop);
    };

    const onPointerMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;

      if (ambient) {
        ambient.style.setProperty('--pointer-x', ((event.clientX / width) - 0.5).toFixed(3));
        ambient.style.setProperty('--pointer-y', ((event.clientY / height) - 0.5).toFixed(3));
      }
    };

    const onPointerLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      if (ambient) {
        ambient.style.setProperty('--pointer-x', '0');
        ambient.style.setProperty('--pointer-y', '0');
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!running) {
        running = true;
        previousTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 140);
    };

    resize();
    rafId = requestAnimationFrame(loop);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      running = false;
      window.clearTimeout(resizeTimer);
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="ambient" aria-hidden="true" ref={ambientRef}>
      <span className="ambient__orb ambient__orb--one" />
      <span className="ambient__orb ambient__orb--two" />
      <span className="ambient__orb ambient__orb--three" />
      <canvas ref={canvasRef} className="ambient__canvas" />
      <span className="ambient__vignette" />
    </div>
  );
}
