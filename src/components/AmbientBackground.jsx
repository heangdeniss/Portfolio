import { useEffect, useRef } from 'react';
import { ambientVertexShader, ambientFragmentShader } from '../lib/shaders/ambient';
import { useExperience } from '../context/ExperienceContext';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { motion } from '../data/motion';

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

/**
 * Full-screen ambient shader canvas.
 * Dependency-free raw WebGL fullscreen quad so Three.js is never pulled into
 * the initial entry chunk. Defers context creation until after intro + idle,
 * renders at a reduced internal resolution, pauses offscreen, throttles on low
 * quality and falls back to CSS gradients on coarse-pointer mobile devices.
 */
export default function AmbientBackground() {
  const hostRef = useRef(null);
  const { quality, velocityRef, introComplete } = useExperience();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !introComplete) return undefined;

    const host = hostRef.current;
    if (!host) return undefined;

    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarse && window.innerWidth < 900) return undefined;

    let cancelled = false;
    let teardown = null;
    let idleId = null;
    let timeoutId = null;

    const mountWebGL = () => {
      if (cancelled || !host.isConnected) return;

      const canvas = document.createElement('canvas');
      canvas.className = 'ambient__canvas';
      canvas.setAttribute('aria-hidden', 'true');

      const gl =
        canvas.getContext('webgl', {
          antialias: false,
          alpha: false,
          depth: false,
          stencil: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        }) ||
        canvas.getContext('experimental-webgl', {
          antialias: false,
          alpha: false,
          depth: false,
          stencil: false,
        });

      if (!gl) return;

      const program = createProgram(gl, ambientVertexShader, ambientFragmentShader);
      if (!program) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return;
      }

      const positionBuffer = gl.createBuffer();
      if (!positionBuffer) {
        gl.deleteProgram(program);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );

      gl.useProgram(program);

      const positionLocation = gl.getAttribLocation(program, 'aPosition');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      const uTimeLoc = gl.getUniformLocation(program, 'uTime');
      const uResolutionLoc = gl.getUniformLocation(program, 'uResolution');
      const uMouseLoc = gl.getUniformLocation(program, 'uMouse');
      const uScrollVelocityLoc = gl.getUniformLocation(program, 'uScrollVelocity');
      const uQualityLoc = gl.getUniformLocation(program, 'uQuality');

      gl.uniform1f(uQualityLoc, quality === 'high' ? 1 : 0);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);

      host.appendChild(canvas);

      let uTime = 0;
      let targetMouseX = 0.5;
      let targetMouseY = 0.5;
      let smoothMouseX = 0.5;
      let smoothMouseY = 0.5;
      let scrollVelocity = 0;
      let pixelWidth = 1;
      let pixelHeight = 1;

      const resize = () => {
        const width = host.clientWidth || window.innerWidth || 1;
        const height = host.clientHeight || window.innerHeight || 1;
        const dprCap = quality === 'high' ? 1.35 : 0.9;
        const renderScale = quality === 'high' ? 0.9 : 0.55;
        const dpr = Math.min(window.devicePixelRatio || 1, dprCap) * renderScale;

        pixelWidth = Math.max(1, Math.round(width * dpr));
        pixelHeight = Math.max(1, Math.round(height * dpr));

        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        gl.viewport(0, 0, pixelWidth, pixelHeight);
        gl.uniform2f(uResolutionLoc, pixelWidth, pixelHeight);
      };

      const onPointerMove = (event) => {
        targetMouseX = event.clientX / Math.max(window.innerWidth, 1);
        targetMouseY = 1 - event.clientY / Math.max(window.innerHeight, 1);
      };

      let visible = true;
      const observer = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
        },
        { threshold: 0 },
      );
      observer.observe(host);

      let rafId = 0;
      let lastFrame = 0;
      let lastTime = performance.now();

      const render = (now) => {
        rafId = requestAnimationFrame(render);

        if (!visible || document.hidden) {
          lastTime = now;
          return;
        }

        if (quality === 'low' && now - lastFrame < 32) return;
        lastFrame = now;

        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        uTime += delta;
        smoothMouseX += (targetMouseX - smoothMouseX) * 0.055;
        smoothMouseY += (targetMouseY - smoothMouseY) * 0.055;
        scrollVelocity += (velocityRef.current - scrollVelocity) * 0.075;

        gl.uniform1f(uTimeLoc, uTime);
        gl.uniform2f(uMouseLoc, smoothMouseX, smoothMouseY);
        gl.uniform1f(uScrollVelocityLoc, scrollVelocity);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      };

      resize();
      rafId = requestAnimationFrame(render);

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('resize', resize);

      teardown = () => {
        cancelAnimationFrame(rafId);
        observer.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', resize);
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(program);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        canvas.remove();
      };
    };

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(mountWebGL, { timeout: 600 });
    } else {
      timeoutId = window.setTimeout(mountWebGL, 80);
    }

    return () => {
      cancelled = true;
      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      teardown?.();
    };
  }, [quality, velocityRef, prefersReducedMotion, introComplete]);

  return (
    <div
      ref={hostRef}
      className={`ambient ambient--shader${quality === 'low' ? ' ambient--low' : ''}`}
      aria-hidden="true"
    >
      <div className="ambient__fallback" />
      {motion.grain && <span className="ambient__grain" />}
      <span className="ambient__vignette" />
    </div>
  );
}
