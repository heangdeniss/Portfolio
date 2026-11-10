import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { site } from '../data/site';

/**
 * Holographic particle vortex that wraps around the Hero portrait.
 *
 * Two canvases share one gsap.ticker loop: the back canvas renders the far
 * half of every orbit (behind the portrait) and the front canvas renders the
 * near half (in front of it), so particles genuinely wrap around Denis.
 * Orbit inclination / roll and particle angular velocity react to the Lenis
 * scroll offset and velocity. Floating data nodes are DOM links connected by
 * an SVG web of light with travelling data packets and live telemetry.
 */

const VIEW = 600;
const CENTER = VIEW / 2;
const RIM = 202;

const PALETTE = [
  [245, 158, 11],
  [56, 189, 248],
  [167, 139, 250],
  [16, 185, 129],
];

const NODES = [
  { id: 'python', label: 'Python', x: 92, y: 128, color: '#38bdf8', href: '#skills', cursor: 'Stack' },
  { id: 'rag', label: 'RAG', x: 522, y: 206, color: '#a78bfa', href: '#projects', cursor: 'Work' },
  { id: 'fastapi', label: 'FastAPI', x: 74, y: 438, color: '#10b981', href: '#projects', cursor: 'Work' },
  { id: 'geo', label: site.location, x: 452, y: 534, color: '#f59e0b', href: '#contact', cursor: 'Hello' },
];

const rimPoint = (node) => {
  const angle = Math.atan2(node.y - CENTER, node.x - CENTER);
  return { x: CENTER + Math.cos(angle) * RIM, y: CENTER + Math.sin(angle) * RIM };
};

const spokePath = (node) => {
  const rim = rimPoint(node);
  const mx = (node.x + rim.x) / 2 + (node.y - CENTER) * 0.12;
  const my = (node.y + rim.y) / 2 - (node.x - CENTER) * 0.12;
  return `M${node.x} ${node.y} Q${mx.toFixed(1)} ${my.toFixed(1)} ${rim.x.toFixed(1)} ${rim.y.toFixed(1)}`;
};

const webPath = (a, b) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  // Bow the arc outward, away from the portrait centre.
  const ox = mx - CENTER;
  const oy = my - CENTER;
  const len = Math.hypot(ox, oy) || 1;
  const cx = mx + (ox / len) * 70;
  const cy = my + (oy / len) * 70;
  return `M${a.x} ${a.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x} ${b.y}`;
};

const SPOKES = NODES.map((node) => ({ id: node.id, d: spokePath(node), color: node.color }));
const WEB = NODES.map((node, i) => {
  const next = NODES[(i + 1) % NODES.length];
  return { id: `${node.id}-${next.id}`, a: node.id, b: next.id, d: webPath(node, next) };
});

function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const phnomPenhTime = () => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Phnom_Penh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    return '--:--:--';
  }
};

