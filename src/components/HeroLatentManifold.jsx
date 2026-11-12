import { useEffect, useRef } from 'react';
import { gsap } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const AMBER = { r: 245, g: 158, b: 11 };
const CYAN = { r: 56, g: 189, b: 248 };
const SLATE = { r: 148, g: 163, b: 184 };

/**
 * Deterministic pseudo-random generator so the 3D manifold topology is stable.
 */
function createRng(seed = 42) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function buildManifoldNodes(count) {
  const rand = createRng(20261110);
  const nodes = [];

  for (let i = 0; i < count; i += 1) {
    const t = i / count;
    const arm = i % 3;
    const theta = t * Math.PI * 4.2 + (arm * (Math.PI * 2)) / 3;
    const radial = 0.22 + Math.sqrt(t) * 0.72;

    // Bias slightly toward the right portrait hemisphere while spanning the hero
    const baseX = Math.cos(theta) * radial * 480 + (rand() - 0.36) * 180;
    const baseY = Math.sin(theta * 0.85) * radial * 270 + (rand() - 0.5) * 110;
    const baseZ = Math.sin(theta * 1.35) * 210 + (rand() - 0.5) * 90;

    nodes.push({
      id: i,
      baseX,
      baseY,
      baseZ,
      dx: 0,
      dy: 0,
      dz: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      size: 1.35 + (i % 4) * 0.42,
      cluster: i % 3 === 0 ? 'amber' : i % 3 === 1 ? 'cyan' : 'slate',
      phase: rand() * Math.PI * 2,
    });
  }

  return nodes;
}

/**
 * Interactive 3D Latent-Space / Markov Manifold canvas behind the Hero section.
 * Projects 3D nodes with perspective scaling, depth-of-field alpha, spring cursor
 * physics, and dynamic k-nearest-neighbor edge illumination.
 */
