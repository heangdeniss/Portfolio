import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import useMediaQuery from '../hooks/useMediaQuery';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import useReveal from '../hooks/useReveal';
import { vaultGraph, vaultStats } from '../lib/vault';
import { motion } from '../data/motion';
import SectionTitle from './SectionTitle';

const GROUP_STYLE = {
  profile: { color: '#f59e0b', packetColor: '#f59e0b', radius: 14 },
  project: { color: '#22d3ee', packetColor: '#f59e0b', radius: 9.5 },
  timeline: { color: '#a78bfa', packetColor: '#34d399', radius: 7.2 },
  system: { color: '#34d399', packetColor: '#34d399', radius: 8.2 },
  note: { color: '#94a3b8', packetColor: '#f59e0b', radius: 7 },
};

const TIMELINE_3D_ANGLES = [22, 82, 145, 205, 265, 325];

function buildScene3D(nodes, isWide) {
  const width = isWide ? 1200 : 420;
  const height = isWide ? 450 : 600;
  const center = isWide ? { x: 600, y: 222 } : { x: 210, y: 298 };
  const positions = new Map();

  const profile = nodes.find((node) => node.group === 'profile');
  const projects = nodes.filter((node) => node.group === 'project');
  const timeline = nodes.filter((node) => node.group === 'timeline');
  const system = nodes.filter((node) => node.group === 'system');
  const other = nodes.filter(
    (node) => !['profile', 'project', 'timeline', 'system'].includes(node.group),
  );

  if (profile) {
    positions.set(profile.id, { x3d: 0, y3d: 0, z3d: 0 });
  }

  // Inner 3D inclined orbital ring for Featured Projects
  const projRx = isWide ? 210 : 114;
  const projRy = isWide ? 94 : 88;
  const projRz = isWide ? 165 : 108;
  const projectAngles = [-34, 90, 212];

  projects.forEach((node, index) => {
    const deg = projectAngles[index % projectAngles.length] + Math.floor(index / 3) * 45;
    const rad = (deg * Math.PI) / 180;
    const x3d = Math.cos(rad) * projRx;
    const y3d = Math.sin(rad) * projRy + (index === 1 ? 38 : -26);
    const z3d = Math.sin(rad + 0.65) * projRz;
    positions.set(node.id, { x3d, y3d, z3d });
  });

  // Outer 3D tilted constellation sphere for Timeline milestones
  const timeRx = isWide ? 378 : 152;
  const timeRy = isWide ? 148 : 188;
  const timeRz = isWide ? 230 : 142;

  timeline.forEach((node, index) => {
    const deg = TIMELINE_3D_ANGLES[index % TIMELINE_3D_ANGLES.length];
    const rad = (deg * Math.PI) / 180;
    const tilt = index % 2 === 0 ? 1 : -1;
    const x3d = Math.cos(rad) * timeRx;
    const y3d = Math.sin(rad) * timeRy + tilt * (isWide ? 22 : 34);
    const z3d = Math.sin(rad * 1.5 + 0.4) * timeRz;
    positions.set(node.id, { x3d, y3d, z3d });
  });

  // North-pole orbital anchor for System / Motion Config
  system.forEach((node, index) => {
    positions.set(node.id, {
      x3d: index * 48 - (system.length - 1) * 24,
      y3d: isWide ? -168 : -210,
      z3d: isWide ? 95 : 70,
    });
  });

  other.forEach((node, index) => {
    const rad = ((index * 72 + 40) * Math.PI) / 180;
    positions.set(node.id, {
      x3d: Math.cos(rad) * (isWide ? 290 : 130),
      y3d: isWide ? 158 : 210,
      z3d: Math.sin(rad) * 140,
    });
  });

  const nodeById = new Map();
  const sceneNodes = nodes
    .map((node) => {
      const pos3d = positions.get(node.id);
      if (!pos3d) return null;
      const enriched = {
        ...node,
        ...pos3d,
        x: center.x + pos3d.x3d,
        y: center.y + pos3d.y3d,
        z: pos3d.z3d,
        scale: 1,
        alpha: 1,
      };
      nodeById.set(node.id, enriched);
      return enriched;
    })
    .filter(Boolean);

  return {
    width,
    height,
    center,
    fov: isWide ? 680 : 520,
    nodes: sceneNodes,
    nodeById,
    positions,
  };
}