export default function HeroVortex() {
  const boxRef = useRef(null);
  const backRef = useRef(null);
  const frontRef = useRef(null);
  const svgRef = useRef(null);
  const readoutRef = useRef(null);
  const metaRefs = useRef({});
  const [activeNode, setActiveNode] = useState(null);
  const { quality, scrollYRef, velocityRef } = useExperience();
  const prefersReducedMotion = usePrefersReducedMotion();

  /* Canvas vortex loop */
  useEffect(() => {
    const box = boxRef.current;
    const back = backRef.current;
    const front = frontRef.current;
    if (!box || !back || !front) return undefined;

    const bctx = back.getContext('2d');
    const fctx = front.getContext('2d');
    if (!bctx || !fctx) return undefined;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const count = isMobile ? 90 : quality === 'low' ? 130 : 240;
    const rand = createRng(7031996);

    const particles = Array.from({ length: count }, (_, i) => {
      const band = rand();
      return {
        r: 0.345 + band * 0.15,
        theta: rand() * Math.PI * 2,
        lift: (rand() - 0.5) * 0.035,
        size: 0.7 + rand() * 1.5,
        color: PALETTE[i % 7 === 0 ? 3 : band > 0.62 ? 1 : band > 0.3 ? 0 : 2],
        twinkle: rand() * Math.PI * 2,
      };
    });

    const orbits = [
      { r: 0.478, tilt: 1.18, roll: -0.34, spin: 0.035, color: PALETTE[0], comet: 0.42 },
      { r: 0.455, tilt: 1.3, roll: 0.62, spin: -0.028, color: PALETTE[1], comet: -0.36 },
      { r: 0.43, tilt: 0.62, roll: 1.95, spin: 0.022, color: PALETTE[2], comet: 0.3 },
    ];

    let size = 1;
    let dpr = 1;
    let inView = true;
    let halo = null;
    let smoothScroll = scrollYRef?.current || 0;
    let smoothVel = 0;
    let lastTime = 0;
    let lastReadout = 0;

    const resize = () => {
      size = Math.max(1, box.clientWidth);
      dpr = Math.min(window.devicePixelRatio || 1, quality === 'low' || isMobile ? 1 : 1.5);
      [back, front].forEach((canvas) => {
        canvas.width = Math.round(size * dpr);
        canvas.height = Math.round(size * dpr);
      });
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const c = size / 2;
      halo = bctx.createRadialGradient(c, c, size * 0.3, c, c, size * 0.5);
      halo.addColorStop(0, 'rgba(56, 189, 248, 0)');
      halo.addColorStop(0.55, 'rgba(56, 189, 248, 0.05)');
      halo.addColorStop(0.82, 'rgba(167, 139, 250, 0.07)');
      halo.addColorStop(1, 'rgba(7, 9, 14, 0)');
    };

    const project = (radius, angle, tilt, roll, lift = 0) => {
      const lx = radius * Math.cos(angle);
      const ly = radius * Math.sin(angle) * Math.cos(tilt) + lift;
      const depth = Math.sin(angle);
      const cosR = Math.cos(roll);
      const sinR = Math.sin(roll);
      return {
        x: size / 2 + lx * cosR - ly * sinR,
        y: size / 2 + lx * sinR + ly * cosR,
        depth,
      };
    };

    const draw = (time) => {
      const dt = time > lastTime && lastTime ? Math.min(0.05, time - lastTime) : 0.016;
      lastTime = time;

      const targetScroll = scrollYRef?.current || 0;
      smoothScroll += (targetScroll - smoothScroll) * 0.12;
      const scrollRatio = Math.max(0, Math.min(1.5, smoothScroll / Math.max(window.innerHeight, 1)));
      smoothVel += ((velocityRef?.current || 0) - smoothVel) * 0.1;
      const energy = 1 + Math.min(3, Math.abs(smoothVel) * 2.4);

      bctx.clearRect(0, 0, size, size);
      fctx.clearRect(0, 0, size, size);

      // Holographic sphere halo
      if (halo) {
        bctx.fillStyle = halo;
        bctx.fillRect(0, 0, size, size);
      }

      // Mathematical orbits + comet data streams
      orbits.forEach((orbit, index) => {
        const tilt = orbit.tilt + scrollRatio * 0.28 * (index % 2 ? -1 : 1);
        const roll = orbit.roll + time * orbit.spin + scrollRatio * 0.55 * (index + 1);
        const radius = orbit.r * size;
        const [cr, cg, cb] = orbit.color;
        const ry = radius * Math.cos(tilt);

        bctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.16)`;
        bctx.lineWidth = 1;
        bctx.setLineDash([3, 6]);
        bctx.beginPath();
        bctx.ellipse(size / 2, size / 2, radius, Math.abs(ry), roll, Math.PI, Math.PI * 2);
        bctx.stroke();
        bctx.setLineDash([]);

        fctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.3)`;
        fctx.lineWidth = 1;
        fctx.beginPath();
        fctx.ellipse(size / 2, size / 2, radius, Math.abs(ry), roll, 0, Math.PI);
        fctx.stroke();

        // Comet head with fading tail
        const head = time * orbit.comet * energy * 1.4 + index * 2.1;
        const dir = Math.sign(orbit.comet) || 1;
        for (let s = 0; s < 14; s += 1) {
          const angle = head - dir * s * 0.045;
          const p = project(radius, angle, tilt, roll);
          const ctx = p.depth > 0 ? fctx : bctx;
          const fade = 1 - s / 14;
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${(fade * (p.depth > 0 ? 0.9 : 0.4)).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, (s === 0 ? 2.6 : 1.6) * fade + 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Particle accretion disk (Keplerian angular velocity)
      const diskTilt = 1.16 + scrollRatio * 0.22;
      const diskRoll = -0.3 + scrollRatio * 0.4;
      for (let i = 0; i < count; i += 1) {
        const p = particles[i];
        if (!prefersReducedMotion) {
          p.theta += dt * 0.26 * Math.pow(0.36 / p.r, 1.5) * energy;
        }
        const pos = project(p.r * size, p.theta, diskTilt, diskRoll, p.lift * size);
        const near = (pos.depth + 1) / 2;
        const twinkle = 0.65 + Math.sin(time * 2.2 + p.twinkle) * 0.35;
        const alpha = (pos.depth > 0 ? 0.42 + near * 0.5 : 0.12 + near * 0.3) * twinkle;
        const radius = p.size * (0.7 + near * 0.6);
        const ctx = pos.depth > 0 ? fctx : bctx;
        const [r, g, b] = p.color;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
        if (radius < 1.3) {
          ctx.fillRect(pos.x - radius, pos.y - radius, radius * 2, radius * 2);
        } else {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Live orbital telemetry readout (throttled to ~4 Hz)
      if (readoutRef.current && Math.abs(time - lastReadout) > 0.25) {
        lastReadout = time;
        const inclination = (diskTilt * 57.2958).toFixed(1);
        const omega = (0.26 * energy).toFixed(2);
        readoutRef.current.textContent = `ORBIT.Φ ${inclination}° · ω ${omega} rad/s · N=${count}`;
      }
    };

    const tick = (time) => {
      if (!inView || document.hidden) return;
      draw(time);
    };

    resize();
    draw(gsap.ticker.time);

    if (!prefersReducedMotion) gsap.ticker.add(tick);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    observer.observe(box);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(gsap.ticker.time);
    });
    resizeObserver.observe(box);

    return () => {
      gsap.ticker.remove(tick);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [prefersReducedMotion, quality, scrollYRef, velocityRef]);

  /* Live node telemetry + SMIL pause while offscreen */
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;

    let visible = true;
    let epoch = 40;
    let timer = 0;

    const write = () => {
      const metas = metaRefs.current;
      epoch += 1;
      const loss = (0.12 * Math.exp(-epoch / 160) + 0.04 + Math.random() * 0.004).toFixed(3);
      const recall = (0.91 + Math.random() * 0.04).toFixed(2);
      const latency = Math.round(9 + Math.random() * 5);
      if (metas.python) metas.python.textContent = `epoch ${String(epoch).padStart(3, '0')} · loss ${loss}`;
      if (metas.rag) metas.rag.textContent = `top-k 8 · recall ${recall}`;
      if (metas.fastapi) metas.fastapi.textContent = `p50 ${latency}ms · 200 OK`;
      if (metas.geo) metas.geo.textContent = `UTC+7 · ${phnomPenhTime()}`;
    };

    write();

    const start = () => {
      if (timer || prefersReducedMotion) return;
      timer = window.setInterval(() => {
        if (visible && !document.hidden) write();
      }, 1000);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        const svg = svgRef.current;
        if (svg && typeof svg.pauseAnimations === 'function') {
          if (visible) svg.unpauseAnimations();
          else svg.pauseAnimations();
        }
      },
      { threshold: 0.01 },
    );
    observer.observe(box);
    start();

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [prefersReducedMotion]);

  const isLinked = (link) => activeNode && (link.a === activeNode || link.b === activeNode);

  return (
    <>
      {/* Far half of the vortex — rendered beneath the portrait */}
      <div className="hero-vortex hero-vortex--back" aria-hidden="true">
        <canvas ref={backRef} className="hero-vortex__canvas" />
      </div>

    {/* Near half, web of light, telemetry and interactive nodes — above the portrait */}
    <div className={`hero-vortex hero-vortex--front${activeNode ? ' has-active' : ''}`} ref={boxRef}>
      <canvas ref={frontRef} className="hero-vortex__canvas" aria-hidden="true" />

      <svg
        ref={svgRef}
        className="hero-vortex__web"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id="vortexRimGlow" cx="50%" cy="50%" r="50%">
            <stop offset="62%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="68%" stopColor="#38bdf8" stopOpacity="0.16" />
            <stop offset="72%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={CENTER} cy={CENTER} r={292} fill="url(#vortexRimGlow)" />
        <circle cx={CENTER} cy={CENTER} r={RIM} className="hero-vortex__rim" />
        <circle cx={CENTER} cy={CENTER} r={RIM + 14} className="hero-vortex__rim hero-vortex__rim--ticks" />

        {WEB.map((link) => (
          <path
            key={link.id}
            id={`vortex-web-${link.id}`}
            d={link.d}
            className={`hero-vortex__link hero-vortex__link--web${isLinked(link) ? ' is-active' : ''}`}
          />
        ))}

        {SPOKES.map((spoke) => (
          <path
            key={spoke.id}
            id={`vortex-spoke-${spoke.id}`}
            d={spoke.d}
            style={{ '--link-color': spoke.color }}
            className={`hero-vortex__link hero-vortex__link--spoke${activeNode === spoke.id ? ' is-active' : ''}`}
          />
        ))}

        {!prefersReducedMotion &&
          SPOKES.map((spoke, index) => (
            <circle key={`packet-${spoke.id}`} r="2.6" fill={spoke.color} className="hero-vortex__packet">
              <animateMotion
                dur={`${2.6 + index * 0.45}s`}
                repeatCount="indefinite"
                begin={`${index * 0.6}s`}
                keyPoints={index % 2 ? '1;0' : '0;1'}
                keyTimes="0;1"
                calcMode="linear"
              >
                <mpath href={`#vortex-spoke-${spoke.id}`} />
              </animateMotion>
            </circle>
          ))}

        {!prefersReducedMotion &&
          WEB.map((link, index) => (
            <circle key={`web-packet-${link.id}`} r="1.8" className="hero-vortex__packet hero-vortex__packet--web">
              <animateMotion dur={`${4.2 + index * 0.6}s`} repeatCount="indefinite" begin={`${index * 0.9}s`}>
                <mpath href={`#vortex-web-${link.id}`} />
              </animateMotion>
            </circle>
          ))}
      </svg>

      <span ref={readoutRef} className="hero-vortex__readout" aria-hidden="true">
        ORBIT.Φ 66.5° · ω 0.26 rad/s
      </span>

      {NODES.map((node) => (
        <a
          key={node.id}
          href={node.href}
          className={`holo-node holo-node--${node.id}${activeNode === node.id ? ' is-active' : ''}`}
          style={{
            left: `${(node.x / VIEW) * 100}%`,
            top: `${(node.y / VIEW) * 100}%`,
            '--node-color': node.color,
          }}
          data-cursor={node.cursor}
          onPointerEnter={() => setActiveNode(node.id)}
          onPointerLeave={() => setActiveNode(null)}
          onFocus={() => setActiveNode(node.id)}
          onBlur={() => setActiveNode(null)}
          aria-label={`${node.label} — jump to ${node.href.slice(1)}`}
        >
          <span className="holo-node__core" aria-hidden="true" />
          <span className="holo-node__body">
            <span className="holo-node__label">{node.label}</span>
            <span
              className="holo-node__meta"
              ref={(el) => {
                if (el) metaRefs.current[node.id] = el;
              }}
              aria-hidden="true"
            />
          </span>
        </a>
      ))}
    </div>
    </>
  );
}