export default function HeroLatentManifold() {
  const canvasRef = useRef(null);
  const { quality, scrollYRef, velocityRef } = useExperience();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const nodeCount = isMobile || quality === 'low' ? 28 : 54;
    const kNeighbors = isMobile || quality === 'low' ? 2 : 3;
    const maxEdgeDist = isMobile ? 165 : 195;
    const maxEdgeDistSq = maxEdgeDist * maxEdgeDist;

    const nodes = buildManifoldNodes(nodeCount);
    const projected = nodes.map(() => ({
      x: 0,
      y: 0,
      z: 0,
      wx: 0,
      wy: 0,
      wz: 0,
      scale: 1,
      alpha: 1,
      cursorProx: 0,
    }));

    let width = 1;
    let height = 1;
    let dpr = 1;
    let inView = true;
    let rotX = 0;
    let rotY = 0.18;
    let rotZ = -0.06;
    let smoothScrollY = scrollYRef?.current || 0;
    let smoothVel = 0;
    let lastFrameTime = 0;
    let lastRenderTime = 0;
    let pointerRafId = 0;
    let pendingPointer = null;

    // Cascading digital particles (data rain) — reacts to scroll velocity
    const dropRand = createRng(99173);
    const dropCount = isMobile || quality === 'low' ? 34 : 72;
    const drops = Array.from({ length: dropCount }, () => ({
      x: dropRand(),
      y: dropRand(),
      speed: 0.035 + dropRand() * 0.1,
      len: 10 + dropRand() * 36,
      alpha: 0.14 + dropRand() * 0.34,
      cyan: dropRand() > 0.32,
    }));

    const pointer = {
      active: false,
      nx: 0.22,
      ny: 0,
      sx: 0.22,
      sy: 0,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = (timeSec) => {
      const time = timeSec;
      context.clearRect(0, 0, width, height);

      pointer.sx += (pointer.nx - pointer.sx) * 0.08;
      pointer.sy += (pointer.ny - pointer.sy) * 0.08;

      const targetScrollY = scrollYRef?.current || 0;
      smoothScrollY += (targetScrollY - smoothScrollY) * 0.12;
      const scrollRatio = Math.max(0, Math.min(1.6, smoothScrollY / Math.max(height, 1)));

      const targetVel = velocityRef?.current || 0;
      smoothVel += (targetVel - smoothVel) * 0.14;

      if (!prefersReducedMotion) {
        rotX = scrollRatio * 0.42 + smoothVel * 0.08;
        rotY = time * 0.11 + pointer.sx * 0.28 + scrollRatio * 0.58;
        rotZ = Math.sin(time * 0.22) * 0.07 + pointer.sy * 0.14 + scrollRatio * 0.22;
      }

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      const centerX = width * (width > 968 ? 0.58 : 0.5);
      const centerY = height * 0.48 - scrollRatio * 46;
      const fov = 560;
      const zDolly = -scrollRatio * 115;
      const cursorWorldX = pointer.sx * width * 0.52;
      const cursorWorldY = pointer.sy * height * 0.52;
      const cursorRadius = isMobile ? 130 : 190;

      // 0a. Cascading digital particles
      const dt = time > lastFrameTime && lastFrameTime ? Math.min(0.05, time - lastFrameTime) : 0.016;
      lastFrameTime = time;
      const rainBoost = 1 + Math.min(4, Math.abs(smoothVel) * 3);
      const rainDir = smoothVel < -0.08 ? -0.55 : 1;

      for (let i = 0; i < dropCount; i += 1) {
        const drop = drops[i];
        if (!prefersReducedMotion) {
          drop.y += drop.speed * dt * rainBoost * rainDir;
          if (drop.y > 1.08) {
            drop.y = -0.06;
            drop.x = Math.random();
          } else if (drop.y < -0.1) {
            drop.y = 1.05;
            drop.x = Math.random();
          }
        }

        const px = Math.round(drop.x * width);
        const py = drop.y * height;
        const seg = drop.len / 3;
        const rgb = drop.cyan ? '56, 189, 248' : '245, 158, 11';

        context.fillStyle = `rgba(${rgb}, ${(drop.alpha * 0.12).toFixed(3)})`;
        context.fillRect(px, py - seg * 3, 1, seg);
        context.fillStyle = `rgba(${rgb}, ${(drop.alpha * 0.28).toFixed(3)})`;
        context.fillRect(px, py - seg * 2, 1, seg);
        context.fillStyle = `rgba(${rgb}, ${(drop.alpha * 0.55).toFixed(3)})`;
        context.fillRect(px, py - seg, 1, seg);
        context.fillStyle = `rgba(${rgb}, ${Math.min(0.9, drop.alpha * 1.6).toFixed(3)})`;
        context.fillRect(px - 0.75, py - 1.5, 2.5, 2.5);
      }

      // 0b. Shifting mathematical orbits that react to scroll
      context.lineWidth = 1;
      for (let k = 0; k < 3; k += 1) {
        const sign = k % 2 ? -1 : 1;
        const rx = width * (0.34 + k * 0.13);
        const ry = rx * (0.28 + k * 0.04);
        const rot = -0.24 + sign * (scrollRatio * 0.45 * (k + 1) + time * 0.012 * (k + 1));
        context.setLineDash(k === 1 ? [] : [2, 9]);
        context.strokeStyle =
          k === 1 ? 'rgba(56, 189, 248, 0.05)' : 'rgba(167, 139, 250, 0.055)';
        context.beginPath();
        context.ellipse(centerX, centerY, rx, ry, rot, 0, Math.PI * 2);
        context.stroke();

        // Orbiting marker
        const t = time * (0.07 + k * 0.025) * sign + k * 1.7;
        const ex = rx * Math.cos(t);
        const ey = ry * Math.sin(t);
        const mx = centerX + ex * Math.cos(rot) - ey * Math.sin(rot);
        const my = centerY + ex * Math.sin(rot) + ey * Math.cos(rot);
        context.fillStyle = k === 1 ? 'rgba(56, 189, 248, 0.55)' : 'rgba(251, 191, 36, 0.5)';
        context.beginPath();
        context.arc(mx, my, 1.8, 0, Math.PI * 2);
        context.fill();
      }
      context.setLineDash([]);

      // 1. Update 3D spring physics & perspective projection
      for (let i = 0; i < nodeCount; i += 1) {
        const node = nodes[i];
        const pulse = prefersReducedMotion ? 0 : Math.sin(time * 1.15 + node.phase) * 7;

        const lx = node.baseX + node.dx;
        const ly = node.baseY + node.dy + pulse;
        const lz = node.baseZ + node.dz;

        // Rotate around Y, X (scroll pitch), then Z
        const rx = lx * cosY + lz * sinY;
        const rz1 = -lx * sinY + lz * cosY;
        const ry = ly * cosX - rz1 * sinX;
        const rz = ly * sinX + rz1 * cosX;
        const wx = rx * cosZ - ry * sinZ;
        const wy = rx * sinZ + ry * cosZ;
        const wz = rz + zDolly;

        let cursorProx = 0;
        if (pointer.active && !prefersReducedMotion) {
          const cdx = wx - cursorWorldX;
          const cdy = wy - cursorWorldY;
          const dist = Math.hypot(cdx, cdy);

          if (dist < cursorRadius && dist > 0.001) {
            cursorProx = 1 - dist / cursorRadius;
            // Gentle repulsive-orbital vector field around cursor in 3D
            const force = cursorProx * cursorProx * 1.55;
            node.vx += (cdx / dist) * force - (cdy / dist) * force * 0.35;
            node.vy += (cdy / dist) * force + (cdx / dist) * force * 0.35;
            node.vz += Math.sin(dist * 0.05 - time * 2) * force * 0.6;
          }
        }

        // Spring restore + damping
        node.vx = (node.vx - node.dx * 0.065) * 0.86;
        node.vy = (node.vy - node.dy * 0.065) * 0.86;
        node.vz = (node.vz - node.dz * 0.065) * 0.86;
        node.dx += node.vx;
        node.dy += node.vy;
        node.dz += node.vz;

        const depth = Math.max(160, fov + wz + 220);
        const scale = fov / depth;
        const depthNorm = Math.max(0, Math.min(1, (260 - wz) / 520));

        const p = projected[i];
        p.wx = wx;
        p.wy = wy;
        p.wz = wz;
        p.x = centerX + wx * scale;
        p.y = centerY + wy * scale;
        p.scale = scale;
        p.alpha = 0.16 + depthNorm * 0.64;
        p.cursorProx = cursorProx;
      }

      // 2. Render k-Nearest-Neighbor Markov transition edges
      context.lineWidth = 1;
      for (let i = 0; i < nodeCount; i += 1) {
        const a = projected[i];
        let connected = 0;

        for (let j = i + 1; j < nodeCount; j += 1) {
          const b = projected[j];
          const dx = a.wx - b.wx;
          if (dx > maxEdgeDist || dx < -maxEdgeDist) continue;
          const dy = a.wy - b.wy;
          if (dy > maxEdgeDist || dy < -maxEdgeDist) continue;
          const dz = a.wz - b.wz;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq > maxEdgeDistSq) continue;

          const distFactor = 1 - distSq / maxEdgeDistSq;
          const boost = Math.max(a.cursorProx, b.cursorProx);
          const alpha = (distFactor * 0.14 + boost * 0.48) * Math.min(a.alpha, b.alpha);

          if (alpha < 0.025) continue;

          const useAmber = boost > 0.16 || (i + j) % 3 === 0;
          const color = useAmber ? AMBER : CYAN;

          context.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha.toFixed(3)})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();

          // Markov transition state packet along active edges
          if (!prefersReducedMotion && (boost > 0.22 || (i % 9 === 0 && connected === 0))) {
            const travel = (time * (0.45 + (i % 4) * 0.12) + i * 0.17) % 1;
            const px = a.x + (b.x - a.x) * travel;
            const py = a.y + (b.y - a.y) * travel;
            context.fillStyle = useAmber
              ? `rgba(251, 191, 36, ${Math.min(0.92, alpha * 2.4).toFixed(3)})`
              : `rgba(56, 189, 248, ${Math.min(0.88, alpha * 2.2).toFixed(3)})`;
            context.beginPath();
            context.arc(px, py, 1.5 * ((a.scale + b.scale) * 0.5), 0, Math.PI * 2);
            context.fill();
          }

          connected += 1;
          if (connected >= kNeighbors) break;
        }
      }

      // 3. Render 3D manifold nodes with depth-of-field glow
      for (let i = 0; i < nodeCount; i += 1) {
        const node = nodes[i];
        const p = projected[i];
        const radius = Math.max(1.1, node.size * p.scale * (1 + p.cursorProx * 0.55));
        const baseColor =
          p.cursorProx > 0.2
            ? AMBER
            : node.cluster === 'amber'
              ? AMBER
              : node.cluster === 'cyan'
                ? CYAN
                : SLATE;
        const alpha = Math.min(0.95, p.alpha + p.cursorProx * 0.42);

        if (p.cursorProx > 0.15 || node.cluster === 'amber') {
          context.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${(alpha * 0.22).toFixed(3)})`;
          context.beginPath();
          context.arc(p.x, p.y, radius * 3.1, 0, Math.PI * 2);
          context.fill();
        }

        context.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha.toFixed(3)})`;
        context.beginPath();
        context.arc(p.x, p.y, radius, 0, Math.PI * 2);
        context.fill();
      }
    };

    const tick = (time) => {
      if (!inView || document.hidden) return;
      // Low-power devices get a 30fps canvas while the DOM stays at 60fps.
      if ((isMobile || quality === 'low') && time - lastRenderTime < 1 / 30) return;
      lastRenderTime = time;
      drawFrame(time);
    };

    resize();
    drawFrame(gsap.ticker.time);

    if (!prefersReducedMotion) {
      gsap.ticker.add(tick);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0.02 },
    );
    observer.observe(canvas);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      drawFrame(gsap.ticker.time);
    });
    resizeObserver.observe(canvas);

    const flushPointer = () => {
      pointerRafId = 0;
      const event = pendingPointer;
      pendingPointer = null;
      if (!event || !inView || document.hidden) return;

      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const cx = width * (width > 968 ? 0.58 : 0.5);
      const cy = height * 0.48;
      pointer.nx = (event.clientX - rect.left - cx) / (width * 0.52);
      pointer.ny = (event.clientY - rect.top - cy) / (height * 0.52);
      pointer.active = true;
    };

    const onPointerMove = (event) => {
      if (!inView || document.hidden) return;
      pendingPointer = { clientX: event.clientX, clientY: event.clientY };
      if (!pointerRafId) {
        pointerRafId = requestAnimationFrame(flushPointer);
      }
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);

    return () => {
      gsap.ticker.remove(tick);
      observer.disconnect();
      resizeObserver.disconnect();
      if (pointerRafId) cancelAnimationFrame(pointerRafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [prefersReducedMotion, quality, scrollYRef, velocityRef]);

  return <canvas ref={canvasRef} className="hero__manifold-canvas" aria-hidden="true" />;
}