function projectPoint3D(x3d, y3d, z3d, rotX, rotY, zoom, center, fov, panX = 0, panY = 0) {
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);

  // Rotate around Y axis
  const rx = x3d * cosY + z3d * sinY;
  const rz1 = -x3d * sinY + z3d * cosY;

  // Rotate around X axis
  const ry = y3d * cosX - rz1 * sinX;
  const rz = y3d * sinX + rz1 * cosX;

  const scale = (fov / Math.max(220, fov - rz)) * zoom;
  const x = center.x + (rx + panX) * scale;
  const y = center.y + (ry + panY) * scale;

  // Depth-of-field alpha: front nodes (rz > 0) are crisp 1.0; back nodes fade gently
  const normalizedDepth = Math.max(-1, Math.min(1, rz / 240));
  const alpha = 0.38 + (normalizedDepth + 1) * 0.31;

  return { x, y, z: rz, scale, alpha };
}

function build3DRingPath(radiusX, radiusZ, tiltX, rotX, rotY, zoom, center, fov, panX, panY) {
  const steps = 40;
  let d = '';
  const cosTilt = Math.cos(tiltX);
  const sinTilt = Math.sin(tiltX);

  for (let i = 0; i <= steps; i += 1) {
    const theta = (i / steps) * Math.PI * 2;
    const rawX = Math.cos(theta) * radiusX;
    const rawZ = Math.sin(theta) * radiusZ;
    const y3d = -rawZ * sinTilt;
    const z3d = rawZ * cosTilt;
    const pt = projectPoint3D(rawX, y3d, z3d, rotX, rotY, zoom, center, fov, panX, panY);
    d += `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)} `;
  }
  return `${d}Z`;
}

function edgesForGraph(links, layout) {
  return links
    .map((link, index) => {
      const source = layout.nodeById.get(link.source);
      const target = layout.nodeById.get(link.target);
      if (!source || !target) return null;

      const accentNode =
        target.group === 'profile' ? source : target ?? source;
      const style = GROUP_STYLE[accentNode?.group] ?? GROUP_STYLE.note;

      const controlX = (source.x + target.x) / 2 + (source.y - target.y) * 0.08;
      const controlY = (source.y + target.y) / 2 + (target.x - source.x) * 0.08;

      return {
        id: `${link.source}-${link.target}`,
        source: link.source,
        target: link.target,
        color: style.color,
        packetColor: index % 2 === 0 ? '#f59e0b' : '#34d399',
        path: `M ${source.x.toFixed(1)} ${source.y.toFixed(1)} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${target.x.toFixed(1)} ${target.y.toFixed(1)}`,
        index,
      };
    })
    .filter(Boolean);
}

