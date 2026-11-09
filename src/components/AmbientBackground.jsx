import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ambientVertexShader, ambientFragmentShader } from '../lib/shaders/ambient';
import { useExperience } from '../context/ExperienceContext';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

/**
 * Full-screen ambient shader canvas.
 * Renders at a reduced internal resolution, pauses offscreen, throttles on low
 * quality and falls back to CSS gradients on coarse-pointer mobile devices.
 */
export default function AmbientBackground() {
  const hostRef = useRef(null);
  const { quality, velocityRef } = useExperience();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const host = hostRef.current;
    if (!host) return undefined;

    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarse && window.innerWidth < 900) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        depth: false,
        stencil: false,
      });
    } catch {
      return undefined;
    }

    const canvas = renderer.domElement;
    canvas.className = 'ambient__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    renderer.setClearColor(0x07090e, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScrollVelocity: { value: 0 },
      uQuality: { value: quality === 'high' ? 1 : 0 },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: ambientVertexShader,
      fragmentShader: ambientFragmentShader,
      uniforms,
      depthWrite: false,
      depthTest: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const targetMouse = new THREE.Vector2(0.5, 0.5);
    const smoothMouse = new THREE.Vector2(0.5, 0.5);

    const resize = () => {
      const width = host.clientWidth || window.innerWidth;
      const height = host.clientHeight || window.innerHeight;
      const dprCap = quality === 'high' ? 1.35 : 0.9;
      const renderScale = quality === 'high' ? 0.9 : 0.55;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap) * renderScale;

      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width * dpr, height * dpr);
    };

    const onPointerMove = (event) => {
      targetMouse.set(
        event.clientX / Math.max(window.innerWidth, 1),
        1 - event.clientY / Math.max(window.innerHeight, 1),
      );
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

      uniforms.uTime.value += delta;
      smoothMouse.lerp(targetMouse, 0.055);
      uniforms.uMouse.value.copy(smoothMouse);
      uniforms.uScrollVelocity.value +=
        (velocityRef.current - uniforms.uScrollVelocity.value) * 0.075;

      renderer.render(scene, camera);
    };

    resize();
    rafId = requestAnimationFrame(render);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [quality, velocityRef, prefersReducedMotion]);

  return (
    <div
      ref={hostRef}
      className={`ambient ambient--shader${quality === 'low' ? ' ambient--low' : ''}`}
      aria-hidden="true"
    >
      <div className="ambient__fallback" />
      <span className="ambient__grain" />
      <span className="ambient__vignette" />
    </div>
  );
}