export default function VaultGraph() {
  const [revealRef, visible] = useReveal({ threshold: 0.08 });
  const panelRef = useRef(null);
  const stageRef = useRef(null);
  const ringInnerRef = useRef(null);
  const ringOuterRef = useRef(null);
  const edgeElsRef = useRef(new Map());
  const packetPrimaryElsRef = useRef(new Map());
  const packetSecondaryElsRef = useRef(new Map());
  const nodeElsRef = useRef(new Map());
  const prefersReducedMotion = usePrefersReducedMotion();
  const { quality } = useExperience();
  const isWide = useMediaQuery('(min-width: 760px)');
  const [hoveredId, setHoveredId] = useState(null);
  const [pinnedId, setPinnedId] = useState(null);
  const [isDraggingUI, setIsDraggingUI] = useState(false);

  const activeId = hoveredId ?? pinnedId;

  const showMotion = motion.vaultGraph && !prefersReducedMotion;
  const nodes = vaultGraph.nodes;
  const layout = useMemo(() => buildScene3D(nodes, isWide), [nodes, isWide]);
  const edges = useMemo(() => edgesForGraph(vaultGraph.links, layout), [layout]);

  const cameraRef = useRef({
    rotX: -0.2,
    rotY: 0.28,
    targetRotX: -0.2,
    targetRotY: 0.28,
    zoom: 1,
    targetZoom: 1,
    panX: 0,
    panY: 0,
    targetPanX: 0,
    targetPanY: 0,
    isDragging: false,
    dragMoved: false,
    lastX: 0,
    lastY: 0,
    userInteractedUntil: 0,
  });

  const activeConnections = useMemo(() => {
    if (!activeId) return null;

    const connected = new Set([activeId]);
    edges.forEach((edge) => {
      if (edge.source === activeId) connected.add(edge.target);
      if (edge.target === activeId) connected.add(edge.source);
    });

    return connected;
  }, [activeId, edges]);

  const activeNode = useMemo(
    () => (activeId ? layout.nodeById.get(activeId) ?? null : null),
    [activeId, layout],
  );

  // Update 3D camera target when hovering or pinning a node
  useEffect(() => {
    const cam = cameraRef.current;
    if (!activeId) {
      cam.targetZoom = 1;
      cam.targetPanX = 0;
      cam.targetPanY = 0;
      return;
    }

    const node = layout.nodeById.get(activeId);
    if (!node) return;

    if (node.group === 'profile') {
      cam.targetZoom = 1.14;
      cam.targetPanX = 0;
      cam.targetPanY = 0;
      return;
    }

    // Smoothly orient the 3D constellation toward the focused node
    const desiredRotY = Math.atan2(-node.x3d, Math.max(90, Math.abs(node.z3d) + 80)) * 0.62;
    const desiredRotX = Math.max(
      -0.65,
      Math.min(0.65, Math.atan2(node.y3d, 260) * 0.55 - 0.12),
    );

    cam.targetRotY = desiredRotY;
    cam.targetRotX = desiredRotX;
    cam.targetZoom = 1.15;
    cam.targetPanX = -node.x3d * 0.14;
    cam.targetPanY = -node.y3d * 0.14;
  }, [activeId, layout]);

  useEffect(() => {
    if (prefersReducedMotion || !panelRef.current) return undefined;

    const context = gsap.context(() => {
      gsap.to(panelRef.current, {
        yPercent: -3.5,
        ease: 'none',
        scrollTrigger: {
          trigger: panelRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
    });

    return () => context.revert();
  }, [prefersReducedMotion]);

  // 3D Orbital Constellation Projection & Packet Animation Loop (unified GSAP ticker + IntersectionObserver)
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !motion.vaultGraph) return undefined;

    let inView = false;
    let lastTime = performance.now();
    let elapsed = 0;

    const projectedMap = new Map();

    const renderFrame = (now) => {
      const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      elapsed += dt;

      const cam = cameraRef.current;

      // Auto-rotate gently when idle (not dragging, no active node, and cooldown passed)
      if (!cam.isDragging && !activeId && !prefersReducedMotion && now > cam.userInteractedUntil) {
        cam.targetRotY += dt * 0.19;
        cam.targetRotX = -0.2 + Math.sin(elapsed * 0.55) * 0.09;
      }

      const lerpFactor = cam.isDragging ? 0.32 : 0.085;
      cam.rotX += (cam.targetRotX - cam.rotX) * lerpFactor;
      cam.rotY += (cam.targetRotY - cam.rotY) * lerpFactor;
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.08;
      cam.panX += (cam.targetPanX - cam.panX) * 0.08;
      cam.panY += (cam.targetPanY - cam.panY) * 0.08;

      // Update 3D orbital reference rings
      if (ringInnerRef.current) {
        ringInnerRef.current.setAttribute(
          'd',
          build3DRingPath(
            isWide ? 210 : 114,
            isWide ? 165 : 108,
            0.22,
            cam.rotX,
            cam.rotY,
            cam.zoom,
            layout.center,
            layout.fov,
            cam.panX,
            cam.panY,
          ),
        );
      }
      if (ringOuterRef.current) {
        ringOuterRef.current.setAttribute(
          'd',
          build3DRingPath(
            isWide ? 378 : 152,
            isWide ? 230 : 142,
            -0.18,
            cam.rotX,
            cam.rotY,
            cam.zoom,
            layout.center,
            layout.fov,
            cam.panX,
            cam.panY,
          ),
        );
      }

      // Project all 3D nodes with perspective scaling and depth-of-field alpha
      for (let i = 0; i < layout.nodes.length; i += 1) {
        const node = layout.nodes[i];
        const floatY = prefersReducedMotion
          ? 0
          : Math.sin(elapsed * 1.4 + i * 0.85) * (node.group === 'profile' ? 2.5 : 4.5);
        const proj = projectPoint3D(
          node.x3d,
          node.y3d + floatY,
          node.z3d,
          cam.rotX,
          cam.rotY,
          cam.zoom,
          layout.center,
          layout.fov,
          cam.panX,
          cam.panY,
        );
        projectedMap.set(node.id, proj);

        const el = nodeElsRef.current.get(node.id);
        if (el) {
          const depthScale = Math.max(0.68, Math.min(1.32, proj.scale));
          el.setAttribute(
            'transform',
            `translate(${proj.x.toFixed(1)} ${proj.y.toFixed(1)}) scale(${depthScale.toFixed(3)})`,
          );
          el.style.setProperty('--depth-alpha', proj.alpha.toFixed(3));
        }
      }

      // Project 3D quadratic Bezier edges and animate glowing data packets along edges
      for (let i = 0; i < edges.length; i += 1) {
        const edge = edges[i];
        const s = projectedMap.get(edge.source);
        const t = projectedMap.get(edge.target);
        if (!s || !t) continue;

        const ctrlX = (s.x + t.x) / 2 + (s.y - t.y) * 0.09;
        const ctrlY = (s.y + t.y) / 2 + (t.x - s.x) * 0.09;
        const d = `M ${s.x.toFixed(1)} ${s.y.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${t.x.toFixed(1)} ${t.y.toFixed(1)}`;

        const edgeEl = edgeElsRef.current.get(edge.id);
        if (edgeEl) {
          edgeEl.setAttribute('d', d);
          const avgAlpha = ((s.alpha + t.alpha) * 0.5).toFixed(3);
          edgeEl.style.setProperty('--edge-depth-alpha', avgAlpha);
        }

        // Evaluate quadratic Bezier point at parameter u for primary and secondary glowing packets
        const p1 = packetPrimaryElsRef.current.get(edge.id);
        if (p1) {
          const speed = 0.22 + (edge.index % 4) * 0.045;
          const u = (elapsed * speed + edge.index * 0.17) % 1;
          const inv = 1 - u;
          const px = inv * inv * s.x + 2 * inv * u * ctrlX + u * u * t.x;
          const py = inv * inv * s.y + 2 * inv * u * ctrlY + u * u * t.y;
          const pScale = s.scale * inv + t.scale * u;
          p1.setAttribute('cx', px.toFixed(1));
          p1.setAttribute('cy', py.toFixed(1));
          p1.setAttribute('r', (Math.max(1.5, 2.3 * pScale)).toFixed(2));
        }

        const p2 = packetSecondaryElsRef.current.get(edge.id);
        if (p2) {
          const speed = 0.22 + (edge.index % 4) * 0.045;
          const u = (elapsed * speed + edge.index * 0.17 + 0.5) % 1;
          const inv = 1 - u;
          const px = inv * inv * s.x + 2 * inv * u * ctrlX + u * u * t.x;
          const py = inv * inv * s.y + 2 * inv * u * ctrlY + u * u * t.y;
          const pScale = s.scale * inv + t.scale * u;
          p2.setAttribute('cx', px.toFixed(1));
          p2.setAttribute('cy', py.toFixed(1));
          p2.setAttribute('r', (Math.max(1.2, 1.85 * pScale)).toFixed(2));
        }
      }
    };

    const tick = () => {
      if (!inView || document.hidden) return;
      if (prefersReducedMotion && !cameraRef.current.isDragging) return;
      renderFrame(performance.now());
    };

    // Initial render
    renderFrame(performance.now());
    gsap.ticker.add(tick);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          lastTime = performance.now();
        }
      },
      { threshold: 0.04 },
    );
    observer.observe(panel);

    return () => {
      gsap.ticker.remove(tick);
      observer.disconnect();
    };
  }, [activeId, edges, isWide, layout, prefersReducedMotion]);

  const onStagePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    const cam = cameraRef.current;
    cam.isDragging = true;
    cam.dragMoved = false;
    cam.lastX = event.clientX;
    cam.lastY = event.clientY;
    setIsDraggingUI(true);
    stageRef.current?.setPointerCapture?.(event.pointerId);
  };

  const onStagePointerMove = (event) => {
    const cam = cameraRef.current;
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      if (rect.width && rect.height) {
        const px = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const py = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        panelRef.current.style.setProperty('--vault-px', px.toFixed(3));
        panelRef.current.style.setProperty('--vault-py', py.toFixed(3));
      }
    }

    if (!cam.isDragging) return;

    const dx = event.clientX - cam.lastX;
    const dy = event.clientY - cam.lastY;
    if (Math.hypot(dx, dy) > 3) {
      cam.dragMoved = true;
    }

    cam.lastX = event.clientX;
    cam.lastY = event.clientY;
    cam.targetRotY += dx * 0.0068;
    cam.targetRotX = Math.max(-1.08, Math.min(1.08, cam.targetRotX - dy * 0.0055));
    cam.userInteractedUntil = performance.now() + 2600;
  };

  const onStagePointerUp = (event) => {
    const cam = cameraRef.current;
    if (!cam.isDragging) return;
    cam.isDragging = false;
    setIsDraggingUI(false);
    stageRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const resetPointer = () => {
    panelRef.current?.style.setProperty('--vault-px', '0');
    panelRef.current?.style.setProperty('--vault-py', '0');
    if (cameraRef.current.isDragging) {
      cameraRef.current.isDragging = false;
      setIsDraggingUI(false);
    }
  };

  const resetConstellation = (event) => {
    event.stopPropagation();
    setPinnedId(null);
    setHoveredId(null);
    const cam = cameraRef.current;
    cam.targetRotX = -0.2;
    cam.targetRotY = 0.28;
    cam.targetZoom = 1;
    cam.targetPanX = 0;
    cam.targetPanY = 0;
    cam.userInteractedUntil = 0;
  };

  const togglePinned = (id) => {
    if (cameraRef.current.dragMoved) return;
    setPinnedId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="notes" className="section vault-section" data-ghost="VAULT" ref={revealRef}>
      <div className={`container${visible ? ' is-visible' : ''}`}>
        <div className="section-header vault__header">
          <p className="section-label">Living Knowledge Base</p>
          <SectionTitle>Built from Notes, Wired to Code.</SectionTitle>
        </div>

        {motion.vaultGraph ? (
          <div
            ref={panelRef}
            className={`vault__panel${isDraggingUI ? ' is-dragging' : ''}`}
            onPointerMove={onStagePointerMove}
            onPointerLeave={resetPointer}
          >
            <div className="vault__panel-head">
              <div className="vault__head-left">
                <span className="vault__badge">
                  <span className="vault__badge-dot" aria-hidden="true" />
                  Obsidian · 3D Constellation
                </span>
                <span className="vault__orbit-hint" aria-hidden="true">
                  Drag to orbit · Click node to focus
                </span>
              </div>
              <div className="vault__head-right">
                <span className="vault__meta" aria-live="polite">
                  {activeNode ? (
                    <>
                      <strong className="vault__meta-active">{activeNode.label}</strong>
                      <i aria-hidden="true">·</i>
                      {String(Math.max(0, (activeConnections?.size ?? 1) - 1)).padStart(2, '0')} links
                      <i aria-hidden="true">·</i>
                      <span className="vault__meta-coords">
                        [{Math.round(activeNode.x3d)}, {Math.round(activeNode.y3d)}, {Math.round(activeNode.z3d)}]
                      </span>
                    </>
                  ) : (
                    <>
                      {String(vaultStats.notes).padStart(2, '0')} notes
                      <i aria-hidden="true">/</i>
                      {String(vaultStats.links).padStart(2, '0')} links
                    </>
                  )}
                </span>
                {pinnedId && (
                  <button
                    type="button"
                    className="vault__reset-btn"
                    onClick={resetConstellation}
                  >
                    Reset 3D View
                  </button>
                )}
              </div>
            </div>

            <div
              ref={stageRef}
              className={`vault__stage${isDraggingUI ? ' is-dragging' : ''}`}
              onPointerDown={onStagePointerDown}
              onPointerUp={onStagePointerUp}
              onPointerCancel={onStagePointerUp}
              onClick={() => {
                if (!cameraRef.current.dragMoved) setPinnedId(null);
              }}
            >
              <div className="vault__radial" aria-hidden="true" />

              <svg
                className={`vault__graph${visible ? ' is-visible' : ''}${activeId ? ' has-active' : ''}`}
                viewBox={`0 0 ${layout.width} ${layout.height}`}
                role="img"
                aria-label={`3D knowledge graph of ${vaultStats.notes} published notes and ${vaultStats.links} links`}
              >
                <g className="vault__scene">
                  {/* 3D Orbital Guide Rings */}
                  <g className="vault__orbits-3d" aria-hidden="true">
                    <path ref={ringOuterRef} className="vault__orbit-ring vault__orbit-ring--outer" />
                    <path ref={ringInnerRef} className="vault__orbit-ring vault__orbit-ring--inner" />
                  </g>

                  <g className="vault__edges" aria-hidden="true">
                    {edges.map((edge) => {
                      const isActive =
                        activeId && (edge.source === activeId || edge.target === activeId);
                      const isDimmed = activeId && !isActive;

                      return (
                        <path
                          key={edge.id}
                          ref={(el) => {
                            if (el) edgeElsRef.current.set(edge.id, el);
                            else edgeElsRef.current.delete(edge.id);
                          }}
                          d={edge.path}
                          className={`vault__edge${isActive ? ' is-active' : ''}${isDimmed ? ' is-dimmed' : ''}`}
                          style={{
                            '--edge-color': edge.color,
                            '--edge-index': edge.index,
                          }}
                          pathLength="1"
                        />
                      );
                    })}
                  </g>

                  {showMotion && quality !== 'low' && (
                    <g className="vault__packets" aria-hidden="true">
                      {edges.map((edge) => {
                        const isActive =
                          activeId && (edge.source === activeId || edge.target === activeId);
                        const isDimmed = activeId && !isActive;

                        return (
                          <g key={`packets-${edge.id}`}>
                            <circle
                              ref={(el) => {
                                if (el) packetPrimaryElsRef.current.set(edge.id, el);
                                else packetPrimaryElsRef.current.delete(edge.id);
                              }}
                              r={isActive ? '2.5' : '1.9'}
                              className={`vault__packet${isActive ? ' is-active' : ''}${isDimmed ? ' is-dimmed' : ''}`}
                              style={{ fill: '#f59e0b' }}
                            />
                            <circle
                              ref={(el) => {
                                if (el) packetSecondaryElsRef.current.set(edge.id, el);
                                else packetSecondaryElsRef.current.delete(edge.id);
                              }}
                              r={isActive ? '2.1' : '1.5'}
                              className={`vault__packet vault__packet--secondary${isActive ? ' is-active' : ''}${isDimmed ? ' is-dimmed' : ''}`}
                              style={{ fill: '#34d399' }}
                            />
                          </g>
                        );
                      })}
                    </g>
                  )}

                  <g className="vault__nodes">
                    {layout.nodes.map((node, index) => {
                      const group = GROUP_STYLE[node.group] ?? GROUP_STYLE.note;
                      const isActive = activeId === node.id;
                      const isConnected = activeConnections?.has(node.id);
                      const isNeighbor = Boolean(activeId && isConnected && !isActive);
                      const isDimmed = activeConnections && !isConnected;
                      const labelOffsetY =
                        node.group === 'profile'
                          ? 31
                          : node.group === 'project'
                            ? 25
                            : node.group === 'system'
                              ? -19
                              : 22;
                      const labelClass =
                        node.group === 'profile'
                          ? 'is-profile'
                          : node.group === 'project'
                            ? 'is-project'
                            : node.group === 'system'
                              ? 'is-system'
                              : '';

                      return (
                        <g
                          key={node.id}
                          ref={(el) => {
                            if (el) nodeElsRef.current.set(node.id, el);
                            else nodeElsRef.current.delete(node.id);
                          }}
                          transform={`translate(${node.x} ${node.y})`}
                          className={`vault__node-anchor${isActive ? ' is-active' : ''}${isNeighbor ? ' is-connected' : ''}${isDimmed ? ' is-dimmed' : ''}`}
                          style={{
                            '--node-color': group.color,
                            '--node-index': index,
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`${node.title} (${node.group} note)`}
                          aria-pressed={pinnedId === node.id}
                          onPointerEnter={() => setHoveredId(node.id)}
                          onPointerLeave={() => setHoveredId(null)}
                          onFocus={() => setHoveredId(node.id)}
                          onBlur={() => setHoveredId(null)}
                          onClick={(event) => {
                            event.stopPropagation();
                            togglePinned(node.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              event.stopPropagation();
                              togglePinned(node.id);
                            } else if (event.key === 'Escape') {
                              setPinnedId(null);
                              setHoveredId(null);
                            }
                          }}
                        >
                          <title>{node.title}</title>
                          <g className="vault__node">
                            <circle
                              className="vault__node-halo"
                              r={group.radius * 2.9}
                            />
                            <circle
                              className="vault__node-ring"
                              r={group.radius + 7}
                              style={{ animationDelay: `${(index % 5) * 0.4}s` }}
                            />
                            <circle
                              className="vault__node-core"
                              r={group.radius}
                            />
                            <circle
                              className="vault__node-glint"
                              r={Math.max(2, group.radius * 0.32)}
                              cx={-group.radius * 0.28}
                              cy={-group.radius * 0.28}
                            />
                          </g>
                          <text
                            className={`vault__label ${labelClass}`}
                            x={0}
                            y={labelOffsetY}
                            textAnchor="middle"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </g>
              </svg>

              <div className="vault__legend" aria-hidden="true">
                <span><i className="is-profile" /> Profile</span>
                <span><i className="is-project" /> Projects</span>
                <span><i className="is-timeline" /> Timeline</span>
                <span><i className="is-system" /> System</span>
              </div>
            </div>

            <div className="vault__panel-foot">
              <span>Edit markdown → save → Vite rebuilds the 3D knowledge constellation.</span>
              <span className="vault__sync">
                <span className="vault__sync-dot" aria-hidden="true" />
                {motion.intensity} motion · 0 runtime tokens
              </span>
            </div>
          </div>
        ) : (
          <div className="vault__fallback">
            <p>
              Motion graph is disabled in <code>motion.md</code>. Content notes are still active.
            </p>
            <div className="vault__note-strip">
              {nodes.map((node) => (
                <span key={node.id} className="vault__note-chip">
                  {node.label}
                  <i>{node.group}</i>
                </span>
              ))}
            </div>
          </div>
        )}

        {motion.vaultGraph && (
          <div className="vault__note-strip" aria-label="Content notes powering this page">
            {nodes.map((node) => {
              const isActive = activeId === node.id;
              const isConnected = activeConnections?.has(node.id);
              return (
                <button
                  key={node.id}
                  type="button"
                  className={`vault__note-chip${isActive ? ' is-active' : ''}${isConnected && !isActive ? ' is-connected' : ''}`}
                  onPointerEnter={() => setHoveredId(node.id)}
                  onPointerLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(node.id)}
                  onBlur={() => setHoveredId(null)}
                  onClick={() => togglePinned(node.id)}
                  aria-pressed={pinnedId === node.id}
                >
                  {node.label}
                  <i>{node.group}</i>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
